import type { CustomIconProps } from "@/shared/model/icon";

export const CloseIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M5.52109 1.17139C5.82139 0.871089 6.30868 0.871089 6.60898 1.17139C6.90886 1.47166 6.90898 1.95811 6.60898 2.2583L4.97714 3.88916L6.60898 5.52198C6.90904 5.82223 6.90904 6.30863 6.60898 6.60889C6.30868 6.90919 5.82139 6.90919 5.52109 6.60889L3.88925 4.97705L2.25742 6.60889C1.95711 6.90912 1.47078 6.90917 1.1705 6.60889C0.87035 6.3086 0.870314 5.82224 1.1705 5.52198L2.80234 3.89014L1.1705 2.2583C0.870272 1.958 0.870225 1.47069 1.1705 1.17041C1.4708 0.870315 1.95815 0.870242 2.25839 1.17041L3.88925 2.80225L5.52109 1.17139Z"
      fill="#7A7A7A"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
