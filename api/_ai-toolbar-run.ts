import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError, logAiStart } from "./_shared.js";

// Carries out a generated toolbar tool: the model reads the interface's data
// and what was asked ("Tone: Warmer", "Fill 4 empty cells"), and returns edits
// to that data as slash-path operations, a short reply for the chat, or both.
// Streamed as NDJSON, one line each, so the client applies each edit as it
// completes and checks the result still fits:
//   {"operation":{"op":"replace","path":"/items/h3/done","value":true}}
//   {"done":{"summary":"…","reply":null}}  or  {"error":"…"}
// List items are addressed by their id where they have one (/rows/r2/…), so
// an edit can't land on the wrong row when positions shift.
export const maxDuration = 60;

const operationSchema = z.object({
  op: z.enum(["add", "replace", "remove"]),
  path: z
    .string()
    .describe('A slash path into the data. In lists whose items have an id, name the item by its id: "/rows/r2/cells/c1", "/items/h3/done". Otherwise a zero-based position. "/items/-" appends.'),
  value: z.any().optional().describe("For add and replace: the new value, in exactly the shape that path holds now."),
});

// Summary first, so the note can say what's happening while the edits stream.
const resultSchema = z.object({
  summary: z.string().optional().describe("What changed, under 60 characters, e.g. 'Filled 4 empty cells'."),
  operations: z.array(operationSchema).optional().describe("Edits to the data, applied in order. Empty when nothing should change."),
  reply: z
    .string()
    .nullable()
    .optional()
    .describe("Anything to tell the person that isn't an edit (an answer, a summary, a caveat). Null when the edit speaks for itself."),
});

type Body = {
  kind?: string;
  label?: string;
  data?: unknown;
  selection?: string | null;
  /** The tool, as generated. */
  tool?: unknown;
  /** What using it asks for, in words ("Tone: Warmer"). */
  request?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const MAX_DATA = 40_000;

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();
  const { kind, label, data, selection, tool, request }: Body = await req.json();
  if (!kind || !request) return json({ error: "kind and request are required" }, 400);

  const content = JSON.stringify(data ?? {});
  logAiStart("toolbar-run", `${kind} · ${request}`);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (line: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`));
      try {
        const result = streamText({
          model: openai(chatLabModel()),
          output: Output.object({ schema: resultSchema }),
          abortSignal: req.signal,
      system: `You carry out a tool the person just used on a ${label ?? kind} interface.
You get the interface's data as JSON and the tool. Change the data to do what
the tool says, and nothing else.

- Work within the fields the data already has: there is no field for every
  idea, so a summary or conclusion goes into the body text, a new property of
  rows goes in a new column, and so on. Never refuse for want of a field.
- Return edits as operations on the JSON: paths use its exact keys. In a list
  whose items have an "id", name the item by its id ("/rows/r2/cells/c1",
  "/items/h3/done"), never its position; use a position only for lists without
  ids. Prefer small edits (one cell, one item, one field) over replacing a
  whole list, so the rest stays exactly as it was.
- A new list entry copies the shape of its neighbours, with a fresh unique id
  when they have ids. Keep every other id as it is.
- Values that read "[image]" are pictures; leave them alone.
- Text fields are one string: to change one, replace the whole field with the
  full new text. Markdown fields stay Markdown.
- If the tool asks for an answer rather than an edit (compare, explain, check),
  put it in reply and return no operations.
- Write like the content already does. Never use em dashes.`,
      prompt: [
        `The tool: ${JSON.stringify(tool ?? {})}`,
        `They used it as: ${request}`,
        selection?.trim() ? `It applies to the selected text: "${selection.trim().slice(0, 600)}"` : "",
        `The data (JSON${content.length > MAX_DATA ? ", cut short" : ""}):`,
        content.slice(0, MAX_DATA),
      ]
        .filter(Boolean)
        .join("\n"),
          providerOptions: { openai: { strictJsonSchema: false } },
        });
        // An operation is complete once the next one has begun, or the stream has ended.
        let sent = 0;
        let last: { summary?: string; operations?: unknown[]; reply?: string | null } = {};
        const flush = (final: boolean) => {
          const operations = last.operations ?? [];
          const ready = final ? operations.length : operations.length - 1;
          for (; sent < ready; sent++) send({ operation: operations[sent] });
        };
        for await (const partial of result.partialOutputStream) {
          last = partial as typeof last;
          flush(false);
        }
        flush(true);
        send({ done: { summary: last.summary || request, reply: last.reply ?? null } });
      } catch (error) {
        if (!req.signal.aborted) {
          logAiError("toolbar-run", error);
          send({ error: error instanceof Error ? error.message : String(error) });
        }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson", "cache-control": "no-store" } });
}
