import { useSummaryDatasetSuspense } from "../model/use-summary-dataset-suspense";
import { SummarySuccess } from "./summary-success";
import { SummaryDocumentCreditsBody } from "./summary-document-credits-body";
import { SummaryTabularCreditsBody } from "./summary-tabular-credits-body";
import { DATASET_STATUSES } from "@/services/dataset";

export function SummaryContent() {
  const { dataset, isLaunched } = useSummaryDatasetSuspense();

  if (isLaunched) return <SummarySuccess datasetStatus={dataset.status} />;

  if (
    dataset.dataset_type === "document" &&
    dataset.status === DATASET_STATUSES.awaiting_preprocessing
  ) {
    return (
      <SummaryDocumentCreditsBody
        preprocessingMode={dataset.preprocessing_mode}
      />
    );
  }

  return <SummaryTabularCreditsBody />;
}
