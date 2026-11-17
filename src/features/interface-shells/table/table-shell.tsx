import { Columns3, Download, ImageIcon, Plus, Rows3, X } from "lucide-react";
import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/css";
import {
  shellId,
  type ShellProps,
  type TableColumn,
  type TableShellData,
} from "../model/shell-types";
import { CONTENT_PANEL, PreviewBody, PreviewHead, SHELL_BODY_BOX, SHELL_TITLE_GLYPH, SHELL_TITLE_ROW } from "../ui/shell-kit";
import { ShellGlyph, TableAppIcon } from "../ui/shell-icons";
import { downloadText, fileNameOf, ShellToolbar, ShellToolButton, ShellToolDivider } from "../ui/shell-toolbar";
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
import { DismissSuggestion, SuggestedRing, SuggestedText, typeahead, unusedSuggestions } from "../ui/suggested-chip";

/** The table as CSV, for pasting into a spreadsheet. */
function tableAsCsv(data: TableShellData) {
  const cell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  return [
    data.columns.map((column) => cell(column.label)).join(","),
    ...data.rows.map((row) => data.columns.map((column) => cell(row.cells[column.id] ?? "")).join(",")),
  ].join("\n");
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
      className="grid min-h-0 shrink auto-rows-min gap-px overflow-hidden rounded-[6px] bg-shell-ink-faint"
      style={{ gridTemplateColumns: template || "1fr" }}
    >
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn("flex items-center bg-shell-fill", cellPad, compact ? "h-4" : "h-6")}
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
            <Bar width={60} className="h-1 bg-shell-ink-faint" />
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
                "flex items-center bg-shell-panel",
                column.type === "image" ? "p-0.5" : cellPad,
                compact ? "h-5" : "h-8",
              )}
            >
              {column.type === "image" ? (
                <Thumbnail url={value} className="size-full rounded-[3px]" />
              ) : column.type === "tag" && value && !compact ? (
                <TagChip value={value} compact />
              ) : compact ? (
                <Bar width={value ? 70 : 40} className={value ? "bg-shell-ink-soft" : undefined} />
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
            className={cn("flex items-center bg-shell-panel", cellPad, compact ? "h-5" : "h-8")}
          >
            <Bar width={35 + ((r * 19 + c * 29) % 40)} className="bg-shell-ink-faint" />
          </div>
        )),
      )}
    </div>
  );
}

function TablePreview({ data }: { data: TableShellData }) {
  const hasColumns = data.columns.some((column) => column.label.trim());
  const hasRows = data.rows.length > 0;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PreviewHead kind="table" title={data.title} />
      <PreviewBody>
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
      </PreviewBody>
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
    <span className="group/suggested relative flex h-6 min-w-0 flex-1 items-center rounded-[6px] bg-shell-panel">
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
  // A suggested column sits where a column would: one more header, outlined, with empty cells under it.
  const extra = editable ? unusedSuggestions(suggestedColumns, data.columns.map((column) => column.label)).slice(0, 1) : [];
  const template = [...data.columns.map((column) => (column.type === "image" ? "52px" : "104px")), ...extra.map(() => "112px")].join(" ");

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

  const cell = "flex min-w-0 items-center bg-shell-panel px-2";

  return (
    // Its own rounded box, clipped on every side, so the header row sits wholly inside it; wide tables scroll within.
    // It fills the room there is, but never less than its rows' height: with less, the panel scrolls instead.
    <div className="no-scrollbar flex flex-[1_0_auto] overflow-x-auto rounded-[8px]">
      <div
        className="grid min-h-0 w-max min-w-full shrink-0 gap-px overflow-hidden rounded-[8px] bg-shell-ink-faint"
        style={{
          gridTemplateColumns: template,
          gridTemplateRows: "30px repeat(4, minmax(28px, 1fr))",
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
                "group/column relative flex min-w-0 items-center gap-1 bg-shell-fill px-1.5",
                menu?.columnId === column.id && "bg-shell-ink-faint",
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
                    column.label ? "text-typography-secondary" : "text-typography-secondary",
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
        {extra.map((label) => (
          <div key={`suggested-${label}`} data-shell-part="suggest" className="group/suggested flex min-w-0 items-center gap-1 bg-shell-fill px-1.5">
            <SuggestedText
              text={label}
              onAccept={() => onChange?.({ ...data, columns: [...data.columns, { id: shellId("col"), label, type: "text" }] })}
              className="min-w-0 flex-1 truncate font-bureau text-[11px]"
            />
            {onDismissColumn && <DismissSuggestion label={label} onDismiss={() => onDismissColumn(label)} className="size-5" />}
          </div>
        ))}

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
            {extra.map((label) => (
              <div key={label} aria-hidden className={cell}>
                <span className="shell-suggest-shimmer block h-2 w-3/4 rounded-full" />
              </div>
            ))}
          </Fragment>
        ))}
        {Array.from({ length: fillerRows }, (_, r) => (
          <Fragment key={`filler-${r}`}>
            {data.columns.map((column, c) => (
              <div key={column.id} className={cell}>
                <Bar width={35 + ((r * 19 + c * 29) % 40)} className="bg-shell-ink-faint" />
              </div>
            ))}
            {extra.map((label) => <div key={label} className={cell} />)}
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
    <div className="flex min-w-0 items-center gap-[var(--shell-title-gap)]">
      {mark && <ShellGlyph kind="table" className={SHELL_TITLE_GLYPH} />}
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
        className="shell-title-type min-w-0 flex-1 truncate bg-transparent font-bureau text-typography-primary outline-none placeholder:text-typography-secondary"
      />
    ) : (
      <div
        className={cn("shell-title-type", "truncate font-bureau", data.title ? "text-typography-primary" : "text-typography-secondary")}
      >
        {data.title || "Table"}
      </div>
    );

  // The standard tools, the same at medium plus and large.
  const standardTools = (
    <>
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
      <ShellToolButton
        label="Download (.csv)"
        disabled={data.rows.length === 0}
        onPress={() => downloadText(`${fileNameOf(data.title, "table")}.csv`, tableAsCsv(data), "text/csv")}
      >
        <Download />
      </ShellToolButton>
    </>
  );

  if (size === "medium-plus") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <div data-shell-part="title" className={cn("flex shrink-0 flex-col", SHELL_TITLE_ROW)}>
          {titleField(false)}
        </div>
        <ShellToolbar tools={tools} actions={actions}>{standardTools}</ShellToolbar>
        {/* The grid sits in the panel with room on every side, as on the medium card. The panel scrolls: what's
            above the grid (the choices on the chat home) pushes it down rather than squeezing its rows. */}
        <div
          data-shell-part="body"
          tabIndex={0}
          className={cn("no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto outline-none focus-visible:ring-2 focus-visible:ring-blue-4/50", SHELL_BODY_BOX, CONTENT_PANEL)}
        >
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
      <div data-shell-part="title" className={cn("flex shrink-0 items-center", SHELL_TITLE_ROW)}>
        <div className="flex min-w-0 flex-1 flex-col">{titleField(true)}</div>
        {status === "loading" && (
          <span className="shrink-0 font-bureau text-[12px] text-typography-secondary tabular-nums">Filling in…</span>
        )}
      </div>
      <ShellToolbar tools={tools} actions={actions}>{standardTools}</ShellToolbar>
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
