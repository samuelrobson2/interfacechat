import { useCreditsTopUp } from "@/services/payment";
import { startTransition, useState } from "react";
import { useLaunchPreprocessingDataset } from "../model/use-launch-dataset";
import type { SummaryDocumentPreprocessingCreditsValue } from "../model/use-summary-document-preprocessing-credits";
import {
  SummaryNotEnoughCreditsView,
  type SummaryChoiceType,
} from "../ui/summary-not-enough-credits-view";

export const SummaryDocumentNotEnoughCredits = ({
  credit,
}: {
  credit: SummaryDocumentPreprocessingCreditsValue;
}) => {
  const [choice, setChoice] = useState<SummaryChoiceType>("top-up-credits");
  const { topUpCredits, isPending: isPendingTopUp } = useCreditsTopUp();
  const { launchDataset, isPending: isPendingLaunch } =
    useLaunchPreprocessingDataset();

  return (
    <SummaryNotEnoughCreditsView
      choice={choice}
      onChoiceChange={setChoice}
      onTopUpSubmit={(values) => topUpCredits(Number(values.amount))}
      isPendingTopUp={isPendingTopUp}
      reduceTitle={credit.reduceTitle}
      reduceTooltip={credit.reduceTooltip}
      onValueChange={(value) => startTransition(() => credit.setBudget(value))}
      maxRows={credit.maxBudget}
      sliderLabel={credit.budgetKind}
      launchKind="preprocessing"
      totalCredits={credit.availableCredits}
      datasetCost={credit.datasetCost}
      onLaunch={() => launchDataset(credit.launchBody)}
      isPendingLaunch={isPendingLaunch}
    />
  );
};
