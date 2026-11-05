import type { CustomIconProps } from "@/shared/model/icon";

export const HrIcon = ({
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
        d="M3 14C3 9.02944 7.02944 5 12 5C16.9706 5 21 9.02944 21 14M3 14C3 15.7282 3.16203 17.3427 3.88056 18.7136C4.21255 19.347 4.91551 19.6573 5.63064 19.6573C6.9392 19.6573 8 18.5965 8 17.288V16.8287C8 15.2664 6.73356 14 5.17133 14H3ZM21 14C21 15.7282 20.838 17.3427 20.1194 18.7136C19.7874 19.347 19.0845 19.6573 18.3694 19.6573C17.0608 19.6573 16 18.5965 16 17.288V16.8287C16 15.2664 17.2664 14 18.8287 14H21Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
