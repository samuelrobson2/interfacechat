import type { PlotPalette, PlotSeries } from "../model/plot-schema";

/**
 * Default series color cycle, sourced from design tokens. Ordered for
 * maximum hue separation on light backgrounds — see `colors.css` for the
 * underlying hex values.
 */
export const DEFAULT_PALETTE = [
  "var(--color-blue-4)",
  "var(--color-mint-2)",
  "var(--color-rose-2)",
  "var(--color-orange-5)",
  "var(--color-green-5)",
  "var(--color-blue-6)",
  "var(--color-gray-3)",
] as const;

const PALETTE_PRESETS: Record<string, readonly string[]> = {
  default: DEFAULT_PALETTE,
  blue: [
    "var(--color-blue-3)",
    "var(--color-blue-4)",
    "var(--color-blue-5)",
    "var(--color-blue-6)",
  ],
  mint: [
    "var(--color-mint-1)",
    "var(--color-mint-2)",
    "var(--color-mint-3)",
    "var(--color-blue-4)",
  ],
  rose: [
    "var(--color-rose-1)",
    "var(--color-rose-2)",
    "var(--color-rose-3)",
    "var(--color-blue-4)",
  ],
  warm: [
    "var(--color-orange-5)",
    "var(--color-red-5)",
    "var(--color-yellow-5)",
    "var(--color-rose-2)",
  ],
  cool: [
    "var(--color-blue-4)",
    "var(--color-mint-2)",
    "var(--color-blue-6)",
    "var(--color-mint-3)",
  ],
};

export const FALLBACK_COLOR = "var(--color-blue-4)";

export const resolvePalette = (
  palette: PlotPalette | undefined,
): readonly string[] => {
  if (!palette) return DEFAULT_PALETTE;
  if (Array.isArray(palette)) {
    return palette.length > 0 ? palette : DEFAULT_PALETTE;
  }
  return PALETTE_PRESETS[palette] ?? DEFAULT_PALETTE;
};

export const colorForSeries = (
  series: PlotSeries,
  index: number,
  palette: readonly string[],
): string =>
  series.color ??
  palette[index % palette.length] ??
  palette[0] ??
  FALLBACK_COLOR;
