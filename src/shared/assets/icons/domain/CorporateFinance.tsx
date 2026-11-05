import type { CustomIconProps } from "@/shared/model/icon";

export const CorporateFinanceIcon = ({
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
        d="M8 8H16M8 12H16M8 16H11M14 16H16M9.49642 20.427L10.8182 20.9935C11.5729 21.317 12.4271 21.317 13.1818 20.9935L14.5036 20.427C15.1054 20.1691 15.8036 20.3036 16.2666 20.7666C17.2753 21.7753 19 21.0609 19 19.6343V6C19 4.34315 17.6569 3 16 3H8C6.34315 3 5 4.34315 5 6V19.6343C5 21.0609 6.72473 21.7753 7.73344 20.7666C8.19642 20.3036 8.89462 20.1691 9.49642 20.427Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
