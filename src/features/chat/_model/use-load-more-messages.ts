import { chatQueryOptions } from "@/services/chat";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useChatContext } from "./store/chat-store";
import { flushSync } from "react-dom";

export const useLoadMoreMessages = (
  chatId: string,
  initialNextCursor: string | null | undefined,
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const queryClient = useQueryClient();
  // Stable action references — do not cause re-renders on store updates
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
      const data = await queryClient.fetchQuery(
        chatQueryOptions.messages(chatId, cursor),
      );

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

  // Register scroll listener — re-run only when cursor changes (hasMore changes)
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
