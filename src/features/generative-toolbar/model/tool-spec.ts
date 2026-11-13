import { z } from "zod";
import { SUGGESTION_PLACES } from "@/features/interface-shells";

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

const base = {
  id: z.string().describe("Stable within a set, e.g. 'tone'."),
  label: z.string().max(24).describe("Two or three words."),
  detail: z.string().max(80).describe("What it will do here, in this situation."),
  icon: z.enum(TOOL_ICONS),
  place: z
    .enum(SUGGESTION_PLACES)
    .optional()
    .describe("Where it shows: beside the part it acts on (Search's filters, a Table's columns), or the toolbar."),
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
  quadrants: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  /** Where the content sits now, each axis 0 (low) to 1 (high). */
  value: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
});

export const choiceToolSchema = z.object({
  type: z.literal("choice"),
  ...base,
  options: z.array(z.object({ id: z.string(), label: z.string().max(14) })).min(2).max(4),
  value: z.string(),
});

export const toggleToolSchema = z.object({
  type: z.literal("toggle"),
  ...base,
  value: z.boolean(),
});

export const toolSpecSchema = z.discriminatedUnion("type", [
  actionToolSchema,
  sliderToolSchema,
  gridToolSchema,
  choiceToolSchema,
  toggleToolSchema,
]);
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
