import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { NewDatasetStepsLayout } from "../_ui/new-dataset-steps-layout";
import { NewDatasetTitleSkeleton } from "../_ui/new-dataset-title-skeleton";
import { SummaryContent } from "./compose/summary-content";
import { SummaryTitle } from "./compose/summary-title";
import { SummarySkeleton } from "./ui/summary-skeleton";
import { usePaymentLoader } from "@/services/payment";
import { NewDatasetStepper } from "../_ui/new-dataset-stepper";
import { NEW_DATASET_KEYS } from "../_lib/new-dataset-routes";

function NewDatasetSummaryPage() {
  usePaymentLoader();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <NewDatasetStepsLayout>
      <NewDatasetStepper stepKey={NEW_DATASET_KEYS.summary}>
        <Suspense key={dataset_id} fallback={<NewDatasetTitleSkeleton />}>
          <SummaryTitle />
        </Suspense>
      </NewDatasetStepper>

      <Suspense key={dataset_id} fallback={<SummarySkeleton />}>
        <SummaryContent />
      </Suspense>
    </NewDatasetStepsLayout>
  );
}

export const Component = NewDatasetSummaryPage;
