import { Separator } from "@/shared/ui/kit/separator";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";

// Mirrors one column: icon + title/badge + add button + percent label/slider
function GrowColumnSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-8 items-center min-w-0">
      <Skeleton className="size-[90px] shrink-0" />

      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="w-[220px] h-7" />
          <Skeleton className="w-[100px] h-9 rounded-[44px]" />
        </div>

        <Skeleton className="w-[120px] h-6" />

        <div className="flex flex-col gap-4 w-full">
          <Skeleton className="w-[183px] h-6" />
          <Skeleton className="w-full h-4" />
        </div>
      </div>
    </div>
  );
}

export function GrowSkeleton() {
  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.expansion} />

      <NewDatasetStepsContent className="flex flex-col gap-10">
        <div className="flex gap-8 items-start w-full">
          <GrowColumnSkeleton />

          <Separator orientation="vertical" color="secondary" />

          <GrowColumnSkeleton />
        </div>
      </NewDatasetStepsContent>

      <NewDatasetContinueButton stepKey={NEW_DATASET_KEYS.expansion} disabled />
    </NewDatasetStepsContentWrapper>
  );
}
