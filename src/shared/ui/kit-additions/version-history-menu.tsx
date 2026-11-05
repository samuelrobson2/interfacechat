import { cn } from "@/shared/lib/css";
import { Card } from "@/shared/ui/kit/card";
import { Text } from "@/shared/ui/kit/text";

import type { VersionHistoryEntry } from "./version-history.mock";

export function VersionHistoryMenu({
  entries,
  onSelect,
}: {
  entries: VersionHistoryEntry[];
  onSelect?: (entry: VersionHistoryEntry) => void;
}) {
  return (
    <Card
      shape="rounded"
      spacing="none"
      className="w-[276px] flex-col gap-0 overflow-hidden rounded-[20px] p-1.5 [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.2] [--hairline-radius:20px]"
    >
      <header className="rounded-t-[16px] bg-gray-1/25 px-4 pb-2 pt-4 hairline-b [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.2]">
        <Text variant="caption" color="darkGray">
          Version History
        </Text>
      </header>

      <ul
        className={cn(
          "flex max-h-[264px] flex-col gap-px overflow-y-auto rounded-b-[16px] bg-gray-1/25 p-2",
          "[scrollbar-width:thin] [scrollbar-color:var(--color-gray-2)_transparent]",
          "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-button]:hidden",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-gray-2 [&::-webkit-scrollbar-thumb]:bg-clip-content",
          "[&::-webkit-scrollbar-thumb]:hover:bg-gray-3",
        )}
      >
        {entries.map((entry) => (
          <VersionHistoryItem key={entry.id} entry={entry} onSelect={onSelect} />
        ))}
      </ul>
    </Card>
  );
}

function VersionHistoryItem({
  entry,
  onSelect,
}: {
  entry: VersionHistoryEntry;
  onSelect?: (entry: VersionHistoryEntry) => void;
}) {
  const { title, author, timeLabel, isCurrent } = entry;

  return (
    <li>
      <button
        type="button"
        aria-current={isCurrent ? "true" : undefined}
        onClick={() => onSelect?.(entry)}
        className={cn(
          "flex w-full cursor-pointer items-start gap-2 rounded-[4px] p-2 text-left transition-colors",
          isCurrent ? "bg-blue-1/35 hover:bg-blue-1/60" : "hover:bg-gray-2/20",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "mt-px text-[10px] leading-none",
            isCurrent ? "text-blue-4" : "text-gray-3",
          )}
        >
          &bull;
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <Text
            as="span"
            variant="caption"
            color="darkGray"
            className="line-clamp-2 whitespace-normal"
          >
            {title}
          </Text>
          <Text as="span" variant="small" color="secondary">
            {author} &middot; {timeLabel}
          </Text>
        </span>
      </button>
    </li>
  );
}
