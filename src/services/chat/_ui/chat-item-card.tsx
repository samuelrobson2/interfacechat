import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "@/shared/assets/icons/general/Plus";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import {
  chatCategoryLightBgVariants,
  type ChatCategoryColor,
} from "../model/chat-categories";
import { ChatGrayFrame } from "./chat-gray-frame";

export function ChatItemCard({
  to,
  title,
  date,
  color = "favorites",
  header,
  fillClassName,
  ariaLabel,
  className,
}: {
  to: string;
  title: string;
  /** Formatted date shown in the bottom-left corner (e.g. "April 30"). */
  date?: string;
  /** Visual color of the outer frame. Defaults to neutral gray. */
  color?: ChatCategoryColor;
  /** Slot above the title, e.g. the dataset a chat is grounded on. */
  header?: ReactNode;
  /** Overrides the frame fill derived from `color`. */
  fillClassName?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const isDefault = color === "favorites";
  const resolvedFillClassName =
    fillClassName ??
    (isDefault ? "bg-gray-2" : chatCategoryLightBgVariants({ color }));

  return (
    <ChatGrayFrame
      asChild
      fillClassName={resolvedFillClassName}
      className={cn(
        "group flex flex-col gap-4 justify-between text-left outline-none p-4",
        className,
      )}
    >
      <Link to={to} aria-label={ariaLabel ?? title}>
        <div className="flex min-w-0 flex-col gap-2">
          {header}

          <Text
            className="line-clamp-2"
            title={title}
            variant="label"
            color={isDefault ? "secondary" : "primary"}
          >
            {title}
          </Text>
        </div>

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
