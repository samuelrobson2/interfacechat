import { Columns3, Copy, Download, Eraser, ImageIcon, Plus, Rows3, X } from "lucide-react";
import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/css";
import {
  shellId,
  type ShellProps,
  type TableColumn,
  type TableShellData,
} from "../model/shell-types";
import { SHELL_TITLE_LARGE } from "../ui/shell-kit";
import { ShellGlyph, TableAppIcon } from "../ui/shell-icons";
import { copyText, downloadText, fileNameOf, ShellToolbar, ShellToolButton, ShellToolDivider, ShellToolMenu } from "../ui/shell-toolbar";
import { useShellMark } from "../ui/shell-mark";
import { ShellFooter } from "../ui/shell-meta";
import {
  Bar,
  fieldEvents,
  isSubmitShortcut,
  ShellSurface,
  stopFieldEvent,
} from "../ui/shell-surface";
import { COLUMN_TYPE_ICON, NEXT_COLUMN_TYPE, TagChip, Thumbnail } from "./table-cells";
import { ColumnMenu, sortRows, TableGrid } from "./table-grid";
import { SuggestedRing, typeahead, unusedSuggestions } from "../ui/suggested-chip";

/** The table as CSV, for pasting into a spreadsheet. */
function tableAsCsv(data: TableShellData) {
  const cell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  return [
    data.columns.map((column) => cell(column.label)).join(","),
    ...data.rows.map((row) => data.columns.map((column) => cell(row.cells[column.id] ?? "")).join(",")),
  ].join("\n");
}

const rowText = (data: TableShellData, row: TableShellData["rows"][number]) =>
  JSON.stringify(data.columns.map((column) => (row.cells[column.id] ?? "").trim()));

/** Sheets' Data cleanup: drop rows with nothing in them, or rows that repeat an earlier one. */
function withoutEmptyRows(data: TableShellData): TableShellData {
  return { ...data, rows: data.rows.filter((row) => data.columns.some((column) => (row.cells[column.id] ?? "").trim())) };
}

function withoutDuplicateRows(data: TableShellData): TableShellData {
  const seen = new Set<string>();
  return {
    ...data,
    rows: data.rows.filter((row) => {
      const key = rowText(data, row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  };
}

/** A few columns and rows at thumbnail scale; images stay images. */
function MiniGrid({
  data,
  columns: maxColumns,
  rows: maxRows,
  compact,
}: {
  data: TableShellData;
  columns: number;
  rows: number;
  compact: boolean;
}) {
  const columns = data.columns.slice(0, maxColumns);
  const rows = data.rows.slice(0, maxRows);
  const fillerRows = Math.max(0, maxRows - rows.length);
  const template = columns
    .map((column) => (column.type === "image" ? (compact ? "28px" : "40px") : "minmax(0,1fr)"))
    .join(" ");
  const cellPad = compact ? "px-1.5" : "px-2";

  return (
    <div
      className="grid min-h-0 shrink auto-rows-min gap-px overflow-hidden rounded-[6px] bg-gray-3/15"
      style={{ gridTemplateColumns: template || "1fr" }}
    >
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn("flex items-center bg-gray-6", cellPad, compact ? "h-4" : "h-6")}
        >
          {column.type === "image" ? (
            <ImageIcon
              aria-label={column.label || "Image"}
              className={cn("mx-auto text-typography-secondary", compact ? "size-2.5" : "size-3")}
            />
          ) : column.label ? (
            <span
              className={cn(
                "truncate font-bureau font-normal text-typography-secondary",
                compact ? "text-[9px]" : "text-[11px]",
              )}
            >
              {column.label}
            </span>
          ) : (
            <Bar width={60} className="h-1 bg-gray-3/25" />
          )}
        </div>
      ))}
      {rows.map((row) =>
        columns.map((column) => {
          const value = row.cells[column.id] ?? "";
          return (
            <div
              key={`${row.id}-${column.id}`}
              className={cn(
                "flex items-center bg-white",
                column.type === "image" ? "p-0.5" : cellPad,
                compact ? "h-5" : "h-8",
              )}
            >
              {column.type === "image" ? (
                <Thumbnail url={value} className="size-full rounded-[3px]" />
              ) : column.type === "tag" && value && !compact ? (
                <TagChip value={value} compact />
              ) : compact ? (
                <Bar width={value ? 70 : 40} className={value ? "bg-gray-3/30" : undefined} />
              ) : (
                <span className="truncate font-bureau text-[11px] text-typography-primary">
                  {value}
                </span>
              )}
            </div>
          );
        }),
      )}
      {Array.from({ length: fillerRows }, (_, r) =>
        columns.map((column, c) => (
          <div
            key={`filler-${r}-${column.id}`}
            className={cn("flex items-center bg-white", cellPad, compact ? "h-5" : "h-8")}
          >
            <Bar width={35 + ((r * 19 + c * 29) % 40)} className="bg-gray-3/15" />
          </div>
        )),
      )}
    </div>
  );
}

