import { Suspense } from "react";
import { NewDatasetTitle } from "../_compose/new-dataset-title";
import { NEW_DATASET_KEYS } from "../_lib/new-dataset-routes";
import { NewDatasetStepsLayout } from "../_ui/new-dataset-steps-layout";
import { NewDatasetTitleSkeleton } from "../_ui/new-dataset-title-skeleton";
import { GrowPage } from "./compose/grow-page";
import { GrowSkeleton } from "./ui/grow-skeleton";
import { useParams } from "react-router-dom";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { NewDatasetStepper } from "../_ui/new-dataset-stepper";

function NewDatasetGrowPage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <NewDatasetStepsLayout>
      <NewDatasetStepper stepKey={NEW_DATASET_KEYS.expansion}>
        <Suspense key={dataset_id} fallback={<NewDatasetTitleSkeleton />}>
          <NewDatasetTitle stepKey={NEW_DATASET_KEYS.expansion} />
        </Suspense>
      </NewDatasetStepper>

      <Suspense key={dataset_id} fallback={<GrowSkeleton />}>
        <GrowPage />
      </Suspense>
    </NewDatasetStepsLayout>
  );
}

export const Component = NewDatasetGrowPage;
