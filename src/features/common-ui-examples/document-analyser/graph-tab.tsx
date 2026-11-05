import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Text } from "@/shared/ui/kit/text";

// A minimal example of a non-document tab — stands in for "other views" like
// a graph opened alongside the documents. Single series, so no legend is
// needed (the header names it); colors follow the app's existing chart tokens.

const AXIS_TICK_STYLE = {
  fill: "var(--color-gray-5)",
  fontSize: 12,
  fontFamily: "var(--font-bureau, STK Bureau Sans, sans-serif)",
  fontWeight: 300,
};

const DATA = [
  { month: "Jan", citations: 40 },
  { month: "Feb", citations: 95 },
  { month: "Mar", citations: 210 },
  { month: "Apr", citations: 480 },
  { month: "May", citations: 890 },
  { month: "Jun", citations: 1520 },
  { month: "Jul", citations: 2380 },
];

export function GraphTab() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-1 overflow-y-auto bg-background-primary p-6">
      <Text variant="label">Citations over time</Text>
      <Text variant="caption" color="secondary" className="mb-4">
        Example graph view — opened as its own tab, same as a document.
      </Text>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="var(--color-gray-2)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK_STYLE}
            />
            <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK_STYLE} />
            <Tooltip
              cursor={{ stroke: "var(--color-gray-3)", strokeDasharray: "2 4" }}
              contentStyle={{
                borderRadius: 12,
                border: "0.5px solid var(--color-gray-2)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
            <Line
              type="monotone"
              dataKey="citations"
              stroke="var(--color-blue-4)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-blue-4)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
