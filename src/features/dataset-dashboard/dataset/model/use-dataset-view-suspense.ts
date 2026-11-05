import { datasetQueryOptions } from "@/services/dataset";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useParams } from "react-router-dom";
import { useMemo, createElement } from "react";
import Markdown from "react-markdown";
import { equalColumnPercents } from "@/shared/ui/kit/table";

// Type for dynamic row data from API
type DatasetRow = Record<string, unknown>;

const generateColumns = (rows: DatasetRow[]): ColumnDef<DatasetRow>[] => {
  if (!rows || rows.length === 0) return [];

  const firstRow = rows[0];
  if (!firstRow || typeof firstRow !== "object") return [];

  const keys = Object.keys(firstRow);

  const widths = equalColumnPercents(keys.length);

  return keys.map((key, i) => ({
    accessorKey: key,
    size: widths[i] ?? 15,
    header: key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .toUpperCase(),
    cell: (info) => {
      const value = info.getValue();

      if (typeof value === "string") {
        return createElement(Markdown, { children: value });
      }

      return JSON.stringify(value || undefined);
    },
  }));
};

export function useDatasetViewSuspense() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const { data } = useSuspenseQuery(
    datasetQueryOptions.datasetView(dataset_id!),
  );

  // Cast rows to proper type since API schema is incorrect (returns objects, not arrays)
  const rows = data?.rows as unknown as DatasetRow[];

  // Generate columns dynamically based on actual data structure
  const columns = useMemo(() => generateColumns(rows), [rows]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!rows?.length) return null;

  return {
    table,
  };
}
