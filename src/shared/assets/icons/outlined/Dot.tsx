import type { ComponentProps } from "react";

export const DotIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: {
  svgClasses?: string;
  pathClasses?: string;
  pathProps?: ComponentProps<"circle">;
} & ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="6"
    viewBox="0 0 6 6"
    fill="none"
    className={svgClasses}
    {...svgProps}
  >
    <circle
      cx="3"
      cy="3"
      r="3"
      fill="#342E29"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
