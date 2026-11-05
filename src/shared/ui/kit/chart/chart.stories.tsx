import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Funnel,
  FunnelChart,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from ".";

const meta: Meta<typeof ChartContainer> = {
  title: "UI/Kit/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    config: {
      control: {
        type: "object",
      },
    },
    children: {
      control: {
        type: "text",
      },
    }
  }
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

const monthlyData = [
  { month: "Jan", revenue: 4200, users: 240 },
  { month: "Feb", revenue: 5800, users: 310 },
  { month: "Mar", revenue: 4900, users: 280 },
  { month: "Apr", revenue: 7200, users: 420 },
  { month: "May", revenue: 6100, users: 380 },
  { month: "Jun", revenue: 8300, users: 510 },
];

const lineChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-blue-5)" },
};

// Showcase: multiple instances — args not applicable
export const LineChartStory: Story = {
  name: "Line Chart",
  render: () => (
    <ChartContainer config={lineChartConfig} className="h-64 w-full">
      <LineChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  ),
};

const barChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-blue-5)" },
  users: { label: "Users", color: "var(--color-blue-3)" },
};

// Showcase: multiple instances — args not applicable
export const BarChartStory: Story = {
  name: "Bar Chart",
  render: () => (
    <ChartContainer config={barChartConfig} className="h-64 w-full">
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  ),
};

const areaChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-blue-5)" },
};

// Showcase: multiple instances — args not applicable
export const AreaChartStory: Story = {
  name: "Area Chart",
  render: () => (
    <ChartContainer config={areaChartConfig} className="h-64 w-full">
      <AreaChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          fill="var(--color-revenue)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  ),
};

const legendChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-blue-5)" },
  users: { label: "Users", color: "var(--color-blue-3)" },
};

// Showcase: multiple instances — args not applicable
export const WithLegend: Story = {
  render: () => (
    <ChartContainer config={legendChartConfig} className="h-72 w-full">
      <LineChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="users"
          stroke="var(--color-users)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  ),
};

const stackedBarConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-blue-5)" },
  users: { label: "Users", color: "var(--color-blue-3)" },
};

// Showcase: multiple instances — args not applicable
export const StackedBarChartStory: Story = {
  name: "Stacked Bar Chart",
  render: () => (
    <ChartContainer config={stackedBarConfig} className="h-64 w-full">
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="revenue" stackId="a" fill="var(--color-revenue)" />
        <Bar dataKey="users" stackId="a" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  ),
};

const stackedAreaConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-blue-5)" },
  users: { label: "Users", color: "var(--color-blue-3)" },
};

// Showcase: multiple instances — args not applicable
export const StackedAreaChartStory: Story = {
  name: "Stacked Area Chart",
  render: () => (
    <ChartContainer config={stackedAreaConfig} className="h-64 w-full">
      <AreaChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stackId="1"
          stroke="var(--color-revenue)"
          fill="var(--color-revenue)"
          fillOpacity={0.4}
        />
        <Area
          type="monotone"
          dataKey="users"
          stackId="1"
          stroke="var(--color-users)"
          fill="var(--color-users)"
          fillOpacity={0.4}
        />
      </AreaChart>
    </ChartContainer>
  ),
};

const composedConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-blue-5)" },
  users: { label: "Users", color: "var(--color-blue-3)" },
  growth: { label: "Growth", color: "var(--color-green-5)" },
};

const composedData = [
  { month: "Jan", revenue: 4200, users: 240, growth: 3100 },
  { month: "Feb", revenue: 5800, users: 310, growth: 4200 },
  { month: "Mar", revenue: 4900, users: 280, growth: 3800 },
  { month: "Apr", revenue: 7200, users: 420, growth: 5500 },
  { month: "May", revenue: 6100, users: 380, growth: 4900 },
  { month: "Jun", revenue: 8300, users: 510, growth: 6700 },
];

