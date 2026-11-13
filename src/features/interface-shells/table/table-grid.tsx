import { ArrowDown, ArrowDownAZ, ArrowDownZA, ArrowLeftToLine, ArrowRightToLine, ArrowUp, ArrowUpDown, Check, PencilLine, Plus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import {
  shellId,
  type ShellStatus,
  type TableColumn,
  type TableShellData,
} from "../model/shell-types";
import { Bar } from "../ui/shell-surface";
import { SuggestedChip, unusedSuggestions } from "../ui/suggested-chip";
import {
  COLUMN_TYPE_ICON,
  COLUMN_TYPE_LABEL,
  columnWidth,
  NEXT_COLUMN_TYPE,
  TagChip,
  Thumbnail,
} from "./table-cells";

type CellAddress = { rowId: string; columnId: string };

/** Rows ordered by one column, as Sheets' Sort A → Z: numbers by value, blanks last. */
export function sortRows(data: TableShellData, columnId: string, direction: 1 | -1): TableShellData {
  const rows = [...data.rows].sort((a, b) => {
    const x = a.cells[columnId]?.trim() ?? "";
    const y = b.cells[columnId]?.trim() ?? "";
    if (!x || !y) return x ? -1 : y ? 1 : 0;
    return direction * x.localeCompare(y, undefined, { numeric: true, sensitivity: "base" });
  });
  return { ...data, rows };
}

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
  suggestedColumns,
  onDismissColumn,
}: {
  data: TableShellData;
  onChange?: (data: TableShellData) => void;
  status?: ShellStatus;
  /** Column names the model suggests: drawn after the real columns, outlined, until added. */
  suggestedColumns?: string[];
  onDismissColumn?: (label: string) => void;
}) {
  const editable = Boolean(onChange);
  const [editing, setEditing] = useState<CellAddress | null>(null);
  // The column last sorted from its header, and which way; rows stay in that order, as in Sheets.
  const [sorted, setSorted] = useState<{ columnId: string; direction: 1 | -1 } | null>(null);
  // Sheets' column menu, opened by right-clicking a header.
  const [menu, setMenu] = useState<{ columnId: string; x: number; y: number } | null>(null);
  // Dragging a header to move its column.
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropAt, setDropAt] = useState<{ columnId: string; side: "before" | "after" } | null>(null);
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

  const addColumn = (at = columns.length, label = "") => {
    const column: TableColumn = { id: shellId("col"), label, type: "text" };
    onChange?.({ ...data, columns: [...columns.slice(0, at), column, ...columns.slice(at)] });
    if (!label) setRenaming(column.id);
  };

  const moveColumn = (columnId: string, targetId: string, side: "before" | "after") => {
    if (columnId === targetId) return;
    const moving = columns.find((column) => column.id === columnId);
    if (!moving) return;
    const rest = columns.filter((column) => column.id !== columnId);
    const at = rest.findIndex((column) => column.id === targetId) + (side === "after" ? 1 : 0);
    onChange?.({ ...data, columns: [...rest.slice(0, at), moving, ...rest.slice(at)] });
  };

  const sortBy = (columnId: string, direction: 1 | -1) => {
    onChange?.(sortRows(data, columnId, direction));
    setSorted({ columnId, direction });
  };

  const extra = editable ? unusedSuggestions(suggestedColumns, columns.map((column) => column.label)).slice(0, 2) : [];
  const SUGGESTED_WIDTH = 168;

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
  const totalWidth = ROW_GUTTER + widths.reduce((sum, width) => sum + width, 0) + extra.length * SUGGESTED_WIDTH + (editable ? 44 : 0);
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
          {extra.map((label) => (
            <col key={`suggested-${label}`} style={{ width: SUGGESTED_WIDTH }} />
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
                  draggable={editable && renaming !== column.id}
                  title={editable ? "Drag to move · right-click for options" : undefined}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", column.id);
                    setDragging(column.id);
                  }}
                  onDragOver={(event) => {
                    if (!dragging || dragging === column.id) return;
                    event.preventDefault();
                    const box = event.currentTarget.getBoundingClientRect();
                    const side = event.clientX < box.left + box.width / 2 ? "before" : "after";
                    if (dropAt?.columnId !== column.id || dropAt.side !== side) setDropAt({ columnId: column.id, side });
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragging && dropAt) moveColumn(dragging, dropAt.columnId, dropAt.side);
                    setDragging(null);
                    setDropAt(null);
                  }}
                  onDragEnd={() => {
                    setDragging(null);
                    setDropAt(null);
                  }}
                  onContextMenu={(event) => {
                    if (!editable) return;
                    event.preventDefault();
                    setMenu({ columnId: column.id, x: event.clientX, y: event.clientY });
                  }}
                  className={cn(
                    "group/header relative border-b border-gray-3/15 bg-background-primary px-3 py-2.5 text-left align-middle",
                    editable && "cursor-grab active:cursor-grabbing",
                    dragging === column.id && "opacity-40",
                    menu?.columnId === column.id && "bg-gray-6",
                  )}
                >
                  {dropAt?.columnId === column.id && (
                    <span
                      aria-hidden
                      className={cn("absolute top-1 bottom-1 w-0.5 rounded-full bg-blue-4", dropAt.side === "before" ? "-left-px" : "-right-px")}
                    />
                  )}
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
                    {editable && column.type !== "image" && rows.length > 1 && (() => {
                      const active = sorted?.columnId === column.id ? sorted.direction : null;
                      const next = active === 1 ? -1 : 1;
                      const SortIcon = active === 1 ? ArrowUp : active === -1 ? ArrowDown : ArrowUpDown;
                      return (
                        <button
                          type="button"
                          aria-label={`Sort by ${column.label || "this column"}, ${next === 1 ? "A to Z" : "Z to A"}`}
                          title={next === 1 ? "Sort A → Z" : "Sort Z → A"}
                          onClick={() => sortBy(column.id, next)}
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-[5px] transition-[opacity,colors] hover:bg-gray-6 hover:text-typography-primary focus-visible:opacity-100",
                            active ? "text-typography-primary opacity-100" : "text-typography-secondary opacity-0 group-hover/header:opacity-100",
                          )}
                        >
                          <SortIcon className="size-3" />
                        </button>
                      );
                    })()}
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
            {extra.map((label) => (
              <th key={`suggested-${label}`} className="border-b border-gray-3/15 bg-background-primary px-2 py-2 text-left align-middle">
                <SuggestedChip
                  size="sm"
                  label={label}
                  onAccept={() => addColumn(columns.length, label)}
                  onDismiss={onDismissColumn && (() => onDismissColumn(label))}
                />
              </th>
            ))}
            {editable && (
              <th className="border-b border-gray-3/15 bg-background-primary px-1.5">
                <button
                  type="button"
                  aria-label="Add column"
                  title="Add column"
                  onClick={() => addColumn()}
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
              {extra.map((label) => (
                <td key={`suggested-${label}`} aria-hidden className="border-b border-dashed border-gray-3/15 bg-gray-6/30" />
              ))}
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
              {extra.map((label) => (
                <td key={`suggested-${label}`} className="border-b border-gray-3/10" />
              ))}
              {editable && <td className="border-b border-gray-3/10" />}
            </tr>
          ))}
        </tbody>
      </table>
      {menu && (
        <ColumnMenu
          menu={menu}
          column={columns.find((column) => column.id === menu.columnId)}
          index={columns.findIndex((column) => column.id === menu.columnId)}
          canSort={rows.length > 1}
          onClose={() => setMenu(null)}
          onSort={(direction) => sortBy(menu.columnId, direction)}
          onInsert={(at) => addColumn(at)}
          onRename={() => setRenaming(menu.columnId)}
          onType={(type) => updateColumn(menu.columnId, { type })}
          onRemove={() => removeColumn(menu.columnId)}
        />
      )}
    </div>
  );
}

