import type { CustomIconProps } from "@/shared/model/icon";

export const PlusBigIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M7.99935 2.66797V8.0013M7.99935 8.0013V13.3346M7.99935 8.0013H2.66602M7.99935 8.0013H13.3327"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
