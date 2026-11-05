import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";
import loadingWhiteAnimation from "@/shared/assets/lottie/loading-white.json";
import { cn } from "@/shared/lib/css";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Lottie from "lottie-react";
import * as React from "react";
import { textVariants } from "../text";

const buttonVariants = cva(
  [
    "cursor-pointer inline-flex items-center justify-center whitespace-nowrap font-bureau",
    "transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 outline-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gray-4 text-typography-inverse rounded-[4px]",
          "hairline [--hairline-radius:4px]",
          "hover:bg-background-secondary-inverse",
          "disabled:opacity-40",
        ],
        secondary: [
          // White background with primary text
          "bg-background-secondary text-typography-primary rounded-[4px]",
          "hairline [--hairline-radius:4px]",
          "hover:bg-background-primary",
          "disabled:bg-background-secondary disabled:text-gray-2",
        ],
        tertiary: [
          "bg-background-secondary text-typography-primary rounded-[4px]",
          "hover:bg-neutral-100",
          "active:bg-neutral-200",
          "disabled:opacity-40",
        ],
        link: [
          "bg-transparent text-typography-primary",
          "hover:text-typography-secondary",
          "disabled:text-gray-2",
        ],
        "link-destructive": [
          "bg-transparent text-red-5",
          "hover:text-red-600",
          "active:text-red-700",
          "disabled:opacity-40",
        ],
        ghost: [
          "bg-transparent rounded-[4px] text-icon-primary",
          "hover:bg-background-secondary",
          "disabled:opacity-40",
        ],
        "icon-button": [
          "rounded-[20px] bg-background-primary text-icon-primary",
          "hover:bg-neutral-100",
          "disabled:opacity-50",
        ],
        destructive: [
          "bg-red-0 text-red-500 rounded-[60px]",
          "hover:bg-red-100",
          "active:bg-red-200",
          "disabled:opacity-50",
        ],
        black: [
          "bg-gray-5 text-typography-inverse rounded-[4px]",
          "hover:bg-gray-4",
          "disabled:opacity-10",
        ],
        dashboard: [
          "rounded-[40px] border-[0.5px] border-stroke-secondary bg-gray-4 text-typography-inverse",
          "hover:bg-gray-5",
          "disabled:opacity-40",
        ],
        blue: [
          "bg-blue-5 text-typography-inverse rounded-[4px]",
          "hover:bg-blue-6",
          "disabled:opacity-10",
        ],
      },
      size: {
        "56": [
          textVariants({ variant: "title", color: "none" }),
          "h-14 px-6 py-3.5 gap-3",
        ],
        "48": [
          textVariants({ variant: "body", color: "none" }),
          "h-12 px-6 py-3 gap-3",
        ],
        "40": [
          textVariants({ variant: "label", color: "none" }),
          "h-10 px-4 py-2.5 gap-3",
        ],
        icon: "size-10 p-2.5",
        "icon-md": "size-9 p-1.5",
        "icon-sm": "size-8 px-3 py-2",
        icon_6: "size-6 p-0",
        icon_14: "size-14 p-0",
      },
      radius: {
        default: "",
        rounded: "rounded-[60px] [--hairline-radius:60px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "56",
      radius: "default",
    },
    compoundVariants: [
      {
        variant: ["link", "link-destructive"],
        className: [
          textVariants({ variant: "body", color: "none" }),
          "h-auto px-0 py-0 gap-2",
        ],
      },
    ],
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  lottieClassName?: string;
  asChild?: boolean;
}

function Button({
  className,
  variant = "primary",
  size = "56",
  radius = "default",
  isLoading = false,
  lottieClassName,
  asChild = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, radius }),
        isLoading && "pointer-events-none",
        // Apply disabled styles when disabled and using asChild
        asChild &&
          disabled &&
          variant === "primary" &&
          "opacity-40 pointer-events-none",
        asChild &&
          disabled &&
          variant === "secondary" &&
          "bg-background-secondary text-gray-2 pointer-events-none",
        asChild &&
          disabled &&
          variant === "tertiary" &&
          "opacity-50 pointer-events-none",
        asChild &&
          disabled &&
          variant === "link" &&
          "text-gray-2 pointer-events-none",
        asChild &&
          disabled &&
          variant === "black" &&
          "opacity-10 pointer-events-none",
        asChild &&
          disabled &&
          variant === "blue" &&
          "opacity-10 pointer-events-none",
        isLoading && "disabled:opacity-100 disabled:text-current",
        className,
      )}
      disabled={disabled || isLoading}
      aria-disabled={asChild && (disabled || isLoading) ? true : undefined}
      {...props}
    >
      {isLoading ? (
        <Lottie
          className={lottieClassName}
          animationData={
            variant === "primary" || variant === "black" || variant === "blue"
              ? loadingWhiteAnimation
              : loadingBlackAnimation
          }
          loop
          data-testid="lottie-animation"
        />
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
