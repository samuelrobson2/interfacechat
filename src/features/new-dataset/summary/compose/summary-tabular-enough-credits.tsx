import { useCreditsCalculationSuspenseQuery } from "@/services/payment";
import { PlansListDialog } from "@/services/plans";
import { startTransition, useState } from "react";
import { useLaunchDataset } from "../model/use-launch-dataset";
import { SummaryEnoughCreditsView } from "../ui/summary-enough-credits-view";

export const SummaryTabularEnoughCredits = ({
  maxRows,
}: {
  maxRows: number;
}) => {
  const [plansOpen, setPlansOpen] = useState(false);
  const [rows, setRows] = useState([maxRows]);
  const { launchDataset, isPending } = useLaunchDataset({
    onOpenPlans: () => setPlansOpen(true),
  });
  const { data: tabularCredits } = useCreditsCalculationSuspenseQuery(rows[0]);

  return (
    <>
      <SummaryEnoughCreditsView
        title="If you want to use less credits on this job, reduce the rows."
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
        isPending={isPending}
      />

      <PlansListDialog open={plansOpen} onOpenChange={setPlansOpen} />
    </>
  );
};
