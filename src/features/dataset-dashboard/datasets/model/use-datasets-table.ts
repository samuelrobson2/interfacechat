import {
  DATASET_STATUSES,
  datasetQueryOptions,
  isFinetuneJobTerminal,
  type DatasetStatus,
} from "@/services/dataset";
import type { ApiSchemas } from "@/shared/api/schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DEMO_MODE, DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";

// DEV_AUTH_BYPASS means "navigable without a working backend" repo-wide (see
// dev-auth-bypass.ts) — without this, the query below throws on the missing
// API and crashes the whole page instead of rendering mock rows.
const USE_MOCK_DATASETS = DEMO_MODE || DEV_AUTH_BYPASS;
import { useDatasetsProgress } from "./use-datasets-progress";
import { MOCK_DATASETS_RESPONSE } from "./datasets-mock-data";

const DEFAULT_PAGE_SIZE = 10;

// A generated interface, keyed by the chat session + app it was produced from.
export type DatasetInterfaceSummary = {
  session_id: string;
  app_id: string;
};

export type DatasetListRow = ApiSchemas["DatasetListItemDto"] & {
  progress_percentage_live: number | null | undefined;
  is_finetuned?: boolean;
  finetune_eligibility?: {
    eligible?: boolean;
    reason?: string | null;
    actions_visible?: boolean;
  } | null;
  latest_interface?: DatasetInterfaceSummary | null;
};

type DatasetListItemWithFinetuned = ApiSchemas["DatasetListItemDto"] & {
  is_finetuned?: boolean;
  finetune_eligibility?: {
    eligible?: boolean;
    reason?: string | null;
    actions_visible?: boolean;
  } | null;
  latest_interface?: DatasetInterfaceSummary | null;
};

export function useDatasetsTable({
  columns,
}: {
  columns: ColumnDef<DatasetListRow>[];
}) {
  const [period, setPeriod] = useState<string>();
  const [status, setStatus] = useState<DatasetStatus>();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const baseDatasetsOptions = datasetQueryOptions.datasets({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    period: period,
    status: status,
  });
  const { data, refetch: refetchDatasets } = useSuspenseQuery({
    ...baseDatasetsOptions,
    // Backend-less demo: resolve the suspense query with mock datasets so the
    // Dashboard renders offline. (No backend means the real fetch would throw.)
    queryFn: USE_MOCK_DATASETS
      ? async () => MOCK_DATASETS_RESPONSE
      : baseDatasetsOptions.queryFn,
    refetchInterval: (query) => {
      if (USE_MOCK_DATASETS) return false;
      const datasets = query.state.data?.datasets ?? [];

      const hasExtractingDocuments = datasets.some(
        (dataset) =>
          dataset.dataset_type === "document" &&
          dataset.status === DATASET_STATUSES.extracting_documents,
      );

      const hasActiveFinetune = datasets.some((dataset) => {
        const status = dataset.latest_finetune?.status;
        return status && !isFinetuneJobTerminal(status);
      });

      return hasExtractingDocuments || hasActiveFinetune ? 10000 : false;
    },
  });
  const datasetsProgressMap = useDatasetsProgress(
    data.datasets.map((dataset) => dataset.dataset_id),
  );

  const table = useReactTable({
    data: (data.datasets as DatasetListItemWithFinetuned[]).map((dataset) => ({
      ...dataset,
      progress_percentage_live:
        datasetsProgressMap?.[dataset.dataset_id]?.progress_percentage ||
        dataset.progress_percentage,
      is_finetuned: dataset.is_finetuned ?? false,
    })),
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: data.total,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  const pageOptions = useMemo(() => {
    const totalPages = Math.ceil(data.total / pagination.pageSize);
    return Array.from({ length: totalPages }, (_, index) => ({
      label: (index + 1).toString(),
      value: (index + 1).toString(),
    }));
  }, [data.total, pagination.pageSize]);

  const isEmpty = useMemo(() => {
    return data.datasets.length === 0;
  }, [data.datasets]);

  const showPagination = useMemo(() => {
    return data.total > DEFAULT_PAGE_SIZE;
  }, [data.total]);

  return {
    table,
    pageOptions,
    isEmpty,
    period,
    status,
    showPagination,
    setPeriod,
    setStatus,
    refetchDatasets,
  };
}
