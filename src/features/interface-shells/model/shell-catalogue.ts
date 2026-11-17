import { z } from "zod";
import { blockSchema, variableSchema } from "../apps/app-types.js";

/**
 * The catalogue: one entry per interface the model can fill. An entry's schema
 * is the model's tool input, the text it reads about the interface's fields,
 * and what its writes are checked against. Read by the app and by the chat API
 * (`api/_ai-chat-lab.ts`), so it imports nothing but zod (and the app
 * schemas, which import nothing but zod).
 *
 * Every P0 interface the model writes: Document (with or without live
 * pieces), Table, Tracker, Dashboard, Guide, Schedule and Generator. (Search
 * is written as results after a web search; Notes through its tracking tools;
 * Reader holds the person's own file.)
 */
export const CATALOGUE_KINDS = ["document", "table", "tracker", "dashboard", "guide", "schedule", "generator"] as const;
export type CatalogueKind = (typeof CATALOGUE_KINDS)[number];

/** One entry per interface, not per size: the app places it, and this is the model's say. */
const placement = z
  .enum(["inline", "window"])
  .optional()
  .describe(
    "Where it should show: inline in the reply (short, to glance at) or in its own window (long, or to keep working on). Leave out to let the app decide.",
  );

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

/**
 * Dashboard and Document share their data, variables and blocks. Datasets go
 * as columns and rows of cells, not objects, so sample data costs fewer tokens
 * and streams in a shape that's usable row by row.
 */
const cellSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const appDatasetSchema = z.object({
  id: z.string().describe("Short and lower case, such as sales. Blocks refer to the dataset by this."),
  label: z.string().describe("Its name in the Data menu, such as Sales by month."),
  from: z
    .enum(["sample", "code", "yours"])
    .describe(
      "sample: numbers you write in rows until the person's own arrive. code: what a code block emits (set that block's output to this id); leave rows empty. yours: the person's own data, marked by the app; never write it, only read its columns.",
    ),
  columns: z.array(z.string()).describe("Column names in order, short and without spaces: month, region, revenue."),
  rows: z.array(z.array(cellSchema)).describe("Sample rows, cells in column order, numbers as numbers. Empty for code and yours."),
  rowCount: z.number().int().optional().describe("Set by the app when only the first rows are shown. Never set it."),
});
const appParts = {
  datasets: z.array(appDatasetSchema).describe("Write the data first, so each block can draw as soon as it arrives."),
  variables: z
    .array(variableSchema)
    .describe('Controls people steer with. A block reads one as "$id" in a where clause. A choice with includeAll starts on "__all__".'),
  blocks: z.array(blockSchema).describe("Stats, charts, tables, text, controls and code, in reading order."),
};

/**
 * A document is writing, and can carry live pieces between its paragraphs
 * (what Article was): the same datasets, variables and blocks as a dashboard,
 * each block placed in the body by a line of its own, `::id`.
 */
const documentSchema = z.object({
  title: z.string().describe("The document's title, without markdown."),
  placement,
  body: z
    .string()
    .describe(
      "The writing, as markdown: headings, paragraphs, lists and quotes. Do not repeat the title as a heading. To place one of the blocks, put ::id on a line of its own where it belongs.",
    ),
  datasets: appParts.datasets.optional(),
  variables: appParts.variables.optional(),
  blocks: z
    .array(blockSchema)
    .optional()
    .describe("Live pieces placed in the body by ::id: stats, charts, tables, controls and code. Leave out for plain writing."),
});

const dashboardSchema = z.object({
  title: z.string().describe("What the dashboard tracks."),
  placement,
  description: z.string().optional().describe("One line on what it covers and where the numbers come from."),
  ...appParts,
});

const guideSchema = z.object({
  title: z.string().describe("What it makes or does, such as Fish stew for six."),
  placement,
  facts: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .describe("Two or three short facts this kind of guide calls for: Serves and Time for a recipe; Time, Difficulty and People for assembly."),
  needs: z
    .array(z.object({ text: z.string().describe("One thing needed, amount first: 400g white fish"), group: z.string().optional().describe("A section, such as Ingredients or Equipment") }))
    .describe("What's needed before starting, in the order it's used."),
  steps: z
    .array(
      z.object({
        text: z.string().describe("One step, in the imperative."),
        minutes: z.number().optional().describe("A timer for the step, when there's waiting."),
        note: z.string().optional().describe("A tip or warning for this step."),
      }),
    )
    .describe("The steps in order."),
});

