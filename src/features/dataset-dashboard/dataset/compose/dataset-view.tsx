import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";
import { flexRender } from "@tanstack/react-table";
import { useDatasetViewSuspense } from "../model/use-dataset-view-suspense";
import { DatasetNotReadyCard } from "../ui/dataset-not-ready-card";

export function DatasetView() {
  const viewData = useDatasetViewSuspense();

  if (!viewData) return <DatasetNotReadyCard />;

  const { table } = viewData;

  const colCount = table.getAllColumns().length;

  return (
    <div className="flex flex-col h-full overflow-x-auto">
      <Table
        className="table-fixed w-full"
        style={{ minWidth: `${colCount * 320}px` }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.column.columnDef.size}%` }}
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="py-2"
                  style={{ width: `${cell.column.columnDef.size}%` }}
                >
                  {cell.column.id === "image_column" ? (
                    <img
                      src={cell.getValue() as string}
                      alt={cell.column.id}
                      className="block w-auto h-auto max-w-full max-h-[22.5rem] object-contain"
                    />
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
