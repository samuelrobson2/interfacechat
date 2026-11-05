import type { CustomIconProps } from "@/shared/model/icon";

export const DatingIcon = ({
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
        d="M2.51331 6.94417C2.52459 6.5468 2.60534 6.13957 2.73097 5.73803C3.48303 3.33417 6.52298 2.85518 8.8113 3.98257C8.97986 4.06562 9.18441 4.03659 9.32321 3.90993C11.2075 2.19038 14.2607 1.80467 15.6519 3.90437C15.8843 4.25511 16.0751 4.62379 16.1965 5.00234C17.7974 9.99425 12.5172 14.5949 10.6167 14.8646C8.71628 15.1343 2.36463 12.1808 2.51331 6.94417Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
      <path
        d="M14.2057 15.4701C14.2887 15.2895 14.4057 15.118 14.5422 14.9579C15.3592 13.9995 16.8515 14.375 17.6831 15.3421C17.7444 15.4133 17.8441 15.44 17.9328 15.409C19.1366 14.9873 20.6166 15.4083 20.845 16.6467C20.8832 16.8536 20.8987 17.0606 20.8804 17.2585C20.6384 19.8685 17.3079 20.9499 16.3809 20.7015C15.4538 20.4531 13.111 17.8497 14.2057 15.4701Z"
        stroke="#342E29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={pathClasses}
        {...pathProps}
      />
  </svg>
);
