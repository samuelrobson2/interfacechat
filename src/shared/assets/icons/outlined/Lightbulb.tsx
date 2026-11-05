import type { CustomIconProps } from "@/shared/model/icon";

export const LightbulbIcon = ({
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
      d="M8.74775 17.75V17.1005C8.74775 16.7224 8.53134 16.3816 8.2092 16.1838C7.99246 16.0506 7.78326 15.9064 7.58239 15.7519C5.85882 14.4264 4.74805 12.3433 4.74805 10.0009C4.74805 5.99633 7.99438 2.75 11.9989 2.75C16.0035 2.75 19.2498 5.99633 19.2498 10.0009C19.2498 12.3433 18.139 14.4264 16.4155 15.7519C16.2146 15.9064 16.0054 16.0506 15.7887 16.1838C15.4665 16.3816 15.2501 16.7224 15.2501 17.1005V17.75M8.74775 17.75V18.9988C8.74775 20.7944 10.2034 22.25 11.9989 22.25C13.7945 22.25 15.2501 20.7944 15.2501 18.9988V17.75M8.74775 17.75H15.2501"
      stroke="#342E29"
      strokeWidth="1"
      strokeLinecap="square"
      strokeLinejoin="round"
      className={pathClasses}
      {...pathProps}
    />
  </svg>
);
