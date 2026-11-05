import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import {
  shellId,
  type ShellStatus,
  type TableColumn,
  type TableRow,
  type TableShellData,
} from "../model/shell-types";
import { Bar } from "../ui/shell-surface";
import {
  COLUMN_TYPE_ICON,
  COLUMN_TYPE_LABEL,
  columnWidth,
  NEXT_COLUMN_TYPE,
  TagChip,
  Thumbnail,
} from "./table-cells";

type CellAddress = { rowId: string; columnId: string };

const ROW_GUTTER = 40;

function CellEditor({
  initial,
  multiline,
  placeholder,
  onCommit,
  onCancel,
  onNavigate,
}: {
  initial: string;
  multiline: boolean;
  placeholder?: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onNavigate: (value: string, direction: "down" | "right" | "left") => void;
}) {
  const [value, setValue] = useState(initial);
  const done = useRef(false);
  const finish = (fn: () => void) => {
    if (done.current) return;
    done.current = true;
    fn();
  };
  const shared = {
    autoFocus: true,
    value,
    placeholder,
    onFocus: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      event.currentTarget.select(),
    onBlur: () => finish(() => onCommit(value)),
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      event.stopPropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        finish(onCancel);
      } else if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        finish(() => onNavigate(value, "down"));
      } else if (event.key === "Tab") {
        event.preventDefault();
        finish(() => onNavigate(value, event.shiftKey ? "left" : "right"));
      }
    },
    className:
      "w-full resize-none bg-transparent font-bureau text-[13px] leading-[1.45] font-light text-typography-primary outline-none placeholder:text-typography-secondary",
  };
  return multiline ? (
    <textarea
      {...shared}
      rows={2}
      onChange={(event) => setValue(event.target.value)}
    />
  ) : (
    <input {...shared} onChange={(event) => setValue(event.target.value)} />
  );
}

