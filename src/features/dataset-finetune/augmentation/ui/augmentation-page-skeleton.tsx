import { Skeleton } from "@/shared/ui/kit/skeleton";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
} from "../../_ui/finetune-steps-layout";

export function AugmentationPageSkeleton() {
  return (
    <FinetuneStepsContentWrapper>
      <Skeleton className="h-10 w-24" />

      <FinetuneStepsContent className="flex flex-col gap-8 overflow-y-auto no-scrollbar py-2">
        <div className="flex flex-col gap-4 rounded-[8px] border p-6">
          <Skeleton className="h-8 w-[360px]" />
          <Skeleton className="h-6 w-[620px]" />
          <div className="grid grid-cols-[1fr_auto] gap-6 items-center">
            <Skeleton className="h-[180px] w-full rounded-[8px]" />
            <Skeleton className="h-[140px] w-[220px] rounded-[8px]" />
          </div>
          <Skeleton className="h-8 w-full rounded-full" />
        </div>
      </FinetuneStepsContent>

      <Skeleton className="h-12 w-full rounded-[8px]" />
    </FinetuneStepsContentWrapper>
  );
}
