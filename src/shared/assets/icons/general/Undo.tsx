import type { CustomIconProps } from "@/shared/model/icon";

export const UndoIcon = ({
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
      d="M5.99935 9.33464L2.66602 6.0013L5.99935 2.66797"
      stroke="#7A7A7A"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M2.66602 6H9.66602C10.1475 6 10.6243 6.09484 11.0692 6.27911C11.514 6.46338 11.9183 6.73346 12.2587 7.07394C12.5992 7.41442 12.8693 7.81863 13.0536 8.26349C13.2378 8.70835 13.3327 9.18515 13.3327 9.66667C13.3327 10.1482 13.2378 10.625 13.0536 11.0698C12.8693 11.5147 12.5992 11.9189 12.2587 12.2594C11.9183 12.5999 11.514 12.87 11.0692 13.0542C10.6243 13.2385 10.1475 13.3333 9.66602 13.3333H7.33268"
      stroke="#7A7A7A"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
