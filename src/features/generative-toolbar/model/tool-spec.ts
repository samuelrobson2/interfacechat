import { z } from "zod";
import type { SuggestionPlace } from "@/features/interface-shells";
// With .js, and no runtime imports through "@/", so the API (api/_ai-toolbar-tools.ts) can import this file too.
import { TOOL_JOBS } from "./standard-tools.js";

/** Interface-shells' SUGGESTION_PLACES, repeated so this file runs on the server; the type keeps them in step. */
const PLACES = ["toolbar", "footer", "days", "prompt", "board"] as const satisfies readonly SuggestionPlace[];

/**
 * What the model may generate for the toolbar. Every tool is plain data, so
 * this schema is the contract: hand it to the model as structured output, and
 * the toolbar renders whatever comes back. A tool's value goes back to the
 * model when it's used, unless the client knows how to apply it on the spot.
 *
 * - action: a one-tap chip ("Add a summary").
 * - slider: a scale between two ends, in steps ("Shorter … Longer").
 * - grid: a 2×2 pad over two axes, each quadrant named ("Memo", "Feature").
 * - choice: two to four options, one picked ("General / Expert / Students").
 * - toggle: on or off ("Notify owners").
 */

export const TOOL_ICONS = [
  "sparkles",
  "list",
  "sort",
  "plus",
  "user",
  "calendar",
  "text",
  "table",
  "check",
  "image",
  "chart",
  "archive",
  "scissors",
  "search",
  "bell",
  "clock",
  "sliders",
  "grid",
  "users",
] as const;
export type ToolIcon = (typeof TOOL_ICONS)[number];

/**
 * How the model judges a tool for the content as it is now. The toolbar ranks
 * by them (`toolScore`) and shows the best few, so the model never picks a count.
 */
export type ToolScores = { impact: number; fit: number; done: number };
export const DEFAULT_SCORES: ToolScores = { impact: 3, fit: 0.7, done: 0 };

function scoreFields(strict: boolean) {
  const unit = strict ? z.number().min(0).max(1) : z.number();
  return {
    impact: (strict ? z.number().min(1).max(5) : z.number())
      .optional()
      .describe("1 to 5: how much using it would improve the content now."),
    fit: unit.optional().describe("0 to 1: how well it suits what is in the interface right now."),
    done: unit.optional().describe("0 to 1: how far the content already does it (1 = nothing left to do)."),
  };
}

/** One number to rank by: worth doing, suits this, and not done yet. */
export function toolScore(tool: Partial<ToolScores>) {
  const { impact, fit, done } = { ...DEFAULT_SCORES, ...tool };
  return (impact / 5) * fit * (1 - done);
}

/** Scores as the model wrote them, held to their ranges; missing ones are left out. */
export function clampScores(raw: Record<string, unknown>): Partial<ToolScores> {
  const out: Partial<ToolScores> = {};
  const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
  const impact = num(raw.impact);
  const fit = num(raw.fit);
  const done = num(raw.done);
  if (impact !== undefined) out.impact = Math.min(5, Math.max(1, impact));
  if (fit !== undefined) out.fit = Math.min(1, Math.max(0, fit));
  if (done !== undefined) out.done = Math.min(1, Math.max(0, done));
  return out;
}

/**
 * The tools, as the toolbar holds them: the contract. Labels and steps have
 * the limits the toolbar relies on; `normalizeTool` holds a model's draft to
 * them, so one overlong label costs one tool, not the whole set.
 */
const base = {
  id: z.string().describe("Stable within a set, e.g. 'tone'."),
  label: z.string().max(24).describe("Two or three words, at most 24 characters."),
  detail: z.string().max(80).describe("What it will do here, in this situation, at most 80 characters."),
  icon: z.enum(TOOL_ICONS),
  place: z
    .enum(PLACES)
    .optional()
    .describe("Where it shows: beside the part it acts on (Search's filters, a Table's columns), or the toolbar."),
  jobs: z
    .array(z.enum(TOOL_JOBS))
    .optional()
    .describe("Standard jobs this does, if any. A tool whose job the interface's own toolbar already does is dropped."),
  ...scoreFields(true),
};
const end = z.object({ label: z.string().max(16) });