function TablePreview({ data }: { data: TableShellData }) {
  const hasTitle = Boolean(data.title.trim());
  const hasColumns = data.columns.some((column) => column.label.trim());
  const hasRows = data.rows.length > 0;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-2.5">
      <div className="flex shrink-0 items-center gap-1.5">
        <ShellGlyph kind="table" className="size-3.5" />
        <div
          className={cn(
            "min-w-0 flex-1 truncate font-bureau text-[12px] leading-[1.3]",
            hasTitle ? "font-normal text-typography-primary" : "font-light text-typography-secondary",
          )}
        >
          {hasTitle ? data.title : "Table"}
        </div>
      </div>
      <MiniGrid
        data={
          hasColumns || hasRows || data.columns.length
            ? data
            : { ...data, columns: [0, 1, 2].map((i) => ({ id: `ghost-${i}`, label: "", type: "text" as const })) }
        }
        columns={3}
        rows={4}
        compact
      />
      <ShellFooter compact className="mt-auto" />
    </div>
  );
}

/**
 * The table at medium plus: column names are typed straight into the header,
 * the type icon cycles text → tag → image, and + adds a column. Scrolls
 * sideways when there are more columns than fit.
 */
function SuggestedHeader({ label, onAccept, onDismiss }: { label: string; onAccept: () => void; onDismiss?: () => void }) {
  return (
    <span className="group/suggested relative flex h-6 min-w-0 flex-1 items-center rounded-[6px] bg-white">
      <SuggestedRing />
      <button
        type="button"
        title={`Suggested: name it ${label}`}
        aria-label={`Use suggested column: ${label}`}
        {...fieldEvents}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          stopFieldEvent(event);
          onAccept();
        }}
        className="flex min-w-0 flex-1 items-center gap-1 px-1.5 text-left font-bureau text-[11px] text-typography-secondary hover:text-typography-primary"
      >
        <Plus className="size-3 shrink-0" />
        <span className="whitespace-nowrap">{label}</span>
      </button>
      {onDismiss && (
        <button
          type="button"
          aria-label={`Dismiss suggested column: ${label}`}
          {...fieldEvents}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            stopFieldEvent(event);
            onDismiss();
          }}
          className="mr-0.5 grid size-4 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover/suggested:opacity-100 hover:text-typography-primary focus-visible:opacity-100"
        >
          <X className="size-2.5" />
        </button>
      )}
    </span>
  );
}

