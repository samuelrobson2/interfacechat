import { useSessionStore } from "@/services/auth";
import { NewDatasetStepsTitle } from "../../_ui/new-dataset-steps-layout";
import { useSummaryDatasetSuspense } from "../model/use-summary-dataset-suspense";
import { DATASET_STATUSES } from "@/services/dataset";

export function SummaryTitle() {
  const { isLaunched, dataset } = useSummaryDatasetSuspense();
  const user = useSessionStore((state) => state.user);

  if (isLaunched) return null;

  const isPreprocessing =
    dataset.dataset_type === "document" &&
    dataset.status === DATASET_STATUSES.awaiting_preprocessing;
  const title = isPreprocessing
    ? `${user?.profile?.name}, let's shape your data in the Forge`
    : `${user?.profile?.name}, let's launch your data adaption recipe `;

  const subtitle = isPreprocessing
    ? "We will pre-process the data first, and then we can start the adaption process."
    : "";
  return <NewDatasetStepsTitle title={title} subtitle={subtitle} />;
}
