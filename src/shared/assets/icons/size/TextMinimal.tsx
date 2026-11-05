import type { CustomIconProps } from "@/shared/model/icon";

export const TextMinimalIcon = ({
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
      d="M20.25 13.5C20.6642 13.5 21 13.8358 21 14.25C21 14.6642 20.6642 15 20.25 15H3.75C3.33579 15 3 14.6642 3 14.25C3 13.8358 3.33579 13.5 3.75 13.5H20.25ZM21.25 9.5C21.6642 9.5 22 9.83579 22 10.25C22 10.6642 21.6642 11 21.25 11H2.75C2.33579 11 2 10.6642 2 10.25C2 9.83579 2.33579 9.5 2.75 9.5H21.25Z"
      fill="#342E29"
      strokeWidth="1"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
