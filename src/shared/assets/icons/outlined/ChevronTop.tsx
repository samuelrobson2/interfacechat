import type { CustomIconProps } from "@/shared/model/icon";

export const ChevronTopIcon = ({
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
      d="M4 14.9998L11.2929 7.70696C11.6834 7.31643 12.3166 7.31643 12.7071 7.70695L20 14.9998"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
