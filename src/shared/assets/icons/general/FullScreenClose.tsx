import type { CustomIconProps } from "@/shared/model/icon";

export const FullScreenCloseIcon = ({
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
      d="M2.08203 7.00146H4.54175H6.78271C6.90353 7.00146 7.00146 6.90353 7.00146 6.78271V4.54175V2.08203M9.00146 13.9209V11.4612V9.22021C9.00146 9.0994 9.0994 9.00146 9.22021 9.00146H11.4612H13.9209"
      stroke="#46A5D8"
      strokeWidth="1.75"
      strokeLinecap="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
