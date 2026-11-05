import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { Button } from "@/shared/ui/kit/button";
import { Card } from "@/shared/ui/kit/card";
import { Separator } from "@/shared/ui/kit/separator";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";

export function SummarySkeleton() {
  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.summary} />

      <NewDatasetStepsContent className="flex flex-col gap-15 items-center">
        <Skeleton className="w-[400px] h-9" />

        <div className="flex gap-8 items-start w-full">
          <div className="flex-1 flex flex-col gap-8 items-center">
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="w-full h-6" />
              <Skeleton className="w-[237px] h-6" />
            </div>

            <div className="flex flex-col gap-4 w-full">
              <Skeleton className="w-[200px] h-[38px]" />

              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <Skeleton className="w-[100px] h-5" />
                  <Skeleton className="w-20 h-9" />
                </div>
                <Skeleton className="w-full h-4" />
              </div>

              <Skeleton className="w-80 h-5" />
            </div>
          </div>

          <Separator orientation="vertical" color="secondary" />

          <Card className="p-8 rounded-[8px] [--hairline-radius:8px] self-stretch w-[412px]">
            <Skeleton className="w-[200px] h-[38px]" />

            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between w-full">
                <Skeleton className="w-[135px] h-7" />
                <Skeleton className="w-[135px] h-7" />
              </div>

              <div className="flex items-center justify-between w-full">
                <Skeleton className="w-[135px] h-7" />
                <Skeleton className="w-[135px] h-7" />
              </div>
            </div>
          </Card>
        </div>
      </NewDatasetStepsContent>

      <Button className="w-full" variant="primary" disabled>
        Launch
        <ArrowRightIcon pathClasses="stroke-current" />
      </Button>
    </NewDatasetStepsContentWrapper>
  );
}
