import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  BoxPlotChart,
  BubbleChart,
  BubbleSizeLegend,
  ChartCard,
  ChartCardFooter,
  ChartCardHeader,
  ChartCardLegend,
  DensityCurveChart,
  DivergingBarsChart,
  HistogramChart,
  HorizontalBarsChart,
} from ".";

const meta: Meta<typeof ChartCard> = {
  title: "UI/Kit/ChartCard",
  component: ChartCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[680px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChartCard>;

// ---------------------------------------------------------------------------
// 1. Horizontal bars
// ---------------------------------------------------------------------------

export const HorizontalBars: Story = {
  render: (args) => (
    <ChartCard {...args}>
      <ChartCardHeader title="Horizontal bars" subtitle="#3 colors, legend" />
      <ChartCardLegend
        title="Legend"
        items={[
          { label: "1", color: "orange-5" },
          { label: "2", color: "blue-3" },
          { label: "3", color: "rose-2" },
        ]}
      />
      <HorizontalBarsChart
        categoryKey="name"
        colorKey="color"
        xLabel="Value"
        yLabel="Option"
        series={[{ key: "value", color: "orange-5" }]}
        data={[
          { name: "Option 1", value: 18, color: "orange-5" },
          { name: "Option 2", value: 19, color: "orange-5" },
          { name: "Option 3", value: 23, color: "orange-5" },
          { name: "Option 4", value: 15, color: "blue-3" },
          { name: "Option 5", value: 17, color: "blue-3" },
          { name: "Option 6", value: 19, color: "blue-3" },
          { name: "Option 7", value: 8, color: "rose-2" },
          { name: "Option 8", value: 11, color: "rose-2" },
          { name: "Option 9", value: 13, color: "rose-2" },
        ]}
      />
      <ChartCardFooter
        title="Main widget text"
        subtitle="Secondary widget text"
      />
    </ChartCard>
  ),
};

// Simpler single-series variant showing straightforward API usage.
export const HorizontalBarsMultiSeries: Story = {
  render: (args) => (
    <ChartCard {...args}>
      <ChartCardHeader title="Quarterly sales" subtitle="by region" />
      <HorizontalBarsChart
        categoryKey="name"
        xLabel="Sales, $M"
        yLabel="Region"
        series={[
          { key: "q1", label: "Q1", color: "orange-5" },
          { key: "q2", label: "Q2", color: "blue-3" },
          { key: "q3", label: "Q3", color: "rose-2" },
        ]}
        data={[
          { name: "EU", q1: 12, q2: 15, q3: 18 },
          { name: "US", q1: 20, q2: 22, q3: 25 },
          { name: "APAC", q1: 8, q2: 12, q3: 17 },
        ]}
      />
    </ChartCard>
  ),
};

// ---------------------------------------------------------------------------
// 2. Density curve — multiple, smooth
// ---------------------------------------------------------------------------

const densityCurveData = Array.from({ length: 40 }, (_, i) => {
  const x = i * 2;
  const peak = (mu: number, sigma: number, amp: number) =>
    amp * Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));
  return {
    x,
    g1: peak(20, 10, 56) + peak(40, 6, 25),
    g2: peak(22, 7, 50),
    g3: peak(18, 6, 45) + peak(60, 18, 20),
    g4: peak(15, 5, 46) + peak(50, 20, 30),
  };
});

export const DensityCurve: Story = {
  render: (args) => (
    <ChartCard {...args}>
      <ChartCardHeader
        title="Density curve — multiple, smooth"
        subtitle="#4 colors, opacity, outlines"
      />
      <DensityCurveChart
        data={densityCurveData}
        xKey="x"
        xLabel="Value"
        yLabel="Density"
        series={[
          { key: "g1", label: "Group 1", color: "rose-2" },
          { key: "g2", label: "Group 2", color: "blue-5" },
          { key: "g3", label: "Group 3", color: "mint-1" },
          { key: "g4", label: "Group 4", color: "yellow-5" },
        ]}
      />
      <ChartCardLegend
        className="shrink-0"
        items={[
          { label: "Group 1", color: "rose-2" },
          { label: "Group 2", color: "blue-5" },
          { label: "Group 3", color: "mint-1" },
          { label: "Group 4", color: "yellow-5" },
        ]}
      />
    </ChartCard>
  ),
};

// ---------------------------------------------------------------------------
// 3. Box plots
// ---------------------------------------------------------------------------

