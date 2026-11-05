import type { CustomIconProps } from "@/shared/model/icon";

export const LockIcon = ({
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
      d="M16.25 9.75H7.75M16.25 9.75C17.9069 9.75 19.25 11.0931 19.25 12.75V18.25C19.25 19.9069 17.9069 21.25 16.25 21.25H7.75C6.09315 21.25 4.75 19.9069 4.75 18.25V12.75C4.75 11.0931 6.09315 9.75 7.75 9.75M16.25 9.75V7.25C16.25 4.90279 14.3472 3 12 3C9.65279 3 7.75 4.90279 7.75 7.25V9.75M12 14V17"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
