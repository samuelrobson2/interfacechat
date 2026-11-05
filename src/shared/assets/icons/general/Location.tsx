import type { CustomIconProps } from "@/shared/model/icon";

export const LocationIcon = ({
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
    <g clipPath="url(#clip0_15486_58145)">
      <path
        d="M1.33325 8H3.33325"
        stroke="#1A1718"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
      <path
        d="M12.6667 8H14.6667"
        stroke="#1A1718"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
      <path
        d="M8 1.3335V3.3335"
        stroke="#1A1718"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
      <path
        d="M8 12.6665V14.6665"
        stroke="#1A1718"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
      <path
        d="M7.99992 12.6668C10.5772 12.6668 12.6666 10.5775 12.6666 8.00016C12.6666 5.42283 10.5772 3.3335 7.99992 3.3335C5.42259 3.3335 3.33325 5.42283 3.33325 8.00016C3.33325 10.5775 5.42259 12.6668 7.99992 12.6668Z"
        stroke="#1A1718"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
      <path
        d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
        stroke="#1A1718"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
    </g>
    <defs>
      <clipPath id="clip0_15486_58145">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
