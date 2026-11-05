import type { CustomIconProps } from "@/shared/model/icon";

export const ExitFullScreenIcon = ({
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
      d="M9 4V7C9 8.10457 8.10457 9 7 9H4"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
    />
    <path
      d="M15 20L15 17C15 15.8954 15.8954 15 17 15L20 15"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
    />
    <path
      d="M20 9L17 9C15.8954 9 15 8.10457 15 7L15 4"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
    />
    <path
      d="M4 15L7 15C8.10457 15 9 15.8954 9 17L9 20"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
