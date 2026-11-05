import type { CustomIconProps } from "@/shared/model/icon";

// Slack glyph (the four rounded lozenges), drawn in currentColor-friendly strokes
// so it matches the other general icons. Uses the same 20x20 frame as siblings.
export const SlackIcon = ({
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
      d="M7.5 12.5a1.5 1.5 0 1 1-1.5-1.5h1.5v1.5Zm.75 0a1.5 1.5 0 0 1 3 0v3.75a1.5 1.5 0 0 1-3 0V12.5Z"
      fill="#1A1718"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M9.75 6.5a1.5 1.5 0 1 1 1.5-1.5v1.5h-1.5Zm0 .75a1.5 1.5 0 0 1 0 3H6a1.5 1.5 0 0 1 0-3h3.75Z"
      fill="#1A1718"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M13.5 9.75a1.5 1.5 0 1 1 1.5 1.5h-1.5v-1.5Zm-.75 0a1.5 1.5 0 0 1-3 0V6a1.5 1.5 0 0 1 3 0v3.75Z"
      fill="#1A1718"
      className={pathClasses}
      {...pathProps}
    />
    <path
      d="M10.5 13.5a1.5 1.5 0 1 1-1.5 1.5v-1.5h1.5Zm0-.75a1.5 1.5 0 0 1 0-3H14.25a1.5 1.5 0 0 1 0 3H10.5Z"
      fill="#1A1718"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
