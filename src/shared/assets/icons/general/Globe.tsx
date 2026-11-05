import type { CustomIconProps } from "@/shared/model/icon";

export const GlobeIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M6.91667 13.0833C10.3224 13.0833 13.0833 10.3224 13.0833 6.91667C13.0833 3.51091 10.3224 0.75 6.91667 0.75M6.91667 13.0833C3.51091 13.0833 0.75 10.3224 0.75 6.91667C0.75 3.51091 3.51091 0.75 6.91667 0.75M6.91667 13.0833C5.35186 13.0833 4.08333 10.3224 4.08333 6.91667C4.08333 3.51091 5.35186 0.75 6.91667 0.75M6.91667 13.0833C8.48147 13.0833 9.75 10.3224 9.75 6.91667C9.75 3.51091 8.48147 0.75 6.91667 0.75M12.9167 6.91667H0.916667"
      stroke="#1A1718"
      strokeWidth="1.5"
      strokeLinecap="square"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
