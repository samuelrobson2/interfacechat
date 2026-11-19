import { ArrowDownAZ, ArrowUpDown, CalendarClock, Check, Columns3, Eye, EyeOff, ListChecks, ListPlus, Plus, User, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, trackerFields, type ShellProps, type TrackerColumn, type TrackerField, type TrackerItem, type TrackerShellData } from "../model/shell-types";
import { AddChip } from "../ui/shell-fields";
import {
  InlineInput,
  PreviewBody,
  PreviewHead,
  ShellBody,
  ShellDetail,
  ShellTitle,
} from "../ui/shell-kit";
import { accentOf, ghostsAfter } from "../ui/shell-accents";
import { ShellAppIcon } from "../ui/shell-icons";
import { DismissSuggestion, SuggestedBox, SuggestedText, placedSuggestions, suggestionsAfter, type PlacedSuggestion } from "../ui/suggested-chip";
import { ShellToolbar, ShellToolButton, ShellToolDivider, ShellToolMenu } from "../ui/shell-toolbar";
import { Bar, fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const CORAL = "#f0525c";

function Tick({ done, size, onToggle }: { done: boolean; size: "xs" | "sm" | "md"; onToggle?: () => void }) {
  const box = cn(
    "grid shrink-0 place-items-center rounded-[4px] border transition-colors",
    size === "md" ? "size-[18px]" : size === "sm" ? "size-3.5" : "size-2.5 rounded-[3px]",
    done ? "border-transparent text-white" : "border-shell-control bg-shell-panel",
  );
  const style = done ? { backgroundColor: CORAL } : undefined;
  const mark = size !== "xs" && <Check className={size === "md" ? "size-3" : "size-2.5"} strokeWidth={3} />;
  if (!onToggle) return <span className={box} style={style}>{done && mark}</span>;
  return (
    <button
      type="button"
      aria-label={done ? "Mark as not done" : "Mark as done"}
      aria-pressed={done}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onToggle();
      }}
      className={cn(box, "active:scale-[0.9]")}
      style={style}
    >
      {done && mark}
    </button>
  );
}

type TrackerSort = "due" | "owner" | "title" | "open";

/** A due date such as "Fri 4 Dec" as a time, or Infinity when it can't be read. */
function dueTime(due: string | undefined) {
  if (!due?.trim()) return Infinity;
  const direct = Date.parse(due);
  if (!Number.isNaN(direct)) return direct;
  const withYear = Date.parse(`${due} ${new Date().getFullYear()}`);
  return Number.isNaN(withYear) ? Infinity : withYear;
}

/** Reminders' Sort By: the order is kept, so the list stays sorted after you close the menu. */
function sortItems(items: TrackerItem[], by: TrackerSort): TrackerItem[] {
  const text = (value?: string) => value?.trim().toLowerCase() || "\uffff";
  const compare: Record<TrackerSort, (a: TrackerItem, b: TrackerItem) => number> = {
    due: (a, b) => dueTime(a.due) - dueTime(b.due),
    owner: (a, b) => text(a.owner).localeCompare(text(b.owner)),
    title: (a, b) => text(a.label).localeCompare(text(b.label), undefined, { numeric: true }),
    open: (a, b) => Number(a.done) - Number(b.done),
  };
  return [...items].sort(compare[by]);
}


/**
 * An item the model suggests: a checklist row like any other, with its box
 * outlined and its words in the suggestion colour. Click the words to add it;
 * × (on hover) to dismiss it.
 */
