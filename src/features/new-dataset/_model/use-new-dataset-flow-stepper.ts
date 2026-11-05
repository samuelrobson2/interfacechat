import { useRouteLoaderData } from "react-router-dom";
import type { NewDatasetKeys } from "../_lib/new-dataset-routes";
import type { newDatasetStepsLoader } from "./new-dataset-steps-loader";
import type { FlowStep } from "@/shared/ui/flow-stepper";

export function useNewDatasetFlowStepper(stepKey: NewDatasetKeys) {
  const steps =
    useRouteLoaderData<typeof newDatasetStepsLoader>("dataset-steps");

  const currentStep = steps?.find((s) => s.key === stepKey)?.order ?? 1;
  const mappedSteps: FlowStep[] =
    steps?.map((step) => ({
      key: String(step.id),
      title: step.step_name,
      order: step.order,
    })) ?? [];

  return { currentStep, mappedSteps };
}
