import { Slot, Slottable } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/shared/lib/css";

export type ChatGradientFrameProps = React.ComponentProps<"div"> & {
  asChild?: boolean;
  /** Enables the translucent white overlay revealed on hover. Matches the suggestion card and small button hover states from Figma. */
  overlay?: boolean;
  /** Thickness of the gradient border in pixels (gap between gradient edge and the blurred fill). */
  frameThickness?: number;
  /** Blur radius of the inner fill in pixels. */
  blurAmount?: number;
};

export function ChatGradientFrame({
  asChild = false,
  overlay = false,
  frameThickness = 4,
  blurAmount = 3,
  className,
  children,
  ...props
}: ChatGradientFrameProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="chat-gradient-frame"
      className={cn(
        "group relative isolate inline-flex rounded-[16px]",
        "shadow-[0_0_7px_0_var(--color-pink-10)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        data-slot="chat-gradient-frame-border"
        className="bg-gradient-blue-pink pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
        style={{ padding: frameThickness }}
      >
        <span
          className="block size-full rounded-[14px] bg-gray-1/90"
          style={{ filter: `blur(${blurAmount}px)` }}
        />
      </span>

      {overlay && (
        <span
          aria-hidden
          data-slot="chat-gradient-frame-overlay"
          className="bg-background-primary pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-30"
        />
      )}

      <Slottable>{children}</Slottable>
    </Comp>
  );
}
