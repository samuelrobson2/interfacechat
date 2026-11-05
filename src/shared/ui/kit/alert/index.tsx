import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/css";
import { textVariants } from "../text";

const alertVariants = cva(
  [
    "relative grid w-full rounded-[4px] p-4 gap-[9px]",
    "bg-orange-1 border-[0.5px] border-orange-5",
  ],
  {
    variants: {
      variant: {
        default: "text-typography-primary",
        destructive: "text-red-5 *:data-[slot=alert-description]:text-red-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        textVariants({ variant: "title" }),
        "col-start-2 text-current",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        textVariants({ variant: "body" }),
        "col-start-2 grid justify-items-start gap-1 text-current [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
