import type { CustomIconProps } from "@/shared/model/icon";

export const GoBackwards15Icon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="26"
    height="28"
    viewBox="0 0 26 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M11 19V12L9 13.3125"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
    />
    <path
      d="M14 18.5627C14.3134 18.8373 14.7029 19 15.125 19C16.1605 19 17 18.0206 17 16.8125C17 15.6044 16.1605 14.625 15.125 14.625C14.7029 14.625 14.3134 14.7877 14 15.0623L14.375 12H17"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
    />
    <path
      d="M4.81605 6.80412C-0.0309168 11.1977 -0.296082 18.579 4.22379 23.2905C8.74366 28.0021 16.337 28.2599 21.1839 23.8663C26.0309 19.4726 26.2961 12.0914 21.7762 7.37984C19.2053 4.69988 15.64 3.46089 12.1514 3.69923M13.8571 1L10.8008 3.83294L13.8571 6.87098"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
