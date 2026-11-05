import type { Config } from "vega-lite";

export const NUMI_FONT = '"STK Bureau Sans", sans-serif';

export const NUMI_FAMILIES = [
  "blue",
  "mint",
  "indigo",
  "rose",
  "warm",
  "chartreuse",
  "gray",
  "yellow",
] as const;

export type NumiFamily = (typeof NUMI_FAMILIES)[number];

/**
 * The family an aggregated "Other" takes. Held out of the rotation so a chart
 * can never paint a real category in the tone its own residual uses.
 */
export const NUMI_OTHER_FAMILY = "yellow" satisfies NumiFamily;

/** The rotation a categorical scale walks, in palette order. */
export const NUMI_CATEGORY_FAMILIES = NUMI_FAMILIES.filter(
  (family) => family !== NUMI_OTHER_FAMILY,
);

export const NUMI_CORE_COLORS = {
  blue: "var(--chart-core-blue)",
  mint: "var(--chart-core-mint)",
  indigo: "var(--chart-core-indigo)",
  rose: "var(--chart-core-rose)",
  warm: "var(--chart-core-warm)",
  chartreuse: "var(--chart-core-chartreuse)",
  gray: "var(--chart-core-gray)",
  yellow: "var(--chart-core-yellow)",
} as const satisfies Record<NumiFamily, string>;

export const NUMI_TINT_COLORS = {
  blue: "var(--chart-tint-blue)",
  mint: "var(--chart-tint-mint)",
  indigo: "var(--chart-tint-indigo)",
  rose: "var(--chart-tint-rose)",
  warm: "var(--chart-tint-warm)",
  chartreuse: "var(--chart-tint-chartreuse)",
  gray: "var(--chart-tint-gray)",
  yellow: "var(--chart-tint-yellow)",
} as const satisfies Record<NumiFamily, string>;

/** The family's second accessible step — what a ninth category reaches for. */
export const NUMI_ALT_COLORS = {
  blue: "var(--chart-alt-blue)",
  mint: "var(--chart-alt-mint)",
  indigo: "var(--chart-alt-indigo)",
  rose: "var(--chart-alt-rose)",
  warm: "var(--chart-alt-warm)",
  chartreuse: "var(--chart-alt-chartreuse)",
  gray: "var(--chart-alt-gray)",
  yellow: "var(--chart-alt-yellow)",
} as const satisfies Record<NumiFamily, string>;

export const NUMI_FADE = "var(--chart-fade)";

export const NUMI_CATEGORY_RANGE: string[] = NUMI_CATEGORY_FAMILIES.map(
  (family) => NUMI_CORE_COLORS[family],
);

/** One category's paint: a pale fill read against the edge that outlines it. */
export type CategorySlot = {
  family: NumiFamily;
  /** Which step of the family this slot uses — the pale one or the solid one. */
  step: "tint" | "core";
  fill: string;
  stroke: string;
};

const tintSlot = (family: NumiFamily): CategorySlot => ({
  family,
  step: "tint",
  fill: NUMI_TINT_COLORS[family],
  stroke: NUMI_CORE_COLORS[family],
});

const coreSlot = (family: NumiFamily): CategorySlot => ({
  family,
  step: "core",
  fill: NUMI_CORE_COLORS[family],
  stroke: NUMI_ALT_COLORS[family],
});

export const NUMI_OTHER_SLOT: CategorySlot = tintSlot(NUMI_OTHER_FAMILY);

/** Categories past this need an aggregated "Other" rather than a longer palette. */
export const NUMI_CATEGORY_CEILING = NUMI_CATEGORY_FAMILIES.length * 2;


export const categorySlots = (count: number): CategorySlot[] => {
  if (count < 1) return [];
  if (count > NUMI_CATEGORY_CEILING) {
    throw new Error(
      `The palette carries ${NUMI_CATEGORY_CEILING} categories; ${count} were asked for. Show the top ${NUMI_CATEGORY_CEILING} and aggregate the tail into "Other".`,
    );
  }

  const families = NUMI_CATEGORY_FAMILIES.slice(0, count);
  if (families.length === count) return families.map(tintSlot);

  return NUMI_CATEGORY_FAMILIES.slice(0, Math.ceil(count / 2))
    .flatMap((family) => [tintSlot(family), coreSlot(family)])
    .slice(0, count);
};

