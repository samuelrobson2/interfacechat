import { useDatasetSuspenseQuery } from "@/services/dataset";
import { Text } from "@/shared/ui/kit/text";
import { useState } from "react";
import { DatasetFinetuneMetricsContent } from "./dataset-finetune-metrics-content";

export function DatasetFinetuneMetrics() {
  const { data: dataset } = useDatasetSuspenseQuery();
  const finetunes = dataset.finetunes ?? [];
  const [selectedJobId, setSelectedJobId] = useState(finetunes[0]?.job_id);

  if (!finetunes.length || !selectedJobId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text variant="body" className="text-typography-secondary">
          Training metrics are not available yet.
        </Text>
      </div>
    );
  }

  return (
    <DatasetFinetuneMetricsContent
      key={selectedJobId}
      datasetId={dataset.dataset_id}
      jobId={selectedJobId}
      finetunes={finetunes}
      onSelectJobId={setSelectedJobId}
    />
  );
}
