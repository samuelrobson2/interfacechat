import type { CustomIconProps } from "@/shared/model/icon";

export const PanelFilledIcon = ({
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
      d="M5.75 20C3.67893 20 2 18.3211 2 16.25V7.75C2 5.67893 3.67893 4 5.75 4H18.25C20.3211 4 22 5.67893 22 7.75V16.25C22 18.3211 20.3211 20 18.25 20H5.75ZM3.5 7.75C3.5 6.50736 4.50736 5.5 5.75 5.5H9.5V18.5H5.75C4.50736 18.5 3.5 17.4926 3.5 16.25V7.75Z"
      fillRule="evenodd"
      clipRule="evenodd"
      fill="#342E29"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
