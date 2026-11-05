import type { CustomIconProps } from "@/shared/model/icon";

export const FlashFilledIcon = ({
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
      d="M13.9992 2.35586C13.9992 1.12924 12.4165 0.636431 11.7202 1.64619L3.17236 14.0405C2.60048 14.8697 3.19407 16.0002 4.20137 16.0002H9.99917V21.6445C9.99917 22.8711 11.5818 23.3639 12.2782 22.3541L20.826 9.95983C21.3979 9.1306 20.8043 8.00016 19.797 8.00016H13.9992V2.35586Z"
      fill="#342E29"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
