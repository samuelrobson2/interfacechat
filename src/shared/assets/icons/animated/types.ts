import type { ComponentProps } from "react";
import type { CustomIconProps } from "@/shared/model/icon";

/**
 * DOM props that Motion uses for something else (its own animation and drag
 * callbacks), so they can't be spread onto a `motion.svg` or `motion.path`.
 */
type MotionClash =
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "values"
  | "ref";

/** Props for icons that play a one-shot animation when `active` becomes true. */
export type AnimatedIconProps = Omit<CustomIconProps, MotionClash | "pathProps"> & {
  pathProps?: Omit<ComponentProps<"path">, MotionClash>;
  active?: boolean;
};
