import { Check } from "lucide-react";
import { useState } from "react";

import { cn } from "@/shared/lib/css";
import { Portal as PopoverPortal } from "@radix-ui/react-popover";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import type { DocBlank } from "../model/shell-types";
import { fieldEvents, stopFieldEvent } from "../ui/shell-surface";

/**
 * A blank inside a sentence: a slot the model left instead of making
 * something up. Empty, it shows its placeholder in the AI colours, pulsing
 * gently while it's the one the writing waits on. Clicking opens its
 * question, with answers to click and a field for their own words. Filled,
 * it reads as their answer, still a slot they can change.
 */
export function DocBlankSlot({
  blank,
  editable,
  onFill,
}: {
  blank: DocBlank | undefined;
  editable: boolean;
  onFill?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [own, setOwn] = useState("");
  if (!blank) return <span className="text-typography-secondary">…</span>;

  const filled = blank.value !== undefined;
  const pick = (value: string) => {
    const next = value.trim();
    if (!next) return;
    onFill?.(next);
    setOwn("");
    setOpen(false);
  };

  const slot = (
    <span
      className={cn(
        "rounded-[4px] px-0.5 underline decoration-dotted underline-offset-[3px]",
        filled ? "decoration-gray-3/60" : "text-gradient-ai decoration-[#a9bad1]",
        !filled && blank.wait && "text-gradient-ai-shimmer",
        editable && "cursor-pointer hover:bg-gray-6",
      )}
    >
      {filled ? blank.value : blank.placeholder}
    </span>
  );
  if (!editable || !onFill) return slot;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        // The block underneath would take the click as "start editing here".
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        {...fieldEvents}
      >
        <button type="button" aria-label={`${blank.ask}${filled ? `: ${blank.value}` : ""}`} className="inline">
          {slot}
        </button>
      </PopoverTrigger>
      {/* In a portal: inside the card it would sit under the rows and be clipped by the scrolling body. */}
      <PopoverPortal>
        <PopoverContent
          align="start"
          className="w-auto max-w-[320px] min-w-[220px] rounded-[16px] border-none bg-background-primary p-3 shadow-[0_6px_24px_rgba(26,23,24,0.14)]"
          onPointerDown={stopFieldEvent}
          onClick={stopFieldEvent}
        >
          <div className="flex flex-col gap-2.5 font-bureau">
            <span className="text-[13px] text-typography-primary">{blank.ask}</span>
            <div className="flex flex-wrap gap-1.5">
              {blank.options.map((option) => {
                const chosen = option === blank.value;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => pick(option)}
                    className={cn(
                      "flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[12px] transition-colors",
                      chosen ? "bg-gray-5 text-white" : "bg-gray-6 text-typography-primary hover:bg-gray-2/60",
                    )}
                  >
                    {chosen && <Check className="size-3" strokeWidth={2.25} />}
                    {option}
                  </button>
                );
              })}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                pick(own);
              }}
            >
              <input
                value={own}
                onChange={(event) => setOwn(event.target.value)}
                placeholder="Something else"
                aria-label="Something else"
                className="h-8 w-full rounded-[10px] bg-gray-6 px-2.5 text-[12px] text-typography-primary outline-none placeholder:text-typography-secondary/70"
              />
            </form>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
}
