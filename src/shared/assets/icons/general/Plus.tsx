import type { CustomIconProps } from "@/shared/model/icon";

export const PlusIcon = ({
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
      d="M12.0001 5.98438V12.0001M12.0001 12.0001V18.0159M12.0001 12.0001H5.98438M12.0001 12.0001H18.0159"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
