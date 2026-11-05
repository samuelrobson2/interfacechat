import type { CustomIconProps } from "@/shared/model/icon";

export const MinimizeIcon = ({ svgClasses, ...svgProps }: CustomIconProps) => (
  <svg
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <rect
      x="0.429688"
      y="3.12109"
      width="6.92074"
      height="1.53794"
      rx="0.768971"
      fill="#7A7A7A"
      fillOpacity="0.1"
    />
  </svg>
);
