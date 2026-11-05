import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { Button } from "@/shared/ui/kit/button";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/kit/radio-group";
import { Separator } from "@/shared/ui/kit/separator";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import { PaymentTopUpForm } from "@/services/payment";
import { SummaryCreditsReduce } from "./summary-credits-reduce";
import { SummaryCreditsSummary } from "./summary-credits-summary";
import { SummaryCreditsTopUp } from "./summary-credits-top-up";

export type SummaryChoiceType = "top-up-credits" | "reduce-rows";

export function SummaryNotEnoughCreditsView({
  choice,
  onChoiceChange,
  onTopUpSubmit,
  isPendingTopUp,
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
  isPendingLaunch,
}: {
  choice: SummaryChoiceType;
  onChoiceChange: (value: SummaryChoiceType) => void;
  onTopUpSubmit: (values: { amount: string }) => void;
  isPendingTopUp: boolean;
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
  isPendingLaunch: boolean;
}) {
  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.summary} />

      <NewDatasetStepsContent>
        <RadioGroup
          value={choice}
          onValueChange={(value) => onChoiceChange(value as SummaryChoiceType)}
          className="grid grid-cols-[1fr_auto_1fr] gap-8"
        >
          <SummaryCreditsTopUp
            radioInput={<RadioGroupItem value="top-up-credits" />}
            title="Top up your credits"
          >
            <PaymentTopUpForm
              disabled={choice !== "top-up-credits"}
              id="payment-top-up-form"
              className="gap-6"
              onSubmit={onTopUpSubmit}
            />
          </SummaryCreditsTopUp>

          <Separator orientation="vertical" color="secondary" />

          <div className="flex-1 flex flex-col gap-14">
            <SummaryCreditsReduce
              key={maxRows}
              disabled={choice !== "reduce-rows"}
              radioInput={<RadioGroupItem value="reduce-rows" />}
              title={reduceTitle}
              tooltipContent={reduceTooltip}
              onValueChange={onValueChange}
              maxRows={maxRows}
              expanded={expanded}
              sliderLabel={sliderLabel}
              launchKind={launchKind}
            />

            <SummaryCreditsSummary
              className="flex-1"
              totalCredits={totalCredits}
              datasetCost={datasetCost}
            />
          </div>
        </RadioGroup>
      </NewDatasetStepsContent>

      {choice === "reduce-rows" ? (
        <Button
          className="w-full"
          onClick={onLaunch}
          isLoading={isPendingLaunch}
        >
          Launch
          <ArrowRightIcon pathClasses="stroke-current" />
        </Button>
      ) : (
        <Button
          className="w-full"
          type="submit"
          form="payment-top-up-form"
          isLoading={isPendingTopUp}
        >
          Top up
          <ArrowRightIcon pathClasses="stroke-current" />
        </Button>
      )}
    </NewDatasetStepsContentWrapper>
  );
}
