import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { Text } from "@/shared/ui/kit/text";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatFinetuneWinRatePct } from "../lib/format-finetune-win-rate";
import {
  useDatasetsTable,
  type DatasetListRow,
} from "../model/use-datasets-table";
import { DatasetKindBadge } from "../ui/dataset-kind-badge";
import { DatasetDate } from "../ui/dataset-date";
import { cn } from "@/shared/lib/css";
import { DatasetInterfaceCell } from "../ui/dataset-interface-cell";
import { DatasetAutoscientistCell } from "./dataset-autoscientist-cell";

const PREVIEW_ROWS_COUNT = 3;

// Per-column sizing applied to the generic head/cell renderers.
type ColumnMetaConfig = {
  headClassName?: string;
  cellClassName?: string;
};

export function DatasetsTableCompact({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // Workaround for TanStack Table bug with React Compiler
  // https://github.com/shadcn-ui/ui/issues/3905#issuecomment-2692272028
  "use no memo";

  const columns: ColumnDef<DatasetListRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "NAME",
        cell: (props) => (
          <div
            className="max-w-[400px] truncate"
            title={props.row.original.name}
          >
            {props.row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "kind",
        header: "TYPE",
        cell: (props) => (
          <DatasetKindBadge kind={props.row.original.kind} variant="table" />
        ),
      },
      {
        accessorKey: "created_at",
        header: "DATE",
        cell: (props) => <DatasetDate value={props.getValue() as string} />,
      },
      {
        accessorKey: "row_count",
        header: "DATA SIZE",
        meta: {
          headClassName: "min-w-[110px]",
          cellClassName: "min-w-[110px]",
        } satisfies ColumnMetaConfig,
        cell: (props) => {
          // Prefer samples_to_process, fall back to row_count
          const value =
            props.row.original.samples_to_process ??
            props.row.original.row_count;
          return value == null ? "—" : value.toLocaleString("en-US");
        },
      },
      {
        id: "finetune",
        header: "STATUS",
        cell: (props) => (
          <DatasetAutoscientistCell
            row={props.row.original}
            variant="table"
          />
        ),
      },
      {
        id: "interface",
        header: "INTERFACE",
        meta: {
          headClassName: "min-w-[146px]",
          cellClassName: "min-w-[146px] grid justify-items-start",
        } satisfies ColumnMetaConfig,
        cell: (props) => {
          const row = props.row.original;
          if (
            !row.latest_interface &&
            !row.latest_finetune?.training_experiment_id
          ) {
            return "—";
          }
          return <DatasetInterfaceCell row={row} />;
        },
      },
      {
        id: "win_rate",
        header: "WIN RATE",
        meta: {
          headClassName: "min-w-[110px]",
          cellClassName: "min-w-[110px]",
        } satisfies ColumnMetaConfig,
        cell: (props) =>
          formatFinetuneWinRatePct(
            props.row.original.latest_finetune?.win_rates,
          ),
      },
    ],
    [],
  );

  const { table, isEmpty } = useDatasetsTable({ columns });

  if (isEmpty) {
    return null;
  }

  const rows = table.getRowModel().rows.slice(0, PREVIEW_ROWS_COUNT);

  return (
    <div
      className={cn("flex max-w-[1116px] w-full flex-col gap-8", className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Text variant="h2" as="h2">
          My Dashboard
        </Text>
        <Button variant="link" asChild>
          <Link to={ROUTES.DATASETS}>
            See full history <ArrowRightIcon pathClasses="stroke-current" />
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={
                    (header.column.columnDef.meta as ColumnMetaConfig)
                      ?.headClassName
                  }
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "whitespace-normal py-4 align-middle",
                    (cell.column.columnDef.meta as ColumnMetaConfig)
                      ?.cellClassName,
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
