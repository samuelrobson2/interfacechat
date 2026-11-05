import type { CustomIconProps } from "@/shared/model/icon";

export const CheckIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="12"
    height="11"
    viewBox="0 0 12 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M0.75 6.10119L3.37626 9.33936C3.80615 9.8694 4.62896 9.82262 4.996 9.24726L10.4167 0.75"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
