import type { CustomIconProps } from "@/shared/model/icon";

export const DownloadIconNormal = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M14.25 9.66667V11.75C14.25 13.1307 13.1307 14.25 11.75 14.25H3C1.61929 14.25 0.5 13.1307 0.5 11.75V9.66667M7.37499 9.875V0.5M10.2917 6.95833L7.37499 9.875L4.45833 6.95833"
      stroke="#1A1718"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
