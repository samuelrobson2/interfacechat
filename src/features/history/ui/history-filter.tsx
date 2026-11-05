import { ChatHistoryIcon } from "@/shared/assets/icons/general/ChatHistory";
import { DashboardIcon } from "@/shared/assets/icons/general/Dashboard";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export type HistoryFilter = "all" | "dataset" | "chat";

const FILTERS: { value: HistoryFilter; label: string; icon?: React.ReactNode }[] =
  [
    { value: "all", label: "All" },
    {
      value: "dataset",
      label: "Datasets",
      icon: <DashboardIcon svgClasses="size-4 shrink-0" />,
    },
    {
      value: "chat",
      label: "Chats",
      icon: <ChatHistoryIcon svgClasses="size-4 shrink-0" />,
    },
  ];

export function HistoryFilterBar({
  value,
  onValueChange,
}: {
  value: HistoryFilter;
  onValueChange: (value: HistoryFilter) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-[2px] rounded-[32px] bg-background-primary p-1",
        "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:32px] [--hairline-opacity:0.2]",
      )}
    >
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onValueChange(filter.value)}
          aria-pressed={value === filter.value}
          className={cn(
            "flex items-center gap-1.5 rounded-[60px] px-3 py-1.5 text-typography-secondary transition-colors",
            value === filter.value &&
              "bg-gray-6 text-typography-primary",
          )}
        >
          {filter.icon}
          <Text as="span" variant="label">
            {filter.label}
          </Text>
        </button>
      ))}
    </div>
  );
}