const TIME = /^\d{1,2}:\d{2}$/;
const scheduleSchema = z.object({
  title: z.string().describe("What's being scheduled, such as Skincare shoot."),
  placement,
  start: z.string().optional().describe("The first day as an ISO date (2026-11-20), when it's known."),
  dayCount: z.number().int().min(1).max(14).describe("How many days it covers."),
  hours: z.array(z.string()).length(2).describe('The working hours each day spans, as ["08:00", "13:00"].'),
  constraints: z.array(z.string()).describe("Limits to plan around, short: Loft from 8am, Model until 1pm."),
  tasks: z
    .array(
      z.object({
        label: z.string().describe("What happens, in a few words."),
        day: z.number().int().min(1).describe("Which day, from 1."),
        start: z.string().regex(TIME).describe("Start time, 24-hour HH:MM."),
        end: z.string().regex(TIME).describe("End time, 24-hour HH:MM."),
        type: z.enum(["setup", "shoot", "travel", "break"]).describe("setup for preparing or packing down; shoot for the main work; travel; break for meals and rests."),
      }),
    )
    .describe("The blocks of the day, in time order."),
});

const generatorSchema = z.object({
  title: z.string().describe("The prompt: what to make, written as the person would ask for it."),
  placement,
  mode: z.enum(["text", "image"]).describe("text for words (a tagline, a caption, a name); image for pictures."),
  tone: z.string().optional().describe("Text: the tone, such as Warm or Confident."),
  length: z.string().optional().describe('Text: "short", "medium" or "long", or their own ("Under 10 words").'),
  style: z.string().optional().describe("Image: the style, such as Cinematic or Studio light."),
  aspect: z.enum(["1:1", "3:2", "2:3"]).optional().describe("Image: the shape."),
  variations: z.array(z.string()).optional().describe("Text only: three variations to choose from. Images are made when the person presses Generate; leave this out for images."),
});

const SCHEMAS = {
  document: documentSchema,
  table: tableSchema,
  tracker: trackerSchema,
  dashboard: dashboardSchema,
  guide: guideSchema,
  schedule: scheduleSchema,
  generator: generatorSchema,
};

export type CatalogueValueByKind = {
  document: z.infer<typeof documentSchema>;
  table: z.infer<typeof tableSchema>;
  tracker: z.infer<typeof trackerSchema>;
  dashboard: z.infer<typeof dashboardSchema>;
  guide: z.infer<typeof guideSchema>;
  schedule: z.infer<typeof scheduleSchema>;
  generator: z.infer<typeof generatorSchema>;
};
export type AppCatalogueDataset = z.infer<typeof appDatasetSchema>;
export type CatalogueValue = CatalogueValueByKind[CatalogueKind];

/** How Dashboard and a Document with live pieces use data: the person's own first, sample numbers only until theirs arrives. */
const APP_DATA_GUIDANCE = [
  "Write it in order: title, datasets, variables, then blocks. It is drawn as you write.",
  "A dataset marked from: yours is the person's own data (a file, a link, another interface). Build on it: read its columns (only the first rows are shown), refer to it by id, and never write rows for it.",
  "With no data of theirs, write sample data (from: sample): 20 to 60 realistic, consistent rows with plain column names. Say in chat that the numbers are samples and that they can bring their own from the Data menu.",
];

/** The same, for a document's live pieces. */
const APP_DATA_GUIDANCE_SHORT = [
  "Datasets marked from: yours are the person's own data: read their columns, refer to them by id, never write their rows. Otherwise write sample data (20 to 60 consistent rows) and say in chat that the numbers are samples.",
];

