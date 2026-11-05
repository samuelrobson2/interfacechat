import { useEffect, useEffectEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { ApiSchemas } from "@/shared/api/schema";
import { useChatContext } from "./chat-store";

export const useLoadMoreMessages = (
  fetchPage: (cursor: string) => Promise<ApiSchemas["ChatMessagesListDto"]>,
  initialNextCursor: string | null | undefined,
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const prependMessages = useChatContext((state) => state.prependMessages);
  const setIsLoadingMore = useChatContext((state) => state.setIsLoadingMore);

  const [cursor, setCursor] = useState(initialNextCursor ?? null);
  const isLoadingRef = useRef(false);

  const loadMore = useEffectEvent(async () => {
    if (!cursor || isLoadingRef.current) return;
    isLoadingRef.current = true;

    const container = scrollContainerRef.current;
    const savedScrollHeight = container?.scrollHeight ?? 0;

    setIsLoadingMore(true);

    try {
      const data = await fetchPage(cursor);

      flushSync(() => {
        prependMessages(data.messages);
      });

      if (container && savedScrollHeight > 0) {
        container.scrollTop += container.scrollHeight - savedScrollHeight;
      }

      setCursor(data.next_cursor);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !cursor) return;

    const handleScroll = () => {
      if (container.scrollTop < 100) loadMore();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => container.removeEventListener("scroll", handleScroll);
  }, [cursor, scrollContainerRef]);

  return { hasMore: !!cursor };
};
