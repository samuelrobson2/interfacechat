import type { CustomIconProps } from "@/shared/model/icon";

export const ArrowUp = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={svgClasses}
    {...svgProps}
  >
    <path
      stroke="#1A1718"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.834 6.667 8 2.5l4.167 4.167M8 13.5V3"
      className={pathClasses}
      {...pathProps}
    ></path>
  </svg>
);
