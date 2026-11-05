import type { CustomIconProps } from "@/shared/model/icon";

export const FilterIcon = ({
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
      d="M17.25 3.75H6.75C5.09315 3.75 3.75 5.09835 3.75 6.7552C3.75 7.55085 4.06607 8.31607 4.62868 8.87868L8.87132 13.1213C9.43393 13.6839 9.75 14.447 9.75 15.2426V21.25L14.25 20V15.2426C14.25 14.447 14.5661 13.6839 15.1287 13.1213L19.3713 8.87868C19.9339 8.31607 20.25 7.55085 20.25 6.7552C20.25 5.09835 18.9069 3.75 17.25 3.75Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
