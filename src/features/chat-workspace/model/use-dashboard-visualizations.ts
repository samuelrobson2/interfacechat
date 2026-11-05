import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { chatQueryOptions } from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";

// Sized for a 3-per-row grid: 8 cards + the New visualization tile fill three
// rows, each "Load more" appends another three rows.
const INITIAL_LIMIT = 8;
const LOAD_MORE_LIMIT = 9;

export function useDashboardVisualizations() {
  const queryClient = useQueryClient();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const initialQueryOptions = chatQueryOptions.chartSessions({
    limit: INITIAL_LIMIT,
  });
  const { data } = useSuspenseQuery(initialQueryOptions);

  const loadMore = async () => {
    if (!data.next_cursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const page = await queryClient.fetchQuery(
        chatQueryOptions.chartSessions({
          cursor: data.next_cursor,
          limit: LOAD_MORE_LIMIT,
        }),
      );

      // Pages are appended into the first-page entry, so the grid keeps showing
      // everything loaded so far instead of swapping to the latest page.
      queryClient.setQueryData<ApiSchemas["ChartSessionsListDto"]>(
        initialQueryOptions.queryKey,
        (prev) =>
          prev
            ? {
                ...prev,
                sessions: [...prev.sessions, ...page.sessions],
                next_cursor: page.next_cursor,
              }
            : prev,
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    visualizations: data.sessions,
    hasMore: Boolean(data.next_cursor),
    isLoadingMore,
    loadMore,
  };
}
