import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function GrowPersonaItem({
  title,
  icon,
  className,
  children,
  addButton,
}: {
  title?: string;
  icon: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  addButton?: React.ReactNode;
}) {
  return (
    <div className={cn("flex gap-4", className)}>
      {icon}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <Text variant="title">{title}</Text>
          {addButton}
        </div>

        {children}
      </div>
    </div>
  );
}

export function GrowPersonaItemContent({
  hasOptions,
  children,
}: {
  hasOptions: boolean;
  children: React.ReactNode;
}) {
  if (!hasOptions)
    return <Text color="secondary">You don't have any tags yet</Text>;

  return <div className="flex flex-wrap gap-2">{children}</div>;
}
