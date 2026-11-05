import type { CustomIconProps } from "@/shared/model/icon";

export const PlusSmallIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    fill="none"
    viewBox="0 0 12 12"
    className={svgClasses}
    {...svgProps}
  >
    <path
      stroke="#1A1718"
      strokeLinecap="round"
      d="M5.833.5v5.333m0 0v5.334m0-5.334H.5m5.333 0h5.334"
      className={pathClasses}
      {...pathProps}
    ></path>
  </svg>
);
