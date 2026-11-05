import { Skeleton } from "@/shared/ui/kit/skeleton";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
} from "../../_ui/finetune-steps-layout";

export function CreditsPageSkeleton() {
  return (
    <FinetuneStepsContentWrapper>
      <Skeleton className="h-10 w-24" />

      <FinetuneStepsContent className="flex h-full flex-col gap-10 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-10 w-[520px]" />
          <Skeleton className="h-6 w-[460px]" />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-8">
          <div className="flex flex-col gap-8">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-4">
                <Skeleton className="h-8 w-64" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-9 w-14" />
                  </div>
                  <Skeleton className="h-8 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="h-full w-px bg-border-secondary" />

          <Skeleton className="h-[220px] w-full rounded-[8px]" />
        </div>
      </FinetuneStepsContent>

      <Skeleton className="h-12 w-full rounded-[8px]" />
    </FinetuneStepsContentWrapper>
  );
}
