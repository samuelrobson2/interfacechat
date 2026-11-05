import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";
import { useIconActiveAnimation } from "./use-icon-active-animation";

export const AutoInterfaceIconAnimated = ({
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
        d="M5.125 3.625H14.875C16.1176 3.625 17.125 4.63236 17.125 5.875V14.125C17.125 15.3676 16.1176 16.375 14.875 16.375H5.125C3.88236 16.375 2.875 15.3676 2.875 14.125V5.875C2.875 4.63236 3.88236 3.625 5.125 3.625Z"
        stroke="#1A1718"
        strokeWidth="1.75"
        strokeLinejoin="round"
        className={pathClasses}
        initial={false}
        animate={
          active && !reducedMotion ? { scale: [1, 1.04, 1] } : { scale: 1 }
        }
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "center", transformBox: "fill-box" }}
        {...pathProps}
      />
      <motion.path
        d="M2.875 7.5H17.125"
        stroke="#1A1718"
        strokeWidth="1.75"
        strokeLinecap="round"
        className={pathClasses}
        initial={false}
        animate={
          active && !reducedMotion ? { scaleX: [1, 0.92, 1] } : { scaleX: 1 }
        }
        transition={{ duration: 0.32, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "center", transformBox: "fill-box" }}
        {...pathProps}
      />
      <motion.path
        key={`star-${tick}`}
        d="M9.6665 11.0498L10.4248 12.6748L12.0498 13.4331L10.4248 14.1914L9.6665 15.8164L8.9082 14.1914L7.2832 13.4331L8.9082 12.6748L9.6665 11.0498Z"
        fill="#1A1718"
        stroke="#1A1718"
        strokeWidth="0.5"
        strokeLinejoin="round"
        className={pathClasses}
        initial={false}
        animate={
          active && !reducedMotion
            ? { scale: [0.6, 1.15, 1], rotate: [0, 18, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ type: "spring", stiffness: 520, damping: 18, delay: 0.06 }}
        style={{ transformOrigin: "10px 13px", transformBox: "fill-box" }}
        {...pathProps}
      />
    </motion.svg>
  );
};
