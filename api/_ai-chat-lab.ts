import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
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
  isCatalogueKind,
  operationSchema,
  readCatalogueValue,
  type CatalogueKind,
  type CatalogueValue,
} from "../src/features/interface-shells/model/shell-catalogue.js";
import { chatLabModel, DEFAULT_CHAT_LAB_SYSTEM_PROMPT } from "./_chat-lab.js";
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

type InterfaceKind = "document" | "search" | "table" | "moodboard" | "tracker" | "dashboard" | "article";

type ArtefactContext = {
  kind: InterfaceKind | "shell";
  title: string;
  /** A catalogue interface's contents, as JSON in its schema's shape. */
  value?: string;
  /** Active filter chips already on the search interface. */
  filters?: string[];
  /** kind "shell": which library interface is open, and its contents as JSON. */
  label?: string;
  snapshot?: string;
};

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
  document: "a passage",
  table: "a cell, row or column",
  tracker: "an item, an owner, what's done",
  dashboard: "a block, a chart's type, a filter, a dataset's label",
  article: "a paragraph, a chart, a control, a code cell",
};

/** A catalogue interface that's open: how to fill it and how to change part of it. */
const catalogueSystemAddon = (kind: CatalogueKind, artefact: ArtefactContext) => {
  const entry = CATALOGUE[kind];
  const name = entry.label.toLowerCase();
  const contents = artefact.value
    ? `Its current contents, as JSON (list positions start at 0):\n${artefact.value}`
    : "Its contents are too long to show here.";
  const change = artefact.value
    ? kind === "document"
      ? "- To rename it, call update_interface with a replace on /title. To change the writing, call fill_document with the new body."
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
${entry.guidance.map((line) => `- ${line}`).join("\n")}
- Keep chat messages short: what you did, or a question. Do not paste the ${name} into chat.
- If the user is just chatting, reply in chat only and skip the tools.`;
};

const artefactSystemAddon = (artefact: ArtefactContext) => {
  if (isCatalogueKind(artefact.kind)) return catalogueSystemAddon(artefact.kind, artefact);
  if (artefact.kind === "shell") {
    return `
The user has a ${artefact.label ?? "library"} interface titled "${artefact.title}" open beside the chat.
They edit it directly. Its current contents, as JSON:
${artefact.snapshot ?? "{}"}

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
  }: {
    messages: UIMessage[];
    system?: string;
    artefact?: ArtefactContext | null;
    interfaceCandidates?: InterfaceCandidate[] | null;
    /** From a Chat card: who replies (each turn) and how the first reply is laid out. */
    chatModes?: { persona?: { label: string; instruction: string }; format?: string } | null;
  } = await req.json();
  const model = chatLabModel();
  const baseSystem = system?.trim() || DEFAULT_CHAT_LAB_SYSTEM_PROMPT;
  const candidates = interfaceCandidates?.slice(0, 5) ?? [];
  const fullSystem = [
    baseSystem,
    chatModes?.persona ? `Assistant for this thread: ${chatModes.persona.label}. ${chatModes.persona.instruction}` : null,
    chatModes?.format ? `Reply format: ${chatModes.format} Use ordinary markdown text; nothing opens.` : null,
    artefact ? artefactSystemAddon(artefact) : null,
    !artefact && candidates.length > 0
      ? candidatesSystemAddon(candidates)
      : null,
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

  // Catalogue interfaces: the one that's open, or the ones this turn could open.
  const openKind = artefact && isCatalogueKind(artefact.kind) ? artefact.kind : null;
  const fillKinds: CatalogueKind[] = openKind
    ? [openKind]
    : artefact
      ? []
      : CATALOGUE_KINDS.filter((kind) => candidates.some((candidate) => candidate.layer !== "format" && candidate.opensAs === kind));
  // What the open interface holds as this request goes on, so a later change is checked against it.
  let current: CatalogueValue | null = null;
  if (openKind && artefact?.value) {
    try {
      current = readCatalogueValue(openKind, JSON.parse(artefact.value));
    } catch {
      current = null;
    }
  }
  const fillTools: ToolSet = Object.fromEntries(
    fillKinds.map((kind) => [
      CATALOGUE[kind].tool,
      tool({
        description: `Fill the ${CATALOGUE[kind].label} interface. ${CATALOGUE[kind].description} It is drawn as you write, so put the title first.`,
        inputSchema: CATALOGUE[kind].schema,
        execute: async (input: unknown) => {
          const value = readCatalogueValue(kind, input);
          if (!value) return { ok: false as const, error: "Nothing to fill." };
          if (kind === openKind) current = value;
          return { ok: true as const, filled: catalogueSummary(kind, value) };
        },
      }),
    ]),
  );
  const updateTool: ToolSet =
    openKind && current
      ? {
          update_interface: tool({
            description: `Change part of the open ${CATALOGUE[openKind].label} without rewriting it: add, replace or remove at a path.`,
            inputSchema: z.object({ operations: z.array(operationSchema).min(1) }),
            execute: async ({ operations }) => {
              if (!current) return { ok: false as const, error: "Nothing is open to change." };
              const result = applyCatalogueOperations(openKind, current, operations);
              if (!result.ok) return { ok: false as const, error: result.error };
              current = result.value;
              return { ok: true as const, now: catalogueSummary(openKind, result.value) };
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

  const result = streamText({
    model: openai.responses(model),
    tools: {
      web_search: openai.tools.webSearch({ searchContextSize: "low" }),
      ...(needsWrite ? { write_interface: writeInterfaceTool } : {}),
      ...fillTools,
      ...updateTool,
      ...(!artefact && openInterfaceSchema
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
    },
    stopWhen: stepCountIs(
      artefact?.kind === "search" ||
        (!artefact &&
          candidates.some((candidate) => candidate.opensAs === "search"))
        ? 5
        : artefact || candidates.length
          ? 4
          : 2,
    ),
    system: fullSystem,
    messages: await convertToModelMessages(messages),
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
