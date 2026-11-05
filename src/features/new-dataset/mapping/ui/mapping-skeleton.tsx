import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { cn } from "@/shared/lib/css";
import { Card } from "@/shared/ui/kit/card";
import { Separator } from "@/shared/ui/kit/separator";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Text } from "@/shared/ui/kit/text";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";

function MappingCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Card className="gap-1.5 p-4">
        <Skeleton className="w-36 h-6" />
      </Card>
      <Skeleton className="w-60 h-6" />
    </div>
  );
}

function TableHeaderCell() {
  return (
    <div className="flex-1 px-3 py-4">
      <Skeleton className="w-[110px] h-6" />
    </div>
  );
}

function TableDataCell() {
  return (
    <div className="flex-1 px-3 py-4">
      <div className="flex flex-col gap-1">
        <Skeleton className="w-full h-[22px]" />
        <Skeleton className="w-60 h-[22px]" />
      </div>
    </div>
  );
}

function TableRow() {
  return (
    <div className="flex items-center h-[62px] border-b border-gray-2">
      <TableDataCell />
      <TableDataCell />
      <TableDataCell />
    </div>
  );
}

export function MappingSkeleton() {
  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.mapping} />

      <NewDatasetStepsContent className="flex flex-col gap-6">
        <div className="flex gap-4 w-full">
          <MappingCardSkeleton className="flex-1" />
          <MappingCardSkeleton className="flex-1" />
          <MappingCardSkeleton className="flex-1" />
        </div>

        <div className="flex gap-3 items-center w-full">
          <Separator className="flex-1" color="secondary" />
          <div className="flex gap-3 items-center">
            <Text variant="title">OR</Text>
            <ChevronBottomIcon />
          </div>
          <Separator className="flex-1" color="secondary" />
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="w-[400px] h-6" />

          <div className="flex flex-col w-full">
            <div className="flex items-center border-b border-gray-2">
              <TableHeaderCell />
              <TableHeaderCell />
              <TableHeaderCell />
            </div>

            <TableRow />
            <TableRow />
            <TableRow />
            <TableRow />
          </div>
        </div>
      </NewDatasetStepsContent>

      <NewDatasetContinueButton stepKey={NEW_DATASET_KEYS.mapping} disabled />
    </NewDatasetStepsContentWrapper>
  );
}
