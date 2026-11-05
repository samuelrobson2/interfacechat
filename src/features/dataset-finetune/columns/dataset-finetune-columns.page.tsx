import { Suspense } from "react";
import { FinetuneDatasetTitle } from "../_compose/finetune-dataset-title";
import { FINETUNE_STEP_KEYS } from "../_lib/finetune-routes";
import { FinetuneStepper } from "../_ui/finetune-dataset-stepper";
import { FinetuneStepsLayout } from "../_ui/finetune-steps-layout";
import { ColumnsPage } from "./compose/columns-page";
import { ColumnsPageSkeleton } from "./ui/columns-page-skeleton";

function DatasetFinetuneColumnsPage() {
  return (
    <FinetuneStepsLayout>
      <FinetuneStepper stepKey={FINETUNE_STEP_KEYS.columns}>
        <FinetuneDatasetTitle title="Select columns for training" />
      </FinetuneStepper>
      <Suspense fallback={<ColumnsPageSkeleton />}>
        <ColumnsPage />
      </Suspense>
    </FinetuneStepsLayout>
  );
}

export const Component = DatasetFinetuneColumnsPage;
