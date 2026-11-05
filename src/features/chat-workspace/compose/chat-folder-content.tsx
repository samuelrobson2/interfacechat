import type { ReactNode } from "react";
import { format } from "date-fns";
import { href } from "react-router-dom";
import {
  ChatPillButton,
  getChatCategoryColor,
  isChatCategory,
  type ChatCategoryColor,
} from "@/services/chat";
import { HOME_TABS, homeTabPath, ROUTES } from "@/shared/model/routes";
import { Text } from "@/shared/ui/kit";
import { useChatFolderSessions } from "../model/use-chat-folder-sessions";
import { ChatItemCard } from "../ui/chat-item-card";

const gridClasses =
  "w-full grid grid-cols-2 md:grid-cols-3 justify-start gap-4 md:gap-6";

export function ChatFolderContent({
  title,
  children,
}: {
  /** Folder title for the "New chat in …" tile. Omit to hide the tile (search view). */
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[672px] flex-col items-center gap-8 overflow-y-auto no-scrollbar">
      <div className={gridClasses}>
        {/* Static "New chat" tile renders immediately; sessions arrive via children. */}
        {title && (
          <ChatItemCard
            to={homeTabPath(HOME_TABS.CHAT)}
            title={`New chat in ${title}`}
            className="w-full"
          />
        )}

        {children}
      </div>
    </div>
  );
}

export function ChatFolderContentCells({
  directoryId,
  color,
  q,
  initialLimit,
  createdAfter,
}: {
  /** Directory id used to filter sessions. Omit for a global cross-category search. */
  directoryId?: string;
  /** Forces a single color for every card (folder view). When omitted, each card
   * derives its color from its own category (global search view). */
  color?: ChatCategoryColor;
  /** Free-text search applied via the `q` query param. */
  q?: string;
  /** First-page size (folder page uses 8 to fit the "New chat" tile; defaults to 9). */
  initialLimit?: number;
  /** ISO-8601 timestamp applied via the `created_after` query param (date filter). */
  createdAfter?: string;
}) {
  const { sessions, hasMore, isLoadingMore, loadMore } = useChatFolderSessions(
    directoryId,
    q,
    initialLimit,
    createdAfter,
  );

  const resolveColor = (category?: string | null): ChatCategoryColor => {
    if (color) return color;
    return category && isChatCategory(category) ? getChatCategoryColor(category) : "uncategorized";
  };

  const searchQuery = q?.trim();
  const isFiltering = Boolean(searchQuery) || Boolean(createdAfter);

  if (isFiltering && sessions.length === 0) {
    return (
      <Text
        variant="label"
        color="secondary"
        className="col-span-2 py-8 text-center md:col-span-3"
      >
        {searchQuery ? `No chats found for “${searchQuery}”` : "No chats found"}
      </Text>
    );
  }

  return (
    <>
      {sessions.map((session) => (
        <ChatItemCard
          key={session.session_id}
          to={href(ROUTES.CHAT, { chat_id: session.session_id })}
          title={session.title}
          color={resolveColor(session.category)}
          date={format(new Date(session.updated_at), "MMMM d")}
          className="w-full"
        />
      ))}

      {hasMore && (
        <div className="col-span-2 flex justify-center md:col-span-3">
          <ChatPillButton
            shape="pill-text"
            className="w-[95px]"
            isLoading={isLoadingMore}
            onClick={loadMore}
            lottieClassName="size-5"
          >
            <Text variant="label" color="primary">
              Load more
            </Text>
          </ChatPillButton>
        </div>
      )}
    </>
  );
}
