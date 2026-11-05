import { startTransition } from "react";
import { useLaunchPreprocessingDataset } from "../model/use-launch-dataset";
import type { SummaryDocumentPreprocessingCreditsValue } from "../model/use-summary-document-preprocessing-credits";
import { SummaryEnoughCreditsView } from "../ui/summary-enough-credits-view";

export const SummaryDocumentEnoughCredits = ({
  credit,
}: {
  credit: SummaryDocumentPreprocessingCreditsValue;
}) => {
  const { launchDataset, isPending } = useLaunchPreprocessingDataset();

  return (
    <SummaryEnoughCreditsView
      title={credit.enoughTitle}
      reduceTitle={credit.reduceTitle}
      reduceTooltip={credit.reduceTooltip}
      onValueChange={(value) => startTransition(() => credit.setBudget(value))}
      maxRows={credit.maxBudget}
      sliderLabel={credit.budgetKind}
      launchKind="preprocessing"
      totalCredits={credit.availableCredits}
      datasetCost={credit.datasetCost}
      onLaunch={() => launchDataset(credit.launchBody)}
      isPending={isPending}
    />
  );
};
