import type { CustomIconProps } from "@/shared/model/icon";

/** Props for icons that play a one-shot animation when `active` becomes true. */
export type AnimatedIconProps = CustomIconProps & {
  active?: boolean;
};
