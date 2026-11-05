import { Suspense } from "react";
import { NewDatasetTitle } from "../_compose/new-dataset-title";
import { NEW_DATASET_KEYS } from "../_lib/new-dataset-routes";
import { NewDatasetStepsLayout } from "../_ui/new-dataset-steps-layout";
import { NewDatasetTitleSkeleton } from "../_ui/new-dataset-title-skeleton";
import { DiagnosisPage } from "./compose/diagnosis-page";
import { DiagnosisSkeleton } from "./ui/diagnosis-skeleton";
import { NewDatasetWaitingSuspense } from "../_compose/new-dataset-waiting-wrapper";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useParams } from "react-router-dom";
import { NewDatasetStepper } from "../_ui/new-dataset-stepper";

function NewDatasetDataDiagnosisPage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <Suspense
      key={dataset_id}
      fallback={
        <NewDatasetStepsLayout>
          <NewDatasetStepper stepKey={NEW_DATASET_KEYS.diagnosis}>
            <NewDatasetTitleSkeleton />
          </NewDatasetStepper>
          <DiagnosisSkeleton />
        </NewDatasetStepsLayout>
      }
    >
      <NewDatasetWaitingSuspense stepKey={NEW_DATASET_KEYS.diagnosis}>
        <NewDatasetStepsLayout>
          <NewDatasetStepper stepKey={NEW_DATASET_KEYS.diagnosis}>
            <Suspense fallback={<NewDatasetTitleSkeleton />}>
              <NewDatasetTitle stepKey={NEW_DATASET_KEYS.diagnosis} />
            </Suspense>
          </NewDatasetStepper>

          <Suspense fallback={<DiagnosisSkeleton />}>
            <DiagnosisPage />
          </Suspense>
        </NewDatasetStepsLayout>
      </NewDatasetWaitingSuspense>
    </Suspense>
  );
}

export const Component = NewDatasetDataDiagnosisPage;
