import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import {
  apiKeyMissing,
  configError,
  logAiError,
  logAiStart,
  MAX_DURATION,
  MODEL,
} from "./_shared.js";

// Vercel serverless function. Locally it's served by the devApi plugin in
// vite.config.ts under `pnpm dev`.
//
// Visualize chat: the model returns a structured chart (mark + encoding + rows)
// and we assemble a Vega-Lite spec the frontend already knows how to render
// (`data: { name: "table" }` + separate `plot_data`). Theme tokens are applied
// at compile time — never bake colors into the spec.

export const maxDuration = MAX_DURATION;

const FieldType = z.enum([
  "quantitative",
  "temporal",
  "ordinal",
  "nominal",
  "none",
]);
const Aggregate = z.enum([
  "sum",
  "mean",
  "median",
  "min",
  "max",
  "count",
  "none",
]);
const TimeUnit = z.enum([
  "year",
  "yearmonth",
  "yearmonthdate",
  "month",
  "quarter",
  "date",
  "none",
]);

// OpenAI structured output requires every property listed in `required`.
// Unused channels are empty strings / "none" and get dropped when we assemble.
const VisualizeSchema = z.object({
  kind: z
    .enum(["chart", "discuss"])
    .describe("chart = draw or update a plot; discuss = text only"),
  title: z.string().describe("Short chart title, or a short reply title"),
  text_before: z
    .string()
    .describe("One or two sentences above the chart (or the full reply)"),
  text_after: z
    .string()
    .describe("How to read the chart, or empty on a discuss turn"),
  mark: z
    .enum(["bar", "line", "area", "point", "arc", "rect", "tick", "trail", "none"])
    .describe("none on a discuss turn"),
  innerRadius: z
    .number()
    .describe("For arc marks, 50–70 makes a donut; otherwise 0"),
  xField: z.string().describe("Empty if unused"),
  xType: FieldType,
  xAggregate: Aggregate,
  xTimeUnit: TimeUnit,
  xTitle: z.string().describe("Empty to use the field name"),
  yField: z.string().describe("Empty if unused"),
  yType: FieldType,
  yAggregate: Aggregate,
  yTitle: z.string().describe("Empty to use the field name"),
  colorField: z.string().describe("Empty if unused"),
  colorType: FieldType,
  xOffsetField: z.string().describe("Empty if unused; grouped bars"),
  thetaField: z.string().describe("Empty if unused; pie/donut"),
  rows: z
    .array(
      z.object({
        x: z.string().describe("Value for xField (ISO date or category)"),
        series: z.string().describe("Value for colorField, or empty"),
        y: z.number().describe("Value for yField or thetaField"),
      }),
    )
    .describe("8–24 rows. x/series/y map onto the *Field names."),
  followup1: z
    .string()
    .describe("Full next-step question, 12–18 words, or empty"),
  followup2: z
    .string()
    .describe("Another full next-step question, 12–18 words, or empty"),
  followup3: z
    .string()
    .describe("Another full next-step question, 12–18 words, or empty"),
});

type VisualizeBody = {
  prompt?: string;
  history?: { role: "user" | "assistant"; content: string }[];
  currentSpec?: Record<string, unknown> | null;
  currentData?: Record<string, unknown>[] | null;
  target?: {
    role?: string;
    pointer?: string;
    mark_type?: string;
    channel?: string;
    field?: string;
    datum?: Record<string, unknown>;
    current_values?: Record<string, unknown>;
  } | null;
  datasetName?: string | null;
};

