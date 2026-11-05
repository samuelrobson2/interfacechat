import type { CustomIconProps } from "@/shared/model/icon";

export const UserIcon = ({
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
      d="M15.7502 6.5C15.7502 8.57107 14.0712 10.25 12.0002 10.25C9.92911 10.25 8.25017 8.57107 8.25017 6.5C8.25017 4.42893 9.92911 2.75 12.0002 2.75C14.0712 2.75 15.7502 4.42893 15.7502 6.5Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M12.0002 13.25C9.02172 13.25 6.67451 14.8039 5.43352 17.1121C4.59642 18.6691 6.02766 20.25 7.79543 20.25H16.2049C17.9727 20.25 19.4039 18.6691 18.5668 17.1121C17.3258 14.8039 14.9786 13.25 12.0002 13.25Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
