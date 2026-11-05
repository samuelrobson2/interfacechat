import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";
import { useIconActiveAnimation } from "./use-icon-active-animation";

const TILES = [
  "M3 6C3 4.89543 3.89543 4 5 4H8C9.10457 4 10 4.89543 10 6V9C10 10.1046 9.10457 11 8 11H5C3.89543 11 3 10.1046 3 9V6Z",
  "M13 6C13 4.89543 13.8954 4 15 4H18C19.1046 4 20 4.89543 20 6V9C20 10.1046 19.1046 11 18 11H15C13.8954 11 13 10.1046 13 9V6Z",
  "M13 16C13 14.8954 13.8954 14 15 14H18C19.1046 14 20 14.8954 20 16V19C20 20.1046 19.1046 21 18 21H15C13.8954 21 13 20.1046 13 19V16Z",
  "M3 16C3 14.8954 3.89543 14 5 14H8C9.10457 14 10 14.8954 10 16V19C10 20.1046 9.10457 21 8 21H5C3.89543 21 3 20.1046 3 19V16Z",
] as const;

export const LayoutIconAnimated = ({
  active,
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: AnimatedIconProps) => {
  const reducedMotion = useReducedMotion();
  const tick = useIconActiveAnimation(active);

  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={svgClasses}
      {...svgProps}
    >
      {TILES.map((d, index) => (
        <motion.path
          key={`${tick}-${index}`}
          d={d}
          stroke="#342E29"
          strokeWidth="1"
          strokeLinejoin="round"
          className={pathClasses}
          initial={false}
          animate={
            active && !reducedMotion
              ? { scale: [0.75, 1.05, 1], opacity: [0.4, 1, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{
            duration: 0.4,
            delay: index * 0.055,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "center", transformBox: "fill-box" }}
          {...pathProps}
        />
      ))}
    </motion.svg>
  );
};
