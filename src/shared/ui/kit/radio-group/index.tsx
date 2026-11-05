import { CheckIcon } from "@/shared/assets/icons/outlined/Check";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/css";

const radioGroupItemVariants = cva(
  [
    "size-6 shrink-0 rounded-full outline-none cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-background-primary",
          "border border-stroke-secondary hover:border-stroke-primary",
          "data-[state=checked]:bg-gray-4 data-[state=checked]:border-transparent",
          "data-[state=checked]:text-icon-inverse",
          "aria-invalid:border-red-5",
          "disabled:border-gray-2 disabled:hover:border-gray-2 disabled:data-[state=checked]:border-gray-2",
        ],
        filled: [
          "bg-gray-6 border border-transparent",
          "hover:bg-blue-1",
          "data-[state=checked]:bg-blue-5 data-[state=checked]:text-icon-inverse",
          "data-[state=checked]:hover:bg-blue-5",
          "aria-invalid:bg-background-primary aria-invalid:border-red-5",
          "disabled:hover:bg-gray-6",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function RadioGroup({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      orientation={orientation}
      className={cn(
        "flex gap-3",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className,
      )}
      {...props}
    />
  );
}

interface RadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

function RadioGroupItem({
  className,
  variant = "default",
  ...props
}: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ variant }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="grid place-content-center text-current transition-none"
      >
        {variant === "default" ? (
          <CheckIcon
            className="dark-region"
            pathClasses="stroke-icon-primary"
          />
        ) : (
          <CheckIcon pathClasses="stroke-current" />
        )}
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem, radioGroupItemVariants };
export type { RadioGroupItemProps };
