import { useEffect, useEffectEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/shared/lib/css";
import { useIsMobile } from "@/shared/lib/react/use-mobile";

import { useInputStore } from "../../_model/input-store";
import { ChatCreateCard } from "../../_ui/chat-create-card";
import { ChatInputLayout } from "../../_ui/chat-input-layout";
import { ChatComposerLayout } from "../../_ui/chat-layout";
import {
  COMPOSER_FRAME_PADDING,
  COMPOSER_MAX_ROWS,
  COMPOSER_MIN_HEIGHT,
  COMPOSER_MOTION_MS,
  CREATE_CARD_WIDTH,
  SUGGESTIONS_COLUMN_WIDTH,
  SUGGESTION_PILL_SIZE,
  TRACK_WIDTH,
} from "../../_lib/composer-metrics";
import {
  ChatSuggestionsPill,
  type BubbleSuggestionsVariant,
} from "../../suggestions/ui/bubble-suggestions";

export type ComposerInputSlotProps = {
  frameClassName?: string;
  /** Rendered alongside the field's own actions, at its bottom left. */
  leftActions?: React.ReactNode;
  maxRows?: number;
};

// Keystrokes aimed at another field, or at an open overlay's own keyboard
// handling (menu typeahead, dialogs), must not be pulled into the composer.
const FOREIGN_TYPING_TARGET_SELECTOR = [
  "input",
  "textarea",
  "select",
  "[role='dialog']",
  "[role='alertdialog']",
  "[role='menu']",
  "[role='listbox']",
].join(", ");

const isPrintableKey = (event: KeyboardEvent) =>
  event.key.length === 1 &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey &&
  !event.isComposing &&
  !event.defaultPrevented;

const isTypingElsewhere = (element: Element | null) =>
  element instanceof HTMLElement &&
  (element.isContentEditable ||
    Boolean(element.closest(FOREIGN_TYPING_TARGET_SELECTOR)));

export function ChatComposerShell({
  ref,
  input,
  suggestions,
  hasNoSuggestions = false,
  highlight,
  createCardTitle = "How can we help you?",
}: {
  ref?: (element: HTMLDivElement | null) => void;
  input: (props: ComposerInputSlotProps) => React.ReactNode;
  /** Omit (without `hasNoSuggestions`) to keep the field permanently expanded. */
  suggestions?: (variant: BubbleSuggestionsVariant) => React.ReactNode;
  /**
   * Nothing to show — not generated yet, failed or empty: the field stays
   * expanded beside an inert pill.
   */
  hasNoSuggestions?: boolean;
  /** Replaces the whole bar on mobile while something is highlighted. */
  highlight?: React.ReactNode;
  createCardTitle?: string;
}) {
  const isMobile = useIsMobile();
  const [isWriting, setIsWriting] = useState(hasNoSuggestions);
  const [areCardsFolded, setAreCardsFolded] = useState(hasNoSuggestions);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const draft = useInputStore((state) => state.message);

  const hasSuggestionsSlot = Boolean(suggestions) || hasNoSuggestions;
  // Collapsing keeps the draft in the store, so show it on the card rather than
  // the prompt — otherwise it reads as though the text was discarded.
  const collapsedTitle = draft?.trim() ? draft : createCardTitle;

  const trackRef = useRef<HTMLDivElement>(null);

  const focusField = () => {
    inputContainerRef.current?.querySelector("textarea")?.focus();
  };

  const handleCollapse = () => {
    setAreCardsFolded(false);
    setIsWriting(false);
    inputContainerRef.current?.querySelector("textarea")?.blur();
  };

  // An empty draft folds back into the card when focus leaves the bar, or on
  // Escape. Typed text stays put so a click elsewhere can't discard it.
  const collapseIfEmpty = useEffectEvent((event?: KeyboardEvent) => {
    if (!isWriting || draft?.trim()) return;
    event?.preventDefault();
    handleCollapse();
  });

  useEffect(() => {
    if (isMobile || !hasSuggestionsSlot) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (trackRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[role='dialog'], [role='menu'], [role='listbox']")
      ) {
        return;
      }
      collapseIfEmpty();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector("[role='dialog'], [role='alertdialog']")) {
        return;
      }
      const textarea = inputContainerRef.current?.querySelector("textarea");
      if (
        isTypingElsewhere(document.activeElement) &&
        document.activeElement !== textarea
      ) {
        return;
      }
      collapseIfEmpty(event);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobile, hasSuggestionsSlot]);

  const handleStartWriting = () => {
    setAreCardsFolded(false);
    setIsWriting(true);
    requestAnimationFrame(() => {
      setAreCardsFolded(true);
      focusField();
    });
  };

  // Opening synchronously lifts `inert` before focus moves, so the keystroke
  // that triggered it lands in the field instead of being dropped.
  const handleTypeToWrite = useEffectEvent(() => {
    if (hasSuggestionsSlot && !isWriting) {
      flushSync(() => {
        setAreCardsFolded(false);
        setIsWriting(true);
      });
      requestAnimationFrame(() => setAreCardsFolded(true));
    }
    focusField();
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPrintableKey(event)) return;
      if (isTypingElsewhere(document.activeElement)) return;
      handleTypeToWrite();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isMobile) {
    return (
      <ChatComposerLayout className="flex flex-col gap-2 px-4" ref={ref}>
        {highlight ?? (
          <>
            {suggestions?.("carousel")}
            <ChatInputLayout
              ref={inputContainerRef}
              className="pointer-events-auto"
            >
              {input({})}
            </ChatInputLayout>
          </>
        )}
      </ChatComposerLayout>
    );
  }

  // Without suggestions the field is permanently expanded, so there is neither a
  // compact state to close back into nor anything to animate.
  if (!hasSuggestionsSlot) {
    return (
      <ChatComposerLayout ref={ref}>
        <div className="mx-auto w-[660px]" data-slot="chat-composer-track">
          <ChatInputLayout
            ref={inputContainerRef}
            className="pointer-events-auto"
          >
            {input({
              frameClassName: "min-h-[100px] max-h-[200px]",
              maxRows: COMPOSER_MAX_ROWS,
            })}
          </ChatInputLayout>
        </div>
      </ChatComposerLayout>
    );
  }

  const cardsVariant: BubbleSuggestionsVariant =
    isWriting && areCardsFolded ? "column" : "row";

  const motion = `${COMPOSER_MOTION_MS}ms`;

  return (
    <ChatComposerLayout ref={ref}>
      <div
        ref={trackRef}
        className="mx-auto"
        style={{ width: TRACK_WIDTH }}
        data-slot="chat-composer-track"
      >
        <div className="relative">
          <div
            className="grid transition-[grid-template-columns] ease-out motion-reduce:transition-none"
            style={{
              transitionDuration: motion,
              // Animating the columns is what grows the field: the suggestion
              // column closes to nothing and the bar takes the width it gives up,
              // ending up exactly as wide as the card row it replaced.
              gridTemplateColumns: isWriting
                ? `0px ${TRACK_WIDTH}px`
                : `${SUGGESTIONS_COLUMN_WIDTH}px ${CREATE_CARD_WIDTH}px`,
            }}
          >
            <div />

            {/* Both states stay mounted and crossfade, so the field can grow rather
            than pop in at full width once the swap happens. `inert` keeps the
            hidden one out of the tab order and off screen readers. */}
            <div
              className="relative"
              style={{ minHeight: COMPOSER_MIN_HEIGHT }}
            >
              <ChatInputLayout
                ref={inputContainerRef}
                inert={!isWriting}
                className={cn(
                  "pointer-events-auto transition-opacity ease-out",
                  // Out of flow while collapsed: the field carries its own
                  // min-height, so leaving it in flow would set the row's height
                  // even though it is invisible, and the bar would sit too tall.
                  isWriting
                    ? "relative"
                    : "pointer-events-none absolute inset-0 opacity-0",
                )}
                style={{ transitionDuration: motion }}
              >
                {input({
                  maxRows: COMPOSER_MAX_ROWS,
                  frameClassName: "min-h-[100px] max-h-[200px]",
                  // Spacer only — the real pill lives on the overlay at a fixed
                  // point so the cards have somewhere stable to fly into. The
                  // attach button still sits to its right in the action row.
                  leftActions: (
                    <div
                      aria-hidden
                      className="shrink-0"
                      style={{
                        width: SUGGESTION_PILL_SIZE,
                        height: SUGGESTION_PILL_SIZE,
                      }}
                    />
                  ),
                })}
              </ChatInputLayout>

              <div
                inert={isWriting}
                className={cn(
                  "absolute inset-0 transition-opacity ease-out",
                  isWriting && "pointer-events-none opacity-0",
                )}
                style={{ transitionDuration: motion }}
              >
                <ChatCreateCard
                  className="pointer-events-auto h-full w-full min-h-[100px]"
                  title={collapsedTitle}
                  ariaLabel={
                    draft?.trim()
                      ? `Continue writing: ${draft}`
                      : createCardTitle
                  }
                  onClick={handleStartWriting}
                />
              </div>
            </div>
          </div>

          {/* Cards and the pill share this overlay so they agree on coordinates.
            The pill is pinned to the expanded field's bottom-left inset, which
            is also FOLD_TARGET — measuring it mid-transition aimed at the
            create-card slot instead. */}
          <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
            {suggestions?.(cardsVariant)}
            {isWriting ? (
              <div
                className="pointer-events-auto absolute"
                style={{
                  left: COMPOSER_FRAME_PADDING,
                  bottom: COMPOSER_FRAME_PADDING,
                }}
                onClick={hasNoSuggestions ? undefined : handleCollapse}
              >
                {hasNoSuggestions ? (
                  <ChatSuggestionsPill disabled />
                ) : (
                  suggestions?.("pill")
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ChatComposerLayout>
  );
}