export function TableGrid({
  data,
  onChange,
  status = "idle",
}: {
  data: TableShellData;
  onChange?: (data: TableShellData) => void;
  status?: ShellStatus;
}) {
  const editable = Boolean(onChange);
  const [editing, setEditing] = useState<CellAddress | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const columns = data.columns;
  const rows = data.rows;

  const setCell = (rowId: string, columnId: string, value: string) =>
    onChange?.({
      ...data,
      rows: rows.map((row) =>
        row.id === rowId ? { ...row, cells: { ...row.cells, [columnId]: value } } : row,
      ),
    });

  const updateColumn = (columnId: string, patch: Partial<TableColumn>) =>
    onChange?.({
      ...data,
      columns: columns.map((column) =>
        column.id === columnId ? { ...column, ...patch } : column,
      ),
    });

  const removeColumn = (columnId: string) =>
    onChange?.({
      ...data,
      columns: columns.filter((column) => column.id !== columnId),
      rows: rows.map((row) => {
        const cells = { ...row.cells };
        delete cells[columnId];
        return { ...row, cells };
      }),
    });

  const addColumn = () => {
    const column: TableColumn = { id: shellId("col"), label: "", type: "text" };
    onChange?.({ ...data, columns: [...columns, column] });
    setRenaming(column.id);
  };

  const addRow = () => {
    const row: TableRow = { id: shellId("row"), cells: {} };
    onChange?.({ ...data, rows: [...rows, row] });
    const first = columns.find((column) => column.type !== "image") ?? columns[0];
    if (first) setEditing({ rowId: row.id, columnId: first.id });
  };

  const removeRow = (rowId: string) =>
    onChange?.({ ...data, rows: rows.filter((row) => row.id !== rowId) });

  const navigate = (
    from: CellAddress,
    value: string,
    direction: "down" | "right" | "left",
  ) => {
    setCell(from.rowId, from.columnId, value);
    const rowIndex = rows.findIndex((row) => row.id === from.rowId);
    const columnIndex = columns.findIndex((column) => column.id === from.columnId);
    if (direction === "down") {
      const next = rows[rowIndex + 1];
      setEditing(next ? { rowId: next.id, columnId: from.columnId } : null);
      return;
    }
    const step = direction === "right" ? 1 : -1;
    const nextColumn = columns[columnIndex + step];
    if (nextColumn) {
      setEditing({ rowId: from.rowId, columnId: nextColumn.id });
      return;
    }
    const nextRow = rows[rowIndex + step];
    const wrapColumn = step === 1 ? columns[0] : columns[columns.length - 1];
    setEditing(nextRow && wrapColumn ? { rowId: nextRow.id, columnId: wrapColumn.id } : null);
  };

  const widths = columns.map((column) =>
    columnWidth(
      column,
      rows.map((row) => row.cells[column.id] ?? ""),
    ),
  );
  const totalWidth = ROW_GUTTER + widths.reduce((sum, width) => sum + width, 0) + (editable ? 44 : 0);
  const placeholderRows = rows.length === 0 ? 3 : 0;

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table
        className="border-separate border-spacing-0 font-bureau"
        style={{ width: totalWidth, minWidth: "100%" }}
      >
        <colgroup>
          <col style={{ width: ROW_GUTTER }} />
          {columns.map((column, i) => (
            <col key={column.id} style={{ width: widths[i] }} />
          ))}
          {editable && <col style={{ width: 44 }} />}
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="border-b border-gray-3/15 bg-background-primary" />
            {columns.map((column) => {
              const Icon = COLUMN_TYPE_ICON[column.type];
              return (
                <th
                  key={column.id}
                  className="group/header border-b border-gray-3/15 bg-background-primary px-3 py-2.5 text-left align-middle"
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={!editable}
                      title={`${COLUMN_TYPE_LABEL[column.type]} column${editable ? " · click to change" : ""}`}
                      onClick={() => updateColumn(column.id, { type: NEXT_COLUMN_TYPE[column.type] })}
                      className="flex size-5 shrink-0 items-center justify-center rounded-[5px] text-typography-secondary transition-colors hover:bg-gray-6 hover:text-typography-primary disabled:hover:bg-transparent"
                    >
                      <Icon className="size-3.5" />
                    </button>
                    {editable && renaming === column.id ? (
                      <input
                        autoFocus
                        defaultValue={column.label}
                        placeholder="Column name"
                        onBlur={(event) => {
                          updateColumn(column.id, { label: event.target.value.trim() });
                          setRenaming(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                          if (event.key === "Escape") setRenaming(null);
                        }}
                        className="min-w-0 flex-1 bg-transparent text-[12px] font-normal text-typography-primary outline-none placeholder:text-typography-secondary"
                      />
                    ) : (
                      <button
                        type="button"
                        disabled={!editable}
                        onClick={() => setRenaming(column.id)}
                        className={cn(
                          "min-w-0 flex-1 truncate text-left text-[12px] font-normal",
                          column.label ? "text-typography-secondary" : "text-typography-secondary/60",
                        )}
                      >
                        {column.label || "Untitled"}
                      </button>
                    )}
                    {editable && (
                      <button
                        type="button"
                        aria-label={`Remove ${column.label || "column"}`}
                        onClick={() => removeColumn(column.id)}
                        className="flex size-5 shrink-0 items-center justify-center rounded-[5px] text-typography-secondary hover:bg-gray-6 hover:text-typography-primary"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                </th>
              );
            })}
            {editable && (
              <th className="border-b border-gray-3/15 bg-background-primary px-1.5">
                <button
                  type="button"
                  aria-label="Add column"
                  title="Add column"
                  onClick={addColumn}
                  className="flex size-7 items-center justify-center rounded-[8px] text-typography-secondary transition-colors hover:bg-gray-6 hover:text-typography-primary"
                >
                  <Plus className="size-4" />
                </button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id} className="group/row">
              <td className="border-b border-gray-3/10 px-2 py-2.5 text-right align-top text-[12px] text-typography-secondary/70 tabular-nums">
                {rowIndex + 1}
              </td>
              {columns.map((column) => {
                const value = row.cells[column.id] ?? "";
                const isEditing =
                  editable && editing?.rowId === row.id && editing.columnId === column.id;
                const address = { rowId: row.id, columnId: column.id };
                return (
                  <td
                    key={column.id}
                    onClick={() => editable && !isEditing && setEditing(address)}
                    className={cn(
                      "border-b border-gray-3/10 px-3 py-2.5 align-top transition-colors",
                      editable && "cursor-text group-hover/row:bg-gray-6/40",
                      isEditing && "bg-blue-1/50 shadow-[inset_0_0_0_1.5px_var(--color-blue-4)] group-hover/row:bg-blue-1/50",
                    )}
                  >
                    {isEditing ? (
                      <CellEditor
                        initial={value}
                        multiline={column.type === "text" && value.length > 40}
                        placeholder={column.type === "image" ? "Paste an image URL" : undefined}
                        onCommit={(next) => {
                          setCell(row.id, column.id, next.trim());
                          setEditing(null);
                        }}
                        onCancel={() => setEditing(null)}
                        onNavigate={(next, direction) => navigate(address, next.trim(), direction)}
                      />
                    ) : column.type === "image" ? (
                      value ? (
                        <Thumbnail url={value} className="h-[52px] w-[80px] rounded-[8px]" />
                      ) : (
                        <span className="flex h-[52px] w-[80px] items-center justify-center rounded-[8px] border border-dashed border-gray-3/30 text-[11px] text-typography-secondary">
                          {editable ? "Add image" : ""}
                        </span>
                      )
                    ) : column.type === "tag" ? (
                      value ? <TagChip value={value} /> : <span className="block h-6" />
                    ) : (
                      <span className="block text-[13px] leading-[1.45] font-light whitespace-pre-wrap text-typography-primary">
                        {value || "\u200b"}
                      </span>
                    )}
                  </td>
                );
              })}
              {editable && (
                <td className="border-b border-gray-3/10 px-1.5 py-2 align-top">
                  <button
                    type="button"
                    aria-label={`Delete row ${rowIndex + 1}`}
                    onClick={() => removeRow(row.id)}
                    className="flex size-7 items-center justify-center rounded-[8px] text-typography-secondary hover:bg-gray-6 hover:text-typography-primary"
                  >
                    <X className="size-3.5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
          {Array.from({ length: placeholderRows + (status === "loading" && rows.length > 0 ? 2 : 0) }, (_, i) => (
            <tr key={`placeholder-${i}`} className={status === "loading" ? "animate-pulse" : undefined}>
              <td className="border-b border-gray-3/10 px-2 py-3.5" />
              {columns.map((column, c) => (
                <td key={column.id} className="border-b border-gray-3/10 px-3 py-3.5">
                  {column.type === "image" ? (
                    <span className="block h-[52px] w-[80px] rounded-[8px] bg-gray-6" />
                  ) : (
                    <Bar width={40 + ((i * 17 + c * 23) % 45)} className="h-1.5 bg-gray-3/15" />
                  )}
                </td>
              ))}
              {editable && <td className="border-b border-gray-3/10" />}
            </tr>
          ))}
          {editable && (
            <>
              <tr>
                <td colSpan={columns.length + 2} className="border-b border-gray-3/10 px-3 py-2">
                  <button
                    type="button"
                    onClick={addColumn}
                    className="font-bureau text-[13px] leading-[1.4] font-light text-typography-secondary"
                  >
                    Add / remove columns
                  </button>
                </td>
              </tr>
              <tr>
                <td colSpan={columns.length + 2} className="px-3 py-2">
                  <button
                    type="button"
                    onClick={addRow}
                    className="font-bureau text-[13px] leading-[1.4] font-light text-typography-secondary"
                  >
                    Add any additional rows you want
                  </button>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
