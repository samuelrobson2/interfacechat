import { FileText, LineChart, Plus, X } from "lucide-react";
import { Text } from "@/shared/ui/kit/text";
import { cn } from "@/shared/lib/css";
import type { OpenTab } from "./types";

// A simple (non-reorderable) tab strip for whatever's open in the main view —
// documents and other views like graphs share the same strip.
export function TabStrip({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onNewGraph,
}: {
  tabs: OpenTab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNewGraph: () => void;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-gray-2 px-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(tab.id)}
          onKeyDown={(e) => e.key === "Enter" && onSelect(tab.id)}
          className={cn(
            "group flex h-8 max-w-[180px] items-center gap-1.5 rounded-[8px] px-2.5 transition-colors",
            activeTabId === tab.id
              ? "bg-gray-1 text-typography-primary"
              : "text-typography-secondary hover:bg-gray-1/60",
          )}
        >
          {tab.kind === "document" ? (
            <FileText className="size-3.5 shrink-0" />
          ) : (
            <LineChart className="size-3.5 shrink-0" />
          )}
          <Text variant="caption" className="min-w-0 truncate">
            {tab.title}
          </Text>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
            className="shrink-0 rounded-full p-0.5 opacity-0 hover:bg-gray-2 group-hover:opacity-100"
            aria-label={`Close ${tab.title}`}
          >
            <X className="size-3" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onNewGraph}
        className="flex h-8 shrink-0 items-center gap-1 rounded-[8px] px-2.5 text-typography-secondary hover:bg-gray-1/60"
      >
        <Plus className="size-3.5" />
        <Text variant="caption">Graph</Text>
      </button>
    </div>
  );
}