function SuggestedItem({
  label,
  compact = false,
  onAccept,
  onDismiss,
}: {
  label: string;
  /** Medium plus: a checklist row's size, not the window's. */
  compact?: boolean;
  onAccept: () => void;
  onDismiss?: () => void;
}) {
  return (
    <li data-shell-part="suggest" className={cn("group/suggested flex min-w-0 items-center", compact ? "gap-2 py-[3px]" : "gap-3 py-1.5")}>
      <SuggestedBox className={compact ? "size-3.5" : "size-[18px]"} />
      <SuggestedText text={label} onAccept={onAccept} className={cn("min-w-0 flex-1 truncate py-0.5 font-bureau", compact ? "text-[12px]" : "text-[14px]")} />
      {onDismiss && <DismissSuggestion label={label} onDismiss={onDismiss} className={compact ? "size-5" : undefined} />}
    </li>
  );
}

/** Up to two groups of up to two rows, as done flags; ghost rows when empty. */
function groupShapes(items: TrackerItem[]): boolean[][] {
  if (items.length === 0) return [[false, false], [false]];
  const groups = new Map<string, boolean[]>();
  for (const item of items) groups.set(item.group ?? "", [...(groups.get(item.group ?? "") ?? []), item.done]);
  return [...groups.values()].slice(0, 2).map((rows) => rows.slice(0, 2));
}

function Progress({ items, className }: { items: TrackerItem[]; className?: string }) {
  const done = items.filter((item) => item.done).length;
  return (
    <div className={cn("h-1 w-full shrink-0 overflow-hidden rounded-full bg-shell-fill", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: items.length ? `${(done / items.length) * 100}%` : "0%", backgroundColor: CORAL }}
      />
    </div>
  );
}

function AddItem({ large, onAdd }: { large: boolean; onAdd: () => void }) {
  return (
    <button
      type="button"
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onAdd();
      }}
      className={cn(
        "flex items-center gap-1.5 self-start font-bureau text-typography-secondary hover:text-typography-primary",
        large ? "mt-1 text-[13px]" : "mt-0.5 text-[12px]",
      )}
    >
      <Plus className="size-3.5" />
      Add an item
    </button>
  );
}

/** A column's cell width, so every item's values line up under its name. */
const columnWidth = (large: boolean) => (large ? "w-20" : "w-14");

/** An item's values, one per column, lined up on the right. */
function ColumnValues({
  item,
  columns,
  large,
  set,
}: {
  item: TrackerItem;
  columns: TrackerColumn[];
  large: boolean;
  set?: (patch: Partial<TrackerItem>) => void;
}) {
  return (
    <>
      {columns.map((column) => (
        <InlineInput
          key={column.id}
          value={item.values?.[column.id] ?? ""}
          placeholder="–"
          label={`${column.label || "Column"} for ${item.label || "item"}`}
          onChange={set && ((value) => set({ values: { ...item.values, [column.id]: value } }))}
          className={cn(
            columnWidth(large),
            "shrink-0 px-1 py-0.5 text-right text-typography-secondary tabular-nums",
            large ? "text-[13px]" : "text-[11px]",
          )}
        />
      ))}
    </>
  );
}

/** The columns' names, over the values: each can be renamed, and removed on hover. */
function ColumnHeads({
  columns,
  large,
  trailing,
  onRename,
  onRemove,
}: {
  columns: TrackerColumn[];
  large: boolean;
  /** Room kept at the end for each row's remove button, so the names sit over their values. */
  trailing: boolean;
  onRename?: (id: string, label: string) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <div data-tracker-columns="" className={cn("flex min-w-0 items-center", large ? "gap-3 pb-1" : "gap-2 pb-0.5")}>
      <span className="flex-1" />
      {columns.map((column) => (
        <span key={column.id} className={cn("group/column relative shrink-0", columnWidth(large))}>
          <InlineInput
            value={column.label}
            placeholder="Column"
            label="Column name"
            onChange={onRename && ((label) => onRename(column.id, label))}
            className={cn("w-full px-1 py-0.5 text-right text-typography-secondary", large ? "text-[12px]" : "text-[10px]")}
          />
          {onRemove && (
            <button
              type="button"
              aria-label={`Remove the ${column.label || "column"} column`}
              {...fieldEvents}
              onClick={(event) => {
                stopFieldEvent(event);
                onRemove(column.id);
              }}
              className="absolute top-1/2 -left-4 grid size-4 -translate-y-1/2 place-items-center rounded-full text-typography-secondary opacity-0 group-hover/column:opacity-100 hover:bg-shell-fill hover:text-typography-primary focus-visible:opacity-100"
            >
              <X className="size-3" />
            </button>
          )}
        </span>
      ))}
      {trailing && <span aria-hidden className="size-6 shrink-0" />}
    </div>
  );
}

