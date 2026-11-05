import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/css";
import { CircleCheckFilledGradientIcon } from "../../../assets/icons/general/CircleCheckFilledGradient";
import { Text } from "../text";
import { TruncatedText } from "../truncated-text";

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all rounded-[24px]",
  {
    variants: {
      color: {
        default: "bg-icon-primary",
        gradient: "bg-gradient-black-blue",
        blue: "bg-blue-5",
      },
    },
    defaultVariants: { color: "default" },
  },
);

interface ProgressProps
  extends
    Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "color">,
    VariantProps<typeof progressIndicatorVariants> {}

function Progress({ className, value, color, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-gray-2 relative h-0.5 w-full overflow-hidden rounded-[24px]",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(progressIndicatorVariants({ color }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

const progressRowCheckVariants = cva("", {
  variants: {
    color: {
      default: "fill-icon-primary",
      gradient: "",
      blue: "fill-blue-5",
    },
  },
  defaultVariants: { color: "default" },
});

interface ProgressRowProps
  extends
    Omit<React.ComponentProps<"div">, "color">,
    VariantProps<typeof progressRowCheckVariants> {
  label?: string;
  value?: number;
  sign?: string;
}

function ProgressRow({
  label,
  value = 0,
  color,
  className,
  children,
  sign = "%",
  ...props
}: ProgressRowProps) {
  const isComplete = value >= 100;
  const textColor = value === 0 ? "secondary" : "primary";

  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      <div className="flex items-center gap-2 justify-between">
        <TruncatedText color={textColor}>{label}</TruncatedText>

        {isComplete ? (
          <CircleCheckFilledGradientIcon
            className="shrink-0"
            pathClasses={cn(progressRowCheckVariants({ color }))}
          />
        ) : (
          <Text color={textColor}>{value.toFixed(1)}{sign}</Text>
        )}
      </div>

      {children}
    </div>
  );
}

export { Progress, ProgressRow };
export type { ProgressProps, ProgressRowProps };

