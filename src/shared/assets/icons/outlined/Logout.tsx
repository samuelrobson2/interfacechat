import type { CustomIconProps } from "@/shared/model/icon";

export const LogoutIcon = ({
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
      d="M20.25 12L9 12M20.25 12L15.75 16.5M20.25 12L15.75 7.5M11.25 20.25H6.75C5.09315 20.25 3.75 18.9069 3.75 17.25L3.75 6.75C3.75 5.09315 5.09315 3.75 6.75 3.75L11.25 3.75"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
