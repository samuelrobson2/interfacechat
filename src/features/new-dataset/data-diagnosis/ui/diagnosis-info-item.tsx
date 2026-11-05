import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function DiagnosisInfoItem({
  title,
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Text variant="label" color="secondary">{title}</Text>
      <Text>{description}</Text>
    </div>
  );
}
