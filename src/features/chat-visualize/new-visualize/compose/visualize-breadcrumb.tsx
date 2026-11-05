import { AppBreadcrumb } from "@/services/breadcrumb";
import { ROUTES } from "@/shared/model/routes";
import { href } from "react-router-dom";
import { isSampleDatasetId } from "../model/sample-visualize";
import { useSelectedDataset } from "../model/use-selected-dataset";

/** Trail without the dataset segment — also the shape shown while the list loads. */
export function VisualizeBreadcrumbFallback({
  className,
}: {
  className?: string;
}) {
  return (
    <AppBreadcrumb
      className={className}
      root="home"
      items={[{ label: "New visualization" }]}
    />
  );
}

export function VisualizeBreadcrumb({ className }: { className?: string }) {
  const selectedDataset = useSelectedDataset();

  if (!selectedDataset || isSampleDatasetId(selectedDataset.id))
    return <VisualizeBreadcrumbFallback className={className} />;

  return (
    <AppBreadcrumb
      className={className}
      root="datasets"
      items={[
        {
          label: selectedDataset.name,
          to: href(ROUTES.DASHBOARD_DATASET, {
            dataset_id: selectedDataset.id,
          }),
        },
        { label: "New visualization" },
      ]}
    />
  );
}
