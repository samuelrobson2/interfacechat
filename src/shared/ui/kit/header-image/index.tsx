import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/css";
import { Skeleton } from "../skeleton";

const headerImageVariants = cva(
  "relative w-full overflow-hidden aspect-[21/9]",
  {
    variants: {
      size: {
        sm: "max-h-32",
        md: "max-h-48",
        lg: "",
      },
    },
    defaultVariants: { size: "lg" },
  },
);

interface HeaderImageProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof headerImageVariants> {
  src?: string;
  alt?: string;
  isLoading?: boolean;
}

function HeaderImage({
  src,
  alt = "",
  size = "lg",
  className,
  children,
  style,
  isLoading,
  ...props
}: HeaderImageProps) {
  return (
    <div
      className={cn(headerImageVariants({ size }), className)}
      style={style}
      {...props}
    >
      {isLoading ? (
        <Skeleton className="absolute inset-0 size-full rounded-none" />
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "absolute inset-0 size-full object-cover pointer-events-none",
            className,
          )}
        />
      )}
      {children}
    </div>
  );
}

export { HeaderImage, headerImageVariants };
export type { HeaderImageProps };
