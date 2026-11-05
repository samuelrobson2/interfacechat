import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Text } from "@/shared/ui/kit/text";
import { CHART_HEIGHT_PX } from "../lib/plot-theme";

export const PlotSkeleton = ({ className }: { className?: string }) => (
  <div
    data-slot="plot-skeleton"
    className={cn(
      "my-3 flex flex-col gap-3 bg-transparent p-4 md:p-7",
      "hairline [--hairline-radius:14px] [--hairline-color:var(--color-gray-2)]",
      className,
    )}
  >
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="w-full" style={{ height: CHART_HEIGHT_PX }} />
  </div>
);

export const PlotErrorBlock = ({
  error,
  className,
}: {
  error: string;
  className?: string;
}) => (
  <div
    data-slot="plot-error"
    className={cn(
      "my-3 flex flex-col gap-2 border border-stroke-secondary bg-transparent p-4 font-bureau",
      className,
    )}
  >
    <Text variant="label" color="primary">
      Chart could not be rendered
    </Text>
    <Text variant="label" color="secondary">
      {error}
    </Text>
  </div>
);
