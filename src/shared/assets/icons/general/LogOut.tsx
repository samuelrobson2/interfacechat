import type { CustomIconProps } from "@/shared/model/icon";

export const LogOutIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <g clipPath="url(#clip0_14646_30387)">
      <path
        d="M13.1314 15.5385H4.35593V4.46189H13.1314C13.5749 4.46189 13.9344 4.10241 13.9344 3.65892C13.9344 3.21544 13.5749 2.85596 13.1314 2.85596H4.35593C3.46896 2.85596 2.75 3.57492 2.75 4.46189V15.5385C2.75 16.4254 3.46896 17.1444 4.35593 17.1444H13.1314C13.5749 17.1444 13.9344 16.7849 13.9344 16.3414C13.9344 15.898 13.5749 15.5385 13.1314 15.5385Z"
        fill="#1A1718"
        className={pathClasses}
        {...pathProps}
      />
      <path
        d="M7.4502 10.0005H16.4474"
        stroke="#1A1718"
        strokeWidth="1.60593"
        strokeLinecap="round"
        className={pathClasses}
        {...pathProps}
      />
      <path
        d="M16.4475 10.0002L13.6899 7.24268"
        stroke="#1A1718"
        strokeWidth="1.60593"
        strokeLinecap="round"
        className={pathClasses}
        {...pathProps}
      />
      <path
        d="M16.4475 10.0005L13.6899 12.7581"
        stroke="#1A1718"
        strokeWidth="1.60593"
        strokeLinecap="round"
        className={pathClasses}
        {...pathProps}
      />
    </g>
    <defs>
      <clipPath id="clip0_14646_30387">
        <rect
          width="14.5"
          height="14.2884"
          fill="white"
          transform="translate(2.75 2.85596)"
        />
      </clipPath>
    </defs>
  </svg>
);
