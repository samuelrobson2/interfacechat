/**
 * Vega's runtime vocabulary translated into the authored Vega-Lite one, per
 * element role (contract §7, architecture §7.3). Key order is priority: the
 * first property an element paints is the one a scaffolded patch reaches for.
 */

const MARK = {
  fill: "fill",
  stroke: "stroke",
  strokeWidth: "strokeWidth",
  fillOpacity: "fillOpacity",
  opacity: "opacity",
  cornerRadius: "cornerRadius",
  size: "size",
  shape: "shape",
  interpolate: "interpolate",
} as const;

const AXIS_LABEL = {
  fontSize: "labelFontSize",
  fill: "labelColor",
  fontWeight: "labelFontWeight",
  angle: "labelAngle",
  limit: "labelLimit",
  align: "labelAlign",
  baseline: "labelBaseline",
} as const;

const AXIS_TITLE = {
  fontSize: "titleFontSize",
  fill: "titleColor",
  fontWeight: "titleFontWeight",
} as const;

const AXIS_GRID = {
  stroke: "gridColor",
  strokeDash: "gridDash",
  strokeOpacity: "gridOpacity",
  strokeWidth: "gridWidth",
} as const;

const AXIS_DOMAIN = {
  stroke: "domainColor",
  strokeWidth: "domainWidth",
  strokeDash: "domainDash",
} as const;

const AXIS_TICK = { stroke: "tickColor", strokeWidth: "tickWidth" } as const;

const LEGEND_LABEL = { fontSize: "labelFontSize", fill: "labelColor" } as const;

const LEGEND_TITLE = { fontSize: "titleFontSize", fill: "titleColor" } as const;

const LEGEND_SYMBOL = {
  size: "symbolSize",
  fill: "symbolFillColor",
  stroke: "symbolStrokeColor",
  strokeWidth: "symbolStrokeWidth",
} as const;

const TITLE = {
  fontSize: "fontSize",
  fill: "color",
  fontWeight: "fontWeight",
} as const;

export const AUTHORED_BY_ROLE: Record<
  string,
  Readonly<Record<string, string>>
> = {
  mark: MARK,
  "axis-label": AXIS_LABEL,
  "axis-title": AXIS_TITLE,
  "axis-grid": AXIS_GRID,
  "axis-domain": AXIS_DOMAIN,
  "axis-tick": AXIS_TICK,
  "legend-label": LEGEND_LABEL,
  "legend-entry": LEGEND_LABEL,
  "legend-title": LEGEND_TITLE,
  "legend-symbol": LEGEND_SYMBOL,
  "legend-band": LEGEND_SYMBOL,
  title: TITLE,
  "title-text": TITLE,
};


export const authoredValues = (
  role: string,
  painted: Record<string, unknown>,
): Record<string, unknown> => {
  const names = AUTHORED_BY_ROLE[role];
  if (!names) return {};

  const out: Record<string, unknown> = {};
  for (const [runtime, authored] of Object.entries(names)) {
    if (runtime in painted) out[authored] = painted[runtime];
  }
  return out;
};

export const editableFor = (role: string): string[] => [
  ...new Set(Object.values(AUTHORED_BY_ROLE[role] ?? {})),
];
