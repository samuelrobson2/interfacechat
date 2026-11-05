import type { CustomIconProps } from "@/shared/model/icon";

export const StopIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
    className={svgClasses}
    {...svgProps}
  >
    <path
      fill="#1A1718"
      stroke="#1A1718"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.102 2.5H6.898c-.684 0-1.223 0-1.657.035-.443.037-.813.112-1.148.283-.55.28-.995.726-1.275 1.275-.171.335-.246.705-.283 1.148-.035.434-.035.973-.035 1.657v6.204c0 .684 0 1.223.035 1.657.037.443.112.813.283 1.149.28.548.726.995 1.275 1.274.335.171.705.246 1.148.283.434.035.973.035 1.657.035h6.204c.684 0 1.223 0 1.657-.035.443-.037.813-.112 1.149-.283.548-.28.995-.726 1.274-1.274.171-.336.246-.706.283-1.149.035-.434.035-.973.035-1.657V6.898c0-.684 0-1.223-.035-1.657-.037-.443-.112-.813-.283-1.148a2.9 2.9 0 0 0-1.274-1.275c-.336-.171-.706-.246-1.149-.283-.434-.035-.973-.035-1.657-.035"
      className={pathClasses}
      {...pathProps}
    ></path>
  </svg>
);
