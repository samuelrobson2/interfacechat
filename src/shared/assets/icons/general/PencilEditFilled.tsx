import type { CustomIconProps } from "@/shared/model/icon";

export const PencilEditFilledIcon = ({
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
      d="M5 19.6951H6.50736C7.30301 19.6951 8.06607 19.379 8.62868 18.8164L18.5 8.94511C19.5355 7.90957 19.5355 6.23064 18.5 5.19511C17.4645 4.15957 15.7855 4.15957 14.75 5.19511L4.87868 15.0664C4.31607 15.629 4 16.3921 4 17.1877V18.6951C4 19.2474 4.44772 19.6951 5 19.6951Z"
      fill="#342E29"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M12.5 20.6951H18.5M6.50736 19.6951H5C4.44772 19.6951 4 19.2474 4 18.6951V17.1877C4 16.3921 4.31607 15.629 4.87868 15.0664L14.75 5.19511C15.7855 4.15957 17.4645 4.15957 18.5 5.19511C19.5355 6.23064 19.5355 7.90957 18.5 8.94511L8.62868 18.8164C8.06607 19.379 7.30301 19.6951 6.50736 19.6951Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
