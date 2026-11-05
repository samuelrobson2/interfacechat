import type { CustomIconProps } from "@/shared/model/icon";

export const CircleOneFilledIcon = ({
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
      d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12.2373 7.28809C11.9312 7.18604 11.5941 7.29178 11.4004 7.5498L9.15039 10.5498C8.90194 10.8811 8.9687 11.351 9.2998 11.5996C9.63107 11.8481 10.101 11.7813 10.3496 11.4502L11.25 10.249V16.25C11.25 16.6642 11.5858 17 12 17C12.4142 17 12.75 16.6642 12.75 16.25V8C12.75 7.67718 12.5436 7.39017 12.2373 7.28809Z"
      fill="#342E29"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
