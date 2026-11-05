import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps, cx } from "class-variance-authority";

import { cn } from "@/shared/lib/css";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { badgeVariants } from "../badge";

const interactiveStyles = cva("cursor-pointer transition-all", {
  variants: {
    color: {
      default: [
        "hover:bg-background-secondary",
        "data-[selected=true]:shadow-highlight-blue data-[selected=true]:bg-blue-1 data-[selected=true]:[--hairline-color:var(--color-blue-5)]",
      ],
      ghost: [
        "hover:bg-gradient-blue hover:shadow-none",
        "data-[selected=true]:bg-gradient-blue data-[selected=true]:[--hairline-color:var(--color-blue-5)] data-[selected=true]:shadow-highlight-blue",
      ],
      neutral: [
        "hover:[--hairline-color:var(--color-stroke-primary)]",
        "data-[selected=true]:bg-gray-5 data-[selected=true]:text-typography-inverse",
        "[&[data-selected=true]_svg>path]:stroke-icon-inverse",
      ],
      accent: [
        "hover:[--hairline-color:var(--color-blue-5)]",
        "data-[selected=true]:bg-blue-5 data-[selected=true]:text-typography-inverse",
        "[&[data-selected=true]_svg>path]:stroke-icon-inverse",
      ],
    },
  },
  defaultVariants: {
    color: "default",
  },
});

type InteractiveBadgeVariantProps = VariantProps<typeof badgeVariants> &
  VariantProps<typeof interactiveStyles>;

const interactiveBadgeVariants = (props: InteractiveBadgeVariantProps) =>
  cx(badgeVariants(props), interactiveStyles({ color: props.color }));

function InteractiveBadge({
  className,
  size,
  color,
  radius,
  asChild = false,
  isSelected = false,
  closable = false,
  onClose,
  children,
  ...props
}: React.ComponentProps<"button"> &
  InteractiveBadgeVariantProps & {
    asChild?: boolean;
    isSelected?: boolean;
    closable?: boolean;
    onClose?: () => void;
  }) {
  const Comp = asChild ? Slot : "button";

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <Comp
      data-slot="interactive-badge"
      data-selected={isSelected}
      className={cn(
        interactiveBadgeVariants({ size, color, radius }),
        className,
      )}
      {...props}
    >
      {children}
      {closable && (
        <span className="cursor-pointer" onClick={handleClose}>
          <CrossLargeIcon className="size-4" pathClasses="stroke-current" />
        </span>
      )}
    </Comp>
  );
}

export { InteractiveBadge, interactiveBadgeVariants };
