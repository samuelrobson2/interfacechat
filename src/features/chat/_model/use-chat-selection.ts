import { useEffect, useEffectEvent } from "react";
import { useParams } from "react-router-dom";
import type { PathParams, ROUTES } from "@/shared/model/routes";
import { removeSuggestionCache } from "../suggestions/lib/suggestions-cache";
import {
  clearCustomHighlight,
  expandRangeToWordBoundaries,
  paintCustomHighlight,
  resolveHighlightOffsetsFromRange,
  setNativeSelectionHidden,
} from "../_lib/highlight-utils";
import { useChatContext } from "./store/chat-store";
import { useLastAssistantMessageId } from "./use-last-message";

// === DOM selectors / helpers ===

// Reserved vertical space below the selection rect for follow-up suggestions
// (≈4 buttons × 48px + composer + paddings). When the viewport has less than
// this below the selection, suggestions flip above it.
const SUGGESTIONS_FLIP_THRESHOLD_PX = 400;

const ANSWER_SELECTOR = '[data-slot^="chat-answer-"]';
const CHAT_AREA_SELECTOR = '[data-slot="chat-area"]';

// Elements whose click should preserve the selection (buttons, links, inputs,
// follow-up textarea, etc.).
const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, label, [role="button"], [role="link"], [role="menuitem"], [contenteditable=""], [contenteditable="true"]';

const closestMatch = (target: EventTarget | null, selector: string) =>
  target instanceof Element ? target.closest(selector) : null;

const isInChatArea = (target: EventTarget | null) =>
  !!closestMatch(target, CHAT_AREA_SELECTOR);

const isInteractive = (target: EventTarget | null) =>
  !!closestMatch(target, INTERACTIVE_SELECTOR);

// Editable fields whose internal text selection (e.g. Ctrl+A in the composer)
// must never disturb the committed chat highlight.
const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

const isEditableTarget = (target: EventTarget | null) =>
  !!closestMatch(target, EDITABLE_SELECTOR);

const computeSuggestionPlacement = (
  selectionBottom: number,
): "above" | "below" =>
  window.innerHeight - selectionBottom < SUGGESTIONS_FLIP_THRESHOLD_PX
    ? "above"
    : "below";

const computeSuggestionSide = (
  selectionRect: DOMRect,
  answerRect: DOMRect,
): "left" | "right" =>
  selectionRect.left + selectionRect.width / 2 <
  answerRect.left + answerRect.width / 2
    ? "left"
    : "right";

// === Utils hook: exposed clearSelection / selectCodeBlock ===

export const useChatSelectionUtils = () => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  const setSelectedText = useChatContext((state) => state.setSelectedText);
  const setHighlightRange = useChatContext((state) => state.setHighlightRange);
  const setHighlightMessageId = useChatContext(
    (state) => state.setHighlightMessageId,
  );
  const setHighlightSuggestionSide = useChatContext(
    (state) => state.setHighlightSuggestionSide,
  );
  const setHighlightSuggestionPlacement = useChatContext(
    (state) => state.setHighlightSuggestionPlacement,
  );
  const setHighlightSelectionOffsetY = useChatContext(
    (state) => state.setHighlightSelectionOffsetY,
  );
  const closeSourcesPopup = useChatContext((state) => state.closeSourcesPopup);

  const clearSelection = (options?: { keepSuggestionCache?: boolean }) => {
    setSelectedText(undefined);
    setHighlightRange(undefined);
    setHighlightMessageId(undefined);
    setHighlightSuggestionSide("right");
    setHighlightSuggestionPlacement("below");
    setHighlightSelectionOffsetY(undefined);
    window.getSelection()?.removeAllRanges();
    clearCustomHighlight();
    setNativeSelectionHidden(false);
    if (!options?.keepSuggestionCache) removeSuggestionCache(chat_id);
  };

  const selectCodeBlock = (
    el: HTMLElement,
    code: string,
    start: number,
    end: number,
  ) => {
    if (Number.isNaN(start) || Number.isNaN(end) || start >= end) return;

    const range = document.createRange();
    range.selectNodeContents(el);
    paintCustomHighlight(range);

    removeSuggestionCache(chat_id);
    setSelectedText(code);
    setHighlightRange({ start, end });

    const rect = el.getBoundingClientRect();
    const answerEl = el.closest<HTMLElement>(ANSWER_SELECTOR);
    const answerRect = answerEl?.getBoundingClientRect();
    if (answerRect) {
      setHighlightSuggestionSide(computeSuggestionSide(rect, answerRect));
      setHighlightSelectionOffsetY(rect.top - answerRect.top);
    }
    setHighlightSuggestionPlacement(computeSuggestionPlacement(rect.bottom));
    closeSourcesPopup();
  };

  return { clearSelection, selectCodeBlock };
};

// === Main hook: subscribes to document mouse events ===

