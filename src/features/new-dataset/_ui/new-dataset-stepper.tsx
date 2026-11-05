import { FlowStepper } from "@/shared/ui/flow-stepper";
import { NewDatasetStepsHeader } from "./new-dataset-steps-layout";
import { type NewDatasetKeys } from "../_lib/new-dataset-routes";
import { useRouteLoaderData } from "react-router-dom";
import { newDatasetStepsLoader } from "../_model/new-dataset-steps-loader";

export function NewDatasetStepper({
  stepKey,
  children,
}: {
  stepKey: NewDatasetKeys;
  children: React.ReactNode;
}) {
  const steps =
    useRouteLoaderData<typeof newDatasetStepsLoader>("dataset-steps");

  return (
    <NewDatasetStepsHeader>
      <FlowStepper steps={steps ?? []} stepKey={stepKey} />
      {children}
    </NewDatasetStepsHeader>
  );
}
