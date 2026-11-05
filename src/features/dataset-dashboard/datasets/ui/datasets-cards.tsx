import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { flexRender, type Row } from "@tanstack/react-table";
import type { DatasetListRow } from "../model/use-datasets-table";

const renderCellByColumn = (row: Row<DatasetListRow>, columnId: string) => {
  const cell = row.getAllCells().find((c) => {
    if (c.column.id === columnId) return true;
    const def = c.column.columnDef;
    return "accessorKey" in def && def.accessorKey === columnId;
  });
  if (!cell) return null;
  return flexRender(cell.column.columnDef.cell, cell.getContext());
};

function DatasetCard({ row }: { row: Row<DatasetListRow> }) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[8px] border-[0.5px] border-background-primary p-4 bg-background-primary">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <Text variant="title">{renderCellByColumn(row, "name")}</Text>
          {renderCellByColumn(row, "kind")}
        </div>
        <Text color="secondary" className="shrink-0">
          {renderCellByColumn(row, "created_at")}
        </Text>
      </div>

      <Text color="secondary" className="line-clamp-2 empty:hidden">
        {renderCellByColumn(row, "metadata.dataset_description")}
      </Text>

      <div className="mt-auto flex gap-4">
        <div className="flex-1 empty:hidden">
          {renderCellByColumn(row, "status")}
        </div>
        <div className="flex-1 empty:hidden">
          {renderCellByColumn(row, "finetune")}
        </div>
      </div>
    </div>
  );
}

export function DatasetsCards({
  rows,
  isPending,
}: {
  rows: Row<DatasetListRow>[];
  isPending: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-2 pb-2",
        isPending && "opacity-50",
      )}
    >
      {rows.map((row) => (
        <DatasetCard key={row.id} row={row} />
      ))}
    </div>
  );
}
