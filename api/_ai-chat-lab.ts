import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  hasToolCall,
  stepCountIs,
  streamText,
  tool,
  type ToolSet,
  type UIMessage,
} from "ai";
import { z } from "zod";
import {
  CATALOGUE,
  CATALOGUE_KINDS,
  applyCatalogueOperations,
  catalogueSummary,
  FILL_TOOL_KIND,
  isCatalogueKind,
  operationSchema,
  readCatalogueValue,
  type CatalogueKind,
  type CatalogueValue,
} from "../src/features/interface-shells/model/shell-catalogue.js";
import {
  applyRoleTool,
  PROGRESS_START,
  roleSpec,
  rulesFor,
  type InPlay,
} from "../src/features/interface-shells/model/interface-roles.js";
import type { InterfaceRole, ShellKind } from "../src/features/interface-shells/model/shell-types.js";
import { askableFields, askInputSchema, normalizeQuestions } from "../src/features/interface-shells/model/questions.js";
import { CHART_BLOCK, chatLabModel, DEFAULT_CHAT_LAB_SYSTEM_PROMPT, wantsChart } from "./_chat-lab.js";
import { hybridCandidates, type RetrievalInput } from "./_interface-retrieval.js";
import { compactArtifactHistory } from "../src/features/chat-lab/model/artifact-history.js";
import {
  apiKeyMissing,
  configError,
  logAiError,
  logAiFinish,
  logAiStart,
} from "./_shared.js";

// Chat Lab: the pharos chat surface, streamed from OpenAI instead of the
// pharos backend. Requires OPENAI_API_KEY; OPENAI_CHAT_MODEL picks the model.
export const maxDuration = 60;

type InterfaceKind = "document" | "search" | "table" | "moodboard" | CatalogueKind;

type ArtefactContext = {
  /** Its id in the thread, so tools can name it. */
  id?: string;
  kind: InterfaceKind | "shell";
  title: string;
  /** A catalogue interface's contents, as JSON in its schema's shape. */
  value?: string;
  /** Active filter chips already on the search interface. */
  filters?: string[];
  /** Search and Canvas: what they hold now, as text. */
  content?: string;
  /** kind "shell": which library interface is open, and its contents as JSON. */
  label?: string;
  snapshot?: string;
};

/** Writes one request, exactly as it goes to the model, for reading. */
async function dumpPrompt(folder: string, system: string, messages: unknown, tools: ToolSet) {
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(folder, { recursive: true });
  const toolList = Object.fromEntries(
    Object.entries(tools).map(([name, entry]) => {
      const schema = (entry as { inputSchema?: unknown }).inputSchema;
      let input: unknown = "(provider tool)";
      try {
        input = schema ? z.toJSONSchema(schema as z.ZodType) : input;
      } catch {
        input = "(schema)";
      }
      return [name, { description: (entry as { description?: string }).description ?? "(provider tool)", input }];
    }),
  );
  await writeFile(`${folder}/prompt-${Date.now()}.json`, JSON.stringify({ system, messages, tools: toolList }, null, 2));
}

/**
 * Asking: a question the person answers with a tiny interface (a stepper, a
 * few chips, Yes and No) instead of typing. Each interface in play says what
 * it can be asked; plain questions are for the chat.
 */
function askAddon(targets: { id: string; kind: ShellKind; label: string; title: string }[]) {
  const lines = targets.flatMap((target) => {
    if (target.kind === "notes") return [`- id=${target.id} (Notes "${target.title}"): any fact, with field set to a short label (Guests, Budget); the answer becomes a line.`];
    const fields = askableFields(target.kind);
    return fields.length ? [`- id=${target.id} (${target.label} "${target.title}"): ${fields.join(", ")}.`] : [];
  });
  return `Asking: when you need something from them that's a pick, a yes or no, a number, a time or a date, ask with the ask tool, never as a question in your text. At most three at once, only what they'd know offhand, each with your best guess; then stop and wait for the answer. Keep them light to read: a question of five words or fewer (How many guests?), options of one or two words, no units or examples in the words (the control shows them). If they skip, go with your guesses.
What can be asked, and where the answer goes:
${[...lines, '- for "chat": a plain question (confirm for yes or no, choose for options, text otherwise).'].join("\n")}`;
}

