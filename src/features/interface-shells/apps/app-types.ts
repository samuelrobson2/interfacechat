import { z } from "zod";

/**
 * Dashboard and Article are built from the same parts: named datasets, the
 * variables people steer with controls, and blocks that read both. The model
 * writes this spec, never code that runs in the app; the only code that runs
 * is a code block's, inside a sandbox (see app-sandbox.tsx).
 *
 * Everything here is plain data, so the schema doubles as the model's
 * structured output and as the check every edit has to pass.
 */

/* ── Data ─────────────────────────────────────────────────────────────── */

export type Cell = string | number | boolean | null;
export type Row = Record<string, Cell>;

/** Where a dataset's rows come from. Rows are always kept too, as the last snapshot. */
export const dataSourceSchema = z.discriminatedUnion("type", [
  /** The model wrote the numbers: a stand-in until real data replaces it. */
  z.object({ type: z.literal("generated"), note: z.string().optional() }),
  /** A CSV, TSV or JSON file the person added. */
  z.object({ type: z.literal("upload"), fileName: z.string(), addedAt: z.string() }),
  /** A CSV or JSON link (a published sheet, an API), fetched again on refresh. */
  z.object({ type: z.literal("url"), url: z.string().url(), format: z.enum(["csv", "json"]) }),
  /** Another interface's data, such as a Table's rows. */
  z.object({ type: z.literal("interface"), kind: z.string(), title: z.string() }),
  /** What a code block emits; filled each time it runs. */
  z.object({ type: z.literal("code"), blockId: z.string() }),
  /** A connected service (a sheet, a database), queried on the server. Not wired yet. */
  z.object({ type: z.literal("connector"), connector: z.string(), query: z.string() }),
]);
export type DataSource = z.infer<typeof dataSourceSchema>;

const cellSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const datasetSchema = z.object({
  id: z.string().describe("Blocks refer to it by this, e.g. 'sales'."),
  label: z.string(),
  source: dataSourceSchema,
  rows: z.array(z.record(z.string(), cellSchema)),
});
export type Dataset = z.infer<typeof datasetSchema>;

/* ── Variables and queries ────────────────────────────────────────────── */

export const variableSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("choice"),
    id: z.string().describe("Short, such as region. Blocks read it as \"$region\"; code reads vars.region."),
    label: z.string(),
    /** Fixed options, or read from a column so they follow the data. */
    options: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional()
      .describe("Fixed options. Leave out to read them from a column with fromField."),
    fromField: z
      .object({ dataset: z.string(), field: z.string() })
      .optional()
      .describe("Read the options from a column's distinct values, so they follow the data."),
    /** Offers "All", which turns the filters reading this variable off. */
    includeAll: z.boolean().optional().describe("Offer All, which switches off the filters reading this variable."),
    default: z.string().describe('The starting option\'s value, or "__all__" when includeAll is set.'),
  }),
  z.object({
    kind: z.literal("slider"),
    id: z.string().describe("Short, such as rate. Blocks read it as \"$rate\"; code reads vars.rate."),
    label: z.string(),
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    /** A name per step, e.g. months, instead of the number. */
    labels: z.array(z.string()).optional().describe("A name for each step from min to max, such as month names."),
    unit: z.string().optional().describe("Shown after the number, such as %."),
    default: z.number(),
  }),
  z.object({ kind: z.literal("toggle"), id: z.string(), label: z.string(), default: z.boolean() }),
]);
export type Variable = z.infer<typeof variableSchema>;
export type VariableValue = string | number | boolean;
export type VariableValues = Record<string, VariableValue>;

/** A literal, or "$name" to read a variable. */
const operandSchema = z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]);

export const whereSchema = z.object({
  field: z.string().describe("A column of the block's dataset."),
  op: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "contains"]),
  value: operandSchema.describe('A literal, or "$id" to read a variable. A variable set to "__all__" switches the clause off.'),
});
export type Where = z.infer<typeof whereSchema>;

export const AGGREGATES = ["sum", "mean", "count", "min", "max", "last"] as const;
export type Aggregate = (typeof AGGREGATES)[number];

export const querySchema = z.object({
  where: z.array(whereSchema).optional().describe("Every clause must hold."),
  sort: z.object({ field: z.string(), dir: z.enum(["asc", "desc"]) }).optional(),
  limit: z.number().int().positive().optional(),
});
export type Query = z.infer<typeof querySchema>;

/* ── Blocks ───────────────────────────────────────────────────────────── */

