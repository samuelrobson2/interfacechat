import {
  chatQueryOptions,
  type ChatSessionsQueryParams,
} from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

type ChatSession = ApiSchemas["ChatSessionDto"];

const INITIAL_LIMIT = 9;
const LOAD_MORE_LIMIT = 9;

export type UseChatFolderSessionsResult = {
  sessions: ChatSession[];
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
};

export function useChatFolderSessions(
  directoryId?: string,
  q?: string,
  initialLimit: number = INITIAL_LIMIT,
  createdAfter?: string,
): UseChatFolderSessionsResult {
  const queryClient = useQueryClient();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const search = q?.trim() || undefined;

  const buildParams = (
    cursor: string | undefined,
    limit: number,
  ): ChatSessionsQueryParams => ({
    directory_id: directoryId || undefined,
    q: search,
    created_after: createdAfter,
    cursor,
    limit,
  });

  const initialQueryOptions = chatQueryOptions.sessions(
    buildParams(undefined, initialLimit),
  );
  const { data } = useSuspenseQuery(initialQueryOptions);

  const sessions = data.sessions ?? [];

  const loadMore = async () => {
    if (!data.next_cursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const page = await queryClient.fetchQuery(
        chatQueryOptions.sessions(
          buildParams(data.next_cursor, LOAD_MORE_LIMIT),
        ),
      );

      queryClient.setQueryData<ApiSchemas["ChatSessionsListDto"]>(
        initialQueryOptions.queryKey,
        (prev) =>
          prev
            ? {
                ...prev,
                sessions: [...prev.sessions, ...(page.sessions ?? [])],
                next_cursor: page.next_cursor,
              }
            : prev,
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    sessions,
    hasMore: data.next_cursor !== null,
    isLoadingMore,
    loadMore,
  };
}
