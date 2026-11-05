import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

export function SummaryCreditsTopUp({
  radioInput,
  title,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  radioInput?: React.ReactNode;
  title?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <label className="flex gap-3 items-center">
        {radioInput}

        <Text variant="title">{title}</Text>
      </label>

      {children}
    </div>
  );
}