function ItemRow({
  item,
  index,
  large,
  columns = [],
  fields = new Set(),
  onChange,
  onRemove,
}: {
  item: TrackerItem;
  index: number;
  large: boolean;
  columns?: TrackerColumn[];
  /** Owner and due date, where this checklist uses them. */
  fields?: Set<TrackerField>;
  onChange?: (next: TrackerItem) => void;
  onRemove?: () => void;
}) {
  const set = onChange && ((patch: Partial<TrackerItem>) => onChange({ ...item, ...patch }));
  return (
    <li className={cn("group flex min-w-0 items-center", large ? "gap-3 py-1.5" : "gap-2 py-[3px]")}>
      <Tick done={item.done} size={large ? "md" : "sm"} onToggle={set && (() => set({ done: !item.done }))} />
      <InlineInput
        value={item.label}
        placeholder={`Item ${index + 1}`}
        label="Item"
        onChange={set && ((label) => set({ label }))}
        className={cn(
          "flex-1 px-1 py-0.5",
          large ? "text-[14px]" : "text-[12px]",
          item.done && "text-typography-secondary line-through",
        )}
      />
      {large ? (
        <>
          {fields.has("owner") && (
            <InlineInput
              value={item.owner ?? ""}
              placeholder="Owner"
              label="Owner"
              onChange={set && ((owner) => set({ owner: owner || undefined }))}
              className="w-20 px-1 py-0.5 text-[12px] text-typography-secondary"
            />
          )}
          {fields.has("due") && (
            <InlineInput
              value={item.due ?? ""}
              placeholder="Due"
              label="Due"
              onChange={set && ((due) => set({ due: due || undefined }))}
              className="w-24 px-1 py-0.5 text-right text-[12px] text-typography-secondary tabular-nums"
            />
          )}
          <ColumnValues item={item} columns={columns} large set={set} />
          {onRemove && (
            <button
              type="button"
              aria-label={`Remove ${item.label || "item"}`}
              {...fieldEvents}
              onClick={(event) => {
                stopFieldEvent(event);
                onRemove();
              }}
              className="grid size-6 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-shell-fill hover:text-typography-primary focus-visible:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          )}
        </>
      ) : (
        <>
          {fields.has("owner") && item.owner && <span className="shrink-0 font-bureau text-[10px] text-typography-secondary">{item.owner}</span>}
          <ColumnValues item={item} columns={columns} large={false} set={set} />
        </>
      )}
    </li>
  );
}

function GroupHeading({ name, index, large }: { name: string; index: number; large: boolean }) {
  return (
    <h3
      className={cn(
        "flex items-center gap-1.5 font-bureau text-typography-secondary",
        large ? "mb-0.5 text-[12px]" : "mb-px text-[11px]",
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", accentOf(index).solid)} />
      {name}
    </h3>
  );
}

/** Empty state: two placeholder groups, the first item ticked, so the shape reads at a glance. */
/** Placeholder rows for an empty checklist; `filled` of them are taken by suggestions above, so they aren't drawn. */
function GhostRows({ large, filled = 0 }: { large: boolean; filled?: number }) {
  const left = ghostsAfter("Item", filled);
  const groups = [left.filter((label) => Number(label.split(" ").pop()) <= 2), left.filter((label) => Number(label.split(" ").pop()) > 2)].filter((labels) => labels.length);
  return (
    <div className={cn("flex flex-col", large ? "gap-5" : "gap-2")}>
      {groups.map((labels, g) => (
        <section key={g} className="flex flex-col">
          <GroupHeading name={`Group ${g + 1}`} index={g} large={large} />
          <ul className="flex flex-col">
            {labels.map((label, i) => {
              const done = g === 0 && i === 0;
              return (
                <li key={label} className={cn("flex items-center", large ? "gap-3 py-1.5" : "gap-2 py-[3px]")}>
                  <Tick done={done} size={large ? "md" : "sm"} />
                  <span
                    className={cn(
                      "px-1 font-bureau font-light text-typography-secondary",
                      large ? "text-[14px]" : "text-[12px]",
                      done && "line-through",
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function TrackerShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  tools,
  actions,
  suggested,
  onDismissSuggestion,
  suggestions,
  className,
}: ShellProps<TrackerShellData>) {
  const [hideDone, setHideDone] = useState(false);

  if (size === "small") return <ShellAppIcon kind="tracker" className={className} />;

  if (size === "medium") {
    const ghost = data.items.length === 0;
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="tracker" title={data.title} />
        {/* Shapes, not words: groups of checklist rows under a coloured head, and progress. */}
        <PreviewBody>
          {groupShapes(data.items).map((group, g) => (
            <div key={g} className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5">
                <span className={cn("size-1.5 shrink-0 rounded-full", accentOf(g).solid)} />
                <Bar width="34%" className="h-1 bg-shell-ink-soft" />
              </span>
              {group.map((done, i) => (
                <span key={i} className="flex min-w-0 items-center gap-1.5 pl-3">
                  <Tick done={done} size="xs" />
                  <Bar width={`${[66, 52, 60][i % 3]}%`} className={cn("h-1", done ? "bg-shell-ink-faint" : "bg-shell-ink-faint")} />
                </span>
              ))}
            </div>
          ))}
          <Progress items={ghost ? [] : data.items} className="mt-auto" />
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<TrackerShellData>) => onChange({ ...data, ...patch }) : undefined;
  const setItem = update
    ? (next: TrackerItem) => update({ items: data.items.map((item) => (item.id === next.id ? next : item)) })
    : undefined;
  const removeItem = update ? (id: string) => update({ items: data.items.filter((item) => item.id !== id) }) : undefined;
  const addItem = update
    ? (group?: string) => update({ items: [...data.items, { id: shellId("item"), label: "", done: false, group }] })
    : undefined;
  // Columns of detail beside each item (Weight, Qty): added from the toolbar or by the model.
  const columns = data.columns ?? [];
  // Owner and due date only where the checklist uses them (the model's pick, or switched on here).
  const fields = trackerFields(data);
  const toggleField = update
    ? (field: TrackerField) =>
        fields.has(field)
          ? // Off: the field goes, and so does what the items held in it.
            update({
              fields: (data.fields ?? []).filter((each) => each !== field),
              items: data.items.map((item) => ({ ...item, [field]: undefined })),
            })
          : update({ fields: [...(data.fields ?? []), field] })
    : undefined;
  const addColumn = update ? () => update({ columns: [...columns, { id: shellId("col"), label: "" }] }) : undefined;
  const renameColumn = update
    ? (id: string, label: string) => update({ columns: columns.map((column) => (column.id === id ? { ...column, label } : column)) })
    : undefined;
  const removeColumn = update
    ? (id: string) =>
        update({
          columns: columns.filter((column) => column.id !== id),
          items: data.items.map((item) => {
            if (!item.values || !(id in item.values)) return item;
            const { [id]: _removed, ...values } = item.values;
            void _removed;
            return { ...item, values };
          }),
        })
    : undefined;

  const done = data.items.filter((item) => item.done).length;
  const visible = (items: TrackerItem[]) => (hideDone ? items.filter((item) => !item.done) : items);
  const ungrouped = data.items.filter((item) => !item.group || !data.groups.includes(item.group));
  const sections: { group?: string; items: TrackerItem[] }[] = [
    ...data.groups.map((group) => ({ group, items: data.items.filter((item) => item.group === group) })),
    ...(ungrouped.length || data.groups.length === 0 ? [{ items: ungrouped }] : []),
  ].filter((section) => large || section.items.length > 0);
  // Each suggestion goes to its section: the group it names, else the one holding the item it follows, else the first.
  const suggestionsBySection: PlacedSuggestion[][] = sections.map(() => []);
  if (update) {
    for (const placed of placedSuggestions(suggested?.items, data.items.map((item) => item.label)).slice(0, 4)) {
      const byGroup = sections.findIndex((section) => placed.group && section.group?.toLowerCase() === placed.group.toLowerCase());
      const byAnchor = sections.findIndex((section) => placed.after && section.items.some((item) => item.label.toLowerCase().startsWith(placed.after!.toLowerCase())));
      suggestionsBySection[byGroup >= 0 ? byGroup : byAnchor >= 0 ? byAnchor : 0]?.push(placed);
    }
  }

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle
        kind="tracker"
        size={size}
        value={data.title}
        onChange={update && ((title) => update({ title }))}
        onSubmit={onSubmit}
        aside={
          large && data.items.length > 0 ? (
            <span className="font-bureau text-[13px] text-typography-secondary tabular-nums">
              {done} of {data.items.length} done
            </span>
          ) : undefined
        }
      />
      {/* The same standard tools at medium plus and large. */}
      <ShellToolbar tools={tools} actions={actions}>
        <ShellToolButton label="New item" disabled={!addItem} onPress={() => addItem?.(data.groups[0])}>
          <Plus />
        </ShellToolButton>
        <ShellToolButton
          label="New list"
          disabled={!update}
          onPress={() => {
            let n = data.groups.length + 1;
            while (data.groups.includes(`List ${n}`)) n += 1;
            const group = `List ${n}`;
            update?.({ groups: [...data.groups, group], items: [...data.items, { id: shellId("item"), label: "", done: false, group }] });
          }}
        >
          <ListPlus />
        </ShellToolButton>
        <ShellToolButton label="Add column" disabled={!addColumn} onPress={() => addColumn?.()}>
          <Columns3 />
        </ShellToolButton>
        <ShellToolButton label={fields.has("owner") ? "Hide owners" : "Show owners"} active={fields.has("owner")} disabled={!toggleField} onPress={() => toggleField?.("owner")}>
          <User />
        </ShellToolButton>
        <ShellToolButton label={fields.has("due") ? "Hide due dates" : "Show due dates"} active={fields.has("due")} disabled={!toggleField} onPress={() => toggleField?.("due")}>
          <CalendarClock />
        </ShellToolButton>
        <ShellToolDivider />
        <ShellToolMenu
          label="Sort by"
          icon={<ArrowUpDown />}
          disabled={!update || data.items.length < 2}
          items={[
            ...(fields.has("due") ? [{ id: "due", label: "Due date", icon: <CalendarClock />, onSelect: () => update?.({ items: sortItems(data.items, "due") }) }] : []),
            ...(fields.has("owner") ? [{ id: "owner", label: "Owner", icon: <User />, onSelect: () => update?.({ items: sortItems(data.items, "owner") }) }] : []),
            { id: "title", label: "Title", icon: <ArrowDownAZ />, onSelect: () => update?.({ items: sortItems(data.items, "title") }) },
            { id: "open", label: "Not done first", icon: <ListChecks />, onSelect: () => update?.({ items: sortItems(data.items, "open") }) },
          ]}
        />
        <ShellToolButton
          label={hideDone ? "Show completed" : "Hide completed"}
          active={hideDone}
          disabled={done === 0}
          onPress={() => setHideDone((value) => !value)}
        >
          {hideDone ? <EyeOff /> : <Eye />}
        </ShellToolButton>
        <ShellToolDivider />
      </ShellToolbar>
      <ShellBody size={size}>
        {large && data.items.length > 0 && <Progress items={data.items} />}
        {/* The columns' names, over the values they line up. */}
        {columns.length > 0 && data.items.length > 0 && (
          <ColumnHeads columns={columns} large={large} trailing={large && !!removeItem} onRename={renameColumn} onRemove={large ? removeColumn : undefined} />
        )}
        {/* On the chat home: what the request leaves open, where the empty rows would be. */}
        {!large && suggestions?.brief}
        {/* No items: suggested items (below) take the placeholders' places; the rest stay placeholders after them. */}
        {data.items.length > 0 &&
          sections.map((section, sectionIndex) => {
            const { group, items } = section;
            const shown = visible(items);
            // This section's suggestions, each right after the item it follows (or at the end of the section).
            const where = suggestionsAfter(suggestionsBySection[sectionIndex] ?? [], shown.map((item) => item.label));
            const suggestion = (placed: PlacedSuggestion, at: TrackerItem | undefined) => (
              <SuggestedItem
                key={placed.value}
                label={placed.value}
                compact={!large}
                onAccept={() => {
                  const next = { id: shellId("item"), label: placed.value, done: false, group };
                  const index = at ? data.items.indexOf(at) + 1 : data.items.length;
                  update?.({ items: [...data.items.slice(0, index), next, ...data.items.slice(index)] });
                }}
                onDismiss={onDismissSuggestion && (() => onDismissSuggestion("items", placed.value))}
              />
            );
            return (
            <section key={group ?? "ungrouped"} className="flex flex-col">
              {group && <GroupHeading name={group} index={data.groups.indexOf(group)} large={large} />}
              <ul className={cn("flex flex-col", large && "divide-y divide-shell-line")}>
                {shown.flatMap((item, i) => [
                  <ItemRow
                    key={item.id}
                    item={item}
                    index={data.items.indexOf(item)}
                    large={large}
                    columns={columns}
                    fields={fields}
                    onChange={setItem}
                    onRemove={removeItem && (() => removeItem(item.id))}
                  />,
                  ...where.after(i).map((placed) => suggestion(placed, item)),
                ])}
                {where.atEnd.map((placed) => suggestion(placed, shown.at(-1)))}
              </ul>
              {addItem && large && <AddItem large onAdd={() => addItem(group)} />}
            </section>
            );
          })}
        {/* No items yet (a request on the chat home): the suggested first items are the list. */}
        {data.items.length === 0 && update && (suggested?.items?.length ?? 0) > 0 && (
          <ul className="flex flex-col">
            {placedSuggestions(suggested?.items, [])
              .slice(0, 3)
              .map((placed) => (
                <SuggestedItem
                  key={placed.value}
                  label={placed.value}
                  compact={!large}
                  onAccept={() => update({ items: [...data.items, { id: shellId("item"), label: placed.value, done: false, group: data.groups?.[0] }] })}
                  onDismiss={onDismissSuggestion && (() => onDismissSuggestion("items", placed.value))}
                />
              ))}
          </ul>
        )}
        {data.items.length === 0 && !(!large && suggestions?.brief) && (
          <GhostRows large={large} filled={update ? Math.min(3, placedSuggestions(suggested?.items, []).length) : 0} />
        )}
        {addItem && (!large || data.items.length === 0) && <AddItem large={large} onAdd={() => addItem()} />}
        {large && update && (
          <AddChip
            size="md"
            placeholder="Group name"
            onSubmitValue={(group) => {
              if (!data.groups.includes(group)) update({ groups: [...data.groups, group] });
            }}
          >
            Add a group
          </AddChip>
        )}
      </ShellBody>
      {!large && (
        <ShellDetail>
          {data.items.length ? `${done}/${data.items.length} done` : null}
        </ShellDetail>
      )}
    </ShellSurface>
  );
}
