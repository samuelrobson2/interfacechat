import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/css";
import { Text } from "../text";

const circularProgressVariants = cva("relative shrink-0", {
  variants: {
    size: {
      lg: "size-[160px]",
      md: "size-[120px]",
    },
  },
  defaultVariants: { size: "lg" },
});

const circularArcVariants = cva("transition-all", {
  variants: {
    color: {
      default: "stroke-icon-primary",
      gradient: "",
      blue: "stroke-blue-5",
    },
  },
  defaultVariants: { color: "default" },
});

const CIRCULAR_CONFIG = {
  lg: { dim: 160, strokeWidth: 4 },
  md: { dim: 120, strokeWidth: 4 },
} as const;

interface CircularProgressProps
  extends
    Omit<React.ComponentProps<"div">, "color">,
    VariantProps<typeof circularArcVariants>,
    VariantProps<typeof circularProgressVariants> {
  value?: number;
  label?: string;
}

function CircularProgress({
  value = 0,
  label,
  size = "lg",
  color = "default",
  className,
  children,
  ...props
}: CircularProgressProps) {
  const gradientId = `cpg${React.useId().replace(/:/g, "-")}`;
  const cfg = CIRCULAR_CONFIG[size ?? "lg"];
  const radius = (cfg.dim - cfg.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.min(100, Math.max(0, value));
  const dashOffset = circumference * (1 - safeValue / 100);
  const valueColor = safeValue === 0 ? "secondary" : "primary";

  return (
    <div
      className={cn(circularProgressVariants({ size }), className)}
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <svg
        className="size-full -rotate-90"
        viewBox={`0 0 ${cfg.dim} ${cfg.dim}`}
        aria-hidden
      >
        {color === "gradient" && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-gray-4)" />
              <stop offset="100%" stopColor="var(--color-blue-6)" />
            </linearGradient>
          </defs>
        )}
        {/* Track ring */}
        <circle
          cx={cfg.dim / 2}
          cy={cfg.dim / 2}
          r={radius}
          fill="none"
          className="stroke-gray-2"
          strokeWidth={cfg.strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={cfg.dim / 2}
          cy={cfg.dim / 2}
          r={radius}
          fill="none"
          className={
            color !== "gradient"
              ? cn(circularArcVariants({ color }))
              : undefined
          }
          stroke={color === "gradient" ? `url(#${gradientId})` : undefined}
          strokeWidth={cfg.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {children ?? (
          <>
            <Text variant={size === "lg" ? "h1" : "h2"} className="text-center">
              {safeValue}%
            </Text>
            {label && (
              <Text variant="label" color={valueColor} className="text-center">
                {label}
              </Text>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { CircularProgress };
export type { CircularProgressProps };
