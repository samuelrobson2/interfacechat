import type { CustomIconProps } from "@/shared/model/icon";

// Design-system export (Visualize/Entry/Input · Icon/Outlined/attachment): a
// 20x20 canvas at 1.75 stroke, which is what gives it its weight at composer
// size. The stroke colour is gray-3 by default — override with `pathClasses`.
export const AttachmentIcon = ({
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
      d="M4.79166 8.95842V12.7084C4.79166 15.4698 7.03023 17.7084 9.79166 17.7084H10.2083C12.9697 17.7084 15.2083 15.4698 15.2083 12.7084V5.83341C15.2083 3.87741 13.6227 2.29175 11.6667 2.29175C9.71065 2.29175 8.12499 3.87741 8.12499 5.83341V12.3959C8.12499 13.3739 8.91782 14.1667 9.89582 14.1667C10.8738 14.1667 11.6667 13.3739 11.6667 12.3959V6.45841"
      stroke="#7A7A7A"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
