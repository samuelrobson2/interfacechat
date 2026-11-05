import { Slot, Slottable } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/shared/lib/css";

export function SurfaceFrame({
  asChild = false,
  gradientStroke,
  hoverable = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
  gradientStroke?: "always" | "focus" | "filled" | "hover";
  hoverable?: boolean;
}) {
  const Comp = asChild ? Slot : "div";
  const isFocusLit = gradientStroke === "focus" || gradientStroke === "filled";

  return (
    <Comp
      data-slot="surface-frame"
      className={cn(
        "group relative isolate rounded-[16px] bg-background-primary shadow-elevated",
        "hairline [--hairline-radius:16px] [--hairline-color:var(--color-stroke-tertiary)]",
        "transition-shadow duration-200",
        hoverable && "hover:[--hairline-color:var(--color-stroke-secondary)]",
        gradientStroke === "always" && "[--hairline-color:transparent]",
        isFocusLit && "has-focus:[--hairline-color:transparent]",
        gradientStroke === "filled" &&
          "has-data-filled:[--hairline-color:transparent]",
        gradientStroke === "hover" && "hover:[--hairline-color:transparent]",
        className,
      )}
      {...props}
    >
      {gradientStroke && (
        <span
          aria-hidden
          data-slot="surface-frame-stroke"
          className={cn(
            "gradient-ring bg-gradient-ai-stroke pointer-events-none absolute inset-0 rounded-[inherit] p-px",
            "transition-opacity duration-200",
            gradientStroke === "always" && "opacity-100",
            isFocusLit && "opacity-0 group-has-focus:opacity-100",
            gradientStroke === "filled" && "group-has-data-filled:opacity-100",
            gradientStroke === "hover" && "opacity-0 group-hover:opacity-100",
          )}
        />
      )}

      <Slottable>{children}</Slottable>
    </Comp>
  );
}
