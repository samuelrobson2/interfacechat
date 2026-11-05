import type { CustomIconProps } from "@/shared/model/icon";

export const SizeMediumIcon = ({
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
      d="M4.92871 19.0708V14.8282M4.92871 19.0708H9.17135M4.92871 19.0708L10.5856 13.414M19.0708 4.92871H14.8282M19.0708 4.92871V9.17135M19.0708 4.92871L13.414 10.5856"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
