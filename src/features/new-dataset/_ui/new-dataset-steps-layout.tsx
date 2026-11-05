import { AiStarIcon } from "@/shared/assets/icons/outlined/AiStar";
import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import { Text } from "@/shared/ui/kit/text";
import type { ReactNode } from "react";

export function NewDatasetStepsLayout({
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

export function NewDatasetStepsHeader({
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

export function NewDatasetStepsTitle({
  title,
  subtitle,
  className,
  proPlan = false,
  ...props
}: React.ComponentProps<"div"> & {
  title?: string | null;
  subtitle?: ReactNode;
  proPlan?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {title && (
        <div className="flex items-center justify-center gap-4">
          <Text variant="h1">{title}</Text>
          {proPlan && (
            <Badge
              size="sm"
              className="px-3 gap-0 bg-background-secondary text-typography-secondary"
            >
              PLUS
              <AiStarIcon pathClasses="bg-gradient-black-blue" />
            </Badge>
          )}
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

export function NewDatasetStepsContentWrapper({
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
export function NewDatasetStepsContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("overflow-y-auto no-scrollbar", className)} {...props} />
  );
}
