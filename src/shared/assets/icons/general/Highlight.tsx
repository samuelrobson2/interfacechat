import type { CustomIconProps } from "@/shared/model/icon";

export const HighlightIcon = ({
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
      d="M12.4131 9.0542C13.0154 8.22552 14.1773 8.04508 15.002 8.65283C15.8228 9.25805 15.9971 10.4142 15.3916 11.2349L9.83301 18.7681C9.22642 19.5898 6.75648 21.2936 5.95215 20.6646C5.18457 20.063 6.33582 17.4154 6.90918 16.6265L12.4131 9.0542ZM15.4463 4.91064C16.0537 4.08746 17.2137 3.91188 18.0371 4.51904C18.8605 5.12625 19.0356 6.28629 18.4287 7.10986L18.3076 7.27393C17.7004 8.09744 16.5404 8.27349 15.7168 7.6665C14.8932 7.05922 14.7179 5.89833 15.3252 5.07471L15.4463 4.91064Z"
      fill="#1A1718"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
