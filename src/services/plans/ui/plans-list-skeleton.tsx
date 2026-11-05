import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Separator } from "@/shared/ui/kit/separator";
import { Card } from "@/shared/ui/kit/card";
import { cn } from "@/shared/lib/css";

function PlanItemSkeleton({
  featuresCount = 2,
  highlight = false,
  separator = true,
}: {
  featuresCount?: number;
  highlight?: boolean;
  separator?: boolean;
} & React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        `p-6 gap-8 min-h-[516px]`,
        !highlight && "shadow-none [--hairline-color:transparent]",
      )}
    >
      <Skeleton className="shrink-0 h-22.5 w-22.5 self-center" />

      <div className="flex flex-col gap-10 justify-between h-full">
        <div className="flex flex-col gap-6 w-full">
          <Skeleton className="h-[36px] w-[110px]" />

          <div className="flex flex-col gap-4">
            {[...Array(featuresCount)].map((_, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className="h-[24px] w-[120px]" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {separator && (
            <>
              <Separator color="secondary" />
              <div className="flex gap-2 items-center">
                <Skeleton className="h-[56px] w-[80px]" />
                <Skeleton className="h-[24px] w-[64px]" />
              </div>
            </>
          )}

          <Skeleton className="h-[56px] w-full" />
        </div>
      </div>
    </Card>
  );
}

export function PlansListSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-8 auto-rows-min">
      <PlanItemSkeleton featuresCount={2} />
      <PlanItemSkeleton featuresCount={3} highlight />
      <PlanItemSkeleton featuresCount={3} />
      <PlanItemSkeleton featuresCount={7} separator={false} />
    </div>
  );
}
