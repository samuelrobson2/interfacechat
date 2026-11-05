import type { CustomIconProps } from "@/shared/model/icon";

export const ProjectsIcon = ({
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
      d="M17.5742 11.5239C18.2329 11.5239 18.7508 12.0873 18.6953 12.7437L18.2188 18.355C18.1691 18.9371 17.682 19.3843 17.0977 19.3843H6.90332C6.31903 19.3843 5.83185 18.9371 5.78223 18.355L5.30566 12.7437C5.25019 12.0873 5.76803 11.5239 6.42676 11.5239H17.5742Z"
      stroke="#1A1718"
      strokeWidth="1.75"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M17.5864 8.49072H11.9996H6.41309"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M17.0671 5.49023H11.9992H6.93164"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
