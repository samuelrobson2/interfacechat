import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import { cn } from "@/shared/lib/css";
import { textVariants } from "../text";

function Label({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { disabled?: boolean }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        textVariants({ variant: "body" }),
        "flex items-center gap-2 select-none cursor-pointer",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-gray-2",
        "peer-disabled:cursor-not-allowed peer-disabled:text-gray-2",
        "has-disabled:cursor-not-allowed has-disabled:text-gray-2",
        disabled && "text-gray-2",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
