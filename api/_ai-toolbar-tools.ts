import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError, logAiStart } from "./_shared.js";
import { clampScores, draftToolDiffSchema, normalizeTool } from "../src/features/generative-toolbar/model/tool-spec.js";
import {
  STANDARD_TOOLS,
  SUGGESTION_ROWS,
  standardToolsPrompt,
} from "../src/features/generative-toolbar/model/standard-tools.js";

// The generated half of a large interface's toolbar. The client holds a table
// of every tool suggested so far, by key; this reads it with the interface's
// data and answers with changes, streamed as NDJSON, one line each:
//   {"drop":["key"]}  {"score":{"id":"key","impact":4,"fit":0.8,"done":0}}
//   {"add":{...tool}}  {"done":{"ms":1234}}  or  {"error":"..."}
// Each tool is held to `toolSpecSchema` as it completes (`normalizeTool`), so
// one bad tool costs only itself. When one is used, `/api/toolbar-run` does it.
export const maxDuration = 30;

type Row = Record<string, unknown> & { id?: string; label?: string; pinned?: boolean; dismissed?: boolean };

type Body = {
  kind?: string;
  label?: string;
  description?: string;
  /** The interface's data as the client holds it, images replaced by "[image]". */
  data?: unknown;
  selection?: string | null;
  /** The toolbar's table now: every tool suggested so far, with its scores; the person's are pinned. */
  table?: Row[];
  /** What changed in the data since the table was last brought up to date, one line each. */
  changes?: string[];
  /** Labels the person cleared with Regenerate, not to be offered again. */
  avoid?: string[];
  /** How many fit in the toolbar. */
  count?: number;
};

const MAX_DATA = 24_000;

