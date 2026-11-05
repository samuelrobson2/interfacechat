import { Text } from "@/shared/ui/kit/text";
import type { DatasetChartData } from "./dataset-chart";

export function DatasetChartLegend({
  chartData,
}: {
  chartData: DatasetChartData[];
}) {
  return (
    <div className="flex items-center gap-x-6 flex-wrap">
      {chartData.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5 shrink-0">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <Text variant="label">
            {item.name}: {item.value}
          </Text>
        </div>
      ))}
    </div>
  );
}
