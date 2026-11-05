import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";
import { useIconActiveAnimation } from "./use-icon-active-animation";

const LOZENGES = [
  "M7.5 12.5a1.5 1.5 0 1 1-1.5-1.5h1.5v1.5Zm.75 0a1.5 1.5 0 0 1 3 0v3.75a1.5 1.5 0 0 1-3 0V12.5Z",
  "M9.75 6.5a1.5 1.5 0 1 1 1.5-1.5v1.5h-1.5Zm0 .75a1.5 1.5 0 0 1 0 3H6a1.5 1.5 0 0 1 0-3h3.75Z",
  "M13.5 9.75a1.5 1.5 0 1 1 1.5 1.5h-1.5v-1.5Zm-.75 0a1.5 1.5 0 0 1-3 0V6a1.5 1.5 0 0 1 3 0v3.75Z",
  "M10.5 13.5a1.5 1.5 0 1 1-1.5 1.5v-1.5h1.5Zm0-.75a1.5 1.5 0 0 1 0-3H14.25a1.5 1.5 0 0 1 0 3H10.5Z",
] as const;

export const SlackIconAnimated = ({
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
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={svgClasses}
      {...svgProps}
    >
      {LOZENGES.map((d, index) => (
        <motion.path
          key={`${tick}-${index}`}
          d={d}
          fill="#1A1718"
          className={pathClasses}
          initial={false}
          animate={
            active && !reducedMotion
              ? { scale: [0.5, 1.12, 1], opacity: [0.3, 1, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{
            type: "spring",
            stiffness: 480,
            damping: 16,
            delay: index * 0.06,
          }}
          style={{ transformOrigin: "center", transformBox: "fill-box" }}
          {...pathProps}
        />
      ))}
    </motion.svg>
  );
};
