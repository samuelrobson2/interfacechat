import { z } from "zod";

/**
 * The catalogue: one entry per interface the model can fill. An entry's schema
 * is the model's tool input, the text it reads about the interface's fields,
 * and what its writes are checked against. Read by the app and by the chat API
 * (`api/_ai-chat-lab.ts`), so it imports nothing but zod.
 *
 * Piloted on Document, Table and Tracker.
 */
export const CATALOGUE_KINDS = ["document", "table", "tracker"] as const;
export type CatalogueKind = (typeof CATALOGUE_KINDS)[number];

/** One entry per interface, not per size: the app places it, and this is the model's say. */
const placement = z
  .enum(["inline", "window"])
  .optional()
  .describe(
    "Where it should show: inline in the reply (short, to glance at) or in its own window (long, or to keep working on). Leave out to let the app decide.",
  );

const documentSchema = z.object({
  title: z.string().describe("The document's title, without markdown."),
  placement,
  body: z
    .string()
    .describe("The writing, as markdown: headings, paragraphs, lists and quotes. Do not repeat the title as a heading."),
});

const tableSchema = z.object({
  title: z.string().describe("What the table lists, such as Shot list."),
  placement,
  columns: z
    .array(
      z.object({
        label: z.string().describe("The column's heading."),
        type: z
          .enum(["text", "tag", "image"])
          .optional()
          .describe("text by default; tag for a category that repeats; image for a picture URL."),
      }),
    )
    .min(1)
    .describe("The columns, in order."),
  rows: z
    .array(z.array(z.string()))
    .describe("One list of cells per row, in column order. An image cell holds the image's URL."),
});

const trackerSchema = z.object({
  title: z.string().describe("What the checklist is for."),
  placement,
  groups: z.array(z.string()).optional().describe("Optional sections, such as Locations or Crew."),
  items: z
    .array(
      z.object({
        label: z.string().describe("The thing to do, in a few words."),
        owner: z.string().optional().describe("Who does it."),
        due: z.string().optional().describe("When it's due, as short text such as Fri 4 Dec."),
        done: z.boolean().optional().describe("True once it's finished. False unless told otherwise."),
        group: z.string().optional().describe("One of the groups."),
      }),
    )
    .describe("Each thing to do, in order."),
});

const SCHEMAS = { document: documentSchema, table: tableSchema, tracker: trackerSchema };

export type CatalogueValueByKind = {
  document: z.infer<typeof documentSchema>;
  table: z.infer<typeof tableSchema>;
  tracker: z.infer<typeof trackerSchema>;
};
export type CatalogueValue = CatalogueValueByKind[CatalogueKind];

export type CatalogueEntry<K extends CatalogueKind = CatalogueKind> = {
  kind: K;
  label: string;
  /** The tool that fills it. */
  tool: `fill_${K}`;
  description: string;
  /** How to write it well, as lines of the system prompt. */
  guidance: string[];
  schema: (typeof SCHEMAS)[K];
};

export const CATALOGUE: { [K in CatalogueKind]: CatalogueEntry<K> } = {
  document: {
    kind: "document",
    label: "Document",
    tool: "fill_document",
    description: "A piece of writing the user creates and edits: a paper, report, memo or email.",
    guidance: [
      "Work in stages: outline, then a section, then revise. Prefer one stage at a time over a finished paper.",
      "Send the whole body for the current stage; do not paste the document into chat.",
      "Help the user develop their own reasoning rather than picking wording or a conclusion for them.",
    ],
    schema: documentSchema,
  },
  table: {
    kind: "table",
    label: "Table",
    tool: "fill_table",
    description: "Columns and rows of text, tags or pictures: a shot list or a comparison.",
    guidance: [
      'If the user listed columns (e.g. "Columns: Shot, Framing, Cast"), use exactly those, in that order. Otherwise choose a few clear columns.',
      "Keep cells short (a few words). Repeat the same wording for categories so they read as tags.",
      "Only use real image URLs (from web_search) in image columns; otherwise leave the cell empty.",
    ],
    schema: tableSchema,
  },
  tracker: {
    kind: "tracker",
    label: "Tracker",
    tool: "fill_tracker",
    description: "The steps to get something done, with owners, due dates and what's finished.",
    guidance: [
      "One item per thing to do, a few words each, in the order they'd be done.",
      "Only give an owner or a due date the user gave or plainly implied.",
      "Use groups only when the items fall into a few clear sections.",
    ],
    schema: trackerSchema,
  },
};

