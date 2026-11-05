import {
  useCreditsCalculationSuspenseQuery,
  useCreditsTopUp,
} from "@/services/payment";
import { PlansListDialog } from "@/services/plans";
import { startTransition, useState } from "react";
import { useLaunchDataset } from "../model/use-launch-dataset";
import {
  SummaryNotEnoughCreditsView,
  type SummaryChoiceType,
} from "../ui/summary-not-enough-credits-view";

export const SummaryTabularNotEnoughCredits = ({
  maxRows,
}: {
  maxRows: number;
}) => {
  const [plansOpen, setPlansOpen] = useState(false);
  const [choice, setChoice] = useState<SummaryChoiceType>("top-up-credits");
  const [rows, setRows] = useState([maxRows]);

  const { launchDataset, isPending: isPendingLaunchDataset } = useLaunchDataset(
    { onOpenPlans: () => setPlansOpen(true) },
  );
  const { topUpCredits, isPending: isPendingTopUp } = useCreditsTopUp();
  const { data: tabularCredits } = useCreditsCalculationSuspenseQuery(rows[0]);

  return (
    <>
      <SummaryNotEnoughCreditsView
        choice={choice}
        onChoiceChange={setChoice}
        onTopUpSubmit={(values) => topUpCredits(Number(values.amount))}
        isPendingTopUp={isPendingTopUp}
        reduceTitle="Reduce Rows"
        reduceTooltip="Specify the total number of rows you want to adapt."
        onValueChange={(value) => startTransition(() => setRows(value))}
        maxRows={tabularCredits?.maxRowsProcessable ?? 1}
        expanded={
          Number(tabularCredits?.expansionConfig?.expansionFactor) > 1
            ? tabularCredits?.estimatedOutputRows
            : 0
        }
        totalCredits={tabularCredits?.availableCredits || 0}
        datasetCost={tabularCredits?.costRequestedRows ?? 0}
        onLaunch={() => launchDataset(rows[0]!)}
        isPendingLaunch={isPendingLaunchDataset}
      />

      <PlansListDialog open={plansOpen} onOpenChange={setPlansOpen} />
    </>
  );
};
