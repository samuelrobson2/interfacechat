import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

import { isMobileViewport } from "@/shared/lib/react/use-mobile";
import { userMessageSentEvent } from "../lib/chat-scroll-events";

const TOP_MESSAGE_OFFSET_DESKTOP = 75;
const TOP_MESSAGE_OFFSET_MOBILE = 88;
const getTopMessageOffset = () =>
  isMobileViewport() ? TOP_MESSAGE_OFFSET_MOBILE : TOP_MESSAGE_OFFSET_DESKTOP;

const getLastUserMessage = (content: HTMLDivElement, messageId?: string) => {
  if (messageId)
    return content.querySelector<HTMLElement>(
      `[data-message-id="${messageId}"]`,
    );

  const userMsgs = content.querySelectorAll<HTMLElement>('[data-role="user"]');
  return userMsgs[userMsgs.length - 1];
};

const calcExtraPadding = (
  scroll: HTMLDivElement,
  content: HTMLDivElement,
  inputLayoutHeight: number,
  messageId?: string,
) => {
  const lastUserMsg = getLastUserMessage(content, messageId);
  if (!lastUserMsg) return 0;

  const contentHeight = content.offsetHeight;
  const userMsgOffset = lastUserMsg.offsetTop;
  const viewport = scroll.clientHeight;
  const paddingTop =
    parseFloat(window.getComputedStyle(scroll).paddingTop) || 0;

  //   max scrollTop = scrollHeight - viewport
  //                 = paddingTop + contentHeight + paddingBottom - viewport
  //   target        = userMsgOffset - TOP_MESSAGE_OFFSET
  // => paddingBottom = userMsgOffset + viewport - contentHeight
  //                    - paddingTop - TOP_MESSAGE_OFFSET
  // The caller adds inputLayoutHeight back, so subtract it here.
  return Math.max(
    0,
    userMsgOffset +
      viewport -
      contentHeight -
      paddingTop -
      getTopMessageOffset() -
      inputLayoutHeight,
  );
};

export const useChatScroll = () => {
  const [inputLayoutHeight, setInputLayoutHeight] = useState(0);
  const [extraBottomPadding, setExtraBottomPadding] = useState(0);

  const conversationRef = useRef<HTMLDivElement>(null);
  const conversationScrollRef = useRef<HTMLDivElement>(null);
  const isInitialScroll = useRef(true);
  const inputLayoutHeightRef = useRef(0);
  const extraBottomPaddingRef = useRef(0);
  const inputLayoutObserverRef = useRef<ResizeObserver | null>(null);

  // Effect-event wrapper — resolves refs and delegates to the pure function.
  // Safe to call from effects without adding to dependency arrays.
  const calcExtraPaddingEvent = useEffectEvent((messageId?: string) => {
    const scroll = conversationScrollRef.current;
    const content = conversationRef.current;
    if (!scroll || !content) return 0;
    return calcExtraPadding(
      scroll,
      content,
      inputLayoutHeightRef.current,
      messageId,
    );
  });

  // Callback ref for input layout — re-observes each time element mounts
  const inputLayoutRef = useCallback((el: HTMLDivElement | null) => {
    if (inputLayoutObserverRef.current) {
      inputLayoutObserverRef.current.disconnect();
      inputLayoutObserverRef.current = null;
    }

    if (!el) return;

    const observer = new ResizeObserver(() => {
      const scroll = conversationScrollRef.current;
      const content = conversationRef.current;
      const h = el.getBoundingClientRect().height;
      if (h === inputLayoutHeightRef.current) return;
      inputLayoutHeightRef.current = h;
      setInputLayoutHeight(h);

      // Composer height changed (e.g. generation ended → suggestions row).
      // Re-derive extra padding so the pinned user message stays in place.
      if (extraBottomPaddingRef.current === 0 || !scroll || !content) return;
      const newPadding = calcExtraPadding(scroll, content, h);
      if (newPadding === extraBottomPaddingRef.current) return;
      extraBottomPaddingRef.current = newPadding;
      setExtraBottomPadding(newPadding);
    });
    observer.observe(el);
    inputLayoutObserverRef.current = observer;
  }, []);

  // Initial scroll — reacts to first height calculation
  useEffect(() => {
    if (!isInitialScroll.current || inputLayoutHeight === 0) return;

    isInitialScroll.current = false;
    const scroll = conversationScrollRef.current;
    if (scroll)
      scroll.scrollTo({ top: scroll.scrollHeight, behavior: "instant" });
  }, [inputLayoutHeight]);

  // Scroll to user message + set initial padding after send
  useEffect(() => {
    return userMessageSentEvent.subscribe((messageId) => {
      // Prevent initial-scroll-to-bottom from overriding user-message scroll
      isInitialScroll.current = false;

      requestAnimationFrame(() => {
        const extra = calcExtraPaddingEvent(messageId);
        extraBottomPaddingRef.current = extra;
        flushSync(() => setExtraBottomPadding(extra));

        const scroll = conversationScrollRef.current;
        const content = conversationRef.current;
        if (!scroll || !content) return;

        const userMsg = content.querySelector<HTMLElement>(
          `[data-message-id="${messageId}"]`,
        );
        if (userMsg) {
          scroll.scrollTo({
            top: Math.max(0, userMsg.offsetTop - getTopMessageOffset()),
            behavior: "smooth",
          });
        }
      });
    });
  }, []);

  // ResizeObserver on conversation content — recalculates padding as agent message grows
  useEffect(() => {
    const content = conversationRef.current;
    if (!content) return;

    const observer = new ResizeObserver(() => {
      if (extraBottomPaddingRef.current === 0) return;

      const newPadding = calcExtraPaddingEvent();
      if (newPadding === extraBottomPaddingRef.current) return;

      extraBottomPaddingRef.current = newPadding;
      setExtraBottomPadding(newPadding);
    });
    observer.observe(content);

    return () => observer.disconnect();
  }, []);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useEffect(() => {
    const scrollContainer = conversationScrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const distanceToBottom =
        scrollContainer.scrollHeight -
        scrollContainer.scrollTop -
        scrollContainer.clientHeight;
      setShowScrollToBottom(distanceToBottom > 120);
    };

    handleScroll();
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToBottom = useCallback(() => {
    const scrollContainer = conversationScrollRef.current;
    if (!scrollContainer) return;
    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  return {
    inputLayoutRef,
    conversationRef,
    conversationScrollRef,
    inputLayoutHeight,
    totalBottomPadding: inputLayoutHeight + extraBottomPadding,
    showScrollToBottom,
    handleScrollToBottom,
  };
};
