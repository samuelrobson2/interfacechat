import type { ChartMetricKey, ChartPoint } from "../model/metrics-types";

type ChartGradientStop = {
  offset: string;
  stopColor: string;
  stopOpacity: number;
};

export type ChartGradient = {
  id: string;
  stops: ChartGradientStop[];
};

export function buildXAxisTicks(data: ChartPoint[], maxTicks = 8): number[] {
  const uniqueSortedSteps = [...new Set(data.map((item) => item.step))].sort(
    (a, b) => a - b,
  );

  if (uniqueSortedSteps.length <= maxTicks) {
    return uniqueSortedSteps;
  }

  const indexStep = Math.ceil((uniqueSortedSteps.length - 1) / (maxTicks - 1));
  const ticks = uniqueSortedSteps.filter((_, index) => index % indexStep === 0);
  const lastStep = uniqueSortedSteps.at(-1);

  if (lastStep !== undefined && ticks.at(-1) !== lastStep) {
    ticks.push(lastStep);
  }

  return ticks;
}

export function hasMetricData(data: ChartPoint[], key: ChartMetricKey) {
  return data.some((item) => item[key] !== null && item[key] !== undefined);
}

export function createGradient(
  id: string,
  color: string,
  topOpacity: number,
): ChartGradient[] {
  return [
    {
      id,
      stops: [
        {
          offset: "0%",
          stopColor: color,
          stopOpacity: topOpacity,
        },
        {
          offset: "100%",
          stopColor: color,
          stopOpacity: 0,
        },
      ],
    },
  ];
}
