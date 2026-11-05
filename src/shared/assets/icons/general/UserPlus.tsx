import type { CustomIconProps } from "@/shared/model/icon";

export const UserPlusIcon = ({
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
      d="M11.8525 13.2513C8.94419 13.3017 6.65393 14.8422 5.43352 17.1121C4.59642 18.6691 6.02766 20.25 7.79543 20.25H12.5002M11.8525 13.2513C11.9016 13.2504 11.9508 13.25 12.0002 13.25C12.3523 13.25 12.6955 13.2717 13.0292 13.3138M11.8525 13.2513C11.2024 13.2626 10.5836 13.3483 10.0003 13.5M13.0292 13.3138C13.3628 13.3559 13.6869 13.4184 14.0006 13.5M13.0292 13.3138C13.7311 13.4024 14.3905 13.5812 15.0002 13.838M18.2502 15.25V18.25M18.2502 18.25V21.25M18.2502 18.25H15.2502M18.2502 18.25H21.2502M15.7502 6.5C15.7502 8.57107 14.0712 10.25 12.0002 10.25C9.92911 10.25 8.25017 8.57107 8.25017 6.5C8.25017 4.42893 9.92911 2.75 12.0002 2.75C14.0712 2.75 15.7502 4.42893 15.7502 6.5Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