function EditableGrid({
  data,
  editable,
  onChange,
  onSubmit,
  suggestedColumns = [],
  onDismissColumn,
}: {
  data: TableShellData;
  editable: boolean;
  onChange?: (data: TableShellData) => void;
  onSubmit?: () => void;
  /** Column names suggested for this table: offered under a header once they start typing its name. */
  suggestedColumns?: string[];
  onDismissColumn?: (label: string) => void;
}) {
  // Suggestions only once they start typing a column's name (`typeahead`): then the ones that match, under it.
  // Where the list goes: under the field being typed in, measured as they type (the grid clips anything inside it).
  const [typing, setTyping] = useState<{ columnId: string; left: number; top: number } | null>(null);
  const nameColumn = (columnId: string, label: string) => {
    onChange?.({ ...data, columns: data.columns.map((column) => (column.id === columnId ? { ...column, label } : column)) });
    setTyping(null);
  };
  const [focusId, setFocusId] = useState<string | null>(null);
  const rows = data.rows.slice(0, 4);
  const fillerRows = Math.max(0, 4 - rows.length);
  const template = data.columns.map((column) => (column.type === "image" ? "52px" : "104px")).join(" ");

  const updateColumn = (columnId: string, patch: Partial<TableColumn>) =>
    onChange?.({
      ...data,
      columns: data.columns.map((column) => (column.id === columnId ? { ...column, ...patch } : column)),
    });
  const removeColumn = (columnId: string) =>
    onChange?.({ ...data, columns: data.columns.filter((column) => column.id !== columnId) });
  const addColumn = (at = data.columns.length) => {
    const column: TableColumn = { id: shellId("col"), label: "", type: "text" };
    onChange?.({ ...data, columns: [...data.columns.slice(0, at), column, ...data.columns.slice(at)] });
    setFocusId(column.id);
  };
  // Right-click a header, as on the large table: sort, insert, rename, type, delete.
  const [menu, setMenu] = useState<{ columnId: string; x: number; y: number } | null>(null);

  const cell = "flex min-w-0 items-center bg-white px-2";

  return (
    <div className="no-scrollbar -mx-3 flex min-h-0 flex-1 overflow-x-auto px-3 [mask-image:linear-gradient(to_right,black_calc(100%-20px),transparent)]">
      <div
        className="grid min-h-0 w-max min-w-full shrink-0 gap-px overflow-hidden rounded-[8px] bg-gray-3/15"
        style={{
          gridTemplateColumns: template,
          gridTemplateRows: "30px repeat(4, minmax(0, 1fr))",
        }}
      >
        {data.columns.map((column, index) => {
          const Icon = COLUMN_TYPE_ICON[column.type];
          return (
            <div
              key={column.id}
              onContextMenu={(event) => {
                if (!editable) return;
                event.preventDefault();
                stopFieldEvent(event);
                setMenu({ columnId: column.id, x: event.clientX, y: event.clientY });
              }}
              className={cn(
                "group/column relative flex min-w-0 items-center gap-1 bg-gray-6 px-1.5",
                menu?.columnId === column.id && "bg-gray-3/20",
              )}
            >
              <button
                type="button"
                disabled={!editable}
                title={editable ? "Change column type" : undefined}
                {...fieldEvents}
                onClick={(event) => {
                  stopFieldEvent(event);
                  updateColumn(column.id, { type: NEXT_COLUMN_TYPE[column.type] });
                }}
                className="grid size-5 shrink-0 place-items-center rounded-[5px] text-typography-secondary transition-colors enabled:hover:bg-background-primary enabled:hover:text-typography-primary"
              >
                <Icon className="size-3" />
              </button>
              {editable && column.type !== "image" ? (
                <input
                  ref={(node) => {
                    if (node && focusId === column.id) {
                      node.focus();
                      setFocusId(null);
                    }
                  }}
                  value={column.label}
                  size={1}
                  placeholder={`Column ${index + 1}`}
                  aria-label={`Column ${index + 1} name`}
                  {...fieldEvents}
                  onChange={(event) => {
                    updateColumn(column.id, { label: event.target.value });
                    const box = event.currentTarget.getBoundingClientRect();
                    setTyping({ columnId: column.id, left: box.left - 6, top: box.bottom + 6 });
                  }}
                  onBlur={() => setTyping((current) => (current?.columnId === column.id ? null : current))}
                  onKeyDown={(event) => {
                    stopFieldEvent(event);
                    if (isSubmitShortcut(event)) {
                      event.preventDefault();
                      onSubmit?.();
                    } else if (event.key === "Enter" || event.key === "Tab") {
                      const next = data.columns[index + 1];
                      if (event.key === "Enter" || next) event.preventDefault();
                      if (next) setFocusId(next.id);
                      else if (event.key === "Enter") addColumn();
                    }
                  }}
                  className="min-w-0 flex-1 truncate bg-transparent font-bureau text-[11px] font-normal text-typography-primary outline-none placeholder:font-light placeholder:text-typography-secondary/70"
                />
              ) : (
                <span
                  title={column.label}
                  className={cn(
                    "min-w-0 flex-1 truncate font-bureau text-[11px] font-normal",
                    column.label ? "text-typography-secondary" : "text-typography-secondary/60",
                    column.type === "image" && "sr-only",
                  )}
                >
                  {column.label || `Column ${index + 1}`}
                </span>
              )}
              {typing?.columnId === column.id && typeahead(suggestedColumns, column.label).length > 0 && createPortal(
                <div
                  role="listbox"
                  aria-label="Suggested column names"
                  className="fixed z-50 flex w-max max-w-[220px] flex-col gap-1 rounded-[10px] bg-background-primary p-1 shadow-[0_6px_20px_rgba(26,23,24,0.14)]"
                  style={{ left: typing.left, top: typing.top }}
                >
                  {typeahead(suggestedColumns, column.label).map((label) => (
                    <SuggestedHeader
                      key={label}
                      label={label}
                      // Keeps the field focused, so the click lands before blur closes the list.
                      onAccept={() => nameColumn(column.id, label)}
                      onDismiss={onDismissColumn && (() => onDismissColumn(label))}
                    />
                  ))}
                </div>,
                document.body,
              )}
            </div>
          );
        })}

        {rows.map((row) => (
          <Fragment key={row.id}>
            {data.columns.map((column) => {
              const value = row.cells[column.id] ?? "";
              return (
                <div key={column.id} className={cn(cell, column.type === "image" && "p-1")}>
                  {column.type === "image" ? (
                    <Thumbnail url={value} className="size-full rounded-[4px]" />
                  ) : column.type === "tag" && value ? (
                    <TagChip value={value} compact />
                  ) : (
                    <span className="truncate font-bureau text-[11px] text-typography-primary">{value}</span>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
        {Array.from({ length: fillerRows }, (_, r) => (
          <Fragment key={`filler-${r}`}>
            {data.columns.map((column, c) => (
              <div key={column.id} className={cell}>
                <Bar width={35 + ((r * 19 + c * 29) % 40)} className="bg-gray-3/15" />
              </div>
            ))}
          </Fragment>
        ))}
      </div>
      {menu && (
        <ColumnMenu
          menu={menu}
          column={data.columns.find((column) => column.id === menu.columnId)}
          index={data.columns.findIndex((column) => column.id === menu.columnId)}
          canSort={data.rows.length > 1}
          onClose={() => setMenu(null)}
          onSort={(direction) => onChange?.(sortRows(data, menu.columnId, direction))}
          onInsert={(at) => addColumn(at)}
          onRename={() => setFocusId(menu.columnId)}
          onType={(type) => updateColumn(menu.columnId, { type })}
          onRemove={() => removeColumn(menu.columnId)}
        />
      )}
    </div>
  );
}

export function TableShell({
  size,
  data,
  onChange,
  onSubmit,
  status = "idle",
  surface = true,
  actions,
  tools,
  suggested,
  onDismissSuggestion,
  suggestions,
  className,
}: ShellProps<TableShellData>) {
  const editable = Boolean(onChange);
  const mark = useShellMark(size);

  if (size === "small") return <TableAppIcon className={className} />;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <TablePreview data={data} />
      </ShellSurface>
    );
  }

  const titleField = (large: boolean) => (
    <div className="flex min-w-0 items-center gap-2">
      {mark && <ShellGlyph kind="table" className={large ? "size-6" : "size-4"} />}
      {titleInput(large)}
    </div>
  );
  const titleInput = (large: boolean) =>
    editable ? (
      <input
        value={data.title}
        placeholder="Table"
        aria-label="Table title"
        {...fieldEvents}
        onChange={(event) => onChange?.({ ...data, title: event.target.value })}
        onKeyDown={(event) => {
          stopFieldEvent(event);
          if (isSubmitShortcut(event) || (!large && event.key === "Enter")) {
            event.preventDefault();
            if (isSubmitShortcut(event)) onSubmit?.();
          }
        }}
        className={cn(
          "w-full min-w-0 shrink-0 truncate bg-transparent font-bureau text-typography-primary outline-none placeholder:text-typography-secondary",
          large ? SHELL_TITLE_LARGE : "text-[13px] font-normal leading-[1.3]",
        )}
      />
    ) : (
      <div
        className={cn(
          "truncate font-bureau",
          large ? SHELL_TITLE_LARGE : "text-[13px] font-normal leading-[1.3]",
          data.title ? "text-typography-primary" : "text-typography-secondary",
        )}
      >
        {data.title || "Table"}
      </div>
    );

  const descriptionField = (large: boolean) => {
    const textClass = cn(
      "w-full min-w-0 shrink-0 truncate bg-transparent font-bureau font-light text-typography-secondary outline-none placeholder:text-typography-secondary/60",
      large ? "text-[13px] leading-[1.4]" : "text-[11px] leading-[1.35]",
    );
    if (editable) {
      return (
        <input
          value={data.description ?? ""}
          placeholder="What is one row?"
          aria-label="Table description"
          {...fieldEvents}
          onChange={(event) => onChange?.({ ...data, description: event.target.value })}
          onKeyDown={(event) => {
            stopFieldEvent(event);
            if (isSubmitShortcut(event)) {
              event.preventDefault();
              onSubmit?.();
            }
          }}
          className={textClass}
        />
      );
    }
    return data.description ? <div className={textClass}>{data.description}</div> : null;
  };

  if (size === "medium-plus") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3">
          <div className="flex flex-col gap-0.5">
            {titleField(false)}
            {/* Only when it says something: an empty "What is one row?" just asks them to think. */}
            {data.description ? descriptionField(false) : null}
          </div>
          {/* On the chat home: what the request leaves open, above the columns it shapes. */}
          {suggestions?.brief}
          {/* Suggested columns, offered in a header once they start typing its name. */}
          <EditableGrid
            data={data}
            editable={editable}
            onChange={onChange}
            onSubmit={onSubmit}
            suggestedColumns={editable ? unusedSuggestions(suggested?.columns, data.columns.map((column) => column.label)) : []}
            onDismissColumn={onDismissSuggestion && ((label) => onDismissSuggestion("columns", label))}
          />
          <ShellFooter />
        </div>
      </ShellSurface>
    );
  }

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-3/15 py-3 pr-3 pl-5 md:pl-6">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {titleField(true)}
          {descriptionField(true)}
        </div>
        {status === "loading" && (
          <span className="shrink-0 font-bureau text-[12px] text-typography-secondary tabular-nums">Filling in…</span>
        )}
      </div>
      <ShellToolbar tools={tools} actions={actions}>
        <ShellToolButton
          label="Add a row"
          disabled={!editable}
          onPress={() => onChange?.({ ...data, rows: [...data.rows, { id: shellId("row"), cells: {} }] })}
        >
          <Rows3 />
        </ShellToolButton>
        <ShellToolButton
          label="Add a column"
          disabled={!editable}
          onPress={() =>
            onChange?.({
              ...data,
              columns: [...data.columns, { id: shellId("col"), label: "New column", type: "text" }],
            })
          }
        >
          <Columns3 />
        </ShellToolButton>
        <ShellToolDivider />
        <ShellToolMenu
          label="Data cleanup"
          icon={<Eraser />}
          disabled={!editable || data.rows.length === 0}
          items={[
            {
              id: "empty",
              label: "Remove empty rows",
              hint: String(data.rows.length - withoutEmptyRows(data).rows.length),
              onSelect: () => onChange?.(withoutEmptyRows(data)),
            },
            {
              id: "duplicates",
              label: "Remove duplicate rows",
              hint: String(data.rows.length - withoutDuplicateRows(data).rows.length),
              onSelect: () => onChange?.(withoutDuplicateRows(data)),
            },
          ]}
        />
        <ShellToolDivider />
        <ShellToolButton label="Copy as CSV" disabled={data.rows.length === 0} onPress={() => copyText(tableAsCsv(data))}>
          <Copy />
        </ShellToolButton>
        <ShellToolButton
          label="Download (.csv)"
          disabled={data.rows.length === 0}
          onPress={() => downloadText(`${fileNameOf(data.title, "table")}.csv`, tableAsCsv(data), "text/csv")}
        >
          <Download />
        </ShellToolButton>
      </ShellToolbar>
      <TableGrid
        data={data}
        onChange={onChange}
        status={status}
        suggestedColumns={suggested?.columns}
        onDismissColumn={onDismissSuggestion && ((label) => onDismissSuggestion("columns", label))}
      />
    </ShellSurface>
  );
}
