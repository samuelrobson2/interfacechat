import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useQueryClient } from "@tanstack/react-query";
import { datasetQueryOptions } from "./dataset-query-options";

type DisplayedCharts = ApiSchemas["DatasetDisplayedChartsResponseDto"];

/**
 * Unpins a chart from the dataset info tab: the card leaves the grid right
 * away and is put back if the request fails.
 */
export function useDeleteDisplayedChart(datasetId: string) {
  const queryClient = useQueryClient();
  const { queryKey } = datasetQueryOptions.displayedCharts(datasetId);

  const { mutate, isPending } = rqClient.useMutation(
    "delete",
    "/datasets/{dataset_id}/charts/{chart_id}/display",
  );

  const deleteChart = (chartId: string) => {
    const restore = queryClient.getQueryData<DisplayedCharts>(queryKey);

    queryClient.setQueryData<DisplayedCharts>(queryKey, (current) =>
      current
        ? {
            ...current,
            charts: current.charts.filter(
              (chart) => chart.chart_id !== chartId,
            ),
          }
        : current,
    );

    mutate(
      { params: { path: { dataset_id: datasetId, chart_id: chartId } } },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => {
          queryClient.setQueryData(queryKey, restore);
          toast.error(getApiErrorMessage(error, "Failed to remove the chart"));
        },
      },
    );
  };

  return { deleteChart, isPending };
}
