import type { CustomIconProps } from "@/shared/model/icon";

export const MaximizeIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M2.18281 0.839574L4.43527 0.839666L4.43519 2.23063L2.21388 2.23053L2.21394 4.49647L0.82647 4.49647L0.826411 2.19597C0.82641 1.3183 1.30514 0.839573 2.18281 0.839574Z"
      fill="#7A7A7A"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M5.60175 6.94312L3.3493 6.94302L3.34937 5.55206L5.57069 5.55216L5.57063 3.28622L6.95809 3.28622L6.95815 5.58672C6.95815 6.46439 6.47942 6.94312 5.60175 6.94312Z"
      fill="#7A7A7A"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
