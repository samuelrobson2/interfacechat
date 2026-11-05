import { Suspense } from "react";
import { FINETUNE_STEP_KEYS } from "../_lib/finetune-routes";
import { FinetuneStepper } from "../_ui/finetune-dataset-stepper";
import { FinetuneStepsLayout } from "../_ui/finetune-steps-layout";
import { AugmentationPage } from "./compose/augmentation-page";
import { AugmentationPageSkeleton } from "./ui/augmentation-page-skeleton";

function DatasetFinetuneAugmentationPage() {
  return (
    <FinetuneStepsLayout>
      <FinetuneStepper stepKey={FINETUNE_STEP_KEYS.augmentation} />
      <Suspense fallback={<AugmentationPageSkeleton />}>
        <AugmentationPage />
      </Suspense>
    </FinetuneStepsLayout>
  );
}

export const Component = DatasetFinetuneAugmentationPage;
