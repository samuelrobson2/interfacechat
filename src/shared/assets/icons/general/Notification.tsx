import type { CustomIconProps } from "@/shared/model/icon";

export const NotificationIcon = ({
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
      d="M2.90691 6.25691C3.26518 3.71897 5.4372 1.83203 8.00029 1.83203C10.5634 1.83203 12.7354 3.71898 13.0937 6.25691L13.5118 9.21914C13.6818 10.423 12.7472 11.4987 11.5315 11.4987H4.46912C3.25336 11.4987 2.31882 10.423 2.48875 9.21914L2.90691 6.25691Z"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M10.6654 11.5C10.6654 12.9728 9.47146 14.1667 7.9987 14.1667C6.52594 14.1667 5.33203 12.9728 5.33203 11.5"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
