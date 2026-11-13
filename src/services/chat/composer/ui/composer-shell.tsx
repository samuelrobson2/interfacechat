import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

import { useIsMobile } from "@/shared/lib/react/use-mobile";

import { ChatCreateCard } from "../../_ui/chat-create-card";
import { ChatInputLayout } from "../../_ui/chat-input-layout";
import { ChatComposerLayout } from "../../_ui/chat-layout";
import type { BubbleSuggestionsVariant } from "../../suggestions/ui/bubble-suggestions";
import {
  COMPOSER_BAR_WIDTH,
  COMPOSER_PRESS_SCALE,
  composerLayout,
} from "../model/composer-motion";
import { useComposerExpandStore } from "../model/use-composer-expand";
import { ComposerScrubber } from "./composer-scrubber";

export type ComposerInputSlotProps = {
  /** Present only in the desktop expanded state, where collapsing is possible. */
  onClose?: () => void;
  frameClassName?: string;
  layoutId?: string;
  layoutTransition?: import("motion/react").Transition;
};

export function ChatComposerShell({
  ref,
  input: renderInput,
  suggestions,
  highlight,
  createCardTitle = "How can we help you?",
}: {
  ref?: (element: HTMLDivElement | null) => void;
  input: (props: ComposerInputSlotProps) => React.ReactNode;
  /** Omit to keep the field permanently expanded. */
  suggestions?: (variant: BubbleSuggestionsVariant) => React.ReactNode;
  /** Replaces the whole bar on mobile while something is highlighted. */
  highlight?: React.ReactNode;
  createCardTitle?: string;
}) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const progress = useComposerExpandStore((state) => state.progress);
  const playTo = useComposerExpandStore((state) => state.playTo);
  const reset = useComposerExpandStore((state) => state.reset);

  const hasSuggestions = Boolean(suggestions);
  const layout = composerLayout(progress);
  const compactOpacity = 1 - progress;
  const expandedOpacity = progress;

  const handleCollapse = useCallback(() => {
    if (reduceMotion) {
      useComposerExpandStore.getState().setProgress(0);
      return;
    }
    playTo(0);
  }, [playTo, reduceMotion]);

  const handleStartWriting = useCallback(() => {
    const finish = () => {
      requestAnimationFrame(() => {
        document.querySelector("textarea")?.focus();
      });
    };

    if (reduceMotion) {
      useComposerExpandStore.getState().setProgress(1);
      finish();
      return;
    }

    void playTo(1).finished.then(finish);
  }, [playTo, reduceMotion]);

  useEffect(() => {
    reset();
    return reset;
  }, [reset]);

  useEffect(() => {
    if (progress < 1 || !hasSuggestions) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (inputContainerRef.current?.contains(target)) return;
      if (suggestionsRef.current?.contains(target)) return;
      handleCollapse();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [progress, hasSuggestions, handleCollapse]);

  if (isMobile) {
    return (
      <ChatComposerLayout className="flex flex-col gap-2 px-4" ref={ref}>
        {highlight ?? (
          <>
            {suggestions?.("carousel")}
            <ChatInputLayout className="pointer-events-auto">
              {renderInput({})}
            </ChatInputLayout>
          </>
        )}
      </ChatComposerLayout>
    );
  }

  if (!hasSuggestions) {
    return (
      <ChatComposerLayout ref={ref}>
        <div className="mx-auto w-[660px]">
          <ChatInputLayout className="pointer-events-auto w-full bg-transparent">
            {renderInput({})}
          </ChatInputLayout>
        </div>
      </ChatComposerLayout>
    );
  }

  return (
    <ChatComposerLayout ref={ref}>
      {import.meta.env.DEV ? <ComposerScrubber /> : null}
      <div
        className="relative mx-auto"
        style={{ width: COMPOSER_BAR_WIDTH, height: layout.barHeight }}
      >
        <div
          ref={suggestionsRef}
          className="absolute"
          style={layout.suggestions}
        >
          {suggestions?.("row")}
        </div>

        <div
          ref={inputContainerRef}
          className="pointer-events-auto absolute"
          style={layout.input}
        >
          <div
            className="absolute inset-0"
            style={{ opacity: compactOpacity }}
            inert={progress >= 0.5}
          >
            <ChatCreateCard
              className="h-full min-h-0 w-full"
              title={createCardTitle}
              onClick={handleStartWriting}
              pressScale={COMPOSER_PRESS_SCALE}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{ opacity: expandedOpacity }}
            inert={progress < 0.5}
          >
            <ChatInputLayout className="h-full bg-transparent">
              {renderInput({
                onClose: handleCollapse,
                frameClassName: "h-full min-h-0",
              })}
            </ChatInputLayout>
          </div>
        </div>
      </div>
    </ChatComposerLayout>
  );
}
