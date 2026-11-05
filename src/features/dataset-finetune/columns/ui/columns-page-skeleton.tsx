import { Skeleton } from "@/shared/ui/kit/skeleton";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
} from "../../_ui/finetune-steps-layout";

export function ColumnsPageSkeleton() {
  return (
    <FinetuneStepsContentWrapper>
      <Skeleton className="h-10 w-24" />

      <FinetuneStepsContent className="flex h-full min-h-0 flex-col gap-6">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-[4px]" />
          ))}
        </div>

        <div className="flex-1 min-h-0 rounded-[8px] border border-stroke-secondary p-4">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-7 w-full" />
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-full" />
            ))}
          </div>
        </div>
      </FinetuneStepsContent>

      <Skeleton className="h-12 w-full rounded-[8px]" />
    </FinetuneStepsContentWrapper>
  );
}
