import { cn } from "@/shared/lib/css";
import type { ReactNode } from "react";
import { Text } from "@/shared/ui/kit/text";

export function FinetuneStepsLayout({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-rows-[auto_1fr] h-screen mx-auto", className)}
      {...props}
    />
  );
}

export function FinetuneStepsContentWrapper({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-[156px_minmax(200px,888px)_156px] gap-4 justify-between px-12 pb-8 overflow-hidden h-full",
        "[&>*:first-child]:self-end [&>*:last-child]:self-end",
        className,
      )}
      {...props}
    />
  );
}

export function FinetuneStepsHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-8 pb-10 max-w-[888px] w-full mx-auto",
        className,
      )}
      {...props}
    />
  );
}

export function FinetuneStepsContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={className} {...props} />;
}

export function FinetuneDatasetStepsTitle({
  title,
  subtitle,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title?: string | null;
  subtitle?: ReactNode;
}) {
  return (
    <div
      className={cn("flex flex-col gap-3 text-center text-balance", className)}
      {...props}
    >
      {title && (
        <div className="flex items-center justify-center gap-4">
          <Text variant="h1">{title}</Text>
        </div>
      )}
      {subtitle && (
        <div className="flex w-full justify-center">
          <Text as="div" className="text-center">
            {subtitle}
          </Text>
        </div>
      )}
    </div>
  );
}