/** How their blocks are written, for both. */
const APP_BLOCK_GUIDANCE = [
  'Filter a block with query.where; read a variable as "$id", such as {"field": "region", "op": "eq", "value": "$region"}.',
  "Charts: line or area over time, bar for categories, point for two measures, arc for shares of a whole (x the category, y the amount). Set aggregate when several rows share an x.",
  "Code only for what blocks can't do (a forecast, a simulation, a custom drawing): plain JavaScript, run in a sandbox with data (its inputs by id), vars, root (an element to draw into) and emit(rows). No network, no imports. To chart its result, emit rows into a dataset with from: code and point a chart at it.",
  "To change part of one that's open (a chart's type, a block's filter, a label), patch it with update_interface rather than rewriting it.",
];

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
    description:
      "A piece of writing the user creates and edits: a paper, report, memo or email. It can carry live stats, charts, tables, controls and code between the paragraphs: a data story or an explorable explanation.",
    guidance: [
      "Work in stages: outline, then a section, then revise. Prefer one stage at a time over a finished paper.",
      "Send the whole body for the current stage; do not paste the document into chat.",
      "Help the user develop their own reasoning rather than picking wording or a conclusion for them.",
      "Plain writing has no datasets or blocks. Add them only when the piece is about data, or the person asks for a chart, a figure or something to play with.",
      "With live pieces: the prose carries the argument and each block shows something it claims. Put ::id on its own line right after the paragraph it supports. A control goes just before what it changes; write {{id}} in a sentence to show a variable's value, so the sentence moves with it.",
      ...APP_DATA_GUIDANCE_SHORT,
      ...APP_BLOCK_GUIDANCE,
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
  dashboard: {
    kind: "dashboard",
    label: "Dashboard",
    tool: "fill_dashboard",
    description:
      "Figures, charts and tables over data, with filters and code that runs: a sales or KPI dashboard, or an app over a spreadsheet.",
    guidance: [
      ...APP_DATA_GUIDANCE,
      "Lay it out as a dashboard: three or four stats across the top (span 3), the main chart (span 8) beside a supporting one (span 4), then a table or code (span 6 or 12). Fewer, clearer blocks beat many.",
      "Stats: one numeric column with op sum, mean, count, min, max or last; format currency or percent where it fits. compare shows the change against other filters, such as this half against the last.",
      "Every variable sits in the filter bar. Add one only when blocks read it.",
      ...APP_BLOCK_GUIDANCE,
    ],
    schema: dashboardSchema,
  },
  guide: {
    kind: "guide",
    label: "Guide",
    tool: "fill_guide",
    description: "A recipe or how-to to follow: what's needed, then the steps in order, with timers where there's waiting.",
    guidance: [
      "Needs start with the amount (400g white fish, 2 onions) so servings can scale them; group them only when there are clear sections.",
      "Steps are short and in the imperative, one action each; give minutes only where there's waiting.",
      "Facts: the two or three this kind of guide calls for, from what they've said (Serves 8, Time 1 hour).",
    ],
    schema: guideSchema,
  },
  schedule: {
    kind: "schedule",
    label: "Schedule",
    tool: "fill_schedule",
    description: "A plan of tasks across hours and days, drawn as a Gantt: a shoot day, an event, a trip.",
    guidance: [
      "Fit the tasks inside the hours, in time order, with no overlaps on a day unless two things really run at once.",
      "Include set-up, breaks and pack-down where the work needs them; label tasks in a few words.",
      "Put limits they've given (access times, people's hours) in constraints, and plan around them.",
    ],
    schema: scheduleSchema,
  },
  generator: {
    kind: "generator",
    label: "Generator",
    tool: "fill_generator",
    description: "Makes words or pictures from a prompt: taglines, names, captions, images, with tone, style and length to steer it.",
    guidance: [
      "Write the prompt as the person would ask for it, specific about the subject, and set the controls that matter.",
      "Text: write three variations that differ in a real way. Images: leave variations out; the person presses Generate.",
    ],
    schema: generatorSchema,
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

/** The data, variables and blocks of a dashboard or a document, read as they stream. */
function readPieces(source: Record<string, unknown>) {
  // While it streams, the block being written is incomplete: it's left out until it parses.
  const parsed = <T,>(schema: z.ZodType<T>, value: unknown): T[] => {
    const result = schema.safeParse(value);
    return result.success ? [result.data] : [];
  };
  const datasets = list(source.datasets).flatMap((item) => {
    const fields = record(item);
    const id = text(fields?.id).trim();
    if (!fields || !id) return [];
    const columns = list(fields.columns).filter((column): column is string => typeof column === "string" && !!column);
    const rows = list(fields.rows)
      .filter(Array.isArray)
      .map((cells) =>
        columns.map((_, index) => {
          const cell = cells[index];
          return typeof cell === "number" || typeof cell === "boolean" ? cell : typeof cell === "string" ? text(cell) : null;
        }),
      );
    const from = fields.from === "code" || fields.from === "yours" ? fields.from : "sample";
    return [
      {
        id,
        label: text(fields.label) || id,
        from,
        columns,
        rows,
        ...(typeof fields.rowCount === "number" ? { rowCount: fields.rowCount } : {}),
      } as AppCatalogueDataset,
    ];
  });
  return {
    datasets,
    variables: list(source.variables).flatMap((item) => parsed(variableSchema, item)),
    blocks: list(source.blocks).flatMap((item) => parsed(blockSchema, item)),
  };
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

  if (kind === "document") {
    const body = { ...base, body: text(source.body) };
    if (source.datasets === undefined && source.variables === undefined && source.blocks === undefined) return body;
    const { datasets, variables, blocks } = readPieces(source);
    return { ...body, datasets, variables, blocks };
  }

  if (kind === "dashboard") {
    const line = optionalText(source.description);
    return { ...base, ...(line ? { description: line } : {}), ...readPieces(source) } as CatalogueValue;
  }

  if (kind === "guide") {
    const facts = list(source.facts).flatMap((fact) => {
      const label = text(record(fact)?.label).trim();
      const value = text(record(fact)?.value).trim();
      return label && value ? [{ label, value }] : [];
    });
    const needs = list(source.needs).flatMap((need) => {
      const fields = record(need);
      const line = text(fields?.text).trim();
      return line ? [{ text: line, ...(optionalText(fields?.group) ? { group: optionalText(fields?.group) } : {}) }] : [];
    });
    const steps = list(source.steps).flatMap((step) => {
      const fields = record(step);
      const line = text(fields?.text).trim();
      if (!line) return [];
      const minutes = typeof fields?.minutes === "number" && fields.minutes > 0 ? Math.round(fields.minutes) : undefined;
      return [{ text: line, ...(minutes ? { minutes } : {}), ...(optionalText(fields?.note) ? { note: optionalText(fields?.note) } : {}) }];
    });
    return { ...base, facts, needs, steps } as CatalogueValue;
  }

  if (kind === "schedule") {
    const hhmm = (value: unknown, fallback: string) => (typeof value === "string" && TIME.test(value.trim()) ? value.trim() : fallback);
    const hours = list(source.hours);
    const tasks = list(source.tasks).flatMap((task) => {
      const fields = record(task);
      const label = text(fields?.label).trim();
      if (!fields || !label || typeof fields.start !== "string" || !TIME.test(fields.start)) return [];
      const type = ["setup", "shoot", "travel", "break"].includes(fields.type as string) ? (fields.type as "setup") : "shoot";
      const day = typeof fields.day === "number" && fields.day >= 1 ? Math.floor(fields.day) : 1;
      return [{ label, day, start: fields.start, end: hhmm(fields.end, fields.start), type }];
    });
    const dayCount = typeof source.dayCount === "number" && source.dayCount >= 1 ? Math.min(14, Math.floor(source.dayCount)) : Math.max(1, ...tasks.map((task) => task.day));
    return {
      ...base,
      ...(optionalText(source.start) ? { start: optionalText(source.start) } : {}),
      dayCount,
      hours: [hhmm(hours[0], "09:00"), hhmm(hours[1], "17:00")],
      constraints: list(source.constraints).filter((line): line is string => typeof line === "string" && !!line.trim()),
      tasks,
    } as CatalogueValue;
  }

  if (kind === "generator") {
    const mode = source.mode === "image" ? "image" : "text";
    const aspect = ["1:1", "3:2", "2:3"].includes(source.aspect as string) ? (source.aspect as "1:1") : undefined;
    const variations = list(source.variations).filter((line): line is string => typeof line === "string" && !!line.trim());
    return {
      ...base,
      mode,
      ...(optionalText(source.tone) ? { tone: optionalText(source.tone) } : {}),
      ...(optionalText(source.length) ? { length: optionalText(source.length) } : {}),
      ...(optionalText(source.style) ? { style: optionalText(source.style) } : {}),
      ...(aspect ? { aspect } : {}),
      ...(variations.length ? { variations } : {}),
    } as CatalogueValue;
  }

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
  if (kind === "guide") {
    const guide = value as CatalogueValueByKind["guide"];
    return `${guide.needs.length} things needed, ${guide.steps.length} steps`;
  }
  if (kind === "schedule") {
    const schedule = value as CatalogueValueByKind["schedule"];
    return `${schedule.tasks.length} tasks over ${schedule.dayCount} day${schedule.dayCount === 1 ? "" : "s"}`;
  }
  if (kind === "generator") {
    const generator = value as CatalogueValueByKind["generator"];
    return generator.mode === "text" ? `${generator.variations?.length ?? 0} variations` : "an image prompt";
  }
  if (kind === "table") {
    const table = value as CatalogueValueByKind["table"];
    return `${table.columns.length} columns, ${table.rows.length} rows`;
  }
  if (kind === "tracker") return `${(value as CatalogueValueByKind["tracker"]).items.length} items`;
  if (kind === "dashboard") {
    const app = value as CatalogueValueByKind["dashboard"];
    return `${app.blocks.length} blocks over ${app.datasets.length} datasets, ${app.variables.length} controls`;
  }
  const doc = value as CatalogueValueByKind["document"];
  return `${doc.body.length} characters${doc.blocks?.length ? `, ${doc.blocks.length} live pieces` : ""}`;
}
