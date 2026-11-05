import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  chatCategoryHighlightBgVariants,
  chatCategoryHighlightTextVariants,
  chatCategoryLightBgVariants,
  type ChatCategoryColor,
} from "@/services/chat";
import { FolderIcon } from "@/shared/assets/icons/Folder";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function ChatFolderCard({
  color,
  icon,
  title,
  chatsCount,
  to,
  className,
}: {
  color: ChatCategoryColor;
  icon?: ReactNode;
  /** Optional title rendered below the folder; when omitted the label row is hidden. */
  title?: string;
  /** Chat count appended after the title with a separator dot. Ignored when `title` is not set. */
  chatsCount?: number;
  /** When set, the card becomes an internal link; otherwise it renders as a static visual. */
  to?: string;
  className?: string;
}) {
  const hasTitle = !!title;
  const showCount = typeof chatsCount === "number";

  const ariaLabel = useMemo(() => {
    if (!hasTitle) return undefined;
    if (showCount) return `${title}, ${chatsCount} chats`;
    return title;
  }, [hasTitle, showCount, title, chatsCount]);

  const containerClass = cn(
    "group flex flex-col items-center gap-3 overflow-hidden",
    to && "outline-none",
    className,
  );

  const content = (
    <>
      <FolderArt color={color} icon={icon} />
      {hasTitle && (
        <FolderLabel title={title} chatsCount={chatsCount} interactive={!!to} />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} aria-label={ariaLabel} className={containerClass}>
        {content}
      </Link>
    );
  }

  return <div className={containerClass}>{content}</div>;
}

export function FolderArt({
  color,
  icon,
  children,
  folderIconClassName,
  parentBackgroundClassName,
  childBackgroundClassName,
  className,
}: {
  color?: ChatCategoryColor;
  icon?: ReactNode;
  children?: ReactNode;
  folderIconClassName?: string;
  parentBackgroundClassName?: string;
  childBackgroundClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-153/129 w-full", className)}>
      <FolderIcon
        aria-hidden="true"
        svgClasses={cn(
          "absolute inset-0 size-full",
          chatCategoryHighlightTextVariants({ color }),
          folderIconClassName,
        )}
      />

      <div
        className={cn(
          "flex items-center justify-center absolute inset-0 top-[16.9%] rounded-[12px]",
          "border border-gray-2",
          chatCategoryLightBgVariants({ color }),
          parentBackgroundClassName,
        )}
        style={{
          boxShadow:
            "inset 0 1px 2px 0 #ffffff, inset 0 -5px 20px 0 rgba(196, 196, 196, 0.3)",
        }}
      >
        <div
          className={cn(
            "absolute inset-[3px] rounded-[inherit]",
            chatCategoryHighlightBgVariants({ color }),
            childBackgroundClassName,
          )}
          style={{ filter: `blur(6px)` }}
          aria-hidden="true"
        />

        {icon && (
          <div className="relative max-w-[75px] [&>image]:w-full">{icon}</div>
        )}

        {children && <div className="absolute inset-0">{children}</div>}
      </div>
    </div>
  );
}

export function FolderLabel({
  title,
  chatsCount,
  interactive,
}: {
  title: string;
  chatsCount?: number;
  /** Enables hover background tied to the parent `group` (when the card is a link). */
  interactive?: boolean;
}) {
  const showCount = typeof chatsCount === "number";

  return (
    <Text
      variant="label"
      className={cn(
        "flex w-full justify-center whitespace-nowrap rounded-[24px] bg-transparent px-2 py-0.5 transition-colors duration-150",
        interactive && "group-hover:bg-gray-2/50",
      )}
    >
      <span title={title} className="truncate">
        {title}
      </span>
      {showCount && (
        <span className="text-typography-secondary shrink-0">
          {" · "}
          {chatsCount}
        </span>
      )}
    </Text>
  );
}
