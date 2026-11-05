import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { QuestionnairePage } from "./compose/questionnaire-page";
import { QuestionnaireSkeleton } from "../_ui/questionnaire-skeleton";

function NewDatasetQuestionnairePage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();

  return (
    <div className="w-full h-screen pt-25">
      <Suspense key={dataset_id} fallback={<QuestionnaireSkeleton />}>
        <QuestionnairePage />
      </Suspense>
    </div>
  );
}

export const Component = NewDatasetQuestionnairePage;
