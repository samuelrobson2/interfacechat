import { Suspense, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ChatGrayFrame } from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { ChatComposerLayout, ChatInputLayout } from "../_ui/chat-layout";
import {
  ChatBubbleSuggestions,
  ChatBubbleSuggestionsSkeleton,
} from "../suggestions/compose/chat-bubble-suggestions";
import { ChatInput } from "../input/chat-input";

export function ChatInputComposer({
  inputLayoutRef,
  latestAssistantMessage,
  shouldRenderSuggestions,
}: {
  inputLayoutRef: (element: HTMLDivElement | null) => void;
  latestAssistantMessage: ApiSchemas["ChatMessageDto"] | undefined;
  shouldRenderSuggestions: boolean;
}) {
  const [isWriting, setIsWriting] = useState(false);
  // Track the message whose suggestions failed to load so we can hide them and
  // fall back to the expanded chat input instead of surfacing an error. A new
  // anchor message automatically re-enables suggestions.
  const [failedSuggestionsMessageId, setFailedSuggestionsMessageId] = useState<
    string | null
  >(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const canRenderSuggestions =
    shouldRenderSuggestions &&
    failedSuggestionsMessageId !== latestAssistantMessage?.message_id;

  const effectiveIsWriting = isWriting || !canRenderSuggestions;
  const mode: "row" | "column" | "input" = effectiveIsWriting
    ? canRenderSuggestions
      ? "column"
      : "input"
    : "row";

  const suggestionsVariant = mode === "column" ? "column" : "row";

  // Collapse the expanded composer back into the compact pill when the user
  // clicks anywhere outside the input. Only active when suggestions exist —
  // without them there is no compact state to fall back to.
  useEffect(() => {
    if (!isWriting || !canRenderSuggestions) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && inputContainerRef.current?.contains(target)) return;
      setIsWriting(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isWriting, canRenderSuggestions]);

  return (
    <ChatComposerLayout ref={inputLayoutRef}>
      <div
        className={cn(
          "mx-auto flex gap-4",
          mode === "input" ? "w-[660px]" : "w-[888px]",
          mode === "column" ? "items-end" : "items-stretch",
        )}
      >
        {canRenderSuggestions && latestAssistantMessage && (
          <ErrorBoundary
            resetKeys={[latestAssistantMessage.message_id]}
            onError={() =>
              setFailedSuggestionsMessageId(latestAssistantMessage.message_id)
            }
            fallbackRender={() => null}
          >
            <Suspense
              fallback={
                <ChatBubbleSuggestionsSkeleton variant={suggestionsVariant} />
              }
            >
              <ChatBubbleSuggestions
                anchorMessageId={latestAssistantMessage.message_id}
                variant={suggestionsVariant}
              />
            </Suspense>
          </ErrorBoundary>
        )}
        {effectiveIsWriting ? (
          <ChatInputLayout
            ref={inputContainerRef}
            className={cn(
              "pointer-events-auto",
              mode === "column" && "w-[660px]",
            )}
          >
            <ChatInput onClose={() => setIsWriting(false)} />
          </ChatInputLayout>
        ) : (
          <ChatGrayFrame
            asChild
            frameThickness={4}
            className="pointer-events-auto min-h-[100px] w-[204px] shrink-0"
          >
            <button
              type="button"
              onClick={() => {
                setIsWriting(true);
                requestAnimationFrame(() => {
                  document.querySelector("textarea")?.focus();
                });
              }}
              className="flex cursor-pointer flex-col justify-between p-4 text-left"
            >
              <Text className="relative z-10" variant="label" color="secondary">
                How can we help you?
              </Text>
              <div className="relative z-10 flex justify-end">
                <PlusSmallIcon svgClasses="size-3" />
              </div>
            </button>
          </ChatGrayFrame>
        )}
      </div>
    </ChatComposerLayout>
  );
}
