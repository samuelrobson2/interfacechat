import type { CustomIconProps } from "@/shared/model/icon";

export const FullScreenIcon = ({
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
      d="M4 9L4 6C4 4.89543 4.89543 4 6 4L9 4"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
    />
    <path
      d="M20 15V18C20 19.1046 19.1046 20 18 20H15"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
    />
    <path
      d="M15 4L18 4C19.1046 4 20 4.89543 20 6L20 9"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
    />
    <path
      d="M9 20L6 20C4.89543 20 4 19.1046 4 18L4 15"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
