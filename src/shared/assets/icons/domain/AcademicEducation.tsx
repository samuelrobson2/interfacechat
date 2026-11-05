import type { CustomIconProps } from "@/shared/model/icon";

export const AcademicEducationIcon = ({
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
        d="M5.00009 11V19.5815C5.00009 20.2729 5.68623 20.7636 6.34823 20.5642C7.81814 20.1213 10.2008 19.5 12.0001 19.5C13.7994 19.5 16.182 20.1213 17.6519 20.5642C18.3139 20.7636 19.0001 20.2729 19.0001 19.5815V11M21.0001 10V14M10.8462 4.48077L3.69802 7.4592C2.41795 7.99256 2.48502 9.82831 3.8006 10.2668L11.0514 12.6838C11.6672 12.889 12.333 12.889 12.9488 12.6838L20.1996 10.2668C21.5152 9.82831 21.5822 7.99256 20.3022 7.4592L13.1539 4.48077C12.4155 4.17308 11.5847 4.17308 10.8462 4.48077Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
