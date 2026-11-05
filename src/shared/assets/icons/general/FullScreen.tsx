import type { CustomIconProps } from "@/shared/model/icon";

export const FullScreenIcon = ({
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
    <path
      d="M8.00146 3.08203H5.54175H3.30078C3.17997 3.08203 3.08203 3.17997 3.08203 3.30078V5.54175V8.00146M12.9209 8.00146V10.4612V12.7021C12.9209 12.823 12.823 12.9209 12.7021 12.9209H10.4612H8.00146"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
