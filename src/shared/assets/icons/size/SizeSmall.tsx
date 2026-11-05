import type { CustomIconProps } from "@/shared/model/icon";

export const SizeSmallIcon = ({
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
      d="M10.5856 13.414H6.34292M10.5856 13.414V17.6566M10.5856 13.414L4.92871 19.0708M13.414 10.5856V6.34292M13.414 10.5856H17.6566M13.414 10.5856L19.0708 4.92871"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
