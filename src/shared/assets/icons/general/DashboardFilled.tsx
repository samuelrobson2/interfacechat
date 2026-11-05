import type { CustomIconProps } from "@/shared/model/icon";

export const DashboardFilledIcon = ({
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
      d="M13.75 17C13.75 15.2051 15.2051 13.75 17 13.75C18.7949 13.75 20.25 15.2051 20.25 17C20.25 18.7949 18.7949 20.25 17 20.25C15.2051 20.25 13.75 18.7949 13.75 17Z"
      fill="#1A1718"
      stroke="#1A1718"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M13.75 7.25C13.75 5.45507 15.2051 4 17 4C18.7949 4 20.25 5.45507 20.25 7.25C20.25 9.04493 18.7949 10.5 17 10.5C15.2051 10.5 13.75 9.04493 13.75 7.25Z"
      fill="#1A1718"
      stroke="#1A1718"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M4 7.25C4 5.45507 5.45507 4 7.25 4C9.04493 4 10.5 5.45507 10.5 7.25C10.5 9.04493 9.04493 10.5 7.25 10.5C5.45507 10.5 4 9.04493 4 7.25Z"
      fill="#1A1718"
      stroke="#1A1718"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M4 17C4 15.2051 5.45507 13.75 7.25 13.75C9.04493 13.75 10.5 15.2051 10.5 17C10.5 18.7949 9.04493 20.25 7.25 20.25C5.45507 20.25 4 18.7949 4 17Z"
      fill="#1A1718"
      stroke="#1A1718"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
