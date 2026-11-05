import { FlowStepper } from "@/shared/ui/flow-stepper";
import type { ApiSchemas } from "@/shared/api/schema";
import { FinetuneStepsHeader } from "./finetune-steps-layout";
import { useLoaderData } from "react-router-dom";

const toFlowStep = (
  step: ApiSchemas["FinetuneStepDto"],
): ApiSchemas["Step"] => ({
  id: step.id,
  key: step.key,
  step_name: step.step_name ?? step.title,
  title: step.title,
  description: step.description,
  order: step.order,
  created_at: new Date(0).toISOString(),
  completed: step.completed,
  fields: {},
});

export function FinetuneStepper({
  stepKey,
  children,
}: {
  stepKey: string;
  children?: React.ReactNode;
}) {
  const stepsData = useLoaderData() as
    | ApiSchemas["FinetuneStepDto"][]
    | undefined;
  if (!stepsData || stepsData.length === 0) {
    return <FinetuneStepsHeader>{children}</FinetuneStepsHeader>;
  }

  const steps = stepsData
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(toFlowStep);
  if (steps.length === 0) return <FinetuneStepsHeader>{children}</FinetuneStepsHeader>;

  return (
    <FinetuneStepsHeader>
      <FlowStepper steps={steps} stepKey={stepKey} />
      {children && children}
    </FinetuneStepsHeader>
  );
}