export const BoxPlots: Story = {
  render: (args) => (
    <ChartCard {...args}>
      <ChartCardHeader
        title="Box plots"
        subtitle="#6 colors, no legend, inline titles, style 2 - opacity & outlines"
      />
      <BoxPlotChart
        xLabel="Group"
        yLabel="Value"
        data={[
          { name: "group 1", min: 25, q1: 28, median: 30, q3: 32, max: 34 },
          {
            name: "group 2",
            min: 19,
            q1: 25,
            median: 26,
            q3: 28,
            max: 30,
            color: "rose-2",
          },
          {
            name: "group 3",
            min: 8,
            q1: 12,
            median: 14,
            q3: 17,
            max: 23,
            outliers: [26],
            color: "blue-5",
          },
          {
            name: "group 4",
            min: 10,
            q1: 22,
            median: 26,
            q3: 38,
            max: 43,
            outliers: [46, 52],
            color: "gray-3",
          },
          {
            name: "group 5",
            min: 20,
            q1: 26,
            median: 28,
            q3: 30,
            max: 36,
            color: "orange-5",
          },
          {
            name: "group 6",
            min: 19,
            q1: 27,
            median: 30,
            q3: 34,
            max: 42,
            outliers: [49, 51],
            color: "blue-4",
          },
        ]}
      />
    </ChartCard>
  ),
};

// ---------------------------------------------------------------------------
// 4. Histogram with bars
// ---------------------------------------------------------------------------

const histogramBarsG1 = [
  { x: 49, count: 11 },
  { x: 50, count: 18 },
  { x: 51, count: 17 },
  { x: 52, count: 34 },
  { x: 53, count: 42 },
  { x: 54, count: 48 },
  { x: 55, count: 52 },
  { x: 56, count: 47 },
  { x: 57, count: 43 },
  { x: 58, count: 40 },
  { x: 59, count: 36 },
  { x: 60, count: 31 },
  { x: 61, count: 19 },
  { x: 62, count: 13 },
  { x: 63, count: 9 },
  { x: 64, count: 8 },
  { x: 65, count: 4 },
  { x: 66, count: 3 },
  { x: 67, count: 6 },
];

const histogramBarsG2 = [
  { x: 67, count: 16 },
  { x: 68, count: 23 },
  { x: 69, count: 29 },
  { x: 70, count: 37 },
  { x: 71, count: 42 },
  { x: 72, count: 49 },
  { x: 73, count: 53 },
  { x: 74, count: 55 },
  { x: 75, count: 49 },
  { x: 76, count: 44 },
  { x: 77, count: 41 },
  { x: 78, count: 36 },
  { x: 79, count: 31 },
  { x: 80, count: 21 },
  { x: 81, count: 19 },
  { x: 82, count: 13 },
  { x: 83, count: 12 },
  { x: 84, count: 8 },
  { x: 85, count: 5 },
  { x: 86, count: 3 },
];

export const HistogramBars: Story = {
  render: (args) => (
    <ChartCard {...args}>
      <ChartCardHeader
        title="Histogram with bars"
        subtitle="#2 colors overlaid, opacity"
      />
      <HistogramChart
        variant="bars"
        xLabel="Value"
        yLabel="Frequency"
        series={[
          {
            key: "g1",
            label: "Group 1",
            color: "rose-2",
            data: histogramBarsG1,
          },
          {
            key: "g2",
            label: "Group 2",
            color: "orange-5",
            data: histogramBarsG2,
          },
        ]}
      />
      <ChartCardLegend
        items={[
          { label: "Group 1", color: "rose-2" },
          { label: "Group 2", color: "orange-5" },
        ]}
      />
    </ChartCard>
  ),
};

// ---------------------------------------------------------------------------
// 5. Histogram with dot columns
// ---------------------------------------------------------------------------

const dotColumnsG1 = [
  { x: 49, count: 1 },
  { x: 50, count: 11 },
  { x: 51, count: 17 },
  { x: 52, count: 18 },
  { x: 53, count: 34 },
  { x: 54, count: 42 },
  { x: 55, count: 48 },
  { x: 56, count: 52 },
  { x: 57, count: 47 },
  { x: 58, count: 43 },
  { x: 59, count: 40 },
  { x: 60, count: 36 },
  { x: 61, count: 31 },
  { x: 62, count: 19 },
  { x: 63, count: 13 },
  { x: 64, count: 9 },
  { x: 65, count: 8 },
  { x: 66, count: 5 },
  { x: 67, count: 7 },
];

