import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError } from "./_shared.js";

// Fills an interface shell's parts for a suggestion: title, main text, an
// optional project tag, and details particular to each interface.
export const maxDuration = 30;

type ShellKind = "document" | "search" | "table";

const base = {
  title: z.string().describe("Short title, under 48 characters, sentence case"),
  text: z.string().describe("Main text, one or two sentences"),
  project: z
    .string()
    .nullable()
    .describe(
      "A broader ongoing project this belongs to, 1 to 3 words, or null when it stands alone",
    ),
};

const SCHEMAS = {
  document: z.object({
    ...base,
    details: z.object({
      outline: z.array(z.string()).min(3).max(6).describe("Section headings, 2 to 5 words each"),
      length: z.string().describe('Target length, e.g. "~1,500 words"'),
    }),
  }),
  search: z.object({
    title: z.string().describe("The main search query, as a person would type it"),
    project: base.project,
    details: z.object({
      queries: z
        .array(z.string())
        .min(3)
        .max(5)
        .describe(
          "Other queries the search would actually run: distinct wordings and angles of the same question, not results",
        ),
      filters: z
        .array(z.string())
        .max(3)
        .describe('Chip labels: source types ("Web", "News", "Papers", "Images") or short topic narrowers'),
      sources: z
        .array(z.string())
        .min(2)
        .max(4)
        .describe("Real, well-known domains worth searching first, e.g. nature.com"),
    }),
  }),
  table: z.object({
    ...base,
    details: z.object({
      columns: z
        .array(
          z.object({
            label: z.string().describe("Column name, 1 to 3 words"),
            type: z
              .enum(["text", "tag", "image"])
              .describe("tag for short repeated categories, image for pictures"),
          }),
        )
        .min(3)
        .max(8),
      rowCount: z.number().int().min(1).max(50).describe("Rows the finished table will likely have"),
    }),
  }),
} as const;

const SLOT_GUIDE: Record<ShellKind, string> = {
  document: `This is a Document interface. title: the document's title. text: its opening
paragraph, in the document's own voice. details.outline: the section headings it
will cover. details.length: a sensible target length.`,
  search: `This is a Search interface, shown before any results exist. title: the main
search query, as someone would type it. details.queries: three to five other
queries the search would actually run, each a different wording or angle of the
same question. These are searches, not results, titles, or descriptions.
details.filters: chips that narrow the search. details.sources: real domains to
look at first.`,
  table: `This is a Table interface. title: the table's name. text: what one row is
("One row per ..."). details.columns: the columns in order, the first one naming
each row. details.rowCount: how many rows it will likely have.`,
};

// Invented suggestions drift generic without a field to work in.
const FIELDS = [
  "urban planning",
  "film production",
  "marine biology",
  "a product launch",
  "restaurant opening",
  "secondary school teaching",
  "architecture",
  "climate policy",
  "a podcast",
  "museum curation",
  "clinical research",
  "travel planning",
];

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();

  const {
    kind,
    prompt,
    project,
  }: { kind: ShellKind; prompt?: string; project?: string } = await req.json();
  const schema = SCHEMAS[kind];
  if (!schema) {
    return new Response(JSON.stringify({ error: `Unknown interface "${kind}"` }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const { object } = await generateObject({
      model: openai(chatLabModel()),
      schema,
      system: `You fill in the parts of an interface a chat assistant is about to open, so
the person sees a ready-made starting point.

${SLOT_GUIDE[kind]}

The title names the artefact itself ("Ferry dock repair schedule"), never advice
("Start with..."). The parts describe that artefact, not the request.

Only set project when the request clearly belongs to a broader, ongoing piece of
work (a study, a film, a thesis, a product launch); otherwise null. Be concrete
and plausible, never generic. Never use em dashes.`,
      prompt: [
        prompt?.trim()
          ? `The suggestion to fill: ${prompt.trim()}`
          : `Invent one concrete request someone working in ${pick(FIELDS)} would ask an assistant for, that this interface suits. Fill the parts for the artefact it opens. Name real places, materials or methods.`,
        project?.trim() ? `It belongs to the project "${project.trim()}".` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return new Response(
      JSON.stringify({
        fill: { ...object, project: project?.trim() || object.project || undefined },
      }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (error) {
    logAiError("interface-fill", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
