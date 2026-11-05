import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { Suspense, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { NewDatasetTitle } from "../_compose/new-dataset-title";
import { NewDatasetWaitingSuspense } from "../_compose/new-dataset-waiting-wrapper";
import { NEW_DATASET_KEYS } from "../_lib/new-dataset-routes";
import { NewDatasetStepsLayout } from "../_ui/new-dataset-steps-layout";
import { NewDatasetTitleSkeleton } from "../_ui/new-dataset-title-skeleton";
import { MappingPage } from "./compose/mapping-page";
import { MappingSkeleton } from "./ui/mapping-skeleton";
import { NewDatasetStepper } from "../_ui/new-dataset-stepper";

const mappingSubtitle: ReactNode = (
  <div className="mx-auto max-w-[620px] text-center">
    Required: You <strong className="font-bold">must</strong> select a{" "}
    <span className="text-blue-5">prompt column</span> OR a{" "}
    <span className="text-rose-2">completion column</span>. You only need one of
    these, if you don&apos;t have the other we can help you create it.
  </div>
);

function NewDatasetMappingPage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <Suspense
      key={dataset_id}
      fallback={
        <NewDatasetStepsLayout>
          <NewDatasetStepper stepKey={NEW_DATASET_KEYS.mapping}>
            <NewDatasetTitleSkeleton />
          </NewDatasetStepper>
          <MappingSkeleton />
        </NewDatasetStepsLayout>
      }
    >
      <NewDatasetWaitingSuspense stepKey={NEW_DATASET_KEYS.mapping}>
        <NewDatasetStepsLayout>
          <NewDatasetStepper stepKey={NEW_DATASET_KEYS.mapping}>
            <Suspense fallback={<NewDatasetTitleSkeleton />}>
              <NewDatasetTitle
                stepKey={NEW_DATASET_KEYS.mapping}
                subtitle={mappingSubtitle}
              />
            </Suspense>
          </NewDatasetStepper>

          <Suspense fallback={<MappingSkeleton />}>
            <MappingPage />
          </Suspense>
        </NewDatasetStepsLayout>
      </NewDatasetWaitingSuspense>
    </Suspense>
  );
}

export const Component = NewDatasetMappingPage;
