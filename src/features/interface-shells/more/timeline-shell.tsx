import { CirclePlus, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, type ShellColour, type ShellProps, type TimelineEvent, type TimelineShellData } from "../model/shell-types";
import { CanvasBoard, canvasColour, SelectionBar, tint } from "../ui/canvas-board";
import { InlineInput, PreviewBody, PreviewHead, ShellBody, ShellTitle } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { Bar, AutoTextarea, fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const LIME = "#6fa63a";

/** "1898", "2024-03" or "2024-03-05" as a number of years, for ordering and spacing. */
function when(date: string) {
  const [y, m = 1, d = 1] = date.split("-").map(Number);
  if (!y || Number.isNaN(y)) return Number.POSITIVE_INFINITY;
  return y + (m - 1) / 12 + (d - 1) / 365;
}

/** An empty timeline: blank stops along the line, the middle one inviting an event. */
const GHOST_STOPS = ["", "Add an event", ""];

const sorted = (events: TimelineEvent[]) => [...events].sort((a, b) => when(a.date) - when(b.date));

/**
 * Where each event sits along the axis, 0 to 1: part true to the dates, part
 * even, so a long gap reads as long without crushing a cluster.
 */
function positions(events: TimelineEvent[]) {
  if (events.length <= 1) return events.map(() => 0.5);
  const values = events.map((e) => when(e.date));
  const finite = values.filter(Number.isFinite);
  const lo = Math.min(...finite);
  const hi = Math.max(...finite);
  return values.map((v, i) => {
    const even = i / (events.length - 1);
    const real = Number.isFinite(v) && hi > lo ? (v - lo) / (hi - lo) : even;
    return 0.55 * real + 0.45 * even;
  });
}

/** The large board's scene: tall enough for a card above and below the line. */
const SCENE_HEIGHT = 440;
const CARD_WIDTH = 150;

function Dot({ size, ghost, colour = LIME }: { size: "xs" | "sm" | "md"; ghost?: boolean; colour?: string }) {
  return (
    <span
      className={cn(
        "block shrink-0 rounded-full border-2",
        size === "md" ? "size-4" : size === "sm" ? "size-3" : "size-2 border",
        ghost ? "border-dashed border-gray-3/60 bg-white" : "border-white",
      )}
      style={ghost ? undefined : { backgroundColor: colour, boxShadow: `0 0 0 1px ${colour}` }}
    />
  );
}

export function TimelineShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  className,
}: ShellProps<TimelineShellData>) {
  const [selected, setSelected] = useState<string | null>(null);
  if (size === "small") return <ShellAppIcon kind="timeline" className={className} />;

  const events = sorted(data.events);
  const ghost = events.length === 0;

  if (size === "medium") {
    const shown = ghost ? [] : events.slice(0, 4);
    const at = positions(shown);
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="timeline" title={data.title} />
        {/* Shapes, not words: a line with stops, and small event cards above and below it. */}
        <PreviewBody className="justify-center">
          <div className="relative mx-1 h-[78px]">
            <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gray-3/30" />
            {(ghost ? [0.06, 0.36, 0.64, 0.94] : at).map((x, i) => {
              const above = i % 2 === 0;
              return (
                <span
                  key={i}
                  className={cn("absolute flex w-[30%] -translate-x-1/2 flex-col items-center", above ? "bottom-1/2 translate-y-[5px] flex-col-reverse" : "top-1/2 -translate-y-[5px]")}
                  style={{ left: `${6 + x * 88}%` }}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: ghost ? "color-mix(in srgb, var(--color-gray-3) 50%, transparent)" : LIME }}
                  />
                  <span className="h-1.5 w-px bg-gray-3/40" />
                  <span className="flex w-full flex-col gap-[3px] rounded-[4px] bg-gray-6 px-1.5 py-1.5">
                    <Bar width="70%" className="h-1 bg-gray-3/35" />
                    <Bar width="100%" className="h-1" />
                  </span>
                </span>
              );
            })}
          </div>
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<TimelineShellData>) => onChange({ ...data, ...patch }) : undefined;
  const set = (next: TimelineEvent) => update?.({ events: data.events.map((e) => (e.id === next.id ? next : e)) });
  const remove = update && ((id: string) => update({ events: data.events.filter((e) => e.id !== id) }));
  const add = update
    ? () => {
        const last = events.at(-1);
        const year = last && Number.isFinite(when(last.date)) ? Math.floor(when(last.date)) + 1 : new Date().getFullYear();
        update({ events: [...data.events, { id: shellId("ev"), date: String(year), title: "" }] });
      }
    : undefined;

  const addButton = add && (
    <button
      type="button"
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        add();
      }}
      className={cn("flex shrink-0 items-center gap-1.5 self-start font-bureau text-typography-secondary hover:text-typography-primary", large ? "text-[13px]" : "text-[11px]")}
    >
      <Plus className="size-3.5" />
      Add an event
    </button>
  );

  if (!large) {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <ShellTitle kind="timeline" size={size} value={data.title} onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} />
        <ShellBody size={size} className="gap-2">
          <ol className="relative flex flex-col gap-1.5 pl-1">
            <span className="absolute top-1.5 bottom-1.5 left-[9px] w-0.5 rounded-full bg-gray-3/25" />
            {ghost ? (
              // Empty: one stop that invites the first event, and adds it when editable.
              <li className="relative flex items-center gap-2.5">
                <Dot size="sm" ghost />
                {add ? (
                  <button
                    type="button"
                    {...fieldEvents}
                    onClick={(event) => {
                      stopFieldEvent(event);
                      add();
                    }}
                    className="font-bureau text-[12px] font-light text-typography-secondary hover:text-typography-primary"
                  >
                    Add an event
                  </button>
                ) : (
                  <span className="font-bureau text-[12px] font-light text-typography-secondary">Add an event</span>
                )}
              </li>
            ) : (
              events.map((event) => (
                <li key={event.id} className="relative flex min-w-0 items-center gap-2">
                  <Dot size="sm" />
                  <InlineInput value={event.date} placeholder="Year" label="Date" size={4} onChange={update && ((date) => set({ ...event, date }))} className="px-0.5 text-[11px] text-typography-secondary tabular-nums" />
                  <InlineInput value={event.title} placeholder="What happened" label="Event" onChange={update && ((title) => set({ ...event, title }))} className="flex-1 px-1 text-[12px]" />
                </li>
              ))
            )}
          </ol>
          {!ghost && addButton}
        </ShellBody>
      </ShellSurface>
    );
  }

  const at = positions(events);
  // Cards alternate above and below, so only every other one can collide.
  const sceneWidth = Math.max(760, Math.ceil(events.length / 2) * 170 + 150);
  const xOf = (i: number) => CARD_WIDTH / 2 + at[i]! * (sceneWidth - CARD_WIDTH);
  const mid = SCENE_HEIGHT / 2;

  const index = selected ? events.findIndex((e) => e.id === selected) : -1;
  const current = index >= 0 ? events[index] : undefined;
  const addAfter = () => {
    if (!update) return;
    if (!current) return add?.();
    const year = Number.isFinite(when(current.date)) ? Math.floor(when(current.date)) + 1 : new Date().getFullYear();
    const next = { id: shellId("ev"), date: String(year), title: "" };
    update({ events: [...data.events, next] });
    setSelected(next.id);
  };
  const bar = current && (
    <SelectionBar>
      <SelectionBar.Colours value={current.colour} onChange={(colour: ShellColour) => set({ ...current, colour })} />
      <SelectionBar.Divider />
      <SelectionBar.Button icon={CirclePlus} label="Add an event after" onClick={addAfter} />
      <SelectionBar.Delete
        onClick={() => {
          remove?.(current.id);
          setSelected(null);
        }}
      />
    </SelectionBar>
  );

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle kind="timeline" size={size} value={data.title} onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} />
      <CanvasBoard
        width={sceneWidth}
        height={SCENE_HEIGHT}
        editable={Boolean(update)}
        className="mx-4 mt-2 mb-4 rounded-[14px]"
        tools={[{ id: "event", icon: CirclePlus, label: "Add an event", onClick: addAfter }]}
        // The bar sits on the card's outer edge, away from the line and its neighbours.
        selection={current ? { anchor: current.id, placement: index % 2 === 0 ? "above" : "below", bar } : null}
        onClearSelection={() => setSelected(null)}
        onDelete={() => {
          if (!current) return;
          remove?.(current.id);
          setSelected(null);
        }}
      >
        <span className="absolute inset-x-0 h-1 -translate-y-1/2 rounded-full bg-gray-3/25" style={{ top: mid }} />
        {ghost &&
          GHOST_STOPS.map((label, i) => (
            <div key={i} className="absolute flex -translate-x-1/2 -translate-y-2 flex-col items-center gap-2" style={{ left: `${15 + i * 35}%`, top: mid }}>
              <Dot size="md" ghost />
              <span className="font-bureau text-[13px] font-light text-typography-secondary">{label}</span>
            </div>
          ))}
        {events.map((event, i) => {
          const above = i % 2 === 0;
          const colour = event.colour ? canvasColour(event.colour) : undefined;
          const isSel = selected === event.id;
          return (
            <div
              key={event.id}
              data-canvas-item
              data-canvas-id={event.id}
              onClick={(e) => {
                stopFieldEvent(e);
                if (update) setSelected(event.id);
              }}
              className={cn("absolute flex -translate-x-1/2 flex-col items-center", update && "cursor-pointer", above ? "-mb-2 flex-col-reverse" : "-mt-2")}
              style={{ left: xOf(i), width: CARD_WIDTH, ...(above ? { bottom: SCENE_HEIGHT - mid } : { top: mid }) }}
            >
              <Dot size="md" colour={colour} />
              <span className="h-5 w-px bg-gray-3/40" />
              <div
                className={cn("relative flex w-full flex-col gap-0.5 rounded-[12px] bg-gray-6 px-3 py-2", isSel && "ring-2 ring-blue-4")}
                style={colour ? { backgroundColor: tint(colour, 14), ...(isSel ? { ["--tw-ring-color" as string]: colour } : {}) } : undefined}
              >
                <InlineInput value={event.date} placeholder="Year" label="Date" size={4} onChange={update && ((date) => set({ ...event, date }))} className="px-0.5 text-[13px] tabular-nums" />
                <InlineInput value={event.title} placeholder="What happened" label="Event" onChange={update && ((title) => set({ ...event, title }))} className="px-0.5 text-[12px]" />
                <AutoTextarea
                  value={event.detail ?? ""}
                  placeholder="A line of detail"
                  aria-label="Detail"
                  readOnly={!update}
                  {...fieldEvents}
                  onKeyDown={stopFieldEvent}
                  onChange={(e) => set({ ...event, detail: e.target.value || undefined })}
                  className="px-0.5 font-bureau text-[11px] leading-[1.4] text-typography-secondary placeholder:font-light"
                />
              </div>
            </div>
          );
        })}
      </CanvasBoard>
    </ShellSurface>
  );
}
