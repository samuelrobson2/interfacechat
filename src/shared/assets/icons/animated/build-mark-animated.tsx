import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";
import { useIconActiveAnimation } from "./use-icon-active-animation";

// Same lattice as BuildMark — middle column offset half a step.
const DOTS: [cx: number, cy: number][] = [
  [5, 9.5],
  [5, 21.5],
  [15.5, 3.5],
  [15.5, 15.5],
  [15.5, 28],
  [26, 9.5],
  [26, 22],
];

/** Animated Build world mark — dots assemble in on tab activation. */
export function BuildMarkAnimated({
  active,
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: AnimatedIconProps) {
  const reducedMotion = useReducedMotion();
  const tick = useIconActiveAnimation(active);

  return (
    <motion.svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={svgClasses}
      {...svgProps}
    >
      {DOTS.map(([cx, cy], index) => (
        <motion.circle
          key={`${tick}-${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={3.6}
          fill="currentColor"
          className={pathClasses}
          initial={false}
          animate={
            active && !reducedMotion ? { r: [0, 4.4, 3.6] } : { r: 3.6 }
          }
          transition={{
            type: "spring",
            stiffness: 480,
            damping: 16,
            delay: index * 0.045,
          }}
          {...pathProps}
        />
      ))}
    </motion.svg>
  );
}