const NUMI_PATTERN_ONLY: readonly string[] = [
  "var(--chart-blue-10)",
  "var(--chart-blue-20)",
  "var(--chart-blue-30)",
  "var(--chart-blue-40)",
  "var(--chart-mint-10)",
  "var(--chart-mint-20)",
  "var(--chart-mint-30)",
  "var(--chart-indigo-10)",
  "var(--chart-indigo-20)",
  "var(--chart-indigo-30)",
  "var(--chart-rose-10)",
  "var(--chart-rose-20)",
  "var(--chart-warm-10)",
  "var(--chart-warm-20)",
  "var(--chart-warm-30)",
  "var(--chart-chartreuse-10)",
  "var(--chart-chartreuse-20)",
  "var(--chart-chartreuse-30)",
  "var(--chart-yellow-10)",
  "var(--chart-yellow-20)",
  "var(--chart-yellow-30)",
  "var(--chart-gray-20)",
  "var(--chart-gray-30)",
  ...NUMI_FAMILIES.map((family) => NUMI_TINT_COLORS[family]),
];

const CANVAS_UNSAFE: readonly string[] = [
  ...NUMI_PATTERN_ONLY,
  "var(--chart-gray-0)",
  "var(--chart-gray-10)",
  "var(--chart-gray-15)",
  "var(--chart-gray-70)",
  NUMI_FADE,
];

export const isSolidSafe = (color: string): boolean =>
  !CANVAS_UNSAFE.includes(color.trim());

export const NUMI_BLUE_RAMP: string[] = [
  "var(--chart-blue-10)",
  "var(--chart-blue-20)",
  "var(--chart-blue-40)",
  "var(--chart-blue-60)",
];

export const NUMI_PALETTE_PRESETS: Record<string, string[]> = {
  blue: NUMI_BLUE_RAMP,
  mint: [
    "var(--chart-mint-20)",
    "var(--chart-mint-30)",
    "var(--chart-mint-40)",
    "var(--chart-mint-50)",
  ],
  warm: [
    "var(--chart-warm-60)",
    "var(--chart-warm-50)",
    "var(--chart-warm-40)",
  ],
};

type VerticalGradient = {
  gradient: "linear";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: { offset: number; color: string }[];
};

export const verticalGradient = (
  from: string,
  to: string,
): VerticalGradient => ({
  gradient: "linear",
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 1,
  stops: [
    { offset: 0, color: from },
    { offset: 1, color: to },
  ],
});

export const gradientFill = (family: NumiFamily): VerticalGradient =>
  verticalGradient(NUMI_TINT_COLORS[family], NUMI_FADE);

type TextStyle = {
  fontSize: number;
  /** Vega types the weight as a literal, so the theme's two are named here. */
  fontWeight: 300 | 400;
  fill: string;
  limit?: number;
};

const textStyle = ({ fontSize, fontWeight, fill, limit }: TextStyle) => ({
  font: NUMI_FONT,
  fontSize,
  size: fontSize,
  fontWeight,
  fill,
  color: fill,
  ...(limit === undefined ? {} : { limit }),
});

const axisBase = {
  labelColor: "var(--chart-label)",
  labelFont: NUMI_FONT,
  labelFontSize: 11,
  labelFontWeight: 300,
  labelPadding: 8,
  labelOverlap: "greedy",
  labelLimit: 180,
  labelSeparation: 2,
  ticks: false,
  domainColor: "var(--chart-grid)",
  domainWidth: 1,
  titleColor: "var(--chart-label)",
  titleFont: NUMI_FONT,
  titleFontSize: 12,
  titleFontWeight: 300,
  titlePadding: 12,
  grid: false,
} as const;

export const NUMI_BOXPLOT = {
  box: "var(--chart-blue-20)",
  edge: "var(--chart-core-blue)",
  median: "var(--chart-blue-60)",
} as const;

const gridDashed = {
  grid: true,
  gridColor: "var(--chart-grid)",
  gridDash: [2, 4],
  gridOpacity: 0.6,
  gridWidth: 1,
};

