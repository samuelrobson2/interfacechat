import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const withPrefix = (prefix: string, classes: string) =>
  classes
    .split(" ")
    .map((c) => `${prefix}:${c}`)
    .join(" ");

export const resolveColor = (color: string): string => {
  if (
    color.startsWith("#") ||
    color.startsWith("rgb") ||
    color.startsWith("hsl") ||
    color.startsWith("var(")
  ) {
    return color;
  }
  return `var(--color-${color})`;
};
