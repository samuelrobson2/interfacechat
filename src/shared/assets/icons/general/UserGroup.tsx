import type { CustomIconProps } from "@/shared/model/icon";

export const UserGroupIcon = ({
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
      d="M15.0001 2.75C16.9331 2.75 18.5001 4.317 18.5001 6.25C18.5001 8.183 16.9331 9.75 15.0001 9.75M18.2501 13.5088C20.328 14.2448 21.9721 15.9725 22.7535 17.8167C23.2922 19.088 22.1308 20.25 20.7501 20.25M9.25008 9.75C7.31709 9.75 5.75008 8.183 5.75008 6.25C5.75008 4.317 7.31709 2.75 9.25008 2.75C11.1831 2.75 12.7501 4.317 12.7501 6.25C12.7501 8.183 11.1831 9.75 9.25008 9.75ZM1.67191 17.3204C2.93722 14.6844 5.85402 12.75 9.25008 12.75C12.6461 12.75 15.5629 14.6844 16.8283 17.3204C17.5452 18.8141 16.1569 20.2188 14.5001 20.2188H4.00008C2.34323 20.2187 0.954927 18.8141 1.67191 17.3204Z"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
