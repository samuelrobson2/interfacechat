import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { useMemo, useState } from "react";
import { HistoryFilterBar, type HistoryFilter } from "./ui/history-filter";
import { HistoryItemRow } from "./ui/history-item-row";
import { useHistoryItems, type HistoryItem } from "./model/use-history-items";

// Newest datasets first; chats (no date) sort after datasets.
function byDateDesc(a: HistoryItem, b: HistoryItem) {
  if (a.date && b.date) return b.date.localeCompare(a.date);
  if (a.date) return -1;
  if (b.date) return 1;
  return a.title.localeCompare(b.title);
}

export function HistoryView({ className }: { className?: string }) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const { datasetItems, chatItems, isLoading, isError, isMock } =
    useHistoryItems();

  const items = useMemo(() => {
    const source =
      filter === "dataset"
        ? datasetItems
        : filter === "chat"
          ? chatItems
          : [...datasetItems, ...chatItems];
    return source.slice().sort(byDateDesc);
  }, [filter, datasetItems, chatItems]);

  return (
    <div className={cn("flex w-full flex-col items-center gap-10", className)}>
      <HistoryFilterBar value={filter} onValueChange={setFilter} />

      <div className="flex w-full max-w-[648px] flex-col gap-3">
        {isLoading ? (
          <Text className="py-12 text-center text-typography-secondary">
            Loading history…
          </Text>
        ) : items.length === 0 ? (
          <Text className="py-12 text-center text-typography-secondary">
            {isError
              ? "Couldn't load your history."
              : "Nothing here yet. Your datasets and chats will show up here."}
          </Text>
        ) : (
          items.map((item) => (
            <HistoryItemRow key={item.id} item={item} navigable={!isMock} />
          ))
        )}
      </div>
    </div>
  );
}
