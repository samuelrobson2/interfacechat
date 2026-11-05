import { ImageIcon, Plus, X } from "lucide-react";
import { Fragment, useState } from "react";
import { cn } from "@/shared/lib/css";
import {
  shellId,
  type ShellProps,
  type TableColumn,
  type TableShellData,
} from "../model/shell-types";
import { ShellGlyph, TableAppIcon } from "../ui/shell-icons";
import { ShellFooter } from "../ui/shell-meta";
import {
  Bar,
  fieldEvents,
  isSubmitShortcut,
  ShellSurface,
  stopFieldEvent,
} from "../ui/shell-surface";
import { COLUMN_TYPE_ICON, NEXT_COLUMN_TYPE, TagChip, Thumbnail } from "./table-cells";
import { TableGrid } from "./table-grid";

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
      {hasColumns || hasRows ? (
        <MiniGrid data={data} columns={3} rows={4} compact />
      ) : (
        <div className="overflow-hidden rounded-[6px] bg-gray-3/15 p-px">
          <p className="bg-white px-2 py-1.5 font-bureau text-[11px] leading-[1.35] font-light text-typography-secondary">
            Add / remove columns
          </p>
        </div>
      )}
      <ShellFooter compact className="mt-auto" />
    </div>
  );
}

function rowsDetail(data: TableShellData) {
  const count = data.rows.length || data.rowCount;
  if (!count) return null;
  const label = `${count} ${count === 1 ? "row" : "rows"}`;
  return data.rows.length ? label : `~${label}`;
}

function RowsField({
  data,
  editable,
  onChange,
}: {
  data: TableShellData;
  editable: boolean;
  onChange?: (data: TableShellData) => void;
}) {
  const shown = rowsDetail(data);
  if (!editable || data.rows.length > 0 || !onChange) return shown;
  return (
    <input
      value={data.rowCount ? `~${data.rowCount} ${data.rowCount === 1 ? "row" : "rows"}` : ""}
      placeholder="~12 rows"
      aria-label="Expected rows"
      {...fieldEvents}
      onChange={(event) => {
        const count = Number(event.target.value.replace(/[^\d]/g, ""));
        onChange({ ...data, rowCount: count || undefined });
      }}
      className="w-[5.5rem] bg-transparent text-right font-bureau text-[11px] text-typography-secondary tabular-nums outline-none placeholder:text-typography-secondary/50"
    />
  );
}

/**
 * The table at medium plus: column names are typed straight into the header,
 * the type icon cycles text → tag → image, and + adds a column. Scrolls
 * sideways when there are more columns than fit.
 */
function EditableGrid({
  data,
  editable,
  onChange,
  onSubmit,
}: {
  data: TableShellData;
  editable: boolean;
  onChange?: (data: TableShellData) => void;
  onSubmit?: () => void;
}) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const rows = data.rows.slice(0, 4);
  const fillerRows = Math.max(0, 4 - rows.length);
  const template = [
    ...data.columns.map((column) => (column.type === "image" ? "52px" : "104px")),
    ...(editable ? ["32px"] : []),
  ].join(" ");

  const updateColumn = (columnId: string, patch: Partial<TableColumn>) =>
    onChange?.({
      ...data,
      columns: data.columns.map((column) => (column.id === columnId ? { ...column, ...patch } : column)),
    });
  const removeColumn = (columnId: string) =>
    onChange?.({ ...data, columns: data.columns.filter((column) => column.id !== columnId) });
  const addColumn = () => {
    const column: TableColumn = { id: shellId("col"), label: "", type: "text" };
    onChange?.({ ...data, columns: [...data.columns, column] });
    setFocusId(column.id);
  };

  const cell = "flex min-w-0 items-center bg-white px-2";

  return (
    <div className="no-scrollbar -mx-3 flex min-h-0 flex-1 overflow-x-auto px-3 [mask-image:linear-gradient(to_right,black_calc(100%-20px),transparent)]">
      <div
        className="grid min-h-0 w-max min-w-full shrink-0 gap-px overflow-hidden rounded-[8px] bg-gray-3/15"
        style={{
          gridTemplateColumns: template,
          gridTemplateRows: editable
            ? "30px repeat(4, minmax(0, 1fr)) auto"
            : "30px repeat(4, minmax(0, 1fr))",
        }}
      >
        {data.columns.map((column, index) => {
          const Icon = COLUMN_TYPE_ICON[column.type];
          return (
            <div
              key={column.id}
              className={cn(
                "group/column relative flex min-w-0 items-center gap-1 bg-gray-6 pl-1.5",
                editable ? "pr-6" : "pr-1.5",
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
                  onChange={(event) => updateColumn(column.id, { label: event.target.value })}
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
              {editable && (
                <button
                  type="button"
                  aria-label={`Remove ${column.label || `column ${index + 1}`}`}
                  {...fieldEvents}
                  onClick={(event) => {
                    stopFieldEvent(event);
                    removeColumn(column.id);
                  }}
                  className="absolute top-1/2 right-1 grid size-5 -translate-y-1/2 place-items-center rounded-full text-typography-secondary hover:bg-background-primary hover:text-typography-primary"
                >
                  <X className="size-2.5" />
                </button>
              )}
            </div>
          );
        })}
        {editable && (
          <button
            type="button"
            aria-label="Add column"
            title="Add column"
            {...fieldEvents}
            onClick={(event) => {
              stopFieldEvent(event);
              addColumn();
            }}
            className="grid place-items-center bg-gray-6 text-typography-secondary transition-colors hover:bg-gray-3/20 hover:text-typography-primary"
          >
            <Plus className="size-3.5" />
          </button>
        )}

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
            {editable && <div className="bg-white" />}
          </Fragment>
        ))}
        {Array.from({ length: fillerRows }, (_, r) => (
          <Fragment key={`filler-${r}`}>
            {data.columns.map((column, c) => (
              <div key={column.id} className={cell}>
                <Bar width={35 + ((r * 19 + c * 29) % 40)} className="bg-gray-3/15" />
              </div>
            ))}
            {editable && <div className="bg-white" />}
          </Fragment>
        ))}
        {editable && (
          <button
            type="button"
            {...fieldEvents}
            onClick={(event) => {
              stopFieldEvent(event);
              addColumn();
            }}
            style={{ gridColumn: "1 / -1" }}
            className="bg-white px-2 py-1.5 text-left font-bureau text-[11px] leading-[1.35] font-light text-typography-secondary"
          >
            Add / remove columns
          </button>
        )}
      </div>
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
  className,
}: ShellProps<TableShellData>) {
  const editable = Boolean(onChange);

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
      <ShellGlyph kind="table" className={large ? "size-6" : "size-4"} />
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
          large ? "text-[20px] font-light leading-[1.3]" : "text-[13px] font-normal leading-[1.3]",
        )}
      />
    ) : (
      <div
        className={cn(
          "truncate font-bureau",
          large ? "text-[20px] font-light leading-[1.3]" : "text-[13px] font-normal leading-[1.3]",
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
            {descriptionField(false)}
          </div>
          <EditableGrid data={data} editable={editable} onChange={onChange} onSubmit={onSubmit} />
          <ShellFooter
           
            detail={<RowsField data={data} editable={editable} onChange={onChange} />}
          />
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
        <span className="shrink-0 font-bureau text-[12px] text-typography-secondary tabular-nums">
          {status === "loading" ? (
            "Filling in…"
          ) : (
            <RowsField data={data} editable={editable} onChange={onChange} />
          )}
        </span>
        {actions}
      </div>
      <TableGrid data={data} onChange={onChange} status={status} />
    </ShellSurface>
  );
}
