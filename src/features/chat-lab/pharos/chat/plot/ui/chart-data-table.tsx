import { cn } from "@/shared/lib/css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { Text, textVariants } from "@/shared/ui/kit/text";
import { formatCellValue, type ChartDataColumn } from "../lib/chart-data";

// Grid track shrinks to the chart slot so the kit scrollport (h-full) can scroll,
// and stays content-sized when the table is shorter than that cap.
const frameClassName =
  "relative grid h-fit w-full max-h-full grid-rows-[minmax(0,1fr)]";

const tableWrapperClassName = "h-full min-h-0 rounded-[12px] bg-gray-0";

// Sits above the sticky header so the header background cannot cover the stroke.
const borderClassName = cn(
  "pointer-events-none absolute inset-0 z-20 rounded-[12px] hairline",
  "[--hairline-radius:12px] [--hairline-color:var(--color-gray-2)]",
);

/** Raw dataset keys (`credits_used`) read as words once the header is uppercased. */
const displayHeader = (label: string) => label.replace(/[_-]+/g, " ").trim();

const headerCellClassName = (isMetric: boolean) =>
  cn(
    textVariants({
      variant: "caption",
      weight: "regular",
      color: "secondary",
    }),
    "bg-gray-0 px-6 py-4 align-middle uppercase tracking-[0.04em]",
    isMetric ? "w-[1%] whitespace-nowrap text-right" : "text-left",
  );

const bodyCellClassName = (isMetric: boolean) =>
  cn(
    textVariants({ variant: "label", weight: "regular" }),
    "px-6 py-4 align-middle",
    isMetric ? "w-[1%] whitespace-nowrap text-right tabular-nums" : "text-left",
  );

/** Tabular view of the rows a chart was built from. */
export function ChartDataTable({
  columns,
  rows,
  className,
}: {
  columns: readonly ChartDataColumn[];
  rows: readonly Record<string, unknown>[];
  className?: string;
}) {
  if (columns.length === 0) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <Text variant="label" color="secondary">
          No chart data
        </Text>
      </div>
    );
  }

  return (
    <div className={cn(frameClassName, className)}>
      <Table
        size="compact"
        className="h-auto bg-gray-0"
        wrapperClassName={tableWrapperClassName}
      >
        <TableHeader className="bg-gray-0">
          <TableRow className="![--hairline-color:var(--color-gray-2)]">
            {columns.map((column, index) => (
              <TableHead
                key={column.key}
                scope="col"
                className={headerCellClassName(index > 0)}
              >
                {displayHeader(column.label)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column, columnIndex) => (
                <TableCell
                  key={column.key}
                  className={bodyCellClassName(columnIndex > 0)}
                >
                  {formatCellValue(row[column.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div aria-hidden className={borderClassName} />
    </div>
  );
}
