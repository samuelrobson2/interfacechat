import { cn } from "@/shared/lib/css";
import React from "react";

export function ChatInputLayout({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full flex-col gap-4 rounded-[16px] bg-background",
        className,
      )}
      {...props}
    />
  );
}