const SYSTEM = `
You design Vega-Lite charts for Adaption Visualize.

Return a chart the user can read immediately. Invent a small, coherent table
when the user did not attach real rows — never claim the numbers are live data.
Prefer 8–24 rows. Field names must match encoding.field exactly.

Chart rules:
- Pick the simplest mark that answers the question (bar, line, area, point, arc).
- One mark, one encoding. No layers, facets, or concatenated views.
- Temporal x-axes use ISO dates (YYYY-MM or YYYY-MM-DD).
- Do not set colors, fonts, padding, axis style, or background — the theme does.
- title is short (≤ 8 words). text_before is a lead-in, not the title again.
- text_after says how to read the chart in one or two sentences.
- On follow-up edits, keep the same fields and rows unless the user asks to
  change the data or the question. Apply the smallest change that satisfies
  the instruction.
- If the user selected a mark or axis (target), edit that element. Relative
  requests like "make it bigger" or "use a line" refer to the current chart.
- kind=discuss only when the user is asking a question that should not change
  the plot (or is off-topic). Then mark=none and rows=[].
- Unused channels are empty strings and type/aggregate/timeUnit = none.
- rows.x / rows.series / rows.y map onto xField / colorField / yField (or thetaField).
- xField/yField/colorField are real column names (month, product, revenue), never "x"/"y".
`.trim();

const describeTarget = (target: NonNullable<VisualizeBody["target"]>) =>
  [
    target.role && `role: ${target.role}`,
    target.mark_type && `mark: ${target.mark_type}`,
    target.channel && `channel: ${target.channel}`,
    target.field && `field: ${target.field}`,
    target.pointer && `pointer: ${target.pointer}`,
    target.datum && `datum: ${JSON.stringify(target.datum)}`,
    target.current_values &&
      `current values: ${JSON.stringify(target.current_values)}`,
  ]
    .filter(Boolean)
    .join("\n");

const channel = (
  field: string,
  type: z.infer<typeof FieldType>,
  extras: {
    aggregate?: z.infer<typeof Aggregate>;
    timeUnit?: z.infer<typeof TimeUnit>;
    title?: string;
  } = {},
) => {
  if (!field.trim()) return undefined;
  const next: Record<string, unknown> = { field: field.trim() };
  if (type !== "none") next.type = type;
  if (extras.aggregate && extras.aggregate !== "none") {
    next.aggregate = extras.aggregate;
  }
  if (extras.timeUnit && extras.timeUnit !== "none") {
    next.timeUnit = extras.timeUnit;
  }
  if (extras.title?.trim()) next.title = extras.title.trim();
  return next;
};

const GENERIC_FIELDS = new Set(["x", "y", "series", "field"]);

const fieldName = (field: string, title: string, fallback: string) => {
  const trimmed = field.trim();
  if (!trimmed) return "";
  if (!GENERIC_FIELDS.has(trimmed.toLowerCase())) return trimmed;
  const fromTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return fromTitle || fallback;
};

const resolvedFields = (object: z.infer<typeof VisualizeSchema>) => ({
  x: fieldName(object.xField, object.xTitle, "category"),
  y: fieldName(object.yField, object.yTitle, "value"),
  theta: fieldName(object.thetaField, "", "value"),
  color: fieldName(object.colorField, "", "series"),
  xOffset: fieldName(object.xOffsetField, "", "series"),
});

export function rowsToPlotData(
  object: z.infer<typeof VisualizeSchema>,
): Record<string, unknown>[] {
  const fields = resolvedFields(object);
  const measure = fields.y || fields.theta;

  return object.rows.map((row) => {
    const next: Record<string, unknown> = {};
    if (fields.x) {
      const asNumber = Number(row.x);
      next[fields.x] =
        object.xType === "quantitative" && Number.isFinite(asNumber)
          ? asNumber
          : row.x;
    }
    if (row.series.trim()) {
      if (object.colorField.trim()) next[fields.color] = row.series.trim();
      if (object.xOffsetField.trim()) next[fields.xOffset] = row.series.trim();
    }
    if (measure) next[measure] = row.y;
    return next;
  });
}

const MONTHS = [
  "2025-01",
  "2025-02",
  "2025-03",
  "2025-04",
  "2025-05",
  "2025-06",
];
const SERIES = ["Alpha", "Beta", "Gamma"];