/** A plain request to make something: "Make the menu", "Now give me the recipe", "Can you draft a brief". */
const MAKE_REQUEST =
  /^\s*(?:(?:ok(?:ay)?|now|then|and|great|thanks)[,!.]?\s+)*(?:(?:please|can you|could you|would you)\s+)?(?:make|create|build|write|draft|give me|put together|generate|draw up|plan out|set up)\b/i;

/** Another interface open beside the chat (not the one used last, not a tracked one): the model sees it too. */
type OpenContext = { id: string; kind: InterfaceKind | "shell"; label: string; title: string; value?: string; snapshot?: string };

/** An interface the thread keeps current (Notes, a progress tracker), sent every turn whatever is open. */
type TrackedContext = { id: string; kind: ShellKind; role: InterfaceRole; label: string; title: string; data: unknown };

/**
 * The tools of each tracked interface, from its role spec. Each call is run
 * against the interface's data here, so the model hears what changed (or what
 * to fix), and the app applies the same call to the interface.
 */
function trackedTools(tracked: TrackedContext[]): ToolSet {
  const tools: ToolSet = {};
  for (const entry of tracked) {
    const spec = roleSpec(entry.kind, entry.role);
    let current = entry.data;
    for (const roleTool of spec?.tools ?? []) {
      tools[roleTool.name] = tool({
        description: `${roleTool.description} (${entry.label} "${entry.title}")`,
        inputSchema: roleTool.input as z.ZodType<Record<string, unknown>>,
        execute: async (input: unknown) => {
          const result = applyRoleTool(roleTool.name, current, input);
          if (!result.ok) return { ok: false as const, error: result.error };
          current = result.data;
          return { ok: true as const, summary: result.summary };
        },
      });
    }
  }
  // Notes tracked and no progress tracker yet: the model can start one for the goal's stages.
  if (tracked.some((entry) => entry.kind === "notes") && !tracked.some((entry) => entry.kind === "tracker")) {
    tools[PROGRESS_START.name] = tool({
      description: PROGRESS_START.description,
      inputSchema: PROGRESS_START.input,
      execute: async ({ stages }) => ({ ok: true as const, summary: `Started with ${stages.length} stages.` }),
    });
  }
  return tools;
}

