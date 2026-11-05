import type { CustomIconProps } from "@/shared/model/icon";

export const SendFilledIcon = ({
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
      d="M2.75821 5.91475C1.99187 3.9989 3.9934 2.14806 5.84354 3.06171L19.8587 9.98279C21.5304 10.8083 21.5304 13.1921 19.8587 14.0176L5.84354 20.9387C3.9934 21.8524 1.99186 20.0015 2.75821 18.0857L4.89248 12.75H9.25018C9.66439 12.75 10.0002 12.4142 10.0002 12C10.0002 11.5858 9.66439 11.25 9.25018 11.25H4.89231L2.75821 5.91475Z"
      fill="#342E29"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
