import { Separator } from "@/shared/ui/kit/separator";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import { cn } from "@/shared/lib/css";

function DiagnosisInfoItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Skeleton className="w-20 h-5" />
      <Skeleton className="w-[120px] h-6" />
    </div>
  );
}

function DiagnosisTagCardSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-8 items-center">
      <Skeleton className="size-[90px]" />

      <div className="flex flex-col gap-6 w-full">
        <Skeleton className="w-[120px] h-7" />

        <div className="flex flex-wrap gap-3">
          <Skeleton className="w-[120px] h-11 rounded-full" />
          <Skeleton className="w-[120px] h-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DiagnosisSkeleton() {
  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.diagnosis} />

      <NewDatasetStepsContent className="flex flex-col gap-10">
        <div className="flex items-start gap-[26px] w-full">
          <Skeleton className="size-[90px]" />

          <div className="flex flex-col gap-10 w-full">
            <div className="flex gap-8 items-start justify-center w-full">
              <DiagnosisInfoItemSkeleton className="w-[197px]" />
              <div className="flex-1 flex flex-col gap-1">
                <Skeleton className="w-20 h-5" />
                <Skeleton className="w-full h-6" />
              </div>
            </div>

            <Separator color="secondary" />

            <div className="flex gap-8 items-start w-full">
              <DiagnosisInfoItemSkeleton className="w-[197px]" />
              <DiagnosisInfoItemSkeleton className="w-[197px]" />
              <DiagnosisInfoItemSkeleton className="w-[197px]" />
            </div>
          </div>
        </div>

        <Separator color="secondary" />

        <div className="flex gap-[26px] items-start w-full">
          <Skeleton className="size-[90px]" />

          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="w-full h-7" />
            <Skeleton className="w-full h-7" />
            <Skeleton className="w-[370px] h-7" />
          </div>
        </div>

        <Separator color="secondary" />

        <div className="flex gap-8 items-start w-full">
          <DiagnosisTagCardSkeleton />
          <Separator orientation="vertical" color="secondary" />
          <DiagnosisTagCardSkeleton />
          <Separator orientation="vertical" color="secondary" />
          <DiagnosisTagCardSkeleton />
        </div>
      </NewDatasetStepsContent>

      <NewDatasetContinueButton stepKey={NEW_DATASET_KEYS.diagnosis} disabled />
    </NewDatasetStepsContentWrapper>
  );
}