export const actionToolSchema = z.object({ type: z.literal("action"), ...base });
export const sliderToolSchema = z.object({
  type: z.literal("slider"),
  ...base,
  min: end,
  max: end,
  /** Labels for each stop, low to high; their count is the number of steps. */
  steps: z.array(z.string().max(20)).min(2).max(9),
  /** Index into `steps`: where the content is now. */
  value: z.number().int().min(0),
});
export const gridToolSchema = z.object({
  type: z.literal("grid"),
  ...base,
  x: z.object({ low: z.string().max(12), high: z.string().max(12) }),
  y: z.object({ low: z.string().max(12), high: z.string().max(12) }),
  /** Quadrant names: top-left, top-right, bottom-left, bottom-right (y high is the top). */
  quadrants: z.array(z.string()).length(4),
  /** Where the content sits now, each axis 0 (low) to 1 (high). */
  value: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
});
export const choiceToolSchema = z.object({
  type: z.literal("choice"),
  ...base,
  options: z.array(z.object({ id: z.string(), label: z.string().max(14) })).min(2).max(4),
  value: z.string(),
});
export const toggleToolSchema = z.object({ type: z.literal("toggle"), ...base, value: z.boolean() });

export const toolSpecSchema = z.discriminatedUnion("type", [
  actionToolSchema,
  sliderToolSchema,
  gridToolSchema,
  choiceToolSchema,
  toggleToolSchema,
]);

/**
 * What the model is asked for: the same tools, with the limits in words and
 * every field but the type optional, so the SDK's check of the model's reply
 * never throws the whole set away. `normalizeTool` trims and fills in.
 */
const words = (max: number, what = "") => z.string().describe(`${what} At most ${max} characters.`.trim());
const draftBase = {
  id: base.id,
  label: words(24, "Two or three words."),
  detail: words(80, "What it will do here, in this situation."),
  icon: z.string().describe(`One of: ${TOOL_ICONS.join(", ")}.`),
  place: z.string().describe(base.place.description ?? ""),
  jobs: z.array(z.string()).describe(base.jobs.description ?? ""),
  ...scoreFields(false),
};
const draftEnd = z.object({ label: words(16) });
const draftOf = <T extends z.ZodRawShape>(type: string, shape: T) =>
  z.object({ type: z.literal(type), ...draftBase, ...shape }).partial().required({ type: true });
const draftSpecSchema = z.discriminatedUnion("type", [
  draftOf("action", {}),
  draftOf("slider", {
    min: draftEnd,
    max: draftEnd,
    steps: z.array(words(20)).describe("Labels for each stop, low to high, 2 to 9 of them."),
    value: z.number().describe("Index into steps: where the content is now."),
  }),
  draftOf("grid", {
    x: z.object({ low: words(12), high: words(12) }),
    y: z.object({ low: words(12), high: words(12) }),
    quadrants: z.array(z.string()).describe("Exactly four names: top-left, top-right, bottom-left, bottom-right (y high is the top)."),
    value: z.object({ x: z.number(), y: z.number() }).describe("Where the content sits now, each axis 0 (low) to 1 (high)."),
  }),
  draftOf("choice", {
    options: z.array(z.object({ id: z.string(), label: words(14) })).describe("2 to 4 of them."),
    value: z.string().describe("The id of the option that holds now."),
  }),
  draftOf("toggle", { value: z.boolean() }),
]);

export const draftToolSetSchema = z.object({ tools: z.array(draftSpecSchema) });

/**
 * What one call answers with, against the table the toolbar already holds:
 * keys to drop, fresh scores for tools that stay as they are, and tools that
 * are new or changed (a changed one written out again under its key). In
 * that order, so the quick parts arrive first.
 */
export const draftToolDiffSchema = z.object({
  drop: z.array(z.string()).describe("Keys of unpinned tools that no longer make sense for the content."),
  scores: z
    .array(z.object({ id: z.string(), ...scoreFields(false) }))
    .describe("Fresh scores for tools in the table that stay exactly as they are."),
  add: z.array(draftSpecSchema).describe("Tools that are new, or changed (written out again under their key)."),
});

