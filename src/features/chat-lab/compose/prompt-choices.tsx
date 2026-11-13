import { Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { cn } from "@/shared/lib/css";
import { Portal as PopoverPortal } from "@radix-ui/react-popover";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import type { PromptChoice } from "../model/prompt-choices";

const EASE = [0.22, 1, 0.36, 1] as const;

type Shown = PromptChoice & { picked?: string[] };

/** What a choice holds now: what they picked, or the guess the request will go with. */
const valueOf = (choice: Shown) => (choice.picked?.length ? choice.picked : choice.guess);

function ChoiceRow({ choice, thinking, onPick }: { choice: Shown; thinking: boolean; onPick: (labels: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const picked = Boolean(choice.picked?.length);
  const value = valueOf(choice);
  const toggle = (label: string) => {
    if (!choice.multi) {
      onPick([label]);
      setOpen(false);
      return;
    }
    const next = value.includes(label) ? value.filter((item) => item !== label) : [...value, label];
    onPick(next.length ? next : [label]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          // The prompt keeps focus, so typing carries on after a pick.
          onMouseDown={(event) => event.preventDefault()}
          // The card's own type: light body text, and a dotted underline for what can be changed, as on its length.
          className="group flex w-full cursor-pointer items-baseline gap-2 rounded-[4px] py-[3px] text-left font-bureau text-[12px] leading-[1.5] font-light outline-none focus-visible:ring-1 focus-visible:ring-[#a9bad1]"
        >
          <span className="shrink-0 text-typography-secondary">{choice.ask}</span>
          <span
            className={cn(
              "ml-auto min-w-0 truncate underline decoration-dotted underline-offset-[3px] transition-[text-decoration-color]",
              // A guess reads in the AI colours; once picked, it's theirs.
              picked
                ? "text-typography-primary decoration-typography-secondary/35 group-hover:decoration-typography-secondary/70"
                : "text-gradient-ai decoration-[#a9bad1]/70 group-hover:decoration-[#a9bad1]",
              // Still being worked out: the guess shimmers until the update lands.
              !picked && thinking && "text-gradient-ai-shimmer",
            )}
            title={picked ? undefined : "A guess: click to change"}
          >
            {value.join(", ")}
          </span>
        </button>
      </PopoverTrigger>
      {/* In a portal: inside the card it would sit under the rows and be clipped by the scrolling body. */}
      <PopoverPortal>
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={6}
          onOpenAutoFocus={(event) => event.preventDefault()}
          // Focus stays in the prompt, so typing carries on after a pick.
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="w-auto max-w-[300px] min-w-0 rounded-[14px] border-none bg-background-primary p-2 shadow-[0_6px_24px_rgba(26,23,24,0.14)]"
        >
          <div className="flex flex-wrap gap-1.5">
            {choice.options.map((option) => {
              const on = value.includes(option.label);
              return (
                <button
                  key={option.label}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => toggle(option.label)}
                  title={`Adds “${option.phrase}” to your request`}
                  className={cn(
                    "flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 font-bureau text-[12px] transition-colors",
                    on && picked ? "bg-gray-5 text-white" : on ? "bg-gray-6 text-typography-primary ring-1 ring-[#a9bad1]" : "bg-gray-6 text-typography-primary hover:bg-gray-2/60",
                  )}
                >
                  {on && <Check className="size-3" strokeWidth={2.25} />}
                  {option.label}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
}

/** While the first choices are worked out: rows where they'll land, shimmering, so it's clear something's happening. */
function ChoiceSkeleton({ index }: { index: number }) {
  return (
    // A row's height: 12px text at 1.5, plus its padding.
    <div className="flex h-6 items-center gap-2">
      <span className="h-2 animate-pulse rounded-full bg-gray-3/20" style={{ width: [64, 82, 54][index] }} />
      <span
        className="bg-gradient-ai-stroke ml-auto h-2 animate-pulse rounded-full opacity-50"
        style={{ width: [58, 44, 66][index], animationDelay: `${index * 120}ms` }}
      />
    </div>
  );
}

/**
 * The few choices a request leaves open, inside its card on the chat home:
 * a question, and what it holds now (the guess, in the AI colours, until they
 * pick), in the card's own type. Picking adds a phrase to their prompt. While
 * they're worked out, rows shimmer where they'll land; a request that leaves
 * nothing open shows nothing. Never more than three.
 */
export function PromptChoices({
  choices,
  thinking,
  onPick,
  className,
}: {
  choices: Shown[];
  thinking: boolean;
  onPick: (key: string, labels: string[]) => void;
  className?: string;
}) {
  const reduce = Boolean(useReducedMotion());
  const waiting = thinking && choices.length === 0;
  return (
    <div className={cn("flex flex-col", className)} aria-busy={thinking} aria-live="polite">
      <AnimatePresence initial={false} mode="popLayout">
        {waiting
          ? [0, 1, 2].map((index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: index * 0.06 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
              >
                <ChoiceSkeleton index={index} />
              </motion.div>
            ))
          : choices.map((choice) => (
              <motion.div
                key={choice.key}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 3, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.14 } }}
                transition={{ duration: 0.26, ease: EASE }}
              >
                <ChoiceRow choice={choice} thinking={thinking} onPick={(labels) => onPick(choice.key, labels)} />
              </motion.div>
            ))}
      </AnimatePresence>
    </div>
  );
}