// Showcase: multiple instances — args not applicable
export const ComposedChartStory: Story = {
  name: "Composed Chart (Line + Bar + Area)",
  render: () => (
    <ChartContainer config={composedConfig} className="h-64 w-full">
      <ComposedChart data={composedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="growth"
          stroke="var(--color-growth)"
          fill="var(--color-growth)"
          fillOpacity={0.2}
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
        <Line
          type="monotone"
          dataKey="users"
          stroke="var(--color-users)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ChartContainer>
  ),
};

const pieData = [
  { name: "Jan", value: 4200 },
  { name: "Feb", value: 5800 },
  { name: "Mar", value: 4900 },
  { name: "Apr", value: 7200 },
  { name: "May", value: 6100 },
  { name: "Jun", value: 8300 },
];

const PIE_COLORS = [
  "var(--color-blue-5)",
  "var(--color-blue-4)",
  "var(--color-blue-3)",
  "var(--color-blue-2)",
  "var(--color-green-5)",
  "var(--color-green-4)",
];

const pieConfig: ChartConfig = {
  Jan: { label: "Jan", color: PIE_COLORS[0] },
  Feb: { label: "Feb", color: PIE_COLORS[1] },
  Mar: { label: "Mar", color: PIE_COLORS[2] },
  Apr: { label: "Apr", color: PIE_COLORS[3] },
  May: { label: "May", color: PIE_COLORS[4] },
  Jun: { label: "Jun", color: PIE_COLORS[5] },
};

// Showcase: multiple instances — args not applicable
export const PieChartStory: Story = {
  name: "Pie Chart",
  render: () => (
    <ChartContainer config={pieConfig} className="h-64 w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  ),
};

const radarData = [
  { subject: "Math", score: 120, fullMark: 150 },
  { subject: "Chinese", score: 98, fullMark: 150 },
  { subject: "English", score: 86, fullMark: 150 },
  { subject: "Geography", score: 99, fullMark: 150 },
  { subject: "Physics", score: 85, fullMark: 150 },
  { subject: "History", score: 65, fullMark: 150 },
];

const radarConfig: ChartConfig = {
  score: { label: "Score", color: "var(--color-blue-5)" },
};

// Showcase: multiple instances — args not applicable
export const RadarChartStory: Story = {
  name: "Radar Chart",
  render: () => (
    <ChartContainer config={radarConfig} className="h-64 w-full">
      <RadarChart cx="50%" cy="50%" outerRadius={80} data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="var(--color-score)"
          fill="var(--color-score)"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ChartContainer>
  ),
};

const radialBarData = [
  { name: "18-24", value: 31.47, fill: "var(--color-blue-5)" },
  { name: "25-29", value: 26.69, fill: "var(--color-blue-4)" },
  { name: "30-34", value: 15.69, fill: "var(--color-blue-3)" },
  { name: "35-39", value: 8.22, fill: "var(--color-green-5)" },
  { name: "40-49", value: 8.63, fill: "var(--color-green-4)" },
  { name: "50+", value: 2.63, fill: "var(--color-green-3)" },
];

const radialBarConfig: ChartConfig = {
  "18-24": { label: "18-24", color: "var(--color-blue-5)" },
  "25-29": { label: "25-29", color: "var(--color-blue-4)" },
  "30-34": { label: "30-34", color: "var(--color-blue-3)" },
  "35-39": { label: "35-39", color: "var(--color-green-5)" },
  "40-49": { label: "40-49", color: "var(--color-green-4)" },
  "50+": { label: "50+", color: "var(--color-green-3)" },
};

// Showcase: multiple instances — args not applicable
export const RadialBarChartStory: Story = {
  name: "Radial Bar Chart",
  render: () => (
    <ChartContainer config={radialBarConfig} className="h-72 w-full">
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius={20}
        outerRadius={140}
        data={radialBarData}
      >
        <RadialBar dataKey="value" label={{ position: "insideStart", fill: "#fff" }} />
        <ChartLegend
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          content={<ChartLegendContent />}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </RadialBarChart>
    </ChartContainer>
  ),
};

const scatterData = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
];

const scatterConfig: ChartConfig = {
  scatter: { label: "Data Points", color: "var(--color-blue-5)" },
};

// Showcase: multiple instances — args not applicable
export const ScatterChartStory: Story = {
  name: "Scatter Chart",
  render: () => (
    <ChartContainer config={scatterConfig} className="h-64 w-full">
      <ScatterChart>
        <CartesianGrid />
        <XAxis dataKey="x" name="X" type="number" />
        <YAxis dataKey="y" name="Y" type="number" />
        <ZAxis dataKey="z" range={[60, 400]} name="Z" />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="Data" data={scatterData} fill="var(--color-scatter)" />
      </ScatterChart>
    </ChartContainer>
  ),
};

const treemapData = [
  { name: "axis", size: 17010 },
  { name: "brush", size: 8833 },
  { name: "crumbs", size: 12003 },
  { name: "effects", size: 9234 },
  { name: "encoder", size: 16540 },
  { name: "events", size: 7319 },
  { name: "query", size: 13167 },
  { name: "render", size: 11578 },
];

const TREEMAP_COLORS = [
  "var(--color-blue-5)",
  "var(--color-blue-4)",
  "var(--color-blue-3)",
  "var(--color-green-5)",
  "var(--color-green-4)",
  "var(--color-blue-2)",
  "var(--color-green-3)",
  "var(--color-blue-1)",
];

const treemapConfig: ChartConfig = {
  size: { label: "Size", color: "var(--color-blue-5)" },
};

const TreemapCell = (props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, index = 0, name } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: TREEMAP_COLORS[index % TREEMAP_COLORS.length],
          stroke: "#fff",
          strokeWidth: 2,
        }}
      />
      {width > 40 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={12}
        >
          {name}
        </text>
      )}
    </g>
  );
};