export const FILL_TOOL_KIND: Record<string, CatalogueKind> = Object.fromEntries(
  CATALOGUE_KINDS.map((kind) => [CATALOGUE[kind].tool, kind]),
);

export function isCatalogueKind(kind: unknown): kind is CatalogueKind {
  return typeof kind === "string" && (CATALOGUE_KINDS as readonly string[]).includes(kind);
}

type JsonSchema = {
  type?: string;
  description?: string;
  enum?: unknown[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
};

function fieldLines(schema: JsonSchema): string[] {
  return Object.entries(schema.properties ?? {}).map(([key, field]) => {
    const type = field.enum
      ? field.enum.join(" | ")
      : field.type === "array"
        ? "list"
        : field.type === "string"
          ? "text"
          : field.type === "boolean"
            ? "yes/no"
            : (field.type ?? "any");
    const required = schema.required?.includes(key) ? ", required" : "";
    const each = field.items?.properties ? ` Each: ${fieldLines(field.items).join("; ")}.` : "";
    return `${key} (${type}${required}): ${field.description ?? ""}${each}`;
  });
}

/** An interface's fields as the model reads them, generated from its schema. */
export function catalogueFields(kind: CatalogueKind): string {
  return fieldLines(z.toJSONSchema(SCHEMAS[kind]) as JsonSchema).join("; ");
}

/** Web search leaves citation markers in private-use characters; they aren't content. */
const CITATION = /\s*\uE200[^\uE201]*\uE201?/g;
const text = (value: unknown) => (typeof value === "string" ? value.replace(CITATION, "") : "");
const optionalText = (value: unknown) => text(value).trim() || undefined;
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

function readPlacement(value: unknown): "inline" | "window" | undefined {
  return value === "inline" || value === "window" ? value : undefined;
}

/**
 * Read a fill that may still be streaming, or be slightly off: keep what is
 * usable, drop what isn't (a column with no label yet, an item with no text),
 * and square the table up. Null when there's nothing to read.
 */
export function readCatalogueValue<K extends CatalogueKind>(kind: K, input: unknown): CatalogueValueByKind[K] | null;
export function readCatalogueValue(kind: CatalogueKind, input: unknown): CatalogueValue | null {
  const source = record(input);
  if (!source) return null;
  const where = readPlacement(source.placement);
  const base = { title: text(source.title), ...(where ? { placement: where } : {}) };

  if (kind === "document") return { ...base, body: text(source.body) };

  if (kind === "table") {
    const columns = list(source.columns).flatMap((column) => {
      const label = text(record(column)?.label);
      if (!label) return [];
      const type = record(column)?.type;
      return [{ label, ...(type === "tag" || type === "image" || type === "text" ? { type } : {}) } as CatalogueValueByKind["table"]["columns"][number]];
    });
    const rows = list(source.rows)
      .filter(Array.isArray)
      .map((cells) => columns.map((_, index) => (typeof cells[index] === "number" ? String(cells[index]) : text(cells[index]))));
    return { ...base, columns, rows };
  }

  const items = list(source.items).flatMap((item) => {
    const fields = record(item);
    const label = text(fields?.label);
    if (!fields || !label) return [];
    return [
      {
        label,
        ...(optionalText(fields.owner) ? { owner: optionalText(fields.owner) } : {}),
        ...(optionalText(fields.due) ? { due: optionalText(fields.due) } : {}),
        ...(typeof fields.done === "boolean" ? { done: fields.done } : {}),
        ...(optionalText(fields.group) ? { group: optionalText(fields.group) } : {}),
      },
    ];
  });
  const groups = list(source.groups).filter((group): group is string => typeof group === "string" && !!group.trim());
  return { ...base, ...(groups.length ? { groups } : {}), items };
}

/** A change to part of an interface, after JSON Patch: a path such as `/rows/2/1` or `/items/-`. */
export const operationSchema = z.object({
  op: z.enum(["add", "replace", "remove"]).describe("add inserts into a list or sets a field; replace overwrites; remove deletes."),
  path: z
    .string()
    .describe('Where, as a slash path with zero-based list positions: "/title", "/rows/2/1", "/items/0/done". "/rows/-" or "/items/-" adds to the end.'),
  value: z.any().optional().describe("The new value for add and replace, in the shape that path holds."),
});
export type CatalogueOperation = z.infer<typeof operationSchema>;

type Applied<K extends CatalogueKind> = { ok: true; value: CatalogueValueByKind[K] } | { ok: false; error: string };

/** Apply operations in order, then check the result against the interface's schema. */
export function applyCatalogueOperations<K extends CatalogueKind>(
  kind: K,
  current: CatalogueValueByKind[K],
  operations: CatalogueOperation[],
): Applied<K> {
  const draft = structuredClone(current) as Record<string, unknown>;

  for (const { op, path, value } of operations) {
    const keys = path.split("/").slice(1).map((key) => key.replace(/~1/g, "/").replace(/~0/g, "~"));
    const last = keys.pop();
    if (!path.startsWith("/") || last === undefined) return { ok: false, error: `"${path}" is not a path. Use a slash path such as /title.` };
    if (op !== "remove" && value === undefined) return { ok: false, error: `${op} at ${path} needs a value.` };

    let parent: unknown = draft;
    for (const key of keys) {
      parent = Array.isArray(parent) ? parent[Number(key)] : record(parent)?.[key];
      if (parent === null || typeof parent !== "object") return { ok: false, error: `Nothing at ${path}.` };
    }

    if (Array.isArray(parent)) {
      const index = last === "-" ? parent.length : Number(last);
      const limit = op === "add" ? parent.length : parent.length - 1;
      if (!Number.isInteger(index) || index < 0 || index > limit) {
        return { ok: false, error: `No position ${last} at ${path}: the list has ${parent.length}.` };
      }
      // A table's cells follow its columns.
      if (kind === "table" && keys.length === 1 && keys[0] === "columns" && op !== "replace") {
        for (const row of list(draft.rows)) {
          if (!Array.isArray(row)) continue;
          if (op === "remove") row.splice(index, 1);
          else row.splice(index, 0, "");
        }
      }
      if (op === "add") parent.splice(index, 0, value);
      else if (op === "replace") parent[index] = value;
      else parent.splice(index, 1);
    } else {
      const fields = parent as Record<string, unknown>;
      if (op === "remove") delete fields[last];
      else fields[last] = value;
    }
  }

  const parsed = SCHEMAS[kind].safeParse(draft);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 3).map((issue) => `/${issue.path.join("/")}: ${issue.message}`);
    return { ok: false, error: `That would leave the ${CATALOGUE[kind].label.toLowerCase()} invalid. ${issues.join("; ")}` };
  }
  return { ok: true, value: readCatalogueValue(kind, parsed.data) as CatalogueValueByKind[K] };
}

/** One line on what a fill holds, for the tool's result. */
export function catalogueSummary(kind: CatalogueKind, value: CatalogueValue): string {
  if (kind === "table") {
    const table = value as CatalogueValueByKind["table"];
    return `${table.columns.length} columns, ${table.rows.length} rows`;
  }
  if (kind === "tracker") return `${(value as CatalogueValueByKind["tracker"]).items.length} items`;
  return `${(value as CatalogueValueByKind["document"]).body.length} characters`;
}
