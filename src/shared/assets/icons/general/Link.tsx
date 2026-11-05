import type { CustomIconProps } from "@/shared/model/icon";

// Design-system export (Visualize/Entry/Input · Icon/Outlined/chain-link),
// drawn on a 16x16 canvas at 1.5 stroke. This replaces an earlier hand-crop of
// a 32x32 drop-shadow artboard, which had to fake its viewBox to fill the frame.
export const LinkIcon = ({
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
      d="M6.66667 12.6667L6.55229 12.7811C5.51089 13.8224 3.82245 13.8224 2.78105 12.7811L2.55229 12.5523C1.51089 11.5109 1.51089 9.82245 2.55229 8.78105L4.78105 6.55229C5.82245 5.51089 7.51089 5.51089 8.55229 6.55229L8.78105 6.78105C9.2168 7.2168 9.47022 7.76582 9.54131 8.33333"
      stroke="#1A1718"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M6.45865 8.33325C6.52974 8.90076 6.78316 9.44979 7.21891 9.88554L7.44767 10.1143C8.48907 11.1557 10.1775 11.1557 11.2189 10.1143L13.4477 7.88554C14.4891 6.84414 14.4891 5.1557 13.4477 4.1143L13.2189 3.88554C12.1775 2.84414 10.4891 2.84414 9.44767 3.88554L9.33332 3.99992"
      stroke="#1A1718"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
