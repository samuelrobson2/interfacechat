import { Separator } from "@/shared/ui/kit/separator";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";

function ControlBrandTagCardSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-8 items-center min-w-0">
      <Skeleton className="size-[90px] shrink-0" />

      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="w-[104px] h-7" />
          <div className="flex flex-col gap-1 w-[159px]">
            <Skeleton className="w-full h-[18px]" />
            <Skeleton className="w-[99px] h-[22px]" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Skeleton className="w-[120px] h-11 rounded-full" />
          <Skeleton className="w-[120px] h-11 rounded-full" />
          <Skeleton className="w-[120px] h-11 rounded-full" />
          <Skeleton className="w-[120px] h-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ControlBrandSkeleton() {
  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.brand} />

      <NewDatasetStepsContent className="flex flex-col gap-10 pb-6">
        {/* Custom settings block: icon + textarea */}
        <div className="flex gap-6.5 items-start w-full">
          <Skeleton className="size-[90px] shrink-0" />
          <div className="flex flex-col gap-4 flex-1">
            <Skeleton className="w-[162px] h-7" />
            <Skeleton className="w-full h-[136px]" />
          </div>
        </div>

        <Separator color="secondary" />

        {/* Two-column tone/tags section */}
        <div className="flex gap-8 items-start w-full">
          <ControlBrandTagCardSkeleton />
          <Separator orientation="vertical" color="secondary" />
          <ControlBrandTagCardSkeleton />
        </div>

        <Separator color="secondary" />

        {/* Bottom toggle block: icon + text + toggle */}
        <div className="flex gap-6.5 items-center w-full">
          <Skeleton className="size-[100px] shrink-0" />
          <div className="flex flex-1 gap-2 items-start justify-between min-w-0">
            <div className="flex flex-1 flex-col gap-2 min-w-0">
              <Skeleton className="w-[245px] h-7" />
              <Skeleton className="w-[194px] h-6" />
            </div>
            <Skeleton className="w-16 h-7 rounded-[36px] shrink-0" />
          </div>
        </div>
      </NewDatasetStepsContent>

      <NewDatasetContinueButton stepKey={NEW_DATASET_KEYS.brand} disabled />
    </NewDatasetStepsContentWrapper>
  );
}
