import type { CustomIconProps } from "@/shared/model/icon";

export const EntertainmentIcon = ({
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
        d="M9 15.256V17.256C9 18.9128 7.65685 20.256 6 20.256H5.5C4.11929 20.256 3 19.1367 3 17.756C3 16.3752 4.11929 15.256 5.5 15.256H9ZM9 15.256V8.25596M9 8.25596V4.25596C11 2.78011 19 5.25592 21 4.75592V8.75589M9 8.25596C11 6.78011 19 9.25589 21 8.75589M21 8.75589V14.2559M21 14.2559V16.2559C21 17.9128 19.6569 19.2559 18 19.2559H17.5C16.1193 19.2559 15 18.1366 15 16.7559C15 15.3752 16.1193 14.2559 17.5 14.2559H21Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
