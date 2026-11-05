import { downloadFile } from "@/shared/lib/js";
import { toast } from "@/shared/ui/kit/sonner-toast";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export type ChartDataColumn = {
  key: string;
  label: string;
};

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 6,
});

/** Rows + headers from the named Vega dataset (`table`), else the first payload. */
export function chartTableFromDatasets(
  datasets: Record<string, readonly unknown[]>,
): {
  columns: ChartDataColumn[];
  rows: Record<string, unknown>[];
} {
  const rows = (datasets.table ?? Object.values(datasets)[0] ?? []).filter(
    isRecord,
  );
  return {
    columns: Object.keys(rows[0] ?? {}).map((key) => ({ key, label: key })),
    rows,
  };
}

/** Human-readable cell value; missing/non-finite render as an em dash. */
export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") {
    return Number.isFinite(value) ? numberFormatter.format(value) : "—";
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value) ?? "—";
  } catch {
    return "—";
  }
}

const toCsvField = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let text: string;
  if (typeof value === "object") {
    try {
      text = JSON.stringify(value) ?? "";
    } catch {
      text = "";
    }
  } else {
    text = String(value);
  }
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const buildCsv = (
  columns: readonly ChartDataColumn[],
  rows: readonly Record<string, unknown>[],
): string => {
  const header = columns.map((column) => column.label);
  const body = rows.map((row) =>
    columns.map((column) => row[column.key] ?? ""),
  );
  return [header, ...body]
    .map((cells) => cells.map(toCsvField).join(","))
    .join("\r\n");
};

export function downloadChartCsv(
  columns: readonly ChartDataColumn[],
  rows: readonly Record<string, unknown>[],
  fileName: string,
) {
  try {
    const blob = new Blob([buildCsv(columns, rows)], {
      type: "text/csv;charset=utf-8",
    });
    downloadFile(
      blob,
      fileName.endsWith(".csv") ? fileName : `${fileName}.csv`,
    );
  } catch (error) {
    console.error("Failed to download chart data as CSV:", error);
    toast.error("Failed to download data");
  }
}
