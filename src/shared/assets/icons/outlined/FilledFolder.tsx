import type { CustomIconProps } from "@/shared/model/icon";

export const FilledFolderIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="8"
    height="7"
    fill="none"
    viewBox="0 0 8 7"
    className={svgClasses}
    {...svgProps}
  >
    <path
      fill="#7A7A7A"
      d="M3.2 0H.8C.36 0 .004.36.004.8L0 5.6c0 .44.36.8.8.8h6.4c.44 0 .8-.36.8-.8v-4c0-.44-.36-.8-.8-.8H4z"
      className={pathClasses}
      {...pathProps}
    ></path>
  </svg>
);