/** What every interface in view is, with its id, so a write can name the one it's for. */
function inViewAddon(inView: { id: string; label: string; title: string; focused: boolean }[], others: OpenContext[]) {
  const rest = others.filter((entry) => !inView.some((view) => view.id === entry.id));
  if (inView.length + rest.length < 2 && !inView.some((entry) => !entry.focused)) return null;
  return `Interfaces in this thread, in a window or in the reply that made them (what each holds now is at the end of the conversation):
${[...inView.map((entry) => `- id=${entry.id}: ${entry.label} "${entry.title}"${entry.focused ? " (the one they used last)" : ""}`), ...rest.map((entry) => `- id=${entry.id}: ${entry.label} "${entry.title}" (read it; you can't write to it)`)].join("\n")}
- Work on the ones the request is about. To change part of one, call update_interface with its id; to rewrite one, call its fill tool with its id; leave the id out of a fill to make a new one.
- Keep what they say in one consistent across the others (a time moved in the schedule moves in the shot list).`;
}

/** Another open interface's contents, after the conversation. */
const openContents = (entry: OpenContext): string | null => {
  if (isCatalogueKind(entry.kind) && entry.value) return `The open ${CATALOGUE[entry.kind].label} "${entry.title}" (id=${entry.id}), as it is now (JSON, list positions start at 0):\n${entry.value}`;
  if (entry.snapshot) return `The open ${entry.label} "${entry.title}" (id=${entry.id}), as it is now (JSON):\n${entry.snapshot}`;
  return null;
};

/** What the tracked interfaces hold now, after the conversation (they change every turn). */
const trackedContents = (tracked: TrackedContext[]) =>
  tracked.length
    ? `Tracked interfaces, as they are now:\n\n${tracked
        .map((entry) => {
          const spec = roleSpec(entry.kind, entry.role);
          return spec ? spec.contents(entry.data) : `${entry.label} "${entry.title}"`;
        })
        .join("\n\n")}`
    : null;

type InterfaceCandidate = {
  /** "format" shapes the reply; only an "interface" opens. */
  layer?: "interface" | "format";
  id: string;
  label: string;
  description: string;
  opensAs: InterfaceKind;
};

/** What a small change to each catalogue interface touches, in the model's words. */
const PART_WORDS: Record<CatalogueKind, string> = {
  document: "a passage, or one of its live pieces (a chart, a control, a dataset)",
  table: "a cell, row or column",
  tracker: "an item, an owner, what's done",
  dashboard: "a block, a chart's type, a filter, a dataset's label",
  guide: "a step, an amount, a fact such as Serves",
  schedule: "a task's time or day, a constraint, the hours",
  generator: "the prompt, a control such as tone or style, a variation",
};

/** A catalogue interface that's open: how to fill it and how to change part of it. */
const catalogueSystemAddon = (kind: CatalogueKind, artefact: ArtefactContext) => {
  const entry = CATALOGUE[kind];
  const name = entry.label.toLowerCase();
  // The contents themselves go at the end of the prompt (`artefactContents`), so this stays the same while it changes.
  const contents = artefact.value
    ? "Its current contents are given at the end of the conversation, as JSON (list positions start at 0). Only that version counts; earlier versions in the conversation are left out."
    : "Its contents are too long to show here.";
  const change = artefact.value
    ? kind === "document"
      ? "- To rename it, call update_interface with a replace on /title. To change a live piece (a chart's type, a block's filter), patch /blocks with update_interface. To change the writing, call fill_document with the new body (keep its ::id lines where the pieces should stay)."
      : `- To change part of it (${PART_WORDS[kind]}, the title), call update_interface with the
  fewest operations that do it. Don't resend the whole ${name} for a small change.
  If update_interface returns an error, fix the path or value and call it again.`
    : "";
  return `
The user has an open ${entry.label} interface titled "${artefact.title}". ${entry.description}
${contents}

Routing rules:
- To write it or rewrite most of it, call ${entry.tool}. It appears in the ${name} as you write it.
${change}
- Keep chat messages short: what you did, or a question. Do not paste the ${name} into chat.
- If the user is just chatting, reply in chat only and skip the tools.`;
};

/**
 * The open interface's current contents, sent after the conversation rather
 * than in the system prompt: they change as the person and the model edit,
 * and everything before them can stay a cached prefix.
 */
const artefactContents = (artefact: ArtefactContext): string | null => {
  if (isCatalogueKind(artefact.kind) && artefact.value) {
    return `The open ${CATALOGUE[artefact.kind].label} "${artefact.title}", as it is now (JSON, list positions start at 0):\n${artefact.value}`;
  }
  if (artefact.kind === "shell") {
    return `The open ${artefact.label ?? "library"} interface "${artefact.title}", as it is now (JSON):\n${artefact.snapshot ?? "{}"}`;
  }
  if (artefact.content) {
    return `The open ${artefact.kind === "search" ? "Search" : "Canvas"} "${artefact.title}", as it is now:\n${artefact.content}`;
  }
  return null;
};

const artefactSystemAddon = (artefact: ArtefactContext) => {
  if (isCatalogueKind(artefact.kind)) return catalogueSystemAddon(artefact.kind, artefact);
  if (artefact.kind === "shell") {
    return `
The user has a ${artefact.label ?? "library"} interface titled "${artefact.title}" open beside the chat.
They edit it directly. Its current contents are given at the end of the conversation, as JSON.

Routing rules:
- Do not call write_interface or open_interface: this interface is edited by the user.
- Answer in chat, referring to what's in it by name, and suggest concrete changes
  they can make (a task to move, an item to add) in a sentence or two.`;
  }
  if (artefact.kind === "search") {
    const activeFilters =
      artefact.filters && artefact.filters.length > 0
        ? artefact.filters.join(", ")
        : "none";
    return `
The user has an open Search interface for "${artefact.title}".
Active filter chips on the interface: ${activeFilters}.

Routing rules:
- When the user runs a search (or the query changed), you MUST call web_search
  with their query first. Do not invent results.
- When the user asks to filter / narrow / refine results (e.g. "filter those to
  North Beach"), treat that as a search refine: call web_search with the
  narrowed query, then write_interface. Pass filters as the full list of short
  chip labels that should appear on the interface (keep prior filters unless
  they asked to clear them, and add the new one — e.g. ["North Beach"]).
- After web_search returns, call write_interface with:
  - content: markdown bullet list, one result per line, formatted exactly as
    "- [Page or place title](https://source.url) — one-sentence finding"
    using the real URL from the search results
  - filters: string[] of active chip labels for the search UI
  Prefer a few strong results over a long dump. Do not paste the essay into chat.
- Keep chat messages short: what you searched or filtered, or a clarifying
  question. Help the user develop their own reading rather than selecting an
  interpretation.
- If the user is just chatting (not searching), reply in chat only and skip
  web_search and write_interface.`;
  }
  return `
The user has an open Moodboard interface titled "${artefact.title}".

Routing rules:
- Work in stages: direction, then a few tiles/notes, then refine.
- When building the board, call write_interface with content as short bullet
  notes / visual directions (one idea per line). Do not paste a long essay
  into chat.
- Keep chat messages short: tone notes or questions. Help the user develop their
  own aesthetic call rather than choosing it for them.
- If the user is just chatting, reply in chat only and skip write_interface.`;
};

/**
 * The catalogue interfaces this turn could open. Each brings its own guidance,
 * so the prompt only carries how to write the interfaces actually on offer.
 */
const retrievedCatalogueKinds = (interfaces: InterfaceCandidate[]) =>
  CATALOGUE_KINDS.filter((kind) => interfaces.some((candidate) => candidate.opensAs === kind));

const candidatesSystemAddon = (candidates: InterfaceCandidate[]) => {
  const interfaces = candidates.filter((candidate) => candidate.layer !== "format");
  const formats = candidates.filter((candidate) => candidate.layer === "format");
  const list = (items: InterfaceCandidate[], arrow: (c: InterfaceCandidate) => string) =>
    items.map((candidate, index) => `${index + 1}. id="${candidate.id}" (${candidate.label})${arrow(candidate)}: ${candidate.description}`).join("\n");
  const interfaceBlock = interfaces.length
    ? `
Interfaces (surfaces shown with your reply, which the user can move into a window), retrieved for this turn:
${list(interfaces, (c) => ` → opens as ${c.opensAs}`)}

- If an interface clearly fits, call open_interface with that candidate's id and
  a short title for it. Prefer the listed candidates only.
- Right after opening, fill it. ${CATALOGUE_KINDS.map((kind) => CATALOGUE[kind].label).join(", ")} each have their own tool
  (${CATALOGUE_KINDS.map((kind) => CATALOGUE[kind].tool).join(", ")}): it appears in the interface as you write it. For
  anything else call write_interface with the body (and filters for search).
  Keep the chat reply short.
- For search, call web_search before write_interface, and write one result per
  line as "- [Title](https://source.url) — one-sentence finding".
${retrievedCatalogueKinds(interfaces).flatMap((kind) => CATALOGUE[kind].guidance.map((line) => `- ${CATALOGUE[kind].label}: ${line}`)).join("\n")}
- Never open more than one interface in a single turn.
- Don't say where the interface is on screen (no "side panel" or "on the right"):
  the user places it. Refer to it by what it is, as in "the table".`
    : "";
  const formatBlock = formats.length
    ? `
Reply formats (how to lay out your answer in the thread), retrieved for this turn:
${list(formats, () => "")}

- A format is not an interface: never call open_interface for one. If a format
  fits, write your chat reply in that shape with markdown (headings, numbered
  or bulleted lists, bold names, linked sources).`
    : "";
  return `${interfaceBlock}${formatBlock}

If nothing fits well, do NOT call open_interface: just reply in chat.`;
};

const writeInterfaceTool = tool({
  description:
    "Write or replace the open interface's content. For search, also pass filters chip labels when refining. Keep chat replies short.",
  inputSchema: z.object({
    title: z
      .string()
      .optional()
      .describe("Optional updated interface title / query"),
    content: z
      .string()
      .describe(
        "Full interface body (document markdown, search result bullets, a markdown table, or moodboard notes)",
      ),
    filters: z
      .array(z.string())
      .optional()
      .describe(
        'For search: full list of active filter chip labels to show (e.g. ["North Beach", "papers"])',
      ),
  }),
  execute: async ({ title, content, filters }) => ({
    ok: true as const,
    title: title ?? null,
    filters: filters ?? null,
    chars: content.length,
  }),
});

/** Model and default prompt used by the lab. */
export async function GET() {
  return new Response(
    JSON.stringify({
      model: chatLabModel(),
      systemPrompt: DEFAULT_CHAT_LAB_SYSTEM_PROMPT,
      configured: !apiKeyMissing(),
    }),
    { headers: { "content-type": "application/json" } },
  );
}

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();

  const {
    messages,
    system,
    artefact,
    interfaceCandidates,
    chatModes,
    tracked: trackedInput,
    open: openInput,
    retrieval,
  }: {
    messages: UIMessage[];
    system?: string;
    artefact?: ArtefactContext | null;
    /** Interfaces this thread keeps current, whatever is open. */
    tracked?: TrackedContext[] | null;
    /** Every other interface open beside the chat. */
    open?: OpenContext[] | null;
    /** Hybrid retrieval: the app's keyword ranking and catalogue, merged here with a ranking by meaning. */
    retrieval?: RetrievalInput | null;
    interfaceCandidates?: InterfaceCandidate[] | null;
    /** From a Chat card: who replies (each turn) and how the first reply is laid out. */
    chatModes?: { persona?: { label: string; instruction: string }; format?: string; context?: string } | null;
  } = await req.json();
  const model = chatLabModel();
  const baseSystem = system?.trim() || DEFAULT_CHAT_LAB_SYSTEM_PROMPT;
  // The interfaces this turn could make: keywords and meaning merged when the app sends both, else its own list.
  const retrieved = retrieval ? await hybridCandidates(retrieval) : null;
  if (retrieved) console.log(`  [ai:retrieval] ${retrieved.trace}`);
  const candidates = (retrieved?.candidates as InterfaceCandidate[] | undefined) ?? interfaceCandidates?.slice(0, 5) ?? [];
  const tracked = (trackedInput ?? []).filter((entry) => roleSpec(entry.kind, entry.role));
  const others = (openInput ?? []).slice(0, 6);

  // Every catalogue interface in view (the one used last and the others open), by id, with what it holds now.
  const parse = (kind: CatalogueKind, value?: string) => {
    if (!value) return null;
    try {
      return readCatalogueValue(kind, JSON.parse(value));
    } catch {
      return null;
    }
  };
  type InView = { id: string; kind: CatalogueKind; label: string; title: string; current: CatalogueValue | null; focused: boolean };
  const inView: InView[] = [
    ...(artefact && isCatalogueKind(artefact.kind)
      ? [{ id: artefact.id ?? "open", kind: artefact.kind, label: CATALOGUE[artefact.kind].label, title: artefact.title, current: parse(artefact.kind, artefact.value), focused: true }]
      : []),
    ...others.flatMap((entry) =>
      isCatalogueKind(entry.kind) ? [{ id: entry.id, kind: entry.kind, label: CATALOGUE[entry.kind].label, title: entry.title, current: parse(entry.kind, entry.value), focused: false }] : [],
    ),
  ];

  // The rules for what's in play: each interface being made (its kind's lines once), and each tracked one.
  const inPlay: InPlay[] = [
    ...[...new Map(inView.map((entry) => [entry.kind, entry])).values()].map((entry) => ({ kind: entry.kind as ShellKind, role: "make" as const, label: entry.label })),
    ...tracked.map((entry) => ({ kind: entry.kind, role: entry.role, label: entry.label })),
  ];
  const roleRules =
    [
      inViewAddon(inView, others),
      inPlay.length ? rulesFor(inPlay) : null,
      !tracked.some((entry) => entry.kind === "tracker") && tracked.some((entry) => entry.kind === "notes") ? PROGRESS_START.rules.map((line) => `- ${line}`).join("\n") : null,
    ]
      .filter(Boolean)
      .join("\n\n") || null;
  const latestAsk = [...messages].reverse().find((message) => message.role === "user");
  const latestText = (latestAsk?.parts ?? []).map((part) => (part.type === "text" ? part.text : "")).join(" ");
  // What questions can fill: the interfaces in view and the tracked ones.
  const askTargets = [
    ...inView.map((entry) => ({ id: entry.id, kind: entry.kind as ShellKind, label: entry.label, title: entry.title })),
    ...tracked.map((entry) => ({ id: entry.id, kind: entry.kind, label: entry.label, title: entry.title })),
  ];
  const fullSystem = [
    baseSystem,
    // The chat's chart block, only when the request is about numbers.
    wantsChart(latestText) ? CHART_BLOCK : null,
    chatModes?.persona ? `Assistant for this thread: ${chatModes.persona.label}. ${chatModes.persona.instruction}` : null,
    chatModes?.format ? `Reply format: ${chatModes.format} Use ordinary markdown text; nothing opens.` : null,
    chatModes?.context ?? null,
    artefact ? artefactSystemAddon(artefact) : null,
    !artefact && candidates.length > 0
      ? candidatesSystemAddon(candidates)
      : artefact && candidates.some((candidate) => candidate.layer !== "format")
        ? `To make something new rather than change what's open (a recipe while the menu is open), these fit the request:${candidatesSystemAddon(candidates.filter((candidate) => candidate.layer !== "format"))}`
        : null,
    roleRules,
    askAddon(askTargets),
  ]
    .filter(Boolean)
    .join("\n\n");

  // Formats shape the reply; only interfaces can be opened.
  const candidateIds = candidates.filter((candidate) => candidate.layer !== "format").map((candidate) => candidate.id);
  const openInterfaceSchema =
    candidateIds.length > 0
      ? z.object({
          id: z
            .enum(candidateIds as [string, ...string[]])
            .describe("Candidate id from the retrieved library list"),
          title: z
            .string()
            .describe("Short title for the interface (topic / query)"),
        })
      : null;

  // Catalogue interfaces: those in view, or the ones this turn could open.
  const openKind = artefact && isCatalogueKind(artefact.kind) ? artefact.kind : null;
  const fillKinds: CatalogueKind[] = [
    ...new Set([
      ...inView.map((entry) => entry.kind),
      // The kinds this request could make: offered whatever's open, so a new one can be made beside it.
      ...CATALOGUE_KINDS.filter((kind) => candidates.some((candidate) => candidate.layer !== "format" && candidate.opensAs === kind)),
    ]),
  ];
  const fillTools: ToolSet = Object.fromEntries(
    fillKinds.map((kind) => {
      const ofKind = inView.filter((entry) => entry.kind === kind);
      const focused = ofKind.find((entry) => entry.focused);
      const schema = ofKind.length
        ? CATALOGUE[kind].schema.extend({
            id: z
              .enum(ofKind.map((entry) => entry.id) as [string, ...string[]])
              .optional()
              .describe(
                focused
                  ? `Which open ${CATALOGUE[kind].label.toLowerCase()} to write over. Leave out for the one they used last (${focused.id}).`
                  : `Which open ${CATALOGUE[kind].label.toLowerCase()} to write over. Leave out to make a new one.`,
              ),
          })
        : CATALOGUE[kind].schema;
      return [
        CATALOGUE[kind].tool,
        tool({
          description: `Write a ${CATALOGUE[kind].label}. ${CATALOGUE[kind].description} It is drawn as you write, so put the title first.`,
          inputSchema: schema as typeof CATALOGUE[typeof kind]["schema"],
          execute: async (input: unknown) => {
            const value = readCatalogueValue(kind, input);
            if (!value) return { ok: false as const, error: "Nothing to fill." };
            const id = (input as { id?: string }).id;
            const target = ofKind.find((entry) => entry.id === id) ?? focused;
            if (target) target.current = value;
            return { ok: true as const, filled: catalogueSummary(kind, value) };
          },
        }),
      ];
    }),
  );
  const patchable = inView.filter((entry) => entry.current);
  const updateTool: ToolSet = patchable.length
    ? {
        update_interface: tool({
          description: `Change part of an open interface without rewriting it: add, replace or remove at a path. Open: ${patchable.map((entry) => `${entry.label} "${entry.title}" (${entry.id})`).join(", ")}.`,
          inputSchema: z.object({
            id: (patchable.length > 1 ? z.enum(patchable.map((entry) => entry.id) as [string, ...string[]]) : z.enum([patchable[0]!.id]).optional()).describe(
              "Which interface, by id",
            ),
            operations: z.array(operationSchema).min(1),
          }),
          execute: async ({ id, operations }) => {
            const target = patchable.find((entry) => entry.id === id) ?? patchable.find((entry) => entry.focused) ?? patchable[0];
            if (!target?.current) return { ok: false as const, error: "Nothing open to change by that id." };
            const result = applyCatalogueOperations(target.kind, target.current, operations);
            if (!result.ok) return { ok: false as const, error: result.error };
            target.current = result.value;
            return { ok: true as const, now: catalogueSummary(target.kind, result.value) };
          },
        }),
      }
    : {};
  // Search and Moodboard are still written as text.
  const needsWrite = artefact
    ? !openKind && artefact.kind !== "shell"
    : candidates.some((candidate) => candidate.layer !== "format" && !isCatalogueKind(candidate.opensAs));

  const started = logAiStart(
    "chat-lab",
    `${model} · ${messages.length} message(s)${artefact ? ` · ${artefact.kind}` : ""}${candidates.length ? ` · ${candidates.length} candidates` : ""}`,
  );

  // An explicit request to make something always makes it: when the latest
  // message asks to make a thing (and nothing of that kind is in view to
  // change), the first step opens an interface. The rules shape how it's
  // written; whether it's made isn't left to the model.
  const lastAsk = [...messages].reverse().find((message) => message.role === "user");
  const askText = (lastAsk?.parts ?? []).map((part) => (part.type === "text" ? part.text : "")).join(" ");
  const offered = candidates.filter((candidate) => candidate.layer !== "format");
  const mustMake =
    !!openInterfaceSchema &&
    MAKE_REQUEST.test(askText) &&
    offered.length > 0 &&
    !inView.some((entry) => entry.kind === offered[0]!.opensAs) &&
    !(artefact && artefact.kind === offered[0]!.opensAs);

  const tools: ToolSet = {
      ask: tool({
        description: "Ask the person one to three questions, each answered with a tiny interface (a stepper, chips, Yes and No) and your guess already in place. Then stop: their answers come back as their next message.",
        inputSchema: askInputSchema,
        execute: async (input) => {
          const questions = normalizeQuestions(input, askTargets);
          return questions.length ? { ok: true as const, questions } : { ok: false as const, error: "No question could be asked: check each question's for and field." };
        },
      }),
      web_search: openai.tools.webSearch({ searchContextSize: "low" }),
      ...(needsWrite ? { write_interface: writeInterfaceTool } : {}),
      ...fillTools,
      ...updateTool,
      ...trackedTools(tracked),
      ...(openInterfaceSchema
        ? {
            open_interface: tool({
              description:
                "Open one retrieved interface for this turn. Skip this tool to stay in plain chat. Follow with its fill tool, or write_interface, to fill it.",
              inputSchema: openInterfaceSchema,
              execute: async ({ id, title }) => {
                const match = candidates.find((candidate) => candidate.id === id);
                return {
                  ok: true as const,
                  id,
                  opensAs: match?.opensAs ?? "document",
                  title,
                };
              },
            }),
          }
        : {}),
    };
  const modelMessages = [
      // No version of any interface stays in the history: those in use are sent as they are now, below (see artifact-history.ts).
      ...compactArtifactHistory(await convertToModelMessages(messages), {
        writes: [...Object.keys(FILL_TOOL_KIND), "write_interface", "update_interface"],
      }),
      ...(artefact && artefactContents(artefact) ? [{ role: "system" as const, content: artefactContents(artefact)! }] : []),
      ...others.flatMap((entry) => (openContents(entry) ? [{ role: "system" as const, content: openContents(entry)! }] : [])),
      ...(trackedContents(tracked) ? [{ role: "system" as const, content: trackedContents(tracked)! }] : []),
    ];
  // Dev only: CHAT_LAB_PROMPT_DUMP=<folder> writes each request as the model gets it (system, messages, tools).
  if (process.env.CHAT_LAB_PROMPT_DUMP) await dumpPrompt(process.env.CHAT_LAB_PROMPT_DUMP, fullSystem, modelMessages, tools);

  const result = streamText({
    model: openai.responses(model),
    tools,
    prepareStep: ({ stepNumber }) => (mustMake && stepNumber === 0 ? { toolChoice: { type: "tool" as const, toolName: "open_interface" } } : {}),
    // Asking ends the turn: the answers come back as the next message.
    stopWhen: [stepCountIs(
      // Keeping tracked interfaces current takes a step or two of its own.
      (tracked.length ? 2 : 0) +
        (artefact?.kind === "search" ||
        (!artefact &&
          candidates.some((candidate) => candidate.opensAs === "search"))
          ? 5
          : artefact || candidates.length
            ? 4
            : 2),
    ), hasToolCall("ask")],
    system: fullSystem,
    messages: modelMessages,
    providerOptions: {
      openai: {
        reasoningEffort: "low",
        reasoningSummary: "concise",
      },
    },
    onFinish: (event) => logAiFinish("chat-lab", started, event),
    onError: ({ error }) => logAiError("chat-lab", error),
  });

  return result.toUIMessageStreamResponse();
}
