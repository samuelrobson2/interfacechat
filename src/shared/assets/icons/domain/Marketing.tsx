import type { CustomIconProps } from "@/shared/model/icon";

export const MarketingIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
      <path
        d="M20.0002 26.6667V35M20.0002 26.6667L30.0002 35M20.0002 26.6667L10.0002 35M13.3335 11.6667V20M20.0002 15V20M26.6668 18.3333V20M36.6668 5H3.3335M5.00016 5H35.0002V18.6667C35.0002 21.4669 35.0002 22.8671 34.4552 23.9366C33.9758 24.8774 33.2109 25.6423 32.2701 26.1217C31.2006 26.6667 29.8004 26.6667 27.0002 26.6667H13.0002C10.1999 26.6667 8.79977 26.6667 7.73021 26.1217C6.7894 25.6423 6.0245 24.8774 5.54513 23.9366C5.00016 22.8671 5.00016 21.4669 5.00016 18.6667V5Z"
        stroke="#1A73E0" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
