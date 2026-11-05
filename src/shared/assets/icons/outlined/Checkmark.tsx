import type { CustomIconProps } from "@/shared/model/icon";

export const CheckmarkIcon = ({
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
      d="M4.75 12.7768L9.12626 18.1727C9.55615 18.7027 10.379 18.656 10.746 18.0806L19.25 4.75"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
