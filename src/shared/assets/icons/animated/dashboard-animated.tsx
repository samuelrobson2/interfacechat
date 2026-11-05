import { motion, useReducedMotion } from "framer-motion";
import type { AnimatedIconProps } from "./types";
import { useIconActiveAnimation } from "./use-icon-active-animation";

const TILES = [
  "M12.1427 13.3292H15.4312V15.4401H12.1427V13.3292ZM12.1427 11.7603C11.7266 11.7603 11.3274 11.9256 11.0333 12.2198C10.7391 12.514 10.5737 12.9131 10.5737 13.3292V15.4401C10.5737 16.3066 11.2761 17.009 12.1427 17.009H15.4312C16.2977 17.009 17.0002 16.3066 17.0002 15.4401V13.3292C17.0002 12.4627 16.2977 11.7603 15.4312 11.7603H12.1427Z",
  "M15.4312 4.55969V9.08646H12.1427V4.55969H15.4312ZM15.4312 2.99072H12.1427C11.7266 2.99072 11.3274 3.15607 11.0333 3.45025C10.7391 3.74443 10.5737 4.14361 10.5737 4.55969V9.08646C10.5737 9.95301 11.2761 10.6554 12.1427 10.6554H15.4312C15.8473 10.6554 16.2464 10.4901 16.5406 10.1959C16.8348 9.90171 17.0002 9.50253 17.0002 9.08646V4.55969C17.0002 3.69314 16.2977 2.99072 15.4312 2.99072Z",
  "M4.56897 4.55969H7.85746V6.67055H4.56897V4.55969ZM4.56897 2.99072C4.15289 2.99072 3.75371 3.15607 3.45953 3.45025C3.16534 3.74443 3 4.14361 3 4.55969V6.67055C3 7.5371 3.70241 8.23952 4.56897 8.23952H7.85746C8.27353 8.23952 8.67272 8.07417 8.9669 7.77999C9.26108 7.48581 9.42642 7.08663 9.42642 6.67055V4.55969C9.42642 3.69314 8.72401 2.99072 7.85746 2.99072H4.56897Z",
  "M7.85746 10.9137V15.4405H4.56897V10.9137H7.85746ZM7.85746 9.34473H4.56897C4.15289 9.34473 3.75371 9.51007 3.45953 9.80425C3.16534 10.0984 3 10.4976 3 10.9137V15.4405C3 16.307 3.70241 17.0094 4.56897 17.0094H7.85746C8.27353 17.0094 8.67272 16.8441 8.9669 16.5499C9.26108 16.2557 9.42642 15.8565 9.42642 15.4405V10.9137C9.42642 10.0471 8.72401 9.34473 7.85746 9.34473Z",
] as const;

export const DashboardIconAnimated = ({
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
      <g clipPath="url(#clip0_dashboard_animated)">
        {TILES.map((d, index) => (
          <motion.path
            key={`${tick}-${index}`}
            d={d}
            fill="#1A1718"
            className={pathClasses}
            initial={false}
            animate={
              active && !reducedMotion
                ? { scale: [0.82, 1.06, 1], opacity: [0.55, 1, 1] }
                : { scale: 1, opacity: 1 }
            }
            transition={{
              duration: 0.42,
              delay: index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: "center", transformBox: "fill-box" }}
            {...pathProps}
          />
        ))}
      </g>
      <defs>
        <clipPath id="clip0_dashboard_animated">
          <rect
            width="14"
            height="14.019"
            fill="white"
            transform="translate(3 2.99072)"
          />
        </clipPath>
      </defs>
    </motion.svg>
  );
};
