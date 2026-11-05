import * as React from "react";

import { cn } from "@/shared/lib/css";
import { Text } from "../text";

// Common axis styling tokens extracted from the Figma designs.
const AXIS_TICK_STYLE = {
  fill: "var(--color-gray-5)",
  fontSize: 14,
  fontFamily: "var(--font-bureau, STK Bureau Sans, sans-serif)",
  fontWeight: 300,
} as const;

const GRID_COLOR = "var(--color-gray-2)";

// Shared plot-area wrapper — owns padding, height, and axis-title rendering.
// Axis titles are rendered via our <Text> component (not recharts' built-in label).
function ChartPlot({
  className,
  height = 320,
  xLabel,
  yLabel,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  height?: number;
  xLabel?: React.ReactNode;
  yLabel?: React.ReactNode;
}) {
  return (
    <div
      data-slot="chart-card-plot"
      className={cn("flex w-full px-2", className)}
      style={{ height, ...props.style }}
      {...props}
    >
      {yLabel && (
        <Text
          variant="label"
          className="-rotate-90 whitespace-nowrap flex shrink-0 items-center justify-center"
        >
          {yLabel}
        </Text>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Absolutely-positioned inner wrapper guarantees the chart area has
            definite dimensions regardless of outer flex nesting — recharts'
            ResponsiveContainer requires a sized parent to render. */}
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0">{children}</div>
        </div>
        {xLabel && (
          <Text as="p" variant="label" className="text-center">
            {xLabel}
          </Text>
        )}
      </div>
    </div>
  );
}

export { AXIS_TICK_STYLE, GRID_COLOR, ChartPlot };
