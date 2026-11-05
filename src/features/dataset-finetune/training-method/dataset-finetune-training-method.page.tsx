import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { TrainingMethodPage } from "./compose/training-method-page";
import { TrainingMethodSkeleton } from "./ui/training-method-skeleton";

function DatasetFinetuneTrainingMethodPage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <div className="w-full h-screen pt-25">
      <Suspense key={dataset_id} fallback={<TrainingMethodSkeleton />}>
        <TrainingMethodPage />
      </Suspense>
    </div>
  );
}

export const Component = DatasetFinetuneTrainingMethodPage;
