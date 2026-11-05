import type { CustomIconProps } from "@/shared/model/icon";

export const MedicalIcon = ({
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
      d="M21 3L19 5M19 5L16.6479 4.41196C15.6255 4.15638 14.5441 4.45593 13.7989 5.20107L5 14M19 5L19.588 7.35214C19.8436 8.37447 19.5441 9.45593 18.7989 10.2011L10 19M5 14L10 19M5 14L4 13M10 19L11 20M4 17L7 20M13 6L15 8M11 8L13 10M9 10L11 12"
      stroke="#342E29"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
