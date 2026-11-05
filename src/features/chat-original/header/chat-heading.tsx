import {
  getChatCategoryLabel,
  isChatCategory,
  UNCATEGORIZED_FOLDER_ID,
  UNCATEGORIZED_LABEL,
} from "@/services/chat";
import { PencilEditIcon } from "@/shared/assets/icons/general/PencilEdit";
import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { FilledFolderIcon } from "@/shared/assets/icons/outlined/FilledFolder";
import { HeartIcon } from "@/shared/assets/icons/outlined/Heart";
import {
  ChatDropdownMenu,
  ChatDropdownMenuContent,
  ChatDropdownMenuItem,
  ChatDropdownMenuTrigger,
} from "@/services/chat";
import { cn } from "@/shared/lib/css";
import { ROUTES } from "@/shared/model/routes";
import { Text } from "@/shared/ui/kit/text";
import { href, Link } from "react-router-dom";
import { ChatHeader } from "../_ui/chat-layout";
import { useChatHeadingActions } from "./model/use-chat-heading-actions";
import { ChatTitleInput } from "./ui/chat-title-input";

function ChatHeadingDomainItem({ category }: { category?: string | null }) {
  const slug = category?.trim();
  const isKnownCategory = isChatCategory(slug);

  // Known domain categories link to their own folder; empty or custom
  // categories fall back to the uncategorized bucket (matches dashboard cards).
  const folderId = isKnownCategory ? slug : UNCATEGORIZED_FOLDER_ID;
  const label = isKnownCategory
    ? getChatCategoryLabel(slug)
    : slug || UNCATEGORIZED_LABEL;

  return (
    <Link
      to={href(ROUTES.CHAT_FOLDER, { folder_id: folderId })}
      aria-label={`Open ${label} folder`}
      className={cn(
        "absolute left-0 flex w-fit items-center justify-center gap-1.5",
        "rounded-[8px] border border-gray-2 px-2 py-1.5",
        "cursor-pointer transition-colors duration-150 hover:bg-gray-2/50",
        "outline-none focus-visible:ring-2 focus-visible:ring-gray-2",
      )}
    >
      <FilledFolderIcon
        svgClasses="size-2 shrink-0"
        pathClasses="fill-icon-secondary"
      />
      <Text variant="small" color="secondary">
        {label}
      </Text>
    </Link>
  );
}

export function ChatHeading({
  sessionId,
  title,
  category,
  isFavorite,
}: {
  sessionId?: string;
  title?: string | null;
  category?: string | null;
  isFavorite?: boolean;
}) {
  const {
    isEditingTitle,
    startEditingTitle,
    stopEditingTitle,
    toggleFavorite,
    renameChat,
  } = useChatHeadingActions({ sessionId, title, isFavorite });

  const headingTitle = title?.trim() || "Untitled chat";

  return (
    <ChatHeader>
      <div className="relative flex h-full items-center justify-center">
        <ChatHeadingDomainItem category={category} />
        {isEditingTitle ? (
          <ChatTitleInput
            initialValue={headingTitle}
            onSave={renameChat}
            onCancel={stopEditingTitle}
          />
        ) : (
          <ChatDropdownMenu>
            <ChatDropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Toggle heading actions"
                className="group flex items-center gap-[9px] cursor-pointer"
              >
                <Text variant="label" color="secondary" as="span">
                  {headingTitle}
                </Text>
                <ChevronBottomIcon
                  svgClasses={cn(
                    "size-3 transition-transform duration-300",
                    "group-data-[state=open]:rotate-180",
                  )}
                  pathClasses="stroke-icon-secondary"
                />
              </button>
            </ChatDropdownMenuTrigger>
            <ChatDropdownMenuContent
              frameClassName="w-[160px]"
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <ChatDropdownMenuItem onSelect={toggleFavorite}>
                <HeartIcon
                  svgClasses="size-4"
                  pathClasses={cn(
                    "stroke-icon-primary",
                    isFavorite && "fill-rose-2 stroke-rose-2",
                  )}
                />
                {isFavorite ? "Unfavorite" : "Favorite"}
              </ChatDropdownMenuItem>
              <ChatDropdownMenuItem onSelect={startEditingTitle}>
                <PencilEditIcon
                  svgClasses="size-4"
                  pathClasses="stroke-icon-primary"
                />
                Rename
              </ChatDropdownMenuItem>
            </ChatDropdownMenuContent>
          </ChatDropdownMenu>
        )}
      </div>
    </ChatHeader>
  );
}
