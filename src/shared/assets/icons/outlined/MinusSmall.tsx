import type { CustomIconProps } from "@/shared/model/icon";

export const MinusSmallIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M4 12H20"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
