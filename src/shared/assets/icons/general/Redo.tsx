import type { CustomIconProps } from "@/shared/model/icon";

export const RedoIcon = ({
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
      d="M10 9.33464L13.3333 6.0013L10 2.66797"
      stroke="#7A7A7A"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M13.3327 6H6.33268C5.36022 6 4.42759 6.38631 3.73996 7.07394C3.05232 7.76157 2.66602 8.69421 2.66602 9.66667C2.66602 10.1482 2.76086 10.625 2.94512 11.0698C3.12939 11.5147 3.39948 11.9189 3.73996 12.2594C4.42759 12.947 5.36022 13.3333 6.33268 13.3333H8.66602"
      stroke="#7A7A7A"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
