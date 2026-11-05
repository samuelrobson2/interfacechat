/** Visual constants shared by every chart variant. */
export const CHART_HEIGHT_PX = 320;
export const FONT_FAMILY =
  "var(--font-bureau, 'STK Bureau Sans', sans-serif)";
export const TICK_FILL = "var(--color-gray-3)";
export const LABEL_FILL = "var(--color-gray-3)";
export const GRID_STROKE = "var(--color-gray-2)";
export const AXIS_LINE_STROKE = "var(--color-gray-2)";

export const AXIS_TICK_PROPS = {
  fill: TICK_FILL,
  fontSize: 11,
  fontWeight: 300,
  fontFamily: FONT_FAMILY,
} as const;

export const TOOLTIP_WRAPPER_STYLE = { outline: "none" } as const;
export const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: "var(--color-background-primary, #fafafa)",
  border: "1px solid var(--color-gray-2)",
  borderRadius: 0,
  fontSize: 12,
  fontWeight: 300,
  fontFamily: FONT_FAMILY,
  color: "var(--color-gray-5)",
  padding: "8px 10px",
} as const;
export const TOOLTIP_LABEL_STYLE = {
  color: "var(--color-gray-3)",
  fontSize: 11,
  fontWeight: 400,
  fontFamily: FONT_FAMILY,
  marginBottom: 4,
} as const;
export const LEGEND_WRAPPER_STYLE = {
  fontSize: 12,
  fontWeight: 300,
  fontFamily: FONT_FAMILY,
  color: "var(--color-gray-3)",
} as const;

export const MAX_TICK_LINES = 2;
export const TICK_BAND_GAP = 2;

export const cartesianMargin = () => ({
  top: 12,
  right: 24,
  left: 8,
  bottom: 8,
});
