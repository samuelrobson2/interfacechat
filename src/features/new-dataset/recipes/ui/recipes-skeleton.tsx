import { Card } from "@/shared/ui/kit/card";
import { Separator } from "@/shared/ui/kit/separator";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";

function RecipeItemSkeleton() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between w-full">
        <Skeleton className="w-[120px] h-6" />
        <Skeleton className="w-16 h-7 rounded-[36px]" />
      </div>

      <div className="flex flex-col gap-1 w-full">
        <Skeleton className="w-full h-[18px]" />
        <Skeleton className="w-[220px] h-[18px]" />
      </div>
    </div>
  );
}

function RecipeColumnSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-8">
      <RecipeItemSkeleton />
      <RecipeItemSkeleton />
    </div>
  );
}

export function RecipesSkeleton() {
  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.recipes} />

      <NewDatasetStepsContent className="flex flex-col h-full">
        <Card className="flex-row gap-8 p-8 rounded-[8px] [--hairline-radius:8px] h-fit">
          <RecipeColumnSkeleton />

          <Separator orientation="vertical" color="secondary" />

          <RecipeColumnSkeleton />
        </Card>
      </NewDatasetStepsContent>

      <NewDatasetContinueButton stepKey={NEW_DATASET_KEYS.recipes} disabled />
    </NewDatasetStepsContentWrapper>
  );
}
