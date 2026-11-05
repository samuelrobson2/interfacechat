import type { CustomIconProps } from "@/shared/model/icon";

export const AutoScientistIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M12.9 8.7C14.8 7.1 15.9 5.2 15.3 4.5C14.7 3.8 12.6 4.5 10.7 6.1C8.8 7.7 7.7 9.6 8.3 10.3C8.9 11 11 10.3 12.9 8.7Z"
      stroke="#7A7A7A"
      strokeWidth="1"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M15.3 10.3C15.9 9.6 14.8 7.7 12.9 6.1C11 4.5 8.9 3.8 8.3 4.5C7.7 5.2 8.8 7.1 10.7 8.7C12.6 10.3 14.7 11 15.3 10.3Z"
      stroke="#7A7A7A"
      strokeWidth="1"
      className={pathClasses}
      {...pathProps}
    />
    <circle cx="11.85" cy="7.5" r="0.6" fill="#7A7A7A" className={pathClasses} />
  </svg>
);
