import type { CustomIconProps } from "@/shared/model/icon";

export const NoteIcon = ({
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
      d="M15.25 4.75H16.25C17.9069 4.75 19.25 6.09315 19.25 7.75V18.25C19.25 19.9069 17.9069 21.25 16.25 21.25H7.75C6.09315 21.25 4.75 19.9069 4.75 18.25V7.75C4.75 6.09315 6.09315 4.75 7.75 4.75H8.75M9.75 7.25H14.25C14.8023 7.25 15.25 6.80228 15.25 6.25V5.75C15.25 4.09315 13.9069 2.75 12.25 2.75H11.75C10.0931 2.75 8.75 4.09315 8.75 5.75V6.25C8.75 6.80228 9.19772 7.25 9.75 7.25Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="square"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