export const numiVegaConfig: Config = {
  background: "transparent",
  padding: 0,
  font: NUMI_FONT,
  view: { stroke: null },

  axis: axisBase,
  axisQuantitative: { ...gridDashed, tickCount: 5 },
  axisTemporal: { ...gridDashed },
  axisDiscrete: { grid: false },
  axisX: { labelAngle: 0 },

  legend: {
    orient: "top",
    direction: "horizontal",
    title: null,
    labelColor: "var(--chart-label)",
    labelFont: NUMI_FONT,
    labelFontSize: 12,
    labelFontWeight: 300,
    labelOffset: 6,
    labelLimit: 240,
    symbolType: "square",
    symbolSize: 81,
    symbolStrokeWidth: 1,
    offset: 0,
    padding: 0,
    columnPadding: 14,
    rowPadding: 4,
  },

  header: {
    labelColor: "var(--chart-label)",
    labelFont: NUMI_FONT,
    labelFontSize: 12,
    labelFontWeight: 300,
    titleColor: "var(--chart-label)",
    titleFont: NUMI_FONT,
    titleFontSize: 12,
    titleFontWeight: 300,
  },

  title: {
    color: "var(--chart-label-strong)",
    font: NUMI_FONT,
    fontSize: 18,
    fontWeight: 400,
    subtitleColor: "var(--chart-label)",
    subtitleFont: NUMI_FONT,
    subtitleFontSize: 12,
    subtitleFontWeight: 300,
    anchor: "start",
    offset: 0,
    limit: { signal: "width" },
  },

  bar: {
    fill: gradientFill("blue"),
    stroke: NUMI_CORE_COLORS.blue,
    strokeWidth: 1,
    cornerRadius: 0,
    binSpacing: 1,
    discreteBandSize: { band: 0.6 },
  },
  line: {
    stroke: NUMI_CORE_COLORS.blue,
    strokeWidth: 2,
    interpolate: "monotone",
  },
  point: { fill: NUMI_CORE_COLORS.blue, filled: true, size: 50, opacity: 1 },
  tick: { opacity: 1 },
  area: {
    fill: gradientFill("blue"),
    line: { stroke: NUMI_CORE_COLORS.blue, strokeWidth: 2 },
    interpolate: "monotone",
  },
  rect: { fill: NUMI_CORE_COLORS.blue },
  arc: {
    fill: gradientFill("blue"),
    stroke: NUMI_CORE_COLORS.blue,
    strokeWidth: 1,
  },
  rule: { stroke: "var(--chart-grid)", strokeWidth: 1 },
  text: {
    font: NUMI_FONT,
    fontSize: 11,
    fontWeight: 300,
    fill: "var(--chart-label)",
  },
  boxplot: {
    box: { fill: NUMI_BOXPLOT.box, stroke: NUMI_BOXPLOT.edge },
    median: { color: NUMI_BOXPLOT.median, strokeWidth: 2 },
    rule: { color: NUMI_BOXPLOT.edge, strokeWidth: 1.5 },
    ticks: { color: NUMI_BOXPLOT.edge, strokeWidth: 1.5 },
    outliers: {
      fill: "transparent",
      stroke: NUMI_BOXPLOT.edge,
      strokeWidth: 1.5,
      size: 28,
    },
  },

  facet: { spacing: 28 },
  concat: { spacing: 28 },

  range: { category: NUMI_CATEGORY_RANGE },

  style: {
    "value-label": textStyle({
      fontSize: 16,
      fontWeight: 300,
      fill: "var(--chart-label-strong)",
    }),
    "cell-label": textStyle({
      fontSize: 12,
      fontWeight: 300,
      fill: "var(--chart-label-strong)",
    }),
    "data-label": textStyle({
      fontSize: 11,
      fontWeight: 400,
      fill: "var(--chart-label)",
      limit: 120,
    }),
    "tile-label": textStyle({
      fontSize: 15,
      fontWeight: 400,
      fill: "var(--chart-label)",
    }),
    "tile-headline": textStyle({
      fontSize: 18,
      fontWeight: 400,
      fill: "var(--chart-label-strong)",
    }),
  },
};
