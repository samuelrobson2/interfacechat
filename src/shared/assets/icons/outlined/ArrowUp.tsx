import type { CustomIconProps } from "@/shared/model/icon";

// Design-system export (Visualize/Entry/Input · AI/Button/Outlined/arrow-up):
// a 16x16 canvas at 1.5 stroke. The previous copy was drawn at 24x24 with a
// 1-weight stroke, which rendered as a ~0.7px hairline everywhere it's used at
// icon size — noticeably lighter than the design.
export const ArrowUpIcon = ({
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
      d="M3.83331 6.66667L7.99997 2.5L12.1666 6.66667M7.99997 13.5V3"
      stroke="#1A1718"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
