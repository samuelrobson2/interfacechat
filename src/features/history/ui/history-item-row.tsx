import { chatCategoryLightBgVariants } from "@/services/chat";
import { ChatHistoryIcon } from "@/shared/assets/icons/general/ChatHistory";
import { DashboardIcon } from "@/shared/assets/icons/general/Dashboard";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { Link } from "react-router-dom";
import type { HistoryItem } from "../model/use-history-items";

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

function HistoryItemIcon({ item }: { item: HistoryItem }) {
  // Chat folders reuse the chat-history category art + color tint.
  if (item.iconSrc) {
    return (
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full",
          item.color
            ? chatCategoryLightBgVariants({ color: item.color })
            : "bg-gray-6",
        )}
      >
        <img src={item.iconSrc} alt="" className="size-7 object-contain" />
      </span>
    );
  }

  const TypeIcon = item.type === "dataset" ? DashboardIcon : ChatHistoryIcon;
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-6"
      aria-label={item.type === "dataset" ? "Dataset" : "Chat"}
    >
      <TypeIcon svgClasses="size-5" />
    </span>
  );
}

export function HistoryItemRow({
  item,
  navigable = true,
}: {
  item: HistoryItem;
  /** When false, renders a static row (no navigation) — used for mock data. */
  navigable?: boolean;
}) {
  const date = formatDate(item.date);

  const className = cn(
    "group flex w-full items-center gap-3 rounded-[16px] bg-background-primary px-4 py-3.5",
    "hairline [--hairline-color:var(--color-gray-3)] [--hairline-radius:16px] [--hairline-opacity:0.2]",
    "transition-colors hover:bg-gray-6",
  );

  const content = (
    <>
      <HistoryItemIcon item={item} />

      <div className="flex min-w-0 flex-col gap-0.5">
        <Text variant="body" className="truncate">
          {item.title}
        </Text>
        <Text variant="label" color="secondary">
          {item.meta}
        </Text>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {date && (
          <Text variant="label" color="secondary">
            {date}
          </Text>
        )}
        {navigable && <ArrowRightIcon pathClasses="stroke-current" />}
      </div>
    </>
  );

  if (!navigable) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link to={item.to} className={className}>
      {content}
    </Link>
  );
}
