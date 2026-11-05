import { cn } from "@/shared/lib/css";

const CARD_REVEAL_MS = 250;
const FIRST_LINE_PAUSE_MS = 300;
const LINE_INTERVAL_MS = 300;
const BETWEEN_CARDS_PAUSE_MS = 200;
const PULSE_DELAY_AFTER_REVEAL_MS = 200;

const SKELETON_LINE_CLASS_NAMES = ["w-[64%]", "w-[82%]", "w-[46%]"];

export const DEFAULT_SUGGESTIONS_REVEAL_SPEED = 1.5;

type AnimationStyle = React.CSSProperties & {
  "--suggestion-card-delay"?: string;
  "--suggestion-line-delay"?: string;
  "--suggestion-pulse-delay"?: string;
  "--suggestion-reveal-duration"?: string;
};

function scaleTime(durationMs: number, revealSpeed: number) {
  return `${durationMs / revealSpeed}ms`;
}

function getRevealSpeed(revealSpeed: number) {
  return Number.isFinite(revealSpeed) && revealSpeed > 0 ? revealSpeed : 1;
}

function getAnimationTimeline(count: number, revealSpeed: number) {
  const firstLineDelayMs = CARD_REVEAL_MS + FIRST_LINE_PAUSE_MS;
  const cardIntervalMs =
    firstLineDelayMs +
    LINE_INTERVAL_MS * SKELETON_LINE_CLASS_NAMES.length +
    CARD_REVEAL_MS +
    BETWEEN_CARDS_PAUSE_MS;
  const pulseDelayMs =
    Math.max(0, count - 1) * cardIntervalMs +
    firstLineDelayMs +
    LINE_INTERVAL_MS * SKELETON_LINE_CLASS_NAMES.length +
    CARD_REVEAL_MS +
    PULSE_DELAY_AFTER_REVEAL_MS;

  return {
    cardIntervalMs,
    firstLineDelayMs,
    pulseDelay: scaleTime(pulseDelayMs, revealSpeed),
    revealDuration: scaleTime(CARD_REVEAL_MS, revealSpeed),
  };
}

export function ChatSuggestionsSkeleton({
  count = 3,
  revealSpeed = DEFAULT_SUGGESTIONS_REVEAL_SPEED,
  itemClassName,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  count?: number;
  /** `1` uses the designer timing; values above `1` reveal cards faster. */
  revealSpeed?: number;
  itemClassName?: string;
}) {
  const normalizedSpeed = getRevealSpeed(revealSpeed);
  const timeline = getAnimationTimeline(count, normalizedSpeed);

  return (
    <div aria-hidden className={className} {...props}>
      {Array.from({ length: count }).map((_, cardIndex) => {
        const cardDelayMs = cardIndex * timeline.cardIntervalMs;
        const cardStyle: AnimationStyle = {
          "--suggestion-card-delay": scaleTime(
            cardDelayMs,
            normalizedSpeed,
          ),
          "--suggestion-reveal-duration": timeline.revealDuration,
        };
        const arrowStyle: AnimationStyle = {
          "--suggestion-line-delay": scaleTime(
            cardDelayMs +
              timeline.firstLineDelayMs +
              SKELETON_LINE_CLASS_NAMES.length * LINE_INTERVAL_MS,
            normalizedSpeed,
          ),
          "--suggestion-pulse-delay": timeline.pulseDelay,
          "--suggestion-reveal-duration": timeline.revealDuration,
        };

        return (
          <div
            key={cardIndex}
            className={cn(
              "chat-suggestion-skeleton-card flex h-25 flex-col justify-between",
              "rounded-2xl border border-stroke-tertiary bg-background-primary",
              "px-3 py-2.5",
              itemClassName,
            )}
            style={cardStyle}
          >
            <div className="flex flex-col gap-1">
              {SKELETON_LINE_CLASS_NAMES.map((lineClassName, lineIndex) => {
                const lineDelayMs =
                  cardDelayMs +
                  timeline.firstLineDelayMs +
                  lineIndex * LINE_INTERVAL_MS;
                const lineStyle: AnimationStyle = {
                  "--suggestion-line-delay": scaleTime(
                    lineDelayMs,
                    normalizedSpeed,
                  ),
                  "--suggestion-pulse-delay": timeline.pulseDelay,
                  "--suggestion-reveal-duration": timeline.revealDuration,
                };

                return (
                  <div
                    key={lineClassName}
                    className={cn(
                      "chat-suggestion-skeleton-line h-3.5 rounded-lg bg-skeleton-primary",
                      lineClassName,
                    )}
                    style={lineStyle}
                  />
                );
              })}
            </div>

            <div
              className="chat-suggestion-skeleton-line size-4 self-end rounded-lg bg-skeleton-primary"
              style={arrowStyle}
            />
          </div>
        );
      })}
    </div>
  );
}

export function ChatSuggestionsTransition({
  isLoading,
  children,
  count = 3,
  revealSpeed = DEFAULT_SUGGESTIONS_REVEAL_SPEED,
  containerClassName,
  itemClassName,
  className,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  count?: number;
  revealSpeed?: number;
  containerClassName?: string;
  itemClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full", className)} aria-busy={isLoading}>
      <ChatSuggestionsSkeleton
        count={count}
        revealSpeed={revealSpeed}
        itemClassName={itemClassName}
        className={cn(
          containerClassName,
          !isLoading &&
            "chat-suggestions-crossfade-out pointer-events-none absolute inset-0 z-10",
        )}
      />

      <div
        className={cn(
          containerClassName,
          isLoading
            ? "invisible absolute inset-0"
            : "chat-suggestions-crossfade-in",
        )}
      >
        {children}
      </div>
    </div>
  );
}
