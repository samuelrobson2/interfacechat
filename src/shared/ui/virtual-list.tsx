import { cn } from "@/shared/lib/css";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useState, type ReactNode } from "react";

type VirtualListProps<TItem> = {
  items: TItem[];
  getItemKey: (item: TItem, index: number) => string;
  renderItem: (item: TItem, index: number) => ReactNode;
  estimateSize?: number;
  gap?: number;
  maxHeight?: number;
  className?: string;
};

export function VirtualList<TItem>({
  items,
  getItemKey,
  renderItem,
  estimateSize = 24,
  gap = 0,
  maxHeight = 300,
  className,
}: VirtualListProps<TItem>) {
  // Opt out of React Compiler: TanStack Virtual drives re-renders via an
  // internal store mutation the compiler can't track, so memoizing this
  // component freezes `getVirtualItems()` at its empty first-render value.
  "use no memo";

  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => estimateSize,
    initialRect: { width: 0, height: maxHeight },
    gap,
    overscan: 8,
  });

  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={setScrollElement}
      className={cn("overflow-y-auto no-scrollbar", className)}
      style={{ height: Math.min(totalSize, maxHeight) }}
    >
      <div className="relative w-full" style={{ height: totalSize }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];

          if (item === undefined) return null;

          return (
            <div
              key={getItemKey(item, virtualRow.index)}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