/** Last resort so a valid spec never renders against zero rows. */
export function fallbackPlotData(
  object: z.infer<typeof VisualizeSchema>,
): Record<string, unknown>[] {
  const fields = resolvedFields(object);
  const measure = fields.y || fields.theta;
  if (!fields.x && !measure) return [];

  if (object.xType === "temporal" && object.colorField.trim() && measure) {
    return MONTHS.flatMap((month, monthIndex) =>
      SERIES.map((product, seriesIndex) => ({
        [fields.x]: month,
        [fields.color]: product,
        [measure]: 40 + monthIndex * 12 + seriesIndex * 18,
      })),
    );
  }

  if (object.xType === "temporal" && measure) {
    return MONTHS.map((month, index) => ({
      [fields.x]: month,
      [measure]: 50 + index * 14,
    }));
  }

  const categories = object.colorField.trim() ? SERIES : MONTHS.slice(0, 4);
  const categoryField = fields.x || fields.color;
  return categories.map((label, index) => ({
    ...(categoryField ? { [categoryField]: label } : {}),
    ...(measure ? { [measure]: 36 + index * 17 } : {}),
  }));
}

export function assembleVegaSpec(object: z.infer<typeof VisualizeSchema>) {
  if (object.kind !== "chart" || object.mark === "none") return null;

  const fields = resolvedFields(object);
  const mark =
    object.mark === "arc" && object.innerRadius > 0
      ? { type: "arc", innerRadius: object.innerRadius, tooltip: true }
      : { type: object.mark, tooltip: true };

  const x = channel(fields.x, object.xType, {
    aggregate: object.xAggregate,
    timeUnit: object.xTimeUnit,
    title: object.xTitle,
  });
  const y = channel(fields.y, object.yType, {
    aggregate: object.yAggregate,
    title: object.yTitle,
  });
  const xOffset = object.xOffsetField.trim()
    ? channel(fields.xOffset, "nominal")
    : undefined;
  const color = object.colorField.trim()
    ? channel(fields.color, object.colorType)
    : undefined;
  const theta = object.thetaField.trim()
    ? channel(fields.theta, "quantitative")
    : undefined;

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v6.json",
    data: { name: "table" },
    title: object.title,
    mark,
    encoding: {
      ...(x ? { x } : {}),
      ...(y ? { y } : {}),
      ...(xOffset ? { xOffset } : {}),
      ...(color ? { color } : {}),
      ...(theta ? { theta } : {}),
    },
  };
}

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();

  let body: VisualizeBody;
  try {
    body = (await req.json()) as VisualizeBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return new Response(JSON.stringify({ error: "Missing prompt." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const history = (body.history ?? [])
    .filter((turn) => turn.content?.trim())
    .slice(-10)
    .map((turn) => `${turn.role}: ${turn.content.trim()}`)
    .join("\n");

  const userPrompt = [
    body.datasetName && `Attached dataset: ${body.datasetName}`,
    history && `Conversation so far:\n${history}`,
    body.currentSpec &&
      `Current Vega-Lite spec:\n${JSON.stringify(body.currentSpec)}`,
    body.currentData &&
      `Current plot_data (${body.currentData.length} rows):\n${JSON.stringify(body.currentData.slice(0, 40))}`,
    body.target && `Selected element:\n${describeTarget(body.target)}`,
    `User: ${prompt}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const started = logAiStart("visualize", prompt.slice(0, 100));
  try {
    const { object, usage } = await generateObject({
      model: openai(MODEL),
      schema: VisualizeSchema,
      system: SYSTEM,
      prompt: userPrompt,
    });

    const plot_data = object.rows.length
      ? rowsToPlotData(object)
      : fallbackPlotData(object);
    const spec = assembleVegaSpec(object);
    const followups = [object.followup1, object.followup2, object.followup3]
      .map((item) => item.trim())
      .filter(Boolean);

    console.log(
      `✓ [ai:visualize] ${Date.now() - started}ms · kind=${object.kind} · rows=${
        plot_data.length
      } · tokens in/out=${usage?.inputTokens ?? "?"}/${usage?.outputTokens ?? "?"}`,
    );

    return new Response(
      JSON.stringify({
        kind: object.kind,
        title: object.title,
        text_before: object.text_before,
        text_after: object.text_after,
        spec,
        plot_data: spec ? plot_data : [],
        followups,
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  } catch (error) {
    logAiError("visualize", error);
    return new Response(
      JSON.stringify({ error: "The chart could not be generated." }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}
