import { LockIcon } from "@/shared/assets/icons/general/Lock";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";

export function DatasetConfigLayout({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto_1fr]",
        className,
      )}
      {...props}
    />
  );
}

export function DatasetConfigSection({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-10", className)} {...props} />;
}

export function DatasetConfigCard({
  className,
  icon,
  title,
  description,
  button,
  disabled,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  button?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-start md:gap-0",
        className,
      )}
      {...props}
    >
      {/* On mobile the icon and button share the top row. On desktop the
          wrapper collapses (`md:contents`) so the icon, content and button
          become direct flex children again (original layout). */}
      <div className="flex items-center justify-between gap-3 md:contents">
        <div
          className={cn(
            "shrink-0 grid place-items-center size-15 rounded-xl",
            disabled && "opacity-40",
          )}
        >
          {icon}
        </div>

        {button && (
          <div className="shrink-0 md:order-last md:ml-6">{button}</div>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-1 md:ml-4",
          disabled && "opacity-40",
        )}
      >
        {title && <Text variant="title">{title}</Text>}
        {description && <Text>{description}</Text>}
      </div>
    </div>
  );
}

export function DatasetConfigCardButton({
  children,
  disabled,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        disabled &&
          "shadow-inset-default disabled:text-typography-primary gap-1.5 px-3",
      )}
      size="48"
      variant="secondary"
      disabled={disabled}
      {...props}
    >
      {disabled && <LockIcon />}
      {children}
    </Button>
  );
}
