import { useQueryClient } from "@tanstack/react-query";
import { href } from "react-router-dom";

import {
  type SaveInterfaceStatus,
  useChatContext,
  useChatStoreApi,
} from "@/services/chat";
import { rqClient } from "@/shared/api/instance";
import { ROUTES } from "@/shared/model/routes";
import { isSampleDatasetId } from "../../new-visualize/model/sample-visualize";
import { useChartSession } from "./use-chart-session";

const DISPLAYED_CHARTS_PATH = "/datasets/{dataset_id}/charts/displayed";

/**
 * Pins a chart to the dataset info tab.
 *
 * `showOnDataset` comes from `chart.show_on_dataset` on GET /messages so the
 * button reflects a save made in a previous visit, not only this mount.
 */
export function useSaveChart(chartId?: string, showOnDataset = false) {
  const datasetId = useChartSession()?.data?.dataset?.dataset_id;
  const queryClient = useQueryClient();
  const storeApi = useChatStoreApi();
  const setMessages = useChatContext((state) => state.setMessages);

  const { mutate, isPending, isSuccess } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/charts/{chart_id}/display",
  );

  const isSaved = showOnDataset || isSuccess;

  const getStatus = (): SaveInterfaceStatus => {
    if (isSaved) return "saved";
    if (isPending) return "saving";
    return "idle";
  };

  const save = () => {
    if (!datasetId || !chartId || isPending || isSaved) return;

    mutate(
      { params: { path: { dataset_id: datasetId, chart_id: chartId } } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["get", DISPLAYED_CHARTS_PATH],
          });
          // Keep thread + fullscreen buttons in sync without waiting on a refetch.
          setMessages(
            storeApi.getState().messages.map((message) => {
              if (message.chart?.chart_id !== chartId) return message;
              return {
                ...message,
                chart: { ...message.chart, show_on_dataset: true },
              };
            }),
          );
        },
      },
    );
  };

  return {
    status: getStatus(),
    save,
    canSave: Boolean(datasetId && chartId && !isSampleDatasetId(datasetId)),
    savedTo: datasetId
      ? href(ROUTES.DASHBOARD_DATASET, { dataset_id: datasetId })
      : undefined,
  };
}
