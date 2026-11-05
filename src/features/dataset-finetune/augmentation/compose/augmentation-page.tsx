import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { datasetQueryOptions } from "@/services/dataset";
import { Separator } from "@/shared/ui/kit/separator";
import coneImage from "@/shared/assets/images/diagnosis/diagnosis-add-data-yes.png";
import inclinedCirclesImage from "@/shared/assets/images/diagnosis/diagnosis-diverse-yes.png";
import { DatasetFinetuneBackButton } from "../../_compose/dataset-finetune-back-button";
import { DatasetFinetuneContinueButton } from "../../_compose/dataset-finetune-continue-button";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
} from "../../_ui/finetune-steps-layout";
import { AugmentationOption } from "./augmentation-option";
import { useAugmentationContinue } from "../model/use-augmentation-continue";
import { useAugmentationStepData } from "../model/use-augmentation-step-data";
import { useAugmentationState } from "../model/use-augmentation-state";
import { Text } from "@/shared/ui/kit/text";

const MAX_DOMAIN_DATAPOINTS = 20_000;
const MAX_GENERAL_DATAPOINTS = 50_000;

export function AugmentationPage() {
  const {
    datasetId,
    step,
    initialDomainDatapoints,
    initialGeneralDatapoints,
    shouldShowDomainSlider,
    shouldShowGeneralSlider,
  } = useAugmentationStepData();
  const {
    domainDatapoints,
    generalDatapoints,
    updateDomainDatapoints,
    updateGeneralDatapoints,
  } = useAugmentationState({
    initialDomainDatapoints,
    initialGeneralDatapoints,
    maxDomainDatapoints: MAX_DOMAIN_DATAPOINTS,
    maxGeneralDatapoints: MAX_GENERAL_DATAPOINTS,
  });
  const { data: credits } = useQuery({
    ...datasetQueryOptions.finetuneCalculate(datasetId ?? "", {
      augmentation_domain_rows: domainDatapoints,
      augmentation_general_rows: generalDatapoints,
    }),
    enabled: Boolean(datasetId),
    placeholderData: keepPreviousData,
  });

  const { submit, isPending } = useAugmentationContinue();

  // BE owns the threshold and returns meetsMinimumTrainingRows; render the
  // BE-supplied belowMinimumMessage and disable Continue when the gate trips.
  const meetsMinimumTrainingRows = credits?.meetsMinimumTrainingRows ?? null;
  const belowMinimumMessage = credits?.belowMinimumMessage ?? null;
  const isBelowMinimumRows = meetsMinimumTrainingRows === false;

  // Compute per-option cost optimistically using the rate the BE returned, so
  // the label updates instantly while the slider moves instead of lagging the
  // /finetune/calculate refetch. Falls back to a 100-rows-per-credit default
  // until the first response lands. BE remains the source of truth for the
  // total on the credits screen.
  const rowsPerCredit = credits?.augmentationRowsPerCredit ?? 100;
  const formatCost = (rows: number) =>
    `${Math.ceil(rows / rowsPerCredit).toLocaleString()} Credits`;
  const domainCostLabel = formatCost(domainDatapoints);
  const generalCostLabel = formatCost(generalDatapoints);
  const totalDatasetRows = credits?.estimatedTrainingRows ?? null;

  const handleContinue = () => {
    if (!datasetId) return;
    submit({
      datasetId,
      stepKey: step.key,
      fields: step.fields,
      augmentationDomainRows: domainDatapoints,
      augmentationGeneralRows: generalDatapoints,
    });
  };

  return (
    <FinetuneStepsContentWrapper>
      <DatasetFinetuneBackButton stepKey={FINETUNE_STEP_KEYS.augmentation} />

      <FinetuneStepsContent className="flex flex-col gap-10 overflow-y-auto no-scrollbar py-2">
        {shouldShowDomainSlider && (
          <AugmentationOption
            title="You have less than 8,000 datapoints"
            subtitle="Our research shows training with less than 8,000 data points leads to inferior results."
            actionLabel="Add additional domain specific data points"
            imageSrc={coneImage}
            currentCostLabel={domainCostLabel}
            imageAlt="Domain datapoints augmentation"
            value={domainDatapoints}
            onValueChange={updateDomainDatapoints}
            maxRows={MAX_DOMAIN_DATAPOINTS}
            lessThanMarker={8000}
            totalDatasetRows={totalDatasetRows}
          />
        )}

        {shouldShowDomainSlider && shouldShowGeneralSlider && (
          <Separator color="secondary" />
        )}

        {shouldShowGeneralSlider && (
          <AugmentationOption
            title="Your dataset isn't diverse enough"
            subtitle="Research shows that achieving the best training performance requires domain diversity. We recommend maintaining 40% general purpose datapoints to preserve model capabilities."
            actionLabel="Add additional general purpose data points"
            imageSrc={inclinedCirclesImage}
            currentCostLabel={generalCostLabel}
            imageAlt="General purpose datapoints augmentation"
            value={generalDatapoints}
            onValueChange={updateGeneralDatapoints}
            maxRows={MAX_GENERAL_DATAPOINTS}
            totalDatasetRows={totalDatasetRows}
          />
        )}

        {isBelowMinimumRows && belowMinimumMessage && (
          <Text color="secondary" className="max-w-[520px] text-balance">
            {belowMinimumMessage}
          </Text>
        )}
      </FinetuneStepsContent>

      <DatasetFinetuneContinueButton
        stepKey={FINETUNE_STEP_KEYS.augmentation}
        disabled={isPending || isBelowMinimumRows}
        isLoading={isPending}
        onClick={() => handleContinue()}
      />
    </FinetuneStepsContentWrapper>
  );
}
