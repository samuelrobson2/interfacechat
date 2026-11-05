import type { NewDatasetKeys } from "../_lib/new-dataset-routes";
import { useDatasetStepSuspenseQuery } from "../_model/use-dataset-step-query";
import { NewDatasetStepsTitle } from "../_ui/new-dataset-steps-layout";
import type { ReactNode } from "react";

export function NewDatasetTitle({
  stepKey,
  proPlan = false,
  title,
  subtitle,
}: {
  stepKey: NewDatasetKeys;
  proPlan?: boolean;
  title?: string;
  subtitle?: ReactNode;
}) {
  const { data } = useDatasetStepSuspenseQuery(stepKey);

  const stepTitle = "step" in data ? data?.step?.title : undefined;

  return (
    <NewDatasetStepsTitle
      title={title || stepTitle}
      subtitle={subtitle}
      proPlan={proPlan}
    />
  );
}
