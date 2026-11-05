import { Suspense } from "react";
import { NewDatasetTitle } from "../_compose/new-dataset-title";
import { NEW_DATASET_KEYS } from "../_lib/new-dataset-routes";
import { NewDatasetStepsLayout } from "../_ui/new-dataset-steps-layout";
import { NewDatasetTitleSkeleton } from "../_ui/new-dataset-title-skeleton";
import { RecipesPage } from "./compose/recipes-page";
import { RecipesSkeleton } from "./ui/recipes-skeleton";
import { useParams } from "react-router-dom";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { NewDatasetStepper } from "../_ui/new-dataset-stepper";

function NewDatasetRecipesPage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <NewDatasetStepsLayout>
      <NewDatasetStepper stepKey={NEW_DATASET_KEYS.recipes}>
        <Suspense key={dataset_id} fallback={<NewDatasetTitleSkeleton />}>
          <NewDatasetTitle stepKey={NEW_DATASET_KEYS.recipes} />
        </Suspense>
      </NewDatasetStepper>

      <Suspense key={dataset_id} fallback={<RecipesSkeleton />}>
        <RecipesPage />
      </Suspense>
    </NewDatasetStepsLayout>
  );
}

export const Component = NewDatasetRecipesPage;
