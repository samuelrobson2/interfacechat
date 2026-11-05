import type { CustomIconProps } from "@/shared/model/icon";

export const SendIcon = ({
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
      d="M5.9998 12H9.2498M5.9998 12L3.4542 5.63604C2.94331 4.3588 4.27766 3.12491 5.51109 3.73401L19.5263 10.6551C20.6407 11.2054 20.6407 12.7946 19.5263 13.345L5.51109 20.2661C4.27766 20.8752 2.94331 19.6413 3.4542 18.364L5.9998 12Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
