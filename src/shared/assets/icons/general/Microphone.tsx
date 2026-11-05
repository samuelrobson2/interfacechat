import type { CustomIconProps } from "@/shared/model/icon";

export const MicrophoneIcon = ({
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
      d="M12 19C15.0754 19 17.7186 17.1489 18.8759 14.5M12 19C8.92448 19 6.28136 17.1489 5.12402 14.5M12 19V21.25M12 15.75C9.65274 15.75 7.74995 13.8472 7.74995 11.5V7C7.74995 4.65279 9.65274 2.75 12 2.75C14.3472 2.75 16.25 4.65279 16.25 7V11.5C16.25 13.8472 14.3472 15.75 12 15.75Z"
      stroke="#1A1718"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
