import { usePaymentLoader } from "@/services/payment";
import { Suspense } from "react";
import { FINETUNE_STEP_KEYS } from "../_lib/finetune-routes";
import { FinetuneStepsLayout } from "../_ui/finetune-steps-layout";
import { FinetuneStepper } from "../_ui/finetune-dataset-stepper";
import { CreditsPage } from "./compose/credits-page";
import { CreditsPageSkeleton } from "./ui/credits-page-skeleton";

function DatasetFinetuneCreditsPage() {
  usePaymentLoader();

  return (
    <FinetuneStepsLayout>
      <FinetuneStepper stepKey={FINETUNE_STEP_KEYS.credits} />
      <Suspense fallback={<CreditsPageSkeleton />}>
        <CreditsPage />
      </Suspense>
    </FinetuneStepsLayout>
  );
}

export const Component = DatasetFinetuneCreditsPage;
