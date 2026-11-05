import type { CustomIconProps } from "@/shared/model/icon";

export const TeamsIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M5.00024 9.99995H7.70858M5.00024 9.99995L2.87891 4.69662C2.45316 3.63225 3.56512 2.60401 4.59298 3.11159L16.2723 8.87916C17.201 9.33778 17.201 10.6621 16.2723 11.1207L4.59298 16.8883C3.56513 17.3959 2.45316 16.3677 2.87891 15.3033L5.00024 9.99995Z"
      stroke="#1A1718"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