const dotColumnsG2 = [
  { x: 68, count: 23 },
  { x: 69, count: 29 },
  { x: 70, count: 37 },
  { x: 71, count: 42 },
  { x: 72, count: 49 },
  { x: 73, count: 53 },
  { x: 74, count: 54 },
  { x: 75, count: 50 },
  { x: 76, count: 44 },
  { x: 77, count: 41 },
  { x: 78, count: 36 },
  { x: 79, count: 31 },
  { x: 80, count: 21 },
  { x: 81, count: 18 },
  { x: 82, count: 13 },
  { x: 83, count: 10 },
  { x: 84, count: 7 },
  { x: 85, count: 4 },
  { x: 86, count: 2 },
];

export const HistogramDots: Story = {
  render: (args) => (
    <ChartCard {...args}>
      <ChartCardHeader
        title="Histogram with dot columns"
        subtitle="#2 colors overlaid, opacity"
      />
      <HistogramChart
        variant="dots"
        xLabel="Value"
        yLabel="Count"
        series={[
          {
            key: "g1",
            label: "Group 1",
            color: "yellow-5",
            data: dotColumnsG1,
          },
          { key: "g2", label: "Group 2", color: "blue-4", data: dotColumnsG2 },
        ]}
      />
      <ChartCardLegend
        items={[
          { label: "Group 1", color: "yellow-5" },
          { label: "Group 2", color: "blue-4" },
        ]}
      />
    </ChartCard>
  ),
};

// ---------------------------------------------------------------------------
// 6. Diverging / population-pyramid style
// ---------------------------------------------------------------------------

const divergingData = Array.from({ length: 31 }, (_, i) => {
  const name = 60 - i * 2;
  const leftBase = 30 + Math.sin(i / 2) * 20 + (i % 3) * 5;
  const rightBase = 25 + Math.cos(i / 3) * 18 + (i % 4) * 4;
  return {
    name,
    left: Math.max(5, Math.round(leftBase)),
    right: Math.max(5, Math.round(rightBase)),
  };
});

export const DivergingBars: Story = {
  render: (args) => (
    <ChartCard {...args}>
      <ChartCardHeader
        title="Histogram with horizontal bars"
        subtitle="#2 colors, 2 conditions on left and right sides of the chart"
      />
      <DivergingBarsChart
        data={divergingData}
        xLabel="Population"
        yLabel="Age"
        leftColor="blue-4"
        rightColor="mint-2"
      />
    </ChartCard>
  ),
};

// ---------------------------------------------------------------------------
// 7. Bubble chart
// ---------------------------------------------------------------------------

const mkBubbles = (
  count: number,
  xRange: [number, number],
  yRange: [number, number],
  zRange: [number, number],
) =>
  Array.from({ length: count }, () => ({
    x: Math.round(xRange[0] + Math.random() * (xRange[1] - xRange[0])),
    y: Math.round(yRange[0] + Math.random() * (yRange[1] - yRange[0])),
    z: Math.round(zRange[0] + Math.random() * (zRange[1] - zRange[0])),
  }));

export const Bubble: Story = {
  render: (args) => (
    <ChartCard {...args}>
      <ChartCardHeader
        title="Bubble chart"
        subtitle="#5 colors, 5 sizes, opacity & outline"
      />
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <BubbleChart
            xLabel="Revenue"
            yLabel="Score"
            xTickFormatter={(v) => `${v / 1000}K`}
            series={[
              {
                key: "g1",
                label: "Group 1",
                color: "blue-3",
                data: mkBubbles(22, [0, 2000], [50, 80], [50, 400]),
              },
              {
                key: "g2",
                label: "Group 2",
                color: "yellow-5",
                data: mkBubbles(22, [500, 2500], [60, 95], [50, 400]),
              },
              {
                key: "g3",
                label: "Group 3",
                color: "mint-2",
                data: mkBubbles(22, [1500, 3500], [60, 95], [50, 400]),
              },
              {
                key: "g4",
                label: "Group 4",
                color: "rose-2",
                data: mkBubbles(22, [3000, 5500], [55, 90], [50, 400]),
              },
              {
                key: "g5",
                label: "Group 5",
                color: "mint-3",
                data: mkBubbles(18, [4500, 6500], [50, 85], [50, 400]),
              },
            ]}
          />
        </div>
        <BubbleSizeLegend
          className="shrink-0 py-8"
          items={[
            { label: "Value 1", size: 14 },
            { label: "Value 2", size: 20 },
            { label: "Value 3", size: 28 },
            { label: "Value 4", size: 36 },
            { label: "Value 5", size: 48 },
          ]}
        />
      </div>
      <ChartCardLegend
        items={[
          { label: "Group 1", color: "blue-3" },
          { label: "Group 2", color: "yellow-5" },
          { label: "Group 3", color: "mint-2" },
          { label: "Group 4", color: "rose-2" },
          { label: "Group 5", color: "mint-3" },
        ]}
      />
    </ChartCard>
  ),
};