function system(kind: keyof typeof STANDARD_TOOLS, label: string, description: string) {
  const rows = SUGGESTION_ROWS[kind] ?? [];
  return `You keep the generated half of an interface's toolbar up to date. The interface is a
${label}: ${description}

${standardToolsPrompt(kind)}

The toolbar holds a table of tools suggested so far, one row each, under a key
(id). You never rebuild it. Each time the content changes you answer with
changes only:
- drop: keys of tools that no longer make sense (the gap they filled is gone,
  the thing they named no longer exists).
- scores: fresh scores for tools that stay exactly as they are.
- add: tools that are new, or changed (a label or value that no longer holds,
  written out again under the same id, so it stays in its place).
Every open row not in drop or add needs fresh scores. Rows marked pinned (they
used it) or dismissed (they closed it) belong to the person: leave them out of
all three. Never offer a dismissed tool again, or anything that does the same
job under another name.

Keep the toolbar calm. Change or drop a tool only when the content gives a
reason, and add at most two new tools a turn once the table has five or more.
When the table is empty, add six to eight.

Scores, for every tool you add or score:
- impact 1 to 5: how much using it would improve the content now.
- fit 0 to 1: how well it suits what is in the interface right now.
- done 0 to 1: how far the content already does it (1 = nothing left to do).
The toolbar shows the best few by these, so be honest: a fix for a gap that
has just been filled is done 1.

Make tools for what is in it right now, so they could only belong to this
content: name its actual parts, people, numbers and gaps in labels and details.
Kinds of tool:
- action: one tap that does a clear thing ("Add a summary", "Fill 4 empty cells").
- slider: a scale between two ends in 3 to 5 named steps, value where the content is now.
- grid: a 2×2 over two axes, each quadrant named, value where the content sits now.
- choice: two to four options, value the current one.
- toggle: on or off, value the current state.
Keep at least two controls (slider, grid, choice or toggle) among the tools, not all actions.

Rules:
- Each tool is something a person working on this would want to do next,
  that takes real work: drafting, filling, restructuring, checking. No
  renaming the title, changing letter case, or shuffling values for the sake
  of it.
- Only offer to fill, fix or add what the data is actually missing: no "Add
  due dates" when every item has one, no "Fill gaps" with no empty cells.
- Tools change the content, never just the view. No show/hide, group-by,
  filter-the-view or "focus" switches.
- Never duplicate a standard tool, even in other words: no date or time filter
  when the toolbar has one, no sort or order-by when it sorts, no hiding
  completed items when it does that, no copy or download.
- A control's value is where the content is now, and moving it rewrites the
  content to match (a Detail slider at "Brief" moved to "In depth" expands
  the text). Name controls after the quality they change, not a setting.
- Labels are two to four words, sentence case, at most 24 characters, and say
  exactly what it does, with the count when there is one: "Assign 3 owners",
  "Date 2 items", "Add a closing section". Never vague nouns like "Owner
  pass", "Completion" or "Group focus". Details say what it will do here, at
  most 80 characters.
- Each tool must be something a model can carry out by editing the fields this
  data already has (a summary goes into the body; a status is a column or
  field that exists), or by answering in the chat.
- New ids are short kebab-case and not already in the table.
${
  rows.length
    ? `- place: leave it out for the toolbar, or put a tool beside the part it acts on:\n${rows
        .map((row) => `  "${row.place}" = ${row.where}`)
        .join("\n")}`
    : "- Leave place out: everything goes in the toolbar."
}
- Leave jobs out unless the tool does one of the standard jobs (it then gets dropped).
- Never use em dashes.`;
}

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();
  const { kind, label, description, data, selection, table = [], changes = [], avoid = [], count = 5 }: Body = await req.json();
  if (!kind || !(kind in STANDARD_TOOLS)) {
    return new Response(JSON.stringify({ error: `No toolbar for "${kind}"` }), { status: 400 });
  }
  const toolbarKind = kind as keyof typeof STANDARD_TOOLS;
  const content = JSON.stringify(data ?? {});
  const known = new Set(table.map((row) => row.id));
  // The person's rows: the model's changes to them are ignored.
  const pinned = new Set(table.filter((row) => row.pinned || row.dismissed).map((row) => row.id));

  const prompt = [
    `The ${label ?? kind}'s data now (JSON${content.length > MAX_DATA ? ", cut short" : ""}):`,
    content.slice(0, MAX_DATA),
    `\nThe toolbar's table now (${table.length ? `${table.length} rows; ${count} fit in the toolbar` : "empty"}):`,
    JSON.stringify(table),
    table.length
      ? changes.length
        ? `\nWhat changed since you last judged the table:\n${changes.slice(0, 24).map((line) => `- ${line}`).join("\n")}\nRe-judge every row against these changes. A change can open a gap (a new tool, or a changed one whose label names the new count), close one (done 1, or drop), or change nothing.`
        : "\nNothing in the data changed since you last judged the table (the selection may have): keep the rows as they are unless the selection calls for something."
      : "",
    selection?.trim() ? `\nThe person has selected: "${selection.trim().slice(0, 600)}". Add tools for the selection and score them highest.` : "",
    avoid.length ? `\nThey cleared these with Regenerate. Don't offer them, or anything like them, again: ${avoid.join(", ")}.` : "",
  ].join("\n");

  const started = logAiStart(
    "toolbar-tools",
    `${kind} · ${table.length} rows${selection ? " · selection" : ""}${avoid.length ? " · regenerate" : ""}`,
  );
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (line: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`));
      // How many of each list have gone out. An element is complete once the next one has begun.
      const sent = { drop: 0, scores: 0, add: 0 };
      const addSeen = new Set<string>();
      const flush = (partial: { drop?: unknown[]; scores?: unknown[]; add?: unknown[] }, final: boolean) => {
        const ready = (list: unknown[] | undefined) => (list ? (final ? list.length : list.length - 1) : 0);
        const drops = (partial.drop ?? []).slice(sent.drop, ready(partial.drop));
        sent.drop += drops.length;
        const dropIds = drops.filter((id): id is string => typeof id === "string" && known.has(id) && !pinned.has(id));
        if (dropIds.length) send({ drop: dropIds });
        for (const raw of (partial.scores ?? []).slice(sent.scores, ready(partial.scores))) {
          sent.scores += 1;
          const row = raw as Record<string, unknown>;
          if (typeof row?.id !== "string" || !known.has(row.id) || pinned.has(row.id)) continue;
          send({ score: { id: row.id, ...clampScores(row) } });
        }
        for (const raw of (partial.add ?? []).slice(sent.add, ready(partial.add))) {
          sent.add += 1;
          const tool = normalizeTool(raw);
          if (!tool || pinned.has(tool.id) || addSeen.has(tool.id)) continue;
          addSeen.add(tool.id);
          send({ add: tool, ms: Date.now() - started });
        }
      };

      try {
        const result = streamText({
          model: openai(chatLabModel()),
          output: Output.object({ schema: draftToolDiffSchema }),
          system: system(toolbarKind, label ?? kind, description ?? ""),
          prompt,
          abortSignal: req.signal,
          providerOptions: { openai: { strictJsonSchema: false, reasoningEffort: "none" } },
        });
        let last: Parameters<typeof flush>[0] = {};
        for await (const partial of result.partialOutputStream) {
          last = partial as typeof last;
          flush(last, false);
        }
        flush(last, true);
        send({ done: { ms: Date.now() - started, added: addSeen.size } });
      } catch (error) {
        if (!req.signal.aborted) {
          logAiError("toolbar-tools", error);
          send({ error: error instanceof Error ? error.message : String(error) });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "content-type": "application/x-ndjson", "cache-control": "no-store" } });
}
