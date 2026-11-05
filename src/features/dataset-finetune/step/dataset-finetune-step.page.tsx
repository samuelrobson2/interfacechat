import { href, Link, useLoaderData, useParams } from "react-router-dom";
import type { ApiSchemas } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { useFinetuneStepQuery } from "@/services/dataset";
import { resolveFinetuneStepRoute } from "../_lib/resolve-finetune-step-route";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
  FinetuneStepsLayout,
} from "../_ui/finetune-steps-layout";
import { FinetuneStepper } from "../_ui/finetune-dataset-stepper";
import { FinetuneDatasetTitle } from "../_compose/finetune-dataset-title";

function DatasetFinetuneStepPage() {
  const { dataset_id, step_key } = useParams();
  const decodedStepKey = step_key ? decodeURIComponent(step_key) : "";
  const steps = useLoaderData() as ApiSchemas["FinetuneStepDto"][] | undefined;
  const { data } = useFinetuneStepQuery(dataset_id, decodedStepKey);
  if (!dataset_id || !decodedStepKey || !steps?.length || !data?.step) return null;
  const currentIndex = steps.findIndex((step) => step.key === decodedStepKey);
  const previousStep = currentIndex > 0 ? steps[currentIndex - 1] : undefined;
  const nextStep =
    currentIndex >= 0 && currentIndex + 1 < steps.length
      ? steps[currentIndex + 1]
      : undefined;

  return (
    <FinetuneStepsLayout>
      <FinetuneStepper stepKey={decodedStepKey}>
        <FinetuneDatasetTitle title={data.step.title} />
      </FinetuneStepper>
      <FinetuneStepsContentWrapper>
        <Button className="w-full" variant="secondary" asChild>
          <Link
            to={
              previousStep
                ? resolveFinetuneStepRoute(dataset_id, previousStep.key)
                : href(ROUTES.DASHBOARD_DATASET, { dataset_id })
            }
          >
            Back
          </Link>
        </Button>

        <FinetuneStepsContent className="flex flex-col items-center justify-center gap-4">
          <Text variant="h2">{data.step.title}</Text>
          <Text color="secondary" className="max-w-[640px] text-center">
            Step key: <span className="font-medium">{decodedStepKey}</span>
          </Text>
          <Text color="secondary" className="max-w-[640px] text-center">
            This step is available from backend and routed on frontend. UI for this
            step is not implemented yet.
          </Text>
        </FinetuneStepsContent>

        {nextStep ? (
          <Button className="ml-auto w-full" variant="primary" asChild>
            <Link to={resolveFinetuneStepRoute(dataset_id, nextStep.key)}>
              Continue
            </Link>
          </Button>
        ) : null}
      </FinetuneStepsContentWrapper>
    </FinetuneStepsLayout>
  );
}

export const Component = DatasetFinetuneStepPage;
