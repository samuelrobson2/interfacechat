import { cn } from "@/shared/lib/css";
import * as React from "react";

export type GradientTextVariant = "default" | "green" | "purple";

const GRADIENT_TEXT_BACKGROUNDS: Record<GradientTextVariant, string> = {
  default:
    "linear-gradient(110deg, #3e5466, #6b86ad, #bd8bad, #e3b9d2, #bd8bad, #6b86ad, #3e5466)",
  green:
    "linear-gradient(110deg, var(--color-green-5), var(--color-blue-3), var(--color-green-5))",
  // The rose ramp read as a purple — deep plum through pink and back, so the
  // shimmer has a band to sweep without any stop washing out on white. Loops
  // seamlessly, like the others, so the sweep has nowhere to jump.
  purple:
    "linear-gradient(110deg, var(--color-rose-3), var(--color-rose-2), var(--color-rose-3))",
};

export function GradientText({
  className,
  as = "span",
  variant = "default",
  style,
  ref,
  animated = true,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "span" | "p" | "div";
  variant?: GradientTextVariant;
  ref?: React.Ref<HTMLElement>;
  animated?: boolean;
}) {
  return React.createElement(as, {
    ref,
    className: cn(
      "bg-clip-text text-transparent",
      animated && "gradient-text-shimmer",
      className,
    ),
    style: { backgroundImage: GRADIENT_TEXT_BACKGROUNDS[variant], ...style },
    ...props,
  });
}
