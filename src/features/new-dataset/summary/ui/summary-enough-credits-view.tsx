import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import { Text } from "@/shared/ui/kit/text";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import { SummaryCreditsReduce } from "./summary-credits-reduce";
import { SummaryCreditsSummary } from "./summary-credits-summary";

export function SummaryEnoughCreditsView({
  title,
  reduceTitle,
  reduceTooltip,
  onValueChange,
  maxRows,
  expanded,
  sliderLabel,
  launchKind,
  totalCredits,
  datasetCost,
  onLaunch,
  isPending,
}: {
  title: string;
  reduceTitle: string;
  reduceTooltip: string;
  onValueChange: (value: number[]) => void;
  maxRows: number;
  expanded?: number;
  sliderLabel?: string;
  launchKind?: "preprocessing" | "adaption";
  totalCredits: number;
  datasetCost: number;
  onLaunch: () => void;
  isPending: boolean;
}) {
  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.summary} />

      <NewDatasetStepsContent className="grid grid-cols-[1fr_auto_1fr] gap-8 h-fit">
        <div className="flex-1 flex flex-col gap-8">
          <Text variant="title">{title}</Text>

          <SummaryCreditsReduce
            key={maxRows}
            title={reduceTitle}
            tooltipContent={reduceTooltip}
            onValueChange={onValueChange}
            maxRows={maxRows}
            expanded={expanded}
            sliderLabel={sliderLabel}
            launchKind={launchKind}
          />
        </div>

        <Separator orientation="vertical" color="secondary" />

        <SummaryCreditsSummary
          className="flex-1"
          totalCredits={totalCredits}
          datasetCost={datasetCost}
        />
      </NewDatasetStepsContent>

      <Button className="w-full" onClick={onLaunch} isLoading={isPending}>
        Launch
        <ArrowRightIcon pathClasses="stroke-current" />
      </Button>
    </NewDatasetStepsContentWrapper>
  );
}
