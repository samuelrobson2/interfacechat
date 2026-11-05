import {
  DATASET_STATUSES,
  datasetQueryOptions,
  type DatasetStatus,
} from "@/services/dataset";
import type { ApiSchemas } from "@/shared/api/schema";
import { DEMO_MODE, DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { MOCK_DATASETS_RESPONSE } from "./datasets-mock-data";

// See use-datasets-table.ts — DEV_AUTH_BYPASS means "navigable without a
// working backend" repo-wide; without this the query below throws on the
// missing API and crashes the whole page instead of rendering mock rows.
const USE_MOCK_DATASETS = DEMO_MODE || DEV_AUTH_BYPASS;

const DEFAULT_PAGE_SIZE = 10;

export type ReadyDatasetListRow = ApiSchemas["DatasetListItemDto"];

export function useReadyDatasetsTable({
  columns,
}: {
  columns: ColumnDef<ReadyDatasetListRow>[];
}) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const baseDatasetsOptions = datasetQueryOptions.datasets({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    status: DATASET_STATUSES.ready as DatasetStatus,
    forAutoscientist: true,
  });

  const { data, refetch: refetchDatasets } = useSuspenseQuery({
    ...baseDatasetsOptions,
    queryFn: USE_MOCK_DATASETS
      ? async () => MOCK_DATASETS_RESPONSE
      : baseDatasetsOptions.queryFn,
  });

  const table = useReactTable({
    data: data.datasets,
    columns,
    getRowId: (row) => row.dataset_id,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    autoResetPageIndex: false,
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
    showPagination,
    refetchDatasets,
  };
}
