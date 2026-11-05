import { Slot, Slottable } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/shared/lib/css";

export type ChatGrayFrameProps = React.ComponentProps<"div"> & {
  asChild?: boolean;
  /** Adds a translucent white overlay above the blur (used for focus / typing states). */
  overlay?: boolean;
  /** Thickness of the colored border in pixels (gap between the outer frame and the blurred fill). */
  frameThickness?: number;
  /** Blur radius of the inner fill in pixels. */
  blurAmount?: number;
  /** Class for the outer frame fill (the colored border ring). Callers decide the color; defaults to neutral gray. */
  fillClassName?: string;
  /** Class for the fill inside the ring — the composer's own background.
   *  Defaults to the translucent off-white the frosted look is built on. */
  innerFillClassName?: string;
};

export function ChatGrayFrame({
  asChild = false,
  overlay = false,
  frameThickness = 3,
  blurAmount = 3,
  fillClassName = "bg-gray-2",
  innerFillClassName = "bg-gray-1/90",
  className,
  children,
  ...props
}: ChatGrayFrameProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="chat-gray-frame"
      className={cn(
        "relative isolate overflow-hidden rounded-[16px]",
        "shadow-[0_0_8px_0_var(--color-gray-6)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        data-slot="chat-gray-frame-border"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
          "transition-colors duration-300",
          fillClassName,
        )}
        style={{ padding: frameThickness }}
      >
        <span
          className={cn(
            "block size-full rounded-[inherit]",
            innerFillClassName,
          )}
          style={{ filter: `blur(${blurAmount}px)` }}
        />
      </span>

      <span
        aria-hidden
        data-slot="chat-gray-frame-overlay"
        className={cn(
          "bg-background-primary pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
          "transition-opacity duration-300",
          overlay ? "opacity-30" : "opacity-0",
        )}
      />

      <Slottable>{children}</Slottable>
    </Comp>
  );
}
