import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function DatasetQualityCard({
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-8 items-center justify-center",
        className,
      )}
      {...props}
    >
      {icon}

      {children}
    </div>
  );
}

export function DatasetQualityCardContent({
  className,
  title,
  children,
  contentClassName,
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
  contentClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4 w-full", className)} {...props}>
      <Text variant="title">{title}</Text>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DatasetQualityCardItem({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Text variant="label">{title}</Text>
      <Text variant="h1">{value}</Text>
    </div>
  );
}
