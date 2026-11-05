import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/shared/lib/css";
import { cva, type VariantProps } from "class-variance-authority";

const separatorVariants = cva(
  [
    "shrink-0",
    "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=horizontal]:scale-y-50",
    "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px data-[orientation=vertical]:scale-x-50",
  ],
  {
    variants: {
      color: {
        primary: "bg-stroke-primary",
        secondary: "bg-stroke-secondary",
      },
    },
  },
);

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  color = "primary",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> &
  VariantProps<typeof separatorVariants>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(separatorVariants({ color }), className)}
      {...props}
    />
  );
}

export { Separator };
