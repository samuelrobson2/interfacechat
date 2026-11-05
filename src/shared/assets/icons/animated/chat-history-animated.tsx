import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";
import { useIconActiveAnimation } from "./use-icon-active-animation";

export const ChatHistoryIconAnimated = ({
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
      <motion.path
        d="M15.5742 8.52539C16.2329 8.52539 16.7508 9.0888 16.6953 9.74512L16.2188 15.3564C16.1691 15.9386 15.682 16.3857 15.0977 16.3857H4.90332C4.31903 16.3857 3.83185 15.9386 3.78223 15.3564L3.30566 9.74512C3.25019 9.0888 3.76803 8.52539 4.42676 8.52539H15.5742Z"
        stroke="#1A1718"
        strokeWidth="1.75"
        className={pathClasses}
        initial={false}
        animate={
          active && !reducedMotion
            ? { y: [0, 1.5, 0], scale: [1, 1.03, 1] }
            : { y: 0, scale: 1 }
        }
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "center", transformBox: "fill-box" }}
        {...pathProps}
      />
      <motion.path
        key={`line-1-${tick}`}
        d="M15.5869 5.49219H10.0001H4.41357"
        stroke="#1A1718"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClasses}
        initial={false}
        animate={
          active && !reducedMotion ? { x: [0, 2.5, 0] } : { x: 0 }
        }
        transition={{ duration: 0.38, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
        {...pathProps}
      />
      <motion.path
        key={`line-2-${tick}`}
        d="M15.0676 2.4917H9.99969H4.93213"
        stroke="#1A1718"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClasses}
        initial={false}
        animate={
          active && !reducedMotion ? { x: [0, -2.5, 0] } : { x: 0 }
        }
        transition={{ duration: 0.38, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        {...pathProps}
      />
    </motion.svg>
  );
};
