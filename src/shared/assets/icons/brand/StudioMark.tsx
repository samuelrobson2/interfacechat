import type { ComponentProps } from "react";
import type { CustomIconProps } from "@/shared/model/icon";

// The Studio world's mark: the same brand dots, but three of them pulled into
// comets — a round head with a tail tapering back to a point — plus four loose
// dots. Where Build's lattice is ordered material, this is material in motion,
// which is what Studio does with it.
//
// Traced from the 32px artboard: each comet is a 3.7 head circle and a 1.2 tail
// tip joined along their outer tangents — a rounded, tapering stroke rather than
// a wedge, which is what keeps the tails reading as motion at 12–18px instead of
// as exclamation marks. Painted in `currentColor` so it takes the tone of the
// row or pill it sits in.
const COMETS = [
  // Head → tail tip. Longest first, as on the artboard.
  "M23.28 4.26L11.62 20.71A1.2 1.2 0 0 0 13.38 22.31L28.70 9.21A3.7 3.7 0 0 0 23.28 4.26Z",
  "M9.25 4.72L5.15 12.22A1.2 1.2 0 0 0 6.78 13.85L14.28 9.75A3.7 3.7 0 0 0 9.25 4.72Z",
  "M23.03 18.87L19.24 26.04A1.2 1.2 0 0 0 20.86 27.66L28.03 23.87A3.7 3.7 0 0 0 23.03 18.87Z",
];

const DOTS: [cx: number, cy: number][] = [
  [3.5, 16.5],
  [8.5, 25],
  [4, 29.5],
  [17, 30.5],
];

export const StudioMark = ({
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
    {COMETS.map((d) => (
      <path
        key={d}
        d={d}
        fill="currentColor"
        className={pathClasses}
        {...pathProps}
      />
    ))}
    {DOTS.map(([cx, cy]) => (
      <circle
        key={`${cx}-${cy}`}
        cx={cx}
        cy={cy}
        r={1.8}
        fill="currentColor"
        className={pathClasses}
        {...(pathProps as ComponentProps<"circle">)}
      />
    ))}
  </svg>
);
