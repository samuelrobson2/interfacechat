import type { CustomIconProps } from "@/shared/model/icon";

export const ChatBubbleIcon = ({
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
      d="M13.4424 10V2C13.4424 1.87901 13.3564 1.778 13.2422 1.75488L13.1924 1.75V0C14.2969 5.15387e-05 15.1924 0.895462 15.1924 2V10C15.1924 11.1045 14.2969 11.9999 13.1924 12H9.23633L6.24219 14.9873C5.00128 16.2254 2.88277 15.3467 2.88281 13.5938V12H2C0.895431 12 0 11.1046 0 10V2C1.28853e-07 0.895433 0.895428 0 2 0V1.75C1.86193 1.75 1.75 1.86193 1.75 2V10C1.75 10.1381 1.86193 10.25 2 10.25H4.63281V13.5938C4.63281 13.7641 4.81279 13.8598 4.9502 13.7891L5.00586 13.749L8.46777 10.2949C8.48148 10.2812 8.49178 10.2653 8.50098 10.25H13.1924L13.2422 10.2451C13.34 10.2253 13.4174 10.1484 13.4375 10.0508L13.4424 10ZM13.1924 0V1.75H2V0H13.1924Z"
      fill="#1A1718"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
