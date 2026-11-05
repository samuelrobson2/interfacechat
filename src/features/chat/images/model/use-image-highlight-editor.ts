import * as React from "react";

import { useImageSelection } from "@/shared/lib/react/use-image-selection";
import { useImagesViewerLightbox } from "@/shared/ui/kit/images-viewer";

import type {
  ChatImageHighlightPayload,
  HighlightEditResult,
} from "./use-highlight-regenerate-image";

// Reported when a highlight edit finishes, so the consumer can show the
// original/edited comparison popup.
export type ChatImageEditCompletePayload = {
  result: HighlightEditResult;
  title: string;
  originalSrc: string;
  originalAlt?: string;
  index: number;
};

type UseImageHighlightEditorParams = {
  onHighlightRegenerateImage?: (
    payload: ChatImageHighlightPayload,
  ) => Promise<HighlightEditResult | null>;
  onCancelHighlightRegenerateImage?: () => void;
  onEditComplete?: (payload: ChatImageEditCompletePayload) => void;
};

/**
 * Owns the chat-specific highlight state (selection, prompt, submission) for
 * the images viewer lightbox. Display and cross-submodule wiring (suggestions)
 * stay in the compose layer; this hook only manages local interaction state.
 */
export const useImageHighlightEditor = ({
  onHighlightRegenerateImage,
  onCancelHighlightRegenerateImage,
  onEditComplete,
}: UseImageHighlightEditorParams) => {
  const { imageRef, currentImage, currentIndex, registerImageMouseHandlers } =
    useImagesViewerLightbox();

  const isHighlightEnabled = Boolean(
    onHighlightRegenerateImage && currentImage?.attachmentId,
  );

  const {
    selectionBbox,
    selectionPreviewBbox,
    isSelecting,
    beginSelection,
    updateSelection,
    commitSelection,
    reset: resetSelection,
  } = useImageSelection({
    enabled: isHighlightEnabled,
    externalImageRef: imageRef,
  });

  const [promptValue, setPromptValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isInputFlashing, setIsInputFlashing] = React.useState(false);
  const [isHighlightModeActive, setIsHighlightModeActive] =
    React.useState(false);
  const promptInputRef = React.useRef<HTMLInputElement | null>(null);
  const flashTimeoutRef = React.useRef<number | null>(null);

  const hasActiveHighlight = Boolean(selectionBbox);
  const isHighlightIndicatorActive = hasActiveHighlight || isHighlightModeActive;

  React.useEffect(() => {
    if (!isHighlightEnabled || isSubmitting) {
      registerImageMouseHandlers(null);
      return;
    }
    registerImageMouseHandlers({
      onMouseDown: beginSelection,
      onMouseMove: updateSelection,
      onMouseUp: commitSelection,
    });
    return () => registerImageMouseHandlers(null);
  }, [
    isHighlightEnabled,
    isSubmitting,
    beginSelection,
    updateSelection,
    commitSelection,
    registerImageMouseHandlers,
  ]);

  // Reset chat-specific state whenever the visible image changes.
  React.useEffect(() => {
    resetSelection();
    setPromptValue("");
    setIsSubmitting(false);
    setIsHighlightModeActive(false);
    // resetSelection is stable (useCallback in hook), but listing it satisfies the linter.
  }, [currentIndex, resetSelection]);

  React.useEffect(() => {
    if (!hasActiveHighlight || isSubmitting) return;
    const id = requestAnimationFrame(() => {
      promptInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [hasActiveHighlight, isSubmitting]);

  const hasInlinePrompt = promptValue.trim().length > 0;
  const canSubmitInline = hasInlinePrompt && !isSubmitting;

  const submitPrompt = async (rawPrompt: string) => {
    if (!onHighlightRegenerateImage) return;
    if (!currentImage?.attachmentId) return;
    if (isSubmitting) return;
    const trimmedPrompt = rawPrompt.trim();
    if (!trimmedPrompt) return;

    // Capture the original image now — it disappears from the store once the
    // edit is committed, so the comparison popup needs its own snapshot.
    const originalSrc = currentImage.src;
    const originalAlt = currentImage.alt;
    const title = currentImage.alt || `Image ${currentIndex + 1}`;

    setIsSubmitting(true);
    try {
      const result = await onHighlightRegenerateImage({
        attachmentId: currentImage.attachmentId,
        bbox: selectionBbox ?? undefined,
        action: "prompt",
        prompt: trimmedPrompt,
      });
      setIsSubmitting(false);
      if (!result) return;
      resetSelection();
      setPromptValue("");
      // Hand off to the consumer, which closes the lightbox and shows the
      // original/edited comparison popup. The edit is committed only after
      // the user confirms their choice there.
      onEditComplete?.({
        result,
        title,
        originalSrc,
        originalAlt,
        index: currentIndex,
      });
    } catch {
      setIsSubmitting(false);
    }
  };

  // Briefly highlight the input so it's visually obvious that focus moved
  // there — without this flash, the empty input gives no feedback.
  const handleAskSomethingElse = () => {
    requestAnimationFrame(() => {
      promptInputRef.current?.focus();
    });
    setIsInputFlashing(true);
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
    }
    flashTimeoutRef.current = window.setTimeout(() => {
      setIsInputFlashing(false);
      flashTimeoutRef.current = null;
    }, 700);
  };

  const handleSubmit = () => submitPrompt(promptValue);

  const handleStop = () => {
    onCancelHighlightRegenerateImage?.();
    setIsSubmitting(false);
  };

  const handleClearSelection = () => {
    resetSelection();
    setPromptValue("");
  };

  const handleToggleHighlight = () => {
    if (isHighlightIndicatorActive) {
      setIsHighlightModeActive(false);
      handleClearSelection();
      return;
    }

    setIsHighlightModeActive(true);
  };

  return {
    currentImage,
    currentIndex,
    isHighlightEnabled,
    hasActiveHighlight,
    isHighlightIndicatorActive,
    selectionBbox,
    selectionPreviewBbox,
    isSelecting,
    isSubmitting,
    isInputFlashing,
    promptValue,
    setPromptValue,
    canSubmitInline,
    promptInputRef,
    submitPrompt,
    handleSubmit,
    handleStop,
    handleClearSelection,
    handleToggleHighlight,
    handleAskSomethingElse,
  };
};
