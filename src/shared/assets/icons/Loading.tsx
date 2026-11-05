import type { CustomIconProps } from "@/shared/model/icon";

export const LoadingIcon = ({
  svgClasses,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <circle cx="12" cy="15" r="5" fill="url(#paint0_linear_6262_19425)" />
    <circle cx="28" cy="15" r="5" fill="url(#paint1_linear_6262_19425)" />
    <circle cx="20" cy="30" r="5" fill="url(#paint2_linear_6262_19425)" />
    <defs>
      <linearGradient
        id="paint0_linear_6262_19425"
        x1="12"
        y1="10"
        x2="12"
        y2="20"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#373737" />
        <stop offset="1" stopColor="#054761" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_6262_19425"
        x1="28"
        y1="10"
        x2="28"
        y2="20"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#373737" />
        <stop offset="1" stopColor="#054761" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_6262_19425"
        x1="20"
        y1="25"
        x2="20"
        y2="35"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#373737" />
        <stop offset="1" stopColor="#054761" />
      </linearGradient>
    </defs>
  </svg>
);
