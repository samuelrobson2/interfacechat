import type { CustomIconProps } from "@/shared/model/icon";

export const AutoInterfaceIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M5.125 3.625H14.875C16.1176 3.625 17.125 4.63236 17.125 5.875V14.125C17.125 15.3676 16.1176 16.375 14.875 16.375H5.125C3.88236 16.375 2.875 15.3676 2.875 14.125V5.875C2.875 4.63236 3.88236 3.625 5.125 3.625Z"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M2.875 7.5H17.125"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M9.6665 11.0498L10.4248 12.6748L12.0498 13.4331L10.4248 14.1914L9.6665 15.8164L8.9082 14.1914L7.2832 13.4331L8.9082 12.6748L9.6665 11.0498Z"
      fill="#1A1718"
      stroke="#1A1718"
      strokeWidth="0.5"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
