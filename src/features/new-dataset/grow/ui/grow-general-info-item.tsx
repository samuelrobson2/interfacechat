import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function GrowGeneralInfoItem({
  title,
  totalValue,
  className,
}: {
  title: string;
  totalValue?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 justify-between", className)}>
      <Text color="secondary">{title}</Text>
      {totalValue && <Text>{totalValue}</Text>}
    </div>
  );
}
