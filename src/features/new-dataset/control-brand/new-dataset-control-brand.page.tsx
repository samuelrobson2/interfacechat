import { Suspense } from "react";
import { NewDatasetTitle } from "../_compose/new-dataset-title";
import { NEW_DATASET_KEYS } from "../_lib/new-dataset-routes";
import { NewDatasetStepsLayout } from "../_ui/new-dataset-steps-layout";
import { NewDatasetTitleSkeleton } from "../_ui/new-dataset-title-skeleton";
import { ControlBrandPage } from "./compose/control-brand-page";
import { ControlBrandSkeleton } from "./ui/control-brand-skeleton";
import { useParams } from "react-router-dom";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { NewDatasetStepper } from "../_ui/new-dataset-stepper";

function NewDatasetControlBrandPage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <NewDatasetStepsLayout>
      <NewDatasetStepper stepKey={NEW_DATASET_KEYS.brand}>
        <Suspense key={dataset_id} fallback={<NewDatasetTitleSkeleton />}>
          <NewDatasetTitle stepKey={NEW_DATASET_KEYS.brand} proPlan />
        </Suspense>
      </NewDatasetStepper>

      <Suspense key={dataset_id} fallback={<ControlBrandSkeleton />}>
        <ControlBrandPage />
      </Suspense>
    </NewDatasetStepsLayout>
  );
}

export const Component = NewDatasetControlBrandPage;
