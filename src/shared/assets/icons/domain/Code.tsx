import type { CustomIconProps } from "@/shared/model/icon";

export const CodeIcon = ({
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
        d="M28.3335 28.3333L36.6668 20L28.3335 11.6667M11.6668 11.6667L3.3335 20L11.6668 28.3333M23.3335 5L16.6668 35"
        stroke="#1A73E0" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
