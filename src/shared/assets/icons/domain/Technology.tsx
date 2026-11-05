import type { CustomIconProps } from "@/shared/model/icon";

export const TechnologyIcon = ({
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
        d="M10 18H6C4.34315 18 3 16.6569 3 15V6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V8M10 18V21M10 18H12M10 21H14M10 21H9M14 21H15M14 21V20M21 8V17C21 18.6569 19.6569 20 18 20H15C13.3431 20 12 18.6569 12 17V8C12 6.34315 13.3431 5 15 5H18C19.6569 5 21 6.34315 21 8ZM16.51 8H16.5"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
