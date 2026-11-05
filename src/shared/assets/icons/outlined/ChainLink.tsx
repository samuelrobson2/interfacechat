import type { CustomIconProps } from "@/shared/model/icon";

export const ChainLinkIcon = ({
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
      d="M9.99988 18.9999L9.82831 19.1715C8.26622 20.7336 5.73355 20.7336 4.17146 19.1715L3.82831 18.8283C2.26622 17.2662 2.26621 14.7336 3.82831 13.1715L7.17146 9.82831C8.73356 8.26621 11.2662 8.26621 12.8283 9.82831L13.1715 10.1715C13.8251 10.8251 14.2052 11.6486 14.3118 12.4999"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M9.68799 12.4999C9.79463 13.3511 10.1748 14.1747 10.8284 14.8283L11.1715 15.1715C12.7336 16.7336 15.2663 16.7336 16.8284 15.1715L20.1715 11.8283C21.7336 10.2662 21.7336 7.73355 20.1715 6.17146L19.8284 5.82831C18.2663 4.26621 15.7336 4.26621 14.1715 5.82831L14 5.99988"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
