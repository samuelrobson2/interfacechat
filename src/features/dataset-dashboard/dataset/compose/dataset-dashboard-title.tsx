import { BreadcrumbTrail } from "@/shared/ui/kit-additions";
import { useDatasetDataSuspense } from "../model/use-dataset-data-suspense";

/**
 * This page's heading, which is also its breadcrumb — the dataset name is both
 * the title and the last crumb, so rendering them separately would say it twice.
 * Only the Dashboard sits behind this page, so the trail resolves to a back
 * arrow plus the name and carries the back link itself.
 *
 * Kept in step with `dataset-demo.page.tsx`, which renders the same header from
 * mock data for the backend-less build.
 */
export function DatasetDashboardTitle() {
  const { dataset } = useDatasetDataSuspense();

  return (
    <BreadcrumbTrail
      size="title"
      items={[{ id: "dataset", label: dataset?.name ?? "Dataset" }]}
      className="min-w-0 flex-1"
    />
  );
}