const blockBase = {
  id: z.string().describe("Unique and short, such as revenue or by-month."),
  /** Dashboard only: columns of 12 the block spans. */
  span: z
    .union([z.literal(3), z.literal(4), z.literal(6), z.literal(8), z.literal(12)])
    .optional()
    .describe("Dashboard only: columns of 12 it spans. Stats 3, the main chart 8, a side chart 4, tables and code 6 or 12."),
};
const datasetRef = z.string().describe("The id of the dataset it reads.");

export const blockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    ...blockBase,
    /** Markdown; {{variable}} shows a variable's current value. */
    markdown: z.string().describe("Markdown. {{id}} shows a variable's current value, so the sentence moves with its control."),
  }),
  z.object({
    type: z.literal("stat"),
    ...blockBase,
    label: z.string().describe("What the figure is, such as Revenue."),
    dataset: datasetRef,
    field: z.string().describe("A numeric column. Any column for count."),
    op: z.enum(AGGREGATES),
    query: querySchema.optional(),
    /** The same figure under other filters, shown as a change. */
    compare: querySchema.optional().describe("The same figure under other filters, such as the previous period; shown as the change."),
    format: z.enum(["number", "currency", "percent"]).optional(),
  }),
  z.object({
    type: z.literal("chart"),
    ...blockBase,
    title: z.string().optional(),
    caption: z.string().optional(),
    dataset: datasetRef,
    mark: z.enum(["line", "bar", "area", "point", "arc"]),
    x: z.string().describe("The column along the bottom; for arc, the category."),
    y: z.string().describe("The numeric column measured; for arc, the amount."),
    color: z.string().optional().describe("A column that splits it into series, such as category."),
    aggregate: z.enum(["sum", "mean", "count", "min", "max"]).optional().describe("How rows that share an x combine."),
    query: querySchema.optional(),
    height: z.number().optional(),
  }),
  z.object({
    type: z.literal("table"),
    ...blockBase,
    title: z.string().optional(),
    dataset: datasetRef,
    columns: z.array(z.string()).optional().describe("Which columns, in order. All of them when left out."),
    query: querySchema.optional(),
  }),
  z.object({
    type: z.literal("control"),
    ...blockBase,
    variable: z.string().describe("The id of the variable this control sets."),
  }),
  z.object({
    type: z.literal("code"),
    ...blockBase,
    title: z.string().optional(),
    language: z.literal("javascript"),
    /**
     * Runs in a sandbox with `data` (the input datasets by id), `vars` (the
     * variables' values), `root` (an element to draw into) and `emit(rows)`
     * (publishes `output` for other blocks). No network, no access to the app.
     */
    source: z
      .string()
      .describe(
        'Plain JavaScript: the body of a function, run in a sandbox whenever an input or variable changes. data.<id> is each input dataset as an array of row objects keyed by column, such as data.sales = [{ "month": "Jan", "revenue": 120 }]. vars.<id> is each variable\'s current value. root is an element to draw into. emit(rows) publishes an array of row objects as the output dataset. No network, no imports.',
      ),
    inputs: z.array(z.string()).describe("Ids of the datasets it reads. Not variables: those arrive in vars."),
    output: z.string().optional().describe("Id of the dataset (from: code) that emit(rows) fills."),
    /** Start with the code shown; otherwise only its output is. */
    showCode: z.boolean().optional().describe("Start with the code shown, when the working is part of the point."),
  }),
]);
export type AppBlock = z.infer<typeof blockSchema>;
export type AppBlockOf<T extends AppBlock["type"]> = Extract<AppBlock, { type: T }>;

/* ── The two interfaces ───────────────────────────────────────────────── */

const appBase = {
  title: z.string(),
  /** Shown as a tag when the work belongs to a project, as on every interface. */
  project: z.string().optional(),
  datasets: z.array(datasetSchema),
  variables: z.array(variableSchema),
  blocks: z.array(blockSchema),
};

/** Figures at a glance: a filter bar for the variables, blocks on a 12-column grid. */
export const dashboardSchema = z.object({ ...appBase, description: z.string().optional() });
export type DashboardShellData = z.infer<typeof dashboardSchema>;

/** A piece to read top to bottom, with live charts, controls and code between the prose. */
export const articleSchema = z.object({ ...appBase, subtitle: z.string().optional() });
export type ArticleShellData = z.infer<typeof articleSchema>;

export type AppShellData = DashboardShellData | ArticleShellData;
export const APP_KINDS = ["dashboard", "article"] as const;
export type AppKind = (typeof APP_KINDS)[number];
