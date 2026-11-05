import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import { Text } from "@/shared/ui/kit/text";

export const DatasetChartCard = ({
  title,
  improvementPercent,
  titleAccessory,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
  improvementPercent?: string;
  /**
   * Optional element rendered immediately after the title (e.g. an info icon
   * with a tooltip). Lives in the same row as the title and the
   * improvement-percent badge.
   */
  titleAccessory?: React.ReactNode;
}) => {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="flex justify-between gap-1 items-center w-full overflow-hidden">
        <div className="flex items-center gap-1.5">
          <Text variant="title">{title}</Text>
          {titleAccessory}
        </div>
        {improvementPercent && (
          <Badge className="py-1.5 px-3">
            {improvementPercent}% relative improvement
          </Badge>
        )}
      </div>

      {children}
    </div>
  );
};
