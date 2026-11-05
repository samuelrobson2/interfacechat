import { useMemo, useState } from "react";
import { href } from "react-router-dom";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  chatQueryOptions,
  getChatCategoryColor,
  getChatCategoryIcon,
  getChatCategoryLabel,
  isChatCategory,
  type ChatCategoryColor,
  FAVORITES_FOLDER_ID,
  UNCATEGORIZED_FOLDER_ID,
} from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { useDashboardFiltersStore } from "./dashboard-filters-store";

type ChatDirectoryRow = ApiSchemas["ChatDirectoryRowDto"];
type ChatDirectoriesList = ApiSchemas["ChatDirectoriesResponseDto"];

// Initial page shows 7 folders; each "Load more" appends 8 more.
const INITIAL_LIMIT = 7;
const LOAD_MORE_LIMIT = 8;

export type DashboardFolderBucket = {
  key: string;
  title: string;
  color: ChatCategoryColor;
  chatsCount: number;
  to: string;
  icon?: string;
};

// Maps directory rows from GET /chat/directories into dashboard folder cards.
//   - domain folders are resolved by their `slug` against the category map
//   - favorites/uncategorized are virtual directories resolved by their fixed `id`
//   - empty favorites/uncategorized directories are hidden
function mapDirectoriesToBuckets(
  rows: ChatDirectoryRow[],
): DashboardFolderBucket[] {
  const buckets: DashboardFolderBucket[] = [];

  for (const row of rows) {
    const isSpecial =
      row.id === FAVORITES_FOLDER_ID || row.id === UNCATEGORIZED_FOLDER_ID;

    // Hide folders when they currently hold no chats.
    if (row.session_count <= 0) continue;

    // Routing key: special folders use their id, domain folders use slug.
    const routeKey = isSpecial ? row.id : (row.slug ?? row.id);
    const category = isChatCategory(routeKey) ? routeKey : null;

    buckets.push({
      key: row.id,
      title: category ? getChatCategoryLabel(category) : row.title,
      color: category ? getChatCategoryColor(category) : "uncategorized",
      chatsCount: row.session_count,
      to: href(ROUTES.CHAT_FOLDER, { folder_id: routeKey }),
      icon: category ? getChatCategoryIcon(category) : undefined,
    });
  }

  return buckets;
}

// Loads dashboard folders from the directories API with cursor pagination,
// keeping a single growing cache entry as more pages are appended. Filters are
// folded into the query params so changing them starts a fresh paginated list.
export function useChatDashboardFolders() {
  const queryClient = useQueryClient();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const domainGroup = useDashboardFiltersStore(
    (state) => state.filters.domainGroup,
  );

  const initialQueryOptions = chatQueryOptions.directories({
    limit: INITIAL_LIMIT,
    domain_group: domainGroup,
  });
  const { data } = useSuspenseQuery(initialQueryOptions);

  const buckets = useMemo(
    () => mapDirectoriesToBuckets(data.directories ?? []),
    [data],
  );

  const loadMore = async () => {
    if (!data.next_cursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const page = await queryClient.fetchQuery(
        chatQueryOptions.directories({
          cursor: data.next_cursor,
          limit: LOAD_MORE_LIMIT,
          domain_group: domainGroup,
        }),
      );

      queryClient.setQueryData<ChatDirectoriesList>(
        initialQueryOptions.queryKey,
        (prev) =>
          prev
            ? {
              ...prev,
              directories: [
                ...prev.directories,
                ...(page.directories ?? []),
              ],
              next_cursor: page.next_cursor,
            }
            : prev,
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    buckets,
    hasMore: data.next_cursor !== null,
    isLoadingMore,
    loadMore,
  };
}
