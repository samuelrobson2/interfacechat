import type { CustomIconProps } from "@/shared/model/icon";

export const SizeBigIcon = ({
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
      d="M12 4L9 7M12 4L15 7M12 4V12M12 20L9 17M12 20L15 17M12 20V12M12 12H4M12 12L20 12M20 12L17 9M20 12L17 15M4 12L7 9M4 12L7 15"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
