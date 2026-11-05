import { ROUTES } from "@/shared/model/routes";
import { href } from "react-router-dom";
import { DATASET_STATUSES, type DatasetStatus } from "./dataset-statuses";

export function isDatasetReady(status: DatasetStatus) {
  return (
    status === DATASET_STATUSES.ready ||
    status === DATASET_STATUSES.launching ||
    status === DATASET_STATUSES.failed ||
    status === DATASET_STATUSES.preprocessing_failed ||
    status === DATASET_STATUSES.extracting_documents
  );
}

export function getDatasetLink(status: DatasetStatus, dataset_id: string) {
  let link: string = ROUTES.NEW_DATASET_ID;

  if (isDatasetReady(status)) link = ROUTES.DASHBOARD_DATASET;

  return href(link, { dataset_id });
}
