import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/css";

const switchVariants = cva(
  [
    "inline-flex shrink-0 items-center rounded-[100px] p-[2px] cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default:
          "data-[state=unchecked]:bg-gray-2 data-[state=checked]:bg-gray-4",
        filled:
          "data-[state=unchecked]:bg-gray-2 data-[state=checked]:bg-blue-5",
      },
      size: {
        default: "",
        sm: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        size: "default",
        className: "h-[28px] w-[64px]",
      },
      {
        variant: "default",
        size: "sm",
        className: "h-[24px] w-[56px]",
      },
      {
        variant: "filled",
        size: "default",
        className: "h-[28px] w-[52px]",
      },
      {
        variant: "filled",
        size: "sm",
        className: "h-[24px] w-[40px]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const switchThumbVariants = cva(
  "pointer-events-none block bg-background-secondary rounded-[24px] transition-transform data-[state=unchecked]:translate-x-0",
  {
    variants: {
      variant: {
        default: "",
        filled: "",
      },
      size: {
        default: "",
        sm: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        size: "default",
        className: "h-[24px] w-[39px] data-[state=checked]:translate-x-[21px]",
      },
      {
        variant: "default",
        size: "sm",
        className: "h-[20px] w-[32px] data-[state=checked]:translate-x-[20px]",
      },
      {
        variant: "filled",
        size: "default",
        className: "size-[24px] data-[state=checked]:translate-x-[24px]",
      },
      {
        variant: "filled",
        size: "sm",
        className: "size-[20px] data-[state=checked]:translate-x-[16px]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

function Switch({ className, variant, size, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ variant, size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(switchThumbVariants({ variant, size }))}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch, switchVariants, switchThumbVariants };
export type { SwitchProps };
