import type { CustomIconProps } from "@/shared/model/icon";

export const TextConciseIcon = ({
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
      d="M21.25 15.5C21.6642 15.5 22 15.8358 22 16.25C22 16.6642 21.6642 17 21.25 17H2.75C2.33579 17 2 16.6642 2 16.25C2 15.8358 2.33579 15.5 2.75 15.5H21.25ZM20.25 11.5C20.6642 11.5 21 11.8358 21 12.25C21 12.6642 20.6642 13 20.25 13H3.75C3.33579 13 3 12.6642 3 12.25C3 11.8358 3.33579 11.5 3.75 11.5H20.25ZM21.25 7.5C21.6642 7.5 22 7.83579 22 8.25C22 8.66421 21.6642 9 21.25 9H2.75C2.33579 9 2 8.66421 2 8.25C2 7.83579 2.33579 7.5 2.75 7.5H21.25Z"
      fill="#342E29"
      strokeWidth="1"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