/** Sheets' column menu: sort, insert, rename, type, delete. */
function ColumnMenu({
  menu,
  column,
  index,
  canSort,
  onClose,
  onSort,
  onInsert,
  onRename,
  onType,
  onRemove,
}: {
  menu: { x: number; y: number };
  column?: TableColumn;
  index: number;
  canSort: boolean;
  onClose: () => void;
  onSort: (direction: 1 | -1) => void;
  onInsert: (at: number) => void;
  onRename: () => void;
  onType: (type: TableColumn["type"]) => void;
  onRemove: () => void;
}) {
  if (!column) return null;
  const item = (label: string, icon: React.ReactNode, onPress: () => void, options: { disabled?: boolean; danger?: boolean; checked?: boolean } = {}) => (
    <button
      type="button"
      role="menuitem"
      disabled={options.disabled}
      onClick={() => {
        onPress();
        onClose();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-left font-bureau text-[13px] transition-colors hover:bg-gray-6 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
        options.danger ? "text-red-5 [&_svg]:text-red-5" : "text-typography-primary [&_svg]:text-typography-secondary",
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {options.checked !== undefined && <Check className={cn("!text-typography-primary", !options.checked && "invisible")} />}
    </button>
  );
  const rule = <span aria-hidden className="mx-2 my-1 h-px bg-gray-3/20" />;
  // Keep the menu on screen.
  const left = Math.min(menu.x, window.innerWidth - 232);
  const top = Math.min(menu.y, window.innerHeight - 380);
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      />
      <div
        role="menu"
        aria-label={`${column.label || "Column"} options`}
        tabIndex={-1}
        ref={(node) => node?.focus()}
        onKeyDown={(event) => event.key === "Escape" && onClose()}
        className="fixed z-50 flex w-56 flex-col rounded-[14px] border-[0.5px] border-gray-2 bg-gray-1 p-1.5 shadow-[0_4px_14px_rgba(26,23,24,0.14)] outline-none"
        style={{ left, top }}
      >
        {item("Sort A → Z", <ArrowDownAZ />, () => onSort(1), { disabled: !canSort || column.type === "image" })}
        {item("Sort Z → A", <ArrowDownZA />, () => onSort(-1), { disabled: !canSort || column.type === "image" })}
        {rule}
        {item("Insert column left", <ArrowLeftToLine />, () => onInsert(index))}
        {item("Insert column right", <ArrowRightToLine />, () => onInsert(index + 1))}
        {item("Rename", <PencilLine />, onRename)}
        {rule}
        {(["text", "tag", "image"] as const).map((type) => {
          const Icon = COLUMN_TYPE_ICON[type];
          return <span key={type}>{item(COLUMN_TYPE_LABEL[type], <Icon />, () => onType(type), { checked: column.type === type })}</span>;
        })}
        {rule}
        {item("Delete column", <Trash2 />, onRemove, { danger: true })}
      </div>
    </>
  );
}
