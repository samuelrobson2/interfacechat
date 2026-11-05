import { Slot, Slottable } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/shared/lib/css";

export type ChatHighlightFrameProps = React.ComponentProps<"div"> & {
  asChild?: boolean;
  /** Fades out the inner blur fill on hover, exposing the underlying highlight color. */
  clearOnHover?: boolean;
  /** Thickness of the colored border in pixels (gap between the outer frame and the blurred fill). */
  frameThickness?: number;
  /** Blur radius of the inner fill in pixels. */
  blurAmount?: number;
};

export function ChatHighlightFrame({
  asChild = false,
  clearOnHover = false,
  frameThickness = 1,
  blurAmount = 3,
  className,
  children,
  ...props
}: ChatHighlightFrameProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="chat-highlight-frame"
      className={cn(
        "relative isolate rounded-[16px]",
        "border-[0.5px] border-stroke-secondary",
        "shadow-[0_0_12px_0_var(--chat-highlight-glow)]",
        clearOnHover &&
          "group hover:shadow-[0_0_12px_0_var(--chat-highlight-glow),0_0_12px_0_var(--chat-highlight-glow)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        data-slot="chat-highlight-frame-border"
        className={cn(
          "bg-(--chat-highlight-glow) pointer-events-none absolute inset-0 -z-10",
          "overflow-hidden rounded-[inherit] border border-background-primary filter-[drop-shadow(0_0_7px_var(--color-pink-10))]",
        )}
        style={{ padding: frameThickness }}
      >
        <span
          className={cn(
            "block size-full rounded-[inherit] bg-gray-1/90 transition-opacity duration-300",
            clearOnHover && "group-hover:opacity-0",
          )}
          style={{ filter: `blur(${blurAmount}px)` }}
        />
      </span>

      <Slottable>{children}</Slottable>
    </Comp>
  );
}
