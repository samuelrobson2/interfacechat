import type { CustomIconProps } from "@/shared/model/icon";

export const HeartIcon = ({
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
      d="M12.0001 20.4141C11.7656 20.4141 11.5312 20.3366 11.3354 20.1816L5.03931 14.6852C3.35721 13.0031 3.35721 10.2841 5.03931 8.60206C6.72141 6.91996 9.44038 6.91996 11.1225 8.60206L12.0001 9.47974L12.8778 8.60206C14.5599 6.91996 17.2788 6.91996 18.9609 8.60206C20.643 10.2841 20.643 13.0031 18.9609 14.6852L12.6648 20.1816C12.469 20.3366 12.2346 20.4141 12.0001 20.4141Z"
      stroke="#1A1718"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
