import { Slot, Slottable } from "@radix-ui/react-slot";
import { motion, type Transition } from "motion/react";
import * as React from "react";

import { cn } from "@/shared/lib/css";

export function ChatSurfaceFrame({
  asChild = false,
  gradientStroke,
  hoverable = false,
  layoutId,
  layoutTransition,
  pressScale,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
  gradientStroke?: "always" | "focus" | "hover";
  hoverable?: boolean;
  layoutId?: string;
  layoutTransition?: Transition;
  pressScale?: number;
}) {
  const isSharedLayout = Boolean(layoutId) && !asChild;
  // One of three element types; the motion-only props are added only when it is motion.div.
  const Comp: React.ElementType = asChild ? Slot : isSharedLayout ? motion.div : "div";

  return (
    <Comp
      data-slot="chat-surface-frame"
      {...(isSharedLayout
        ? {
            layoutId,
            transition: layoutTransition,
            ...(pressScale != null ? { whileTap: { scale: pressScale } } : {}),
          }
        : {})}
      className={cn(
        "group relative isolate rounded-[16px] bg-background-primary shadow-elevated",
        "hairline [--hairline-radius:16px] [--hairline-color:var(--color-stroke-tertiary)]",
        "transition-shadow duration-200",
        isSharedLayout && "overflow-hidden",
        hoverable && "hover:[--hairline-color:var(--color-stroke-secondary)]",
        gradientStroke === "always" && "[--hairline-color:transparent]",
        gradientStroke === "focus" &&
          "has-focus:[--hairline-color:transparent]",
        gradientStroke === "hover" && "hover:[--hairline-color:transparent]",
        className,
      )}
      {...props}
    >
      {gradientStroke && (
        <span
          aria-hidden
          data-slot="chat-surface-frame-stroke"
          className={cn(
            "gradient-ring bg-gradient-ai-stroke pointer-events-none absolute inset-0 rounded-[inherit] p-px",
            "transition-opacity duration-200",
            gradientStroke === "always" && "opacity-100",
            gradientStroke === "focus" &&
              "opacity-0 group-has-focus:opacity-100",
            gradientStroke === "hover" && "opacity-0 group-hover:opacity-100",
          )}
        />
      )}

      {isSharedLayout ? (
        <motion.div
          layout
          transition={layoutTransition}
          className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col"
        >
          {children}
        </motion.div>
      ) : (
        <Slottable>{children}</Slottable>
      )}
    </Comp>
  );
}
