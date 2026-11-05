import type { CustomIconProps } from "@/shared/model/icon";

export const ProductAdviceIcon = ({
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
        d="M6.75 18.5V11.5C6.75 10.6716 6.07843 10 5.25 10C4.42157 10 3.75 10.6716 3.75 11.5V18.5C3.75 19.3284 4.42157 20 5.25 20C6.07843 20 6.75 19.3284 6.75 18.5Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
