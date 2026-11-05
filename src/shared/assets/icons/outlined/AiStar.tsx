import type { CustomIconProps } from "@/shared/model/icon";

export const AiStarIcon = ({
  svgClasses,
  pathClasses,
  pathProps,
  ...svgProps
}: CustomIconProps) => (
  <svg
    width="7"
    height="16"
    viewBox="0 0 7 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={svgClasses}
    {...svgProps}
  >
    <path
      d="M4 0.5C4 0.223858 3.77614 0 3.5 0C3.22386 0 3 0.223858 3 0.5C3 1.48063 2.78279 2.0726 2.4277 2.4277C2.0726 2.78279 1.48063 3 0.5 3C0.223858 3 0 3.22386 0 3.5C0 3.77614 0.223858 4 0.5 4C1.48063 4 2.0726 4.21721 2.4277 4.5723C2.78279 4.9274 3 5.51937 3 6.5C3 6.77614 3.22386 7 3.5 7C3.77614 7 4 6.77614 4 6.5C4 5.51937 4.21721 4.9274 4.5723 4.5723C4.9274 4.21721 5.51937 4 6.5 4C6.77614 4 7 3.77614 7 3.5C7 3.22386 6.77614 3 6.5 3C5.51937 3 4.9274 2.78279 4.5723 2.4277C4.21721 2.0726 4 1.48063 4 0.5Z"
      fill="url(#paint0_linear_6739_1990)"
      className={pathClasses}
      {...pathProps}
    />
    <defs>
      <linearGradient
        id="paint0_linear_6739_1990"
        x1="3.5"
        y1="0"
        x2="3.5"
        y2="7"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#373737" />
        <stop offset="1" stopColor="#054761" />
      </linearGradient>
    </defs>
  </svg>
);
