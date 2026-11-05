import type { CustomIconProps } from "@/shared/model/icon";

export const AlertIcon = ({
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
      d="M12.0001 8.74986V12.7499M12.0001 15.4999V15.4899M9.44859 4.37571L3.08117 14.672C1.84519 16.6706 3.28277 19.2499 5.63269 19.2499H18.3675C20.7174 19.2499 22.155 16.6706 20.919 14.672L14.5516 4.3757C13.379 2.47958 10.6212 2.47958 9.44859 4.37571ZM12.2501 15.4999C12.2501 15.6379 12.1382 15.7499 12.0001 15.7499C11.862 15.7499 11.7501 15.6379 11.7501 15.4999C11.7501 15.3618 11.862 15.2499 12.0001 15.2499C12.1382 15.2499 12.2501 15.3618 12.2501 15.4999Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
