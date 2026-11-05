import type { ChartConfig } from "@/shared/ui/kit/chart";

export const WIN_RATE_Y_MAX = 100;
export const WIN_RATE_Y_TICKS = [0, 25, 50, 75, 100];

export const WIN_RATE_CHART_CONFIG = {
  value: { label: "Win rate %" },
} satisfies ChartConfig;

export const AXIS_TICK_TEXT_STYLE = {
  fontSize: 14,
  fill: "var(--color-typography-secondary)",
  fontWeight: 300,
} as const;