// Showcase: multiple instances — args not applicable
export const TreemapChartStory: Story = {
  name: "Treemap Chart",
  render: () => (
    <ChartContainer config={treemapConfig} className="h-64 w-full">
      <Treemap data={treemapData} dataKey="size" nameKey="name" content={<TreemapCell />}>
        <ChartTooltip content={<ChartTooltipContent />} />
      </Treemap>
    </ChartContainer>
  ),
};

const funnelData = [
  { value: 100, name: "Impressions", fill: "var(--color-blue-5)" },
  { value: 80, name: "Visits", fill: "var(--color-blue-4)" },
  { value: 50, name: "Sign Ups", fill: "var(--color-blue-3)" },
  { value: 30, name: "Purchases", fill: "var(--color-green-5)" },
  { value: 10, name: "Retained", fill: "var(--color-green-4)" },
];

const funnelConfig: ChartConfig = {
  value: { label: "Value", color: "var(--color-blue-5)" },
};

// Showcase: multiple instances — args not applicable
export const FunnelChartStory: Story = {
  name: "Funnel Chart",
  render: () => (
    <ChartContainer config={funnelConfig} className="h-64 w-full">
      <FunnelChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Funnel dataKey="value" data={funnelData} isAnimationActive>
          <LabelList position="right" fill="var(--color-foreground)" stroke="none" dataKey="name" />
        </Funnel>
      </FunnelChart>
    </ChartContainer>
  ),
};

// Showcase: indicator variants — args not applicable
export const TooltipIndicators: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(["dot", "line", "dashed"] as const).map((indicator) => (
        <div key={indicator}>
          <p className="mb-2 text-sm text-typography-secondary capitalize">
            {indicator} indicator
          </p>
          <ChartContainer config={lineChartConfig} className="h-48 w-full">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <ChartTooltip
                content={<ChartTooltipContent indicator={indicator} />}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      ))}
    </div>
  ),
};
