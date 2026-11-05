import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import React from "react";

export function DatasetTagsCard({
  icon,
  title,
  action,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-8 w-full", className)} {...props}>
      {icon}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Text variant="title">{title}</Text>

          {action}
        </div>

        {children}
      </div>
    </div>
  );
}

export function DatasetTagsCardContent({
  className,
  variant = "column",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "column" | "wrap";
}) {
  return (
    <div
      className={cn(
        "flex gap-3",
        variant === "column" ? "flex-col" : "flex-wrap",
        className,
      )}
      {...props}
    />
  );
}
