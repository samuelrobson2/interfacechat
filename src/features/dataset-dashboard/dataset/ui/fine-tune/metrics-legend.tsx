import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";
import type { ChartMetricKey, LegendItem } from "../../model/metrics-types";

export function MetricsLegend({
  items,
  hoveredDataKey,
  onHoverChange,
}: {
  items: LegendItem[];
  hoveredDataKey?: ChartMetricKey | null;
  onHoverChange?: (dataKey: ChartMetricKey | null) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "flex items-center gap-1.5",
            item.dataKey && "cursor-pointer",
            hoveredDataKey &&
              item.dataKey &&
              item.dataKey !== hoveredDataKey &&
              "opacity-50",
          )}
          onMouseEnter={() => {
            if (item.dataKey) onHoverChange?.(item.dataKey);
          }}
          onMouseLeave={() => {
            if (item.dataKey) onHoverChange?.(null);
          }}
        >
          {item.asIcon ? (
            <span className="relative inline-block h-[8px] w-[8px]">
              <span
                className="absolute top-1/2 left-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </span>
          ) : (
            <span
              className="h-[2px] w-[18px] rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
          )}
          <Text variant="label">{item.label}</Text>
        </div>
      ))}
    </div>
  );
}
