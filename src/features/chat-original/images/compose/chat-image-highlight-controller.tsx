import Lottie from "lottie-react";

import {
  ChatComposerAttachButton,
  ChatComposerSendButton,
  ChatComposerStopButton,
  ChatInlineComposer,
} from "../../_ui-original/chat-input-composer";
import { ChatPillButton } from "../../_ui-original/chat-pill-button";
import { DownloadIconThin } from "@/shared/assets/icons/outlined/DownloadThin";
import loadingThreeDotAnimation from "@/shared/assets/lottie/loading-three-dot.json";
import { downloadImage } from "@/shared/lib/js";
import {
  ImagesViewerLightboxFloating,
  ImagesViewerLightboxFooter,
  ImagesViewerLightboxImageOverlay,
  ImagesViewerLightboxTopActions,
} from "@/shared/ui/kit/images-viewer";

import {
  ChatAssistantClearSelectionButton,
  ChatAssistantHighlightIndicator,
} from "../../_ui/chat-highlight-buttons";
import { useHighlightImageSuggestions } from "../../suggestions/model/use-image-suggestions";
import type {
  ChatImageHighlightPayload,
  HighlightEditResult,
} from "../model/use-highlight-regenerate-image";
import {
  useImageHighlightEditor,
  type ChatImageEditCompletePayload,
} from "../model/use-image-highlight-editor";
import { ImageHighlightOverlay } from "../ui/image-highlight-overlay";

type ChatImageHighlightControllerProps = {
  onHighlightRegenerateImage?: (
    payload: ChatImageHighlightPayload,
  ) => Promise<HighlightEditResult | null>;
  onCancelHighlightRegenerateImage?: () => void;
  onEditComplete?: (payload: ChatImageEditCompletePayload) => void;
};

/**
 * Chat-specific extension for the shared images viewer. Wires the highlight
 * editor state (model) and suggestions (suggestions submodule) into the
 * lightbox slots via the compound API. Must be rendered as a child of
 * <ImagesViewer> or <ImagesViewerLightbox>.
 */
export function ChatImageHighlightController({
  onHighlightRegenerateImage,
  onCancelHighlightRegenerateImage,
  onEditComplete,
}: ChatImageHighlightControllerProps) {
  const {
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
  } = useImageHighlightEditor({
    onHighlightRegenerateImage,
    onCancelHighlightRegenerateImage,
    onEditComplete,
  });

  const { suggestions, isFetching: isFetchingSuggestions } =
    useHighlightImageSuggestions({
      attachmentId: currentImage?.attachmentId,
      bbox: selectionBbox,
    });

  return (
    <>
      {/* Download is always available; highlight toggle only when supported. */}
      <ImagesViewerLightboxTopActions>
        {isHighlightEnabled && (
          <>
            <ChatAssistantHighlightIndicator
              active={isHighlightIndicatorActive}
              onClick={handleToggleHighlight}
              disabled={isSubmitting}
            />
            {hasActiveHighlight && (
              <ChatAssistantClearSelectionButton
                onClick={handleClearSelection}
                disabled={isSubmitting}
              />
            )}
          </>
        )}
        <ChatPillButton
          onClick={() =>
            void downloadImage(
              currentImage.src,
              currentImage.alt || `image-${currentIndex + 1}`,
            )
          }
          aria-label="Download image"
          title="Download"
          shape="icon-sm"
        >
          <DownloadIconThin svgClasses="size-4" />
        </ChatPillButton>
      </ImagesViewerLightboxTopActions>

      {isHighlightEnabled && (
        <ImagesViewerLightboxImageOverlay>
          <ImageHighlightOverlay
            selectionBbox={selectionBbox}
            selectionPreviewBbox={selectionPreviewBbox}
            showSuggestions={
              hasActiveHighlight && !isSubmitting && !isSelecting
            }
            suggestions={suggestions}
            isLoadingSuggestions={isFetchingSuggestions}
            onSuggestionClick={(suggestion) => submitPrompt(suggestion.text)}
            onAskSomethingElse={handleAskSomethingElse}
          />
        </ImagesViewerLightboxImageOverlay>
      )}

      {isHighlightEnabled && (
        <ImagesViewerLightboxFooter>
          <ChatInlineComposer
            ref={promptInputRef}
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSubmitInline && !isSubmitting) void handleSubmit();
              }
            }}
            disabled={isSubmitting}
            highlighted={isInputFlashing}
            leftActions={<ChatComposerAttachButton />}
            rightActions={
              <>
                {isSubmitting ? (
                  <ChatComposerStopButton
                    onClick={handleStop}
                    aria-label="Stop image regenerate"
                  />
                ) : (
                  <ChatComposerSendButton
                    active={canSubmitInline}
                    onClick={() => void handleSubmit()}
                    disabled={!canSubmitInline}
                    aria-label="Send edit request"
                  />
                )}
              </>
            }
          />
        </ImagesViewerLightboxFooter>
      )}

      {isSubmitting && (
        <ImagesViewerLightboxFloating>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Lottie
              className="size-20"
              animationData={loadingThreeDotAnimation}
              loop={true}
            />
          </div>
        </ImagesViewerLightboxFloating>
      )}
    </>
  );
}
