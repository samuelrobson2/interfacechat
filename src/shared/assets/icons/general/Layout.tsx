import type { CustomIconProps } from "@/shared/model/icon";

export const LayoutIcon = ({
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
      d="M3 6C3 4.89543 3.89543 4 5 4H8C9.10457 4 10 4.89543 10 6V9C10 10.1046 9.10457 11 8 11H5C3.89543 11 3 10.1046 3 9V6Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M13 6C13 4.89543 13.8954 4 15 4H18C19.1046 4 20 4.89543 20 6V9C20 10.1046 19.1046 11 18 11H15C13.8954 11 13 10.1046 13 9V6Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M13 16C13 14.8954 13.8954 14 15 14H18C19.1046 14 20 14.8954 20 16V19C20 20.1046 19.1046 21 18 21H15C13.8954 21 13 20.1046 13 19V16Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M3 16C3 14.8954 3.89543 14 5 14H8C9.10457 14 10 14.8954 10 16V19C10 20.1046 9.10457 21 8 21H5C3.89543 21 3 20.1046 3 19V16Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
