import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Card } from "@/shared/ui/kit/card";

function TrainingMethodOptionSkeleton() {
  return (
    <Card className="w-[428px] rounded-[8px] [--hairline-radius:8px] gap-8 p-8">
      <Skeleton className="h-[260px] w-full" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-[220px]" />
        <Skeleton className="w-full h-6" />
      </div>
    </Card>
  );
}

export function TrainingMethodSkeleton() {
  return (
    <div className="flex flex-col gap-15 items-center">
      <div className="flex flex-col gap-1.5 w-[380px] items-center h-24">
        <Skeleton className="w-full h-11" />
        <Skeleton className="w-[340px] h-11" />
      </div>

      <div className="flex gap-8">
        <TrainingMethodOptionSkeleton />
        <TrainingMethodOptionSkeleton />
      </div>
    </div>
  );
}
