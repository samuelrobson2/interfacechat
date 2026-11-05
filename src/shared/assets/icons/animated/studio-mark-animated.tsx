import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";
import { useIconActiveAnimation } from "./use-icon-active-animation";

const COMETS = [
  {
    d: "M23.28 4.26L11.62 20.71A1.2 1.2 0 0 0 13.38 22.31L28.70 9.21A3.7 3.7 0 0 0 23.28 4.26Z",
    x: [4, 0],
    y: [-3, 0],
  },
  {
    d: "M9.25 4.72L5.15 12.22A1.2 1.2 0 0 0 6.78 13.85L14.28 9.75A3.7 3.7 0 0 0 9.25 4.72Z",
    x: [-3, 0],
    y: [-3, 0],
  },
  {
    d: "M23.03 18.87L19.24 26.04A1.2 1.2 0 0 0 20.86 27.66L28.03 23.87A3.7 3.7 0 0 0 23.03 18.87Z",
    x: [3, 0],
    y: [3, 0],
  },
] as const;

const DOTS: [cx: number, cy: number][] = [
  [3.5, 16.5],
  [8.5, 25],
  [4, 29.5],
  [17, 30.5],
];

/** Animated Studio world mark — comets streak in, loose dots follow. */
export function StudioMarkAnimated({
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
      {COMETS.map(({ d, x, y }, index) => (
        <motion.path
          key={`${tick}-comet-${index}`}
          d={d}
          fill="currentColor"
          className={pathClasses}
          initial={false}
          animate={
            active && !reducedMotion
              ? {
                  x,
                  y,
                  opacity: [0, 1, 1],
                  scale: [0.72, 1.06, 1],
                }
              : { x: 0, y: 0, opacity: 1, scale: 1 }
          }
          transition={{
            duration: 0.42,
            delay: index * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "center", transformBox: "fill-box" }}
          {...pathProps}
        />
      ))}
      {DOTS.map(([cx, cy], index) => (
        <motion.circle
          key={`${tick}-dot-${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={1.8}
          fill="currentColor"
          className={pathClasses}
          initial={false}
          animate={
            active && !reducedMotion ? { r: [0, 2.4, 1.8] } : { r: 1.8 }
          }
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 18,
            delay: 0.18 + index * 0.04,
          }}
          {...pathProps}
        />
      ))}
    </motion.svg>
  );
}
