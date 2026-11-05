import type { CustomIconProps } from "@/shared/model/icon";

export const ReplayIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="28"
    height="26"
    viewBox="0 0 28 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M6.80412 21.1839C11.1977 26.0309 18.579 26.2961 23.2905 21.7762C28.0021 17.2563 28.2599 9.66302 23.8663 4.81605C19.4726 -0.0309168 12.0914 -0.296081 7.37984 4.22379C4.69988 6.7947 3.46089 10.36 3.69923 13.8486M1 12.1429L3.83294 15.1992L6.87098 12.1429"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
