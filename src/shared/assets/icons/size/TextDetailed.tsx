import type { CustomIconProps } from "@/shared/model/icon";

export const TextDetailedIcon = ({
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
      d="M18.25 17.5C18.6642 17.5 19 17.8358 19 18.25C19 18.6642 18.6642 19 18.25 19H5.75C5.33579 19 5 18.6642 5 18.25C5 17.8358 5.33579 17.5 5.75 17.5H18.25ZM21.25 13.5C21.6642 13.5 22 13.8358 22 14.25C22 14.6642 21.6642 15 21.25 15H2.75C2.33579 15 2 14.6642 2 14.25C2 13.8358 2.33579 13.5 2.75 13.5H21.25ZM20.25 9.5C20.6642 9.5 21 9.83579 21 10.25C21 10.6642 20.6642 11 20.25 11H3.75C3.33579 11 3 10.6642 3 10.25C3 9.83579 3.33579 9.5 3.75 9.5H20.25ZM21.25 5.5C21.6642 5.5 22 5.83579 22 6.25C22 6.66421 21.6642 7 21.25 7H2.75C2.33579 7 2 6.66421 2 6.25C2 5.83579 2.33579 5.5 2.75 5.5H21.25Z"
      fill="#342E29"
      strokeWidth="1"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
