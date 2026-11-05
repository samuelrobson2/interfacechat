import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/css";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { textVariants } from "../text";

const badgeVariants = cva(
  [
    textVariants({ variant: "body" }),
    "inline-flex items-center justify-center rounded-[56px] [--hairline-radius:56px] px-4",
    "w-fit whitespace-nowrap shrink-0 gap-2",
    "bg-background-primary hairline",
  ],
  {
    variants: {
      color: {
        default: "bg-background-primary",
        ghost: "bg-gray-1/10 shadow-inset-default",
        neutral: "bg-gray-6 [--hairline-color:transparent]",
        accent: "bg-gray-6 [--hairline-color:transparent]",
      },
      size: {
        default: "py-2.5",
        md: "py-1.5",
        sm: [textVariants({ variant: "label" }), "py-1 px-2"],
        icon: "p-0 rounded-full [--hairline-radius:9999px] size-8 overflow-hidden",
      },
      radius: {
        square: "rounded-[4px] [--hairline-radius:4px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type BadgeColors = VariantProps<typeof badgeVariants>["color"];

function Badge({
  className,
  size,
  color,
  radius,
  asChild = false,
  closable = false,
  closeIconClassName,
  onClose,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    closable?: boolean;
    closeIconClassName?: string;
    onClose?: () => void;
  }) {
  const Comp = asChild ? Slot : "span";

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ size, color, radius }), className)}
      {...props}
    >
      {children}
      {closable && (
        <span className="cursor-pointer" onClick={handleClose}>
          <CrossLargeIcon
            className={cn("size-4", closeIconClassName)}
            pathClasses="stroke-current"
          />
        </span>
      )}
    </Comp>
  );
}

export { Badge, badgeVariants };
