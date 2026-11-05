import type { CustomIconProps } from "@/shared/model/icon";

export const ChatHistoryIcon = ({
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
      d="M15.5742 8.52539C16.2329 8.52539 16.7508 9.0888 16.6953 9.74512L16.2188 15.3564C16.1691 15.9386 15.682 16.3857 15.0977 16.3857H4.90332C4.31903 16.3857 3.83185 15.9386 3.78223 15.3564L3.30566 9.74512C3.25019 9.0888 3.76803 8.52539 4.42676 8.52539H15.5742Z"
      stroke="#1A1718"
      strokeWidth="1.75"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M15.5869 5.49219H10.0001H4.41357"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M15.0676 2.4917H9.99969H4.93213"
      stroke="#1A1718"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
