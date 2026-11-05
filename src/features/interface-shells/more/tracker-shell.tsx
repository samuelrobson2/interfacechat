import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, type ShellProps, type TrackerItem, type TrackerShellData } from "../model/shell-types";
import { AddChip } from "../ui/shell-fields";
import {
  InlineInput,
  PreviewBody,
  PreviewHead,
  ShellBody,
  ShellDetail,
  ShellTitle,
} from "../ui/shell-kit";
import { ghostLabels } from "../ui/shell-accents";
import { ShellAppIcon } from "../ui/shell-icons";
import { fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const CORAL = "#f0525c";

function Tick({ done, size, onToggle }: { done: boolean; size: "xs" | "sm" | "md"; onToggle?: () => void }) {
  const box = cn(
    "grid shrink-0 place-items-center rounded-[4px] border transition-colors",
    size === "md" ? "size-[18px]" : size === "sm" ? "size-3.5" : "size-2.5 rounded-[3px]",
    done ? "border-transparent text-white" : "border-gray-3/50 bg-white",
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

function Progress({ items, className }: { items: TrackerItem[]; className?: string }) {
  const done = items.filter((item) => item.done).length;
  return (
    <div className={cn("h-1 w-full shrink-0 overflow-hidden rounded-full bg-gray-6", className)}>
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

function ItemRow({
  item,
  index,
  large,
  onChange,
  onRemove,
}: {
  item: TrackerItem;
  index: number;
  large: boolean;
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
          <InlineInput
            value={item.owner ?? ""}
            placeholder="Owner"
            label="Owner"
            onChange={set && ((owner) => set({ owner: owner || undefined }))}
            className="w-20 px-1 py-0.5 text-[12px] text-typography-secondary"
          />
          <InlineInput
            value={item.due ?? ""}
            placeholder="Due"
            label="Due"
            onChange={set && ((due) => set({ due: due || undefined }))}
            className="w-24 px-1 py-0.5 text-right text-[12px] text-typography-secondary tabular-nums"
          />
          {onRemove && (
            <button
              type="button"
              aria-label={`Remove ${item.label || "item"}`}
              {...fieldEvents}
              onClick={(event) => {
                stopFieldEvent(event);
                onRemove();
              }}
              className="grid size-6 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-gray-6 hover:text-typography-primary focus-visible:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          )}
        </>
      ) : (
        item.owner && <span className="shrink-0 font-bureau text-[10px] text-typography-secondary">{item.owner}</span>
      )}
    </li>
  );
}

function GhostRows({ large }: { large: boolean }) {
  return (
    <ul className="flex flex-col">
      {ghostLabels("Item").map((label) => (
        <li key={label} className={cn("flex items-center", large ? "gap-3 py-1.5" : "gap-2 py-[3px]")}>
          <Tick done={false} size={large ? "md" : "sm"} />
          <span className={cn("px-1 font-bureau font-light text-typography-secondary", large ? "text-[14px]" : "text-[12px]")}>
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TrackerShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  className,
}: ShellProps<TrackerShellData>) {
  const [hideDone, setHideDone] = useState(false);

  if (size === "small") return <ShellAppIcon kind="tracker" className={className} />;

  if (size === "medium") {
    const ghost = data.items.length === 0;
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="tracker" title={data.title} />
        <PreviewBody className="gap-[5px] pt-1">
          {(ghost ? ghostLabels("Item") : data.items.slice(0, 5)).map((row) => {
            const item = typeof row === "string" ? null : row;
            return (
              <span key={item?.id ?? (row as string)} className="flex min-w-0 items-center gap-1.5">
                <Tick done={item?.done ?? false} size="xs" />
                <span
                  className={cn(
                    "truncate font-bureau text-[10px] leading-tight",
                    !item ? "font-light text-typography-secondary" : item.done ? "text-typography-secondary line-through" : "text-typography-primary",
                  )}
                >
                  {item ? item.label : (row as string)}
                </span>
              </span>
            );
          })}
          {!ghost && <Progress items={data.items} className="mt-auto" />}
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

  const done = data.items.filter((item) => item.done).length;
  const visible = (items: TrackerItem[]) => (hideDone ? items.filter((item) => !item.done) : items);
  const ungrouped = data.items.filter((item) => !item.group || !data.groups.includes(item.group));
  const sections: { group?: string; items: TrackerItem[] }[] = large
    ? [
        ...data.groups.map((group) => ({ group, items: data.items.filter((item) => item.group === group) })),
        ...(ungrouped.length || data.groups.length === 0 ? [{ items: ungrouped }] : []),
      ]
    : [{ items: data.items }];

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
            <span className="flex items-center gap-3 font-bureau text-[13px] text-typography-secondary tabular-nums">
              {done} of {data.items.length} done
              <button
                type="button"
                aria-pressed={hideDone}
                {...fieldEvents}
                onClick={(event) => {
                  stopFieldEvent(event);
                  setHideDone((value) => !value);
                }}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[12px] transition-colors",
                  hideDone ? "bg-gray-6 text-typography-primary" : "hover:bg-gray-6",
                )}
              >
                {hideDone ? "Show done" : "Hide done"}
              </button>
            </span>
          ) : undefined
        }
      />
      <ShellBody size={size} className={large ? "gap-5" : "gap-1"}>
        {large && data.items.length > 0 && <Progress items={data.items} />}
        {data.items.length === 0 && <GhostRows large={large} />}
        {data.items.length > 0 &&
          sections.map(({ group, items }) => (
            <section key={group ?? "ungrouped"} className="flex flex-col">
              {large && group && <h3 className="mb-0.5 font-bureau text-[12px] text-typography-secondary">{group}</h3>}
              <ul className={cn("flex flex-col", large && "divide-y divide-gray-3/10")}>
                {visible(items).map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    index={data.items.indexOf(item)}
                    large={large}
                    onChange={setItem}
                    onRemove={removeItem && (() => removeItem(item.id))}
                  />
                ))}
              </ul>
              {addItem && large && <AddItem large onAdd={() => addItem(group)} />}
            </section>
          ))}
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