export const useChatSelection = () => {
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT]>();
  // Subscribed only so the hook re-renders when the values change —
  // `useEffectEvent` closures below pick up the fresh values on each call.
  const lastAssistantId = useLastAssistantMessageId();
  const hasSelection = useChatContext((state) => !!state.selectedText);
  const isStreaming = useChatContext(
    (state) => state.isGenerating || state.isRegenerating,
  );
  const setSelectedText = useChatContext((state) => state.setSelectedText);
  const setHighlightMessageId = useChatContext(
    (state) => state.setHighlightMessageId,
  );
  const setHighlightRange = useChatContext((state) => state.setHighlightRange);
  const setHighlightSuggestionSide = useChatContext(
    (state) => state.setHighlightSuggestionSide,
  );
  const setHighlightSuggestionPlacement = useChatContext(
    (state) => state.setHighlightSuggestionPlacement,
  );
  const setHighlightSelectionOffsetY = useChatContext(
    (state) => state.setHighlightSelectionOffsetY,
  );
  const closeSourcesPopup = useChatContext((state) => state.closeSourcesPopup);

  const { clearSelection } = useChatSelectionUtils();

  const isSelectionBlocked = useEffectEvent(() => isStreaming);

  const commitDragSelection = useEffectEvent(() => {
    // Guard against committing a highlight while the answer is still streaming.
    if (isStreaming) return false;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.toString().trim()) return false;
    if (!lastAssistantId) return false;

    const answerEl = document.querySelector<HTMLElement>(
      `[data-slot="chat-answer-${lastAssistantId}"]`,
    );
    if (!answerEl) return false;

    const range = sel.getRangeAt(0);
    if (!range.intersectsNode(answerEl)) return false;

    // Clip range endpoints that fell outside the answer.
    if (!answerEl.contains(range.startContainer)) {
      range.setStart(answerEl, 0);
    }
    if (!answerEl.contains(range.endContainer)) {
      range.setEnd(answerEl, answerEl.childNodes.length);
    }

    // Snap selection boundaries to whole words so highlight never operates
    // on a partial word.
    expandRangeToWordBoundaries(range);

    const text = range.toString().trim();
    if (!text) return false;

    const cloned = range.cloneRange();
    // Keep the native DOM selection alive so the browser still offers "Copy"
    // in its context menu and Ctrl/Cmd+C works natively. When the CSS Highlight
    // Registry is available we hide the native selection paint (custom
    // highlight takes over the visual); otherwise the native selection stays
    // visible as a fallback.
    setNativeSelectionHidden(paintCustomHighlight(cloned));

    removeSuggestionCache(chat_id);

    setSelectedText(text);
    setHighlightMessageId(lastAssistantId);
    // Persist markdown offsets now — once focus moves to the chat input, the
    // live selection is lost and cannot be resolved at send time.
    setHighlightRange(resolveHighlightOffsetsFromRange(cloned, answerEl));

    const rects = cloned.getClientRects();
    const firstRect = rects[0] ?? cloned.getBoundingClientRect();
    const answerRect = answerEl.getBoundingClientRect();
    setHighlightSuggestionSide(computeSuggestionSide(firstRect, answerRect));
    setHighlightSuggestionPlacement(
      computeSuggestionPlacement(firstRect.bottom),
    );
    setHighlightSelectionOffsetY(firstRect.top - answerRect.top);
    // Highlight and sources popup are mutually exclusive.
    closeSourcesPopup();
    return true;
  });

  const dropPaintForNewDrag = useEffectEvent(() => {
    if (hasSelection) clearCustomHighlight();
    // Restore the native selection paint so the new live drag is visible.
    setNativeSelectionHidden(false);
  });

  const clearIfNeeded = useEffectEvent(() => {
    if (hasSelection) clearSelection();
  });

  useEffect(() => {
    let isDragging = false;
    // Tracks whether the current press was the primary (left) button.
    // `selectstart` carries no button info, so we read it from mousedown.
    let isPrimaryPress = false;

    const handleMouseDown = (e: MouseEvent) => {
      isPrimaryPress = e.button === 0;
    };

    const handleSelectStart = (e: Event) => {
      // Right/middle-button presses can fire selectstart too; ignoring them
      // keeps the committed highlight from being dropped on right-click.
      if (!isPrimaryPress) return;
      // Selecting text inside an input/textarea (e.g. Ctrl+A in the composer)
      // bubbles a selectstart here — it must not drop the chat highlight.
      if (isEditableTarget(e.target)) return;
      // Block starting a selection inside the chat area while the answer is
      // still streaming — wait for the full response before allowing highlight.
      if (isSelectionBlocked() && isInChatArea(e.target)) {
        e.preventDefault();
        return;
      }
      isDragging = true;
      dropPaintForNewDrag();
    };

    const handleNonDragClick = (target: EventTarget | null) => {
      if (!isInChatArea(target)) return;
      if (isInteractive(target)) return;
      clearIfNeeded();
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Right/middle clicks must preserve the highlight (e.g. to open the
      // native context menu over it), so never treat them as clearing clicks.
      if (e.button !== 0) return;

      const wasDragging = isDragging;
      isDragging = false;

      if (wasDragging) {
        if (!commitDragSelection()) clearIfNeeded();
        return;
      }

      handleNonDragClick(e.target);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
};
