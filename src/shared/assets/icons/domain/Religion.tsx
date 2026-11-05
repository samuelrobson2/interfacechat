import type { CustomIconProps } from "@/shared/model/icon";

export const ReligionIcon = ({
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
        d="M5.80998 16.193C8.13657 19.9491 13.0676 21.1079 16.8236 18.7813C16.9201 18.7216 17.0149 18.6601 17.108 18.5969C17.7496 18.1615 18.0704 17.9438 18.1746 17.611C18.2652 17.3218 18.2194 17.0061 18.0504 16.7546C17.8559 16.465 17.2814 16.2822 16.1324 15.9166C14.3779 15.3583 12.8064 14.1949 11.7608 12.5069C10.7153 10.819 10.3736 8.89372 10.6553 7.07419C10.8397 5.88266 10.9319 5.28689 10.7593 4.9838C10.6094 4.72047 10.3472 4.53886 10.0479 4.49111C9.70349 4.43614 9.36567 4.62641 8.69004 5.00694C8.59206 5.06213 8.49479 5.1196 8.3983 5.17937C4.64221 7.50596 3.48339 12.4369 5.80998 16.193Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
