import type { CustomIconProps } from "@/shared/model/icon";

export const FileFilledAccentIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 45 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M0 9.375C0 4.19733 4.19733 0 9.375 0H35.625C40.8027 0 45 4.19733 45 9.375V35.625C45 40.8027 40.8027 45 35.625 45H9.375C4.19733 45 0 40.8027 0 35.625V9.375ZM12.5 27.5C12.5 26.4645 13.3395 25.625 14.375 25.625H25.625C26.6605 25.625 27.5 26.4645 27.5 27.5C27.5 28.5355 26.6605 29.375 25.625 29.375H14.375C13.3395 29.375 12.5 28.5355 12.5 27.5ZM14.375 15.625C13.3395 15.625 12.5 16.4645 12.5 17.5C12.5 18.5355 13.3395 19.375 14.375 19.375H30.625C31.6605 19.375 32.5 18.5355 32.5 17.5C32.5 16.4645 31.6605 15.625 30.625 15.625H14.375Z"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeWidth="1"
      fill="#1A73E0"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
