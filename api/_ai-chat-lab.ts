import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
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

type InterfaceKind = "document" | "search" | "table" | "moodboard";

type ArtefactContext = {
  kind: InterfaceKind | "shell";
  title: string;
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

const artefactSystemAddon = (artefact: ArtefactContext) => {
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
  if (artefact.kind === "document") {
    return `
The user has an open Document interface titled "${artefact.title}".

Routing rules:
- Work in stages: outline, then a section, then revise. Prefer updating one
  stage at a time over dumping a finished paper.
- When producing or revising the document itself, call write_interface with the
  full markdown body for the current stage. Do not paste the full document into
  the chat.
- Keep chat messages short: questions, options, or what to decide next. Help
  the user develop their own reasoning rather than picking wording or a
  conclusion for them.
- If the user is just chatting, reply in chat only and skip write_interface.`;
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
  if (artefact.kind === "table") {
    return `
The user has an open Table interface titled "${artefact.title}".

Routing rules:
- When building or revising the table, call write_interface with content as one
  GitHub-flavoured markdown table: a header row, a --- separator row, then one
  row per item. Always send the full table, not just the changed rows.
- If the user listed columns (e.g. "Columns: Shot, Framing, Cast"), use exactly
  those columns in that order. Otherwise choose a few clear columns.
- Keep cells short (a few words). Repeat the same wording for categories so they
  read as tags (e.g. "Wide", "Close-up").
- For picture columns, put a markdown image in the cell: ![alt](https://…).
  Only use real image URLs (from web_search); otherwise leave the cell empty.
- Keep chat messages short: what you filled in or a clarifying question. Do not
  paste the table into chat.
- If the user is just chatting, reply in chat only and skip write_interface.`;
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

const candidatesSystemAddon = (candidates: InterfaceCandidate[]) => {
  const interfaces = candidates.filter((candidate) => candidate.layer !== "format");
  const formats = candidates.filter((candidate) => candidate.layer === "format");
  const list = (items: InterfaceCandidate[], arrow: (c: InterfaceCandidate) => string) =>
    items.map((candidate, index) => `${index + 1}. id="${candidate.id}" (${candidate.label})${arrow(candidate)}: ${candidate.description}`).join("\n");
  const interfaceBlock = interfaces.length
    ? `
Interfaces (surfaces to open beside the chat), retrieved for this turn:
${list(interfaces, (c) => ` → opens as ${c.opensAs}`)}

- If an interface clearly fits, call open_interface with that candidate's id and
  a short title for it. Prefer the listed candidates only.
- Right after opening, call write_interface to seed the interface body (and
  filters for search). Keep the chat reply short.
- For search, call web_search before write_interface, and write one result per
  line as "- [Title](https://source.url) — one-sentence finding".
- For a table, write the content as one GitHub-flavoured markdown table (header
  row, --- separator, one row per item, short cells).
- Never open more than one interface in a single turn.`
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

  const started = logAiStart(
    "chat-lab",
    `${model} · ${messages.length} message(s)${artefact ? ` · ${artefact.kind}` : ""}${candidates.length ? ` · ${candidates.length} candidates` : ""}`,
  );

  const result = streamText({
    model: openai.responses(model),
    tools: {
      web_search: openai.tools.webSearch({ searchContextSize: "low" }),
      ...(artefact || candidates.length > 0
        ? { write_interface: writeInterfaceTool }
        : {}),
      ...(!artefact && openInterfaceSchema
        ? {
            open_interface: tool({
              description:
                "Open one retrieved interface for this turn. Skip this tool to stay in plain chat. Follow with write_interface to fill it.",
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
