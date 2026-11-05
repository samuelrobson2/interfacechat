import type { CustomIconProps } from "@/shared/model/icon";

export const RelaunchIcon = ({
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
      d="M16.4662 12.2917C15.5224 14.9619 12.9758 16.875 9.98242 16.875C6.18546 16.875 3.10742 13.797 3.10742 10C3.10742 6.20304 6.18546 3.125 9.98242 3.125C12.3301 3.125 13.8991 4.12865 15.4166 5.84076M16.0416 3.33333V5.83333C16.0416 6.29357 15.6685 6.66667 15.2083 6.66667H12.7083"
      stroke="#1A1718"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
