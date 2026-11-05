import { Link } from "react-router-dom";
import {
  ChatGrayFrame,
  chatCategoryLightBgVariants,
  type ChatCategoryColor,
} from "@/services/chat";
import { PlusIcon } from "@/shared/assets/icons/general/Plus";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function ChatItemCard({
  to,
  title,
  date,
  color = "favorites",
  ariaLabel,
  className,
}: {
  to: string;
  title: string;
  /** Formatted date shown in the bottom-left corner (e.g. "April 30"). */
  date?: string;
  /** Visual color of the outer frame. Defaults to neutral gray. */
  color?: ChatCategoryColor;
  ariaLabel?: string;
  className?: string;
}) {
  // The neutral "favorites" tone keeps the legacy gray styling used by the
  // "New conversation" tile on the dashboard for backwards compatibility.
  const isDefault = color === "favorites";
  // Keep the legacy neutral gray for the default tile; categories use their light bg.
  const fillClassName = isDefault
    ? "bg-gray-2"
    : chatCategoryLightBgVariants({ color });

  return (
    <ChatGrayFrame
      asChild
      fillClassName={fillClassName}
      className={cn(
        "group flex flex-col gap-4 justify-between text-left outline-none p-4",
        className,
      )}
    >
      <Link to={to} aria-label={ariaLabel ?? title}>
        <Text
          className="line-clamp-3"
          variant="label"
          color={isDefault ? "secondary" : "primary"}
        >
          {title}
        </Text>

        <div className="flex w-full items-center justify-between gap-2">
          {date ? (
            <Text variant="label" color="secondary" className="truncate">
              {date}
            </Text>
          ) : (
            <span aria-hidden />
          )}
          <PlusIcon svgClasses="size-4 shrink-0" />
        </div>
      </Link>
    </ChatGrayFrame>
  );
}
