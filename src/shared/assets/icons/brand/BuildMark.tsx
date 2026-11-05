import type { ComponentProps } from "react";
import type { CustomIconProps } from "@/shared/model/icon";

// The Build world's mark: the brand's dot lattice — seven dots, the middle
// column offset half a step from the two beside it, so it reads as ordered
// material rather than the scatter of the full logo. Traced from the 32px
// artboard, so the geometry is the artboard's and not a redraw.
//
// Painted in `currentColor` (the design export hard-codes #1A1718) so it takes
// the active/idle tone of whatever row or pill it sits in, the way the lucide
// glyphs beside it do.
const DOTS: [cx: number, cy: number][] = [
  [5, 9.5],
  [5, 21.5],
  [15.5, 3.5],
  [15.5, 15.5],
  [15.5, 28],
  [26, 9.5],
  [26, 22],
];

export const BuildMark = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    {DOTS.map(([cx, cy]) => (
      <circle
        key={`${cx}-${cy}`}
        cx={cx}
        cy={cy}
        r={3.6}
        fill="currentColor"
        className={pathClasses}
        // The shared icon props type speaks in paths; this mark is drawn from
        // circles, and the overrides callers pass (fill, stroke) apply to both.
        {...(pathProps as ComponentProps<"circle">)}
      />
    ))}
  </svg>
);
