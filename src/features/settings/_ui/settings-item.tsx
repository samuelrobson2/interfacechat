import { cn } from "@/shared/lib/css";
import { Card, CardContent } from "@/shared/ui/kit/card";
import { Text } from "@/shared/ui/kit/text";

export function SettingsItem({
  className,
  icon,
  children,
  ...props
}: React.ComponentProps<typeof Card> & {
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn("flex gap-6", className)} {...props}>
      {icon && (
        <div className="size-18 grid place-items-center shrink-0">{icon}</div>
      )}

      {children}
    </div>
  );
}

export function SettingsItemContent({
  className,
  pinActionToBottom = false,
  ...props
}: React.ComponentProps<typeof CardContent> & {
  pinActionToBottom?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-8 items-start",
        pinActionToBottom && "[&>*:last-child]:mt-auto",
        className,
      )}
      {...props}
    />
  );
}

export function SettingsItemHeader({
  title,
  description,
  className,
  action,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-center justify-between w-full">
        {title && <Text variant="h2">{title}</Text>}
        {action}
      </div>
      {description && (
        <Text className="flex items-center gap-1">{description}</Text>
      )}
    </div>
  );
}