const clip = (value: unknown, max: number) => {
  if (typeof value !== "string") return value;
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > max / 2 ? cut.lastIndexOf(" ") : cut.length).trimEnd()}…`;
};

/**
 * A model's draft held to the contract: long text is cut on a word, steps and
 * options are capped, a value is put on a step or option that exists. Returns
 * null when what's left still doesn't fit (a choice with one option, say).
 */
export function normalizeTool(raw: unknown): ToolSpec | null {
  if (typeof raw !== "object" || raw === null) return null;
  const tool = { ...(raw as Record<string, unknown>) };
  Object.assign(tool, clampScores(tool));
  for (const key of ["impact", "fit", "done"] as const) if (typeof tool[key] !== "number") delete tool[key];
  tool.label = clip(tool.label, 24);
  tool.detail = clip(tool.detail, 80);
  if (!(TOOL_ICONS as readonly unknown[]).includes(tool.icon)) tool.icon = "sparkles";
  if (tool.place === "toolbar" || !(PLACES as readonly unknown[]).includes(tool.place)) delete tool.place;
  if (Array.isArray(tool.jobs)) tool.jobs = tool.jobs.filter((job) => (TOOL_JOBS as readonly unknown[]).includes(job));
  const ends = (value: unknown, max: number) =>
    value && typeof value === "object"
      ? Object.fromEntries(Object.entries(value).map(([key, label]) => [key, clip(label, max)]))
      : value;
  if (tool.type === "slider") {
    const steps = Array.isArray(tool.steps) ? tool.steps.slice(0, 9).map((step) => clip(step, 20)) : [];
    tool.steps = steps;
    tool.min = ends(tool.min ?? { label: steps[0] }, 16);
    tool.max = ends(tool.max ?? { label: steps.at(-1) }, 16);
    tool.value = Math.min(steps.length - 1, Math.max(0, Math.round(Number(tool.value) || 0)));
  }
  if (tool.type === "grid") {
    tool.x = ends(tool.x, 12);
    tool.y = ends(tool.y, 12);
    tool.value ??= { x: 0.5, y: 0.5 };
  }
  if (tool.type === "toggle") tool.value = tool.value === true;
  if (typeof tool.detail !== "string") tool.detail = "";
  if (tool.type === "choice") {
    const options = Array.isArray(tool.options) ? tool.options.slice(0, 4) : [];
    tool.options = options.map((option) => ({ ...option, label: clip(option?.label, 14) }));
    if (!options.some((option) => option?.id === tool.value)) tool.value = options[0]?.id;
  }
  const parsed = toolSpecSchema.safeParse(tool);
  return parsed.success ? parsed.data : null;
}

/** The set the model returns for one situation. */
export const toolSetSchema = z.object({ tools: z.array(toolSpecSchema).min(1).max(8) });

export type ToolSpec = z.infer<typeof toolSpecSchema>;
export type ToolType = ToolSpec["type"];
export type GridPoint = { x: number; y: number };

/** What a tool hands back when used, by type. */
export type ToolValueByType = {
  action: undefined;
  slider: number;
  grid: GridPoint;
  choice: string;
  toggle: boolean;
};
export type ToolValue = ToolValueByType[ToolType];

/**
 * A tool as the toolbar holds it: the generated spec, plus the edit to make
 * locally when the client can. Returning the data unchanged means "ask the model".
 */
export type GeneratedTool<D> = {
  [T in ToolType]: Extract<ToolSpec, { type: T }> & {
    apply?: (data: D, value: ToolValueByType[T]) => D;
  };
}[ToolType];

/** The quadrant a point falls in, as an index into `quadrants`. */
export function quadrantOf({ x, y }: GridPoint) {
  return (y >= 0.5 ? 0 : 2) + (x >= 0.5 ? 1 : 0);
}

/** The request the model would get when a tool is used with `value`. */
export function describeUse(tool: ToolSpec, value: ToolValue): string {
  switch (tool.type) {
    case "action":
      return `${tool.label} — ${tool.detail}`;
    case "slider":
      return `${tool.label}: ${tool.steps[value as number] ?? ""}`;
    case "grid": {
      const point = value as GridPoint;
      const x = point.x >= 0.5 ? tool.x.high : tool.x.low;
      const y = point.y >= 0.5 ? tool.y.high : tool.y.low;
      return `${tool.label}: make it a ${tool.quadrants[quadrantOf(point)]} (more ${x.toLowerCase()}, more ${y.toLowerCase()})`;
    }
    case "choice":
      return `${tool.label}: ${tool.options.find((option) => option.id === value)?.label ?? value}`;
    case "toggle":
      return `${tool.label}: ${value ? "on" : "off"}`;
  }
}
