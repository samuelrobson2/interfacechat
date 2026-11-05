import { Text } from "@/shared/ui/kit/text";
import {
  FINETUNE_STEP_KEYS,
  type FinetuneStepKey,
} from "../_lib/finetune-routes";
import { DatasetFinetuneBackButton } from "./dataset-finetune-back-button";
import { DatasetFinetuneContinueButton } from "./dataset-finetune-continue-button";
import { FinetuneDatasetTitle } from "./finetune-dataset-title";
import { FinetuneStepper } from "../_ui/finetune-dataset-stepper";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
  FinetuneStepsLayout,
} from "../_ui/finetune-steps-layout";

export function FinetuneMockStepPage({
  stepKey,
  title,
  description,
}: {
  stepKey: FinetuneStepKey;
  title: string;
  description: string;
}) {
  return (
    <FinetuneStepsLayout>
      <FinetuneStepper stepKey={stepKey}>
        <FinetuneDatasetTitle title={title} />
      </FinetuneStepper>
      <FinetuneStepsContentWrapper>
        <DatasetFinetuneBackButton stepKey={stepKey} />

        <FinetuneStepsContent className="flex flex-col items-center justify-center gap-4">
          <Text variant="h2">{title}</Text>
          <Text color="secondary" className="max-w-[640px] text-center">
            {description}
          </Text>
        </FinetuneStepsContent>

        {stepKey === FINETUNE_STEP_KEYS.confirm ? null : (
          <DatasetFinetuneContinueButton stepKey={stepKey} />
        )}
      </FinetuneStepsContentWrapper>
    </FinetuneStepsLayout>
  );
}
