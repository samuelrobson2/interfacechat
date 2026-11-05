import type { CustomIconProps } from "@/shared/model/icon";

export const BeautyIcon = ({
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
        d="M21 16L7.79198 9M21 8L7.79198 15M8 8C8 9.38071 6.88071 10.5 5.5 10.5C4.11929 10.5 3 9.38071 3 8C3 6.61929 4.11929 5.5 5.5 5.5C6.88071 5.5 8 6.61929 8 8ZM8 16C8 17.3807 6.88071 18.5 5.5 18.5C4.11929 18.5 3 17.3807 3 16C3 14.6193 4.11929 13.5 5.5 13.5C6.88071 13.5 8 14.6193 8 16Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
