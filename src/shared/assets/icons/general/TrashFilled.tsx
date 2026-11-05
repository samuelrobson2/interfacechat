import type { CustomIconProps } from "@/shared/model/icon";

export const TrashFilledIcon = ({
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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.58393 5C8.28068 3.24301 9.99487 2 12.0009 2C14.007 2 15.7212 3.24301 16.4179 5H21.25C21.6642 5 22 5.33579 22 5.75C22 6.16421 21.6642 6.5 21.25 6.5H19.9532L19.1795 18.4914C19.0522 20.4647 17.4146 22 15.4373 22H8.56269C6.58535 22 4.94777 20.4647 4.82047 18.4914L4.04683 6.5H2.75C2.33579 6.5 2 6.16421 2 5.75C2 5.33579 2.33579 5 2.75 5H7.58393ZM9.26161 5C9.83935 4.09775 10.8509 3.5 12.0009 3.5C13.151 3.5 14.1625 4.09775 14.7403 5H9.26161ZM10.5 10.75C10.5 10.3358 10.1642 10 9.75 10C9.33579 10 9 10.3358 9 10.75V16.25C9 16.6642 9.33579 17 9.75 17C10.1642 17 10.5 16.6642 10.5 16.25V10.75ZM14.25 10C14.6642 10 15 10.3358 15 10.75V16.25C15 16.6642 14.6642 17 14.25 17C13.8358 17 13.5 16.6642 13.5 16.25V10.75C13.5 10.3358 13.8358 10 14.25 10Z"
      fill="#342E29"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
