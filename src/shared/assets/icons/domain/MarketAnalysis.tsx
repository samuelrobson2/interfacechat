import type { CustomIconProps } from "@/shared/model/icon";

export const MarketAnalysisIcon = ({
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
        d="M17.5 9L14 12.5C13.1716 13.3284 11.8284 13.3284 11 12.5C10.1716 11.6716 8.82844 11.6716 8.00001 12.5L6.5 14M17.5 9H14.5M17.5 9V12M6 21H18C19.6569 21 21 19.6569 21 18V6C21 4.34315 19.6569 3 18 3H6C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
