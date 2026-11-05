import type { CustomIconProps } from "@/shared/model/icon";

export const PersonalFinanceIcon = ({
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
        d="M11 6C11 4.61929 9.20914 3.5 7 3.5C4.79086 3.5 3 4.61929 3 6M11 6C11 7.38071 9.20914 8.5 7 8.5C4.79086 8.5 3 7.38071 3 6M11 6V18C11 19.3807 9.20914 20.5 7 20.5C4.79086 20.5 3 19.3807 3 18V6M11 10C11 11.3807 9.20914 12.5 7 12.5C4.79086 12.5 3 11.3807 3 10M11 14.5C11 15.8807 9.20914 17 7 17C4.79086 17 3 15.8807 3 14.5M21 15C21 13.6193 19.2091 12.5 17 12.5C14.7909 12.5 13 13.6193 13 15M21 15C21 16.3807 19.2091 17.5 17 17.5C14.7909 17.5 13 16.3807 13 15M21 15V18C21 19.3807 19.2091 20.5 17 20.5C14.7909 20.5 13 19.3807 13 18V15"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
