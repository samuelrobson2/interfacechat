import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, type CalendarEvent, type CalendarShellData, type ShellProps, type ShellSize } from "../model/shell-types";
import {
  ChipList,
  InlineInput,
  PreviewBody,
  PreviewHead,
  ShellBody,
  ShellDetail,
  ShellTitle,
} from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const VIOLET = "#7c66f0";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** Days an empty month marks at medium, to show it holds events. */
const GHOST_EVENT_DAYS = [4, 10, 11, 12, 17];

function monthCells(month: string) {
  const [year, m] = month.split("-").map(Number) as [number, number];
  const first = new Date(Date.UTC(year, m - 1, 1));
  const days = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split("-").map(Number) as [number, number];
  const date = new Date(Date.UTC(year, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

const monthName = (month: string, short = false) =>
  new Date(`${month}-01T12:00:00`).toLocaleDateString("en-GB", short ? { month: "short" } : { month: "long", year: "numeric" });

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

function MonthNav({ data, size, update }: { data: CalendarShellData; size: ShellSize; update?: (patch: Partial<CalendarShellData>) => void }) {
  const large = size === "large";
  const nav = (delta: number) =>
    update && (
      <button
        type="button"
        aria-label={delta < 0 ? "Previous month" : "Next month"}
        {...fieldEvents}
        onClick={(event) => {
          stopFieldEvent(event);
          update({ month: shiftMonth(data.month, delta) });
        }}
        className="grid size-6 place-items-center rounded-full text-typography-secondary hover:bg-gray-6 hover:text-typography-primary"
      >
        {delta < 0 ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>
    );
  return (
    <span className={cn("flex shrink-0 items-center font-bureau text-typography-secondary", large ? "text-[13px]" : "text-[11px]")}>
      {nav(-1)}
      <span className="px-0.5">{monthName(data.month, !large)}</span>
      {nav(1)}
    </span>
  );
}

/** One day: its number and its events. */
function DayCell({
  date,
  data,
  size,
  editing,
  onAdd,
  onEvent,
  onRemove,
  onStartAdd,
  onEndAdd,
}: {
  date: string;
  data: CalendarShellData;
  size: "medium" | "medium-plus" | "large";
  editing: boolean;
  onAdd?: (title: string) => void;
  onEvent?: (event: CalendarEvent) => void;
  onRemove?: (id: string) => void;
  onStartAdd?: () => void;
  onEndAdd?: () => void;
}) {
  const [draft, setDraft] = useState("");
  const events = data.events.filter((event) => event.date === date);
  const day = Number(date.slice(-2));
  const large = size === "large";

  if (size === "medium") {
    // Shapes, not words: grey days, events in colour, and on an empty month a few
    // darker days standing for events.
    const ghostEvent = data.events.length === 0 && GHOST_EVENT_DAYS.includes(day);
    return (
      <span
        className={cn("relative aspect-square rounded-[3px]", events.length ? "" : ghostEvent ? "bg-gray-3/35" : "bg-gray-6")}
        style={events.length ? { backgroundColor: VIOLET } : undefined}
      />
    );
  }

  const commit = () => {
    if (draft.trim()) onAdd?.(draft.trim());
    setDraft("");
    onEndAdd?.();
  };

  return (
    <div
      role={onStartAdd ? "button" : undefined}
      tabIndex={onStartAdd ? 0 : undefined}
      aria-label={`${shortDate(date)}${events.length ? `, ${events.length} events` : ""}${onStartAdd ? ". Add an event" : ""}`}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        if (!editing) onStartAdd?.();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" && !editing) onStartAdd?.();
      }}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-[8px] text-left transition-colors",
        large ? "h-[74px] gap-0.5 p-1.5" : "h-[30px] items-center justify-center",
        large && events.length ? "bg-gray-6" : "bg-white ring-1 ring-gray-3/15 ring-inset",
        onStartAdd && "cursor-pointer hover:ring-2 hover:ring-[#7c66f0]/40",
        !large && events.length > 0 && "text-white",
      )}
      style={!large && events.length ? { backgroundColor: VIOLET } : undefined}
    >
      <span className={cn("font-bureau tabular-nums", large ? "text-[12px] text-typography-primary" : "text-[10px]")}>
        {day}
      </span>
      {large && (
        <>
          {events.slice(0, 2).map((event) => (
            <span
              key={event.id}
              className="group/event flex min-w-0 items-center gap-1 rounded-[4px] px-1 py-px font-bureau text-[10px] text-white"
              style={{ backgroundColor: VIOLET }}
              onClick={stopFieldEvent}
            >
              <input
                value={event.title}
                aria-label="Event"
                readOnly={!onEvent}
                {...fieldEvents}
                onKeyDown={stopFieldEvent}
                onChange={(e) => onEvent?.({ ...event, title: e.target.value })}
                className="min-w-0 flex-1 truncate bg-transparent outline-none"
              />
              {onRemove && (
                <button
                  type="button"
                  aria-label={`Remove ${event.title}`}
                  {...fieldEvents}
                  onClick={(e) => {
                    stopFieldEvent(e);
                    onRemove(event.id);
                  }}
                  className="hidden shrink-0 group-hover/event:block"
                >
                  <X className="size-2.5" />
                </button>
              )}
            </span>
          ))}
          {events.length > 2 && (
            <span className="font-bureau text-[10px] text-typography-secondary">+{events.length - 2} more</span>
          )}
          {editing && (
            <input
              autoFocus
              value={draft}
              placeholder="New event"
              aria-label="New event"
              {...fieldEvents}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                stopFieldEvent(e);
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setDraft("");
                  onEndAdd?.();
                }
              }}
              className="min-w-0 rounded-[4px] bg-white px-1 py-px font-bureau text-[10px] text-typography-primary outline-none ring-1 ring-[#7c66f0]"
            />
          )}
        </>
      )}
    </div>
  );
}

function MonthGrid({
  data,
  size,
  update,
}: {
  data: CalendarShellData;
  size: "medium" | "medium-plus" | "large";
  update?: (patch: Partial<CalendarShellData>) => void;
}) {
  const [adding, setAdding] = useState<string | null>(null);
  const cells = monthCells(data.month);
  const large = size === "large";
  const addEvent = (date: string, title: string) =>
    update?.({ events: [...data.events, { id: shellId("event"), date, title }] });
  // Medium plus has no room to type in a cell, so a click adds a named event at once.
  const quickAdd = (date: string) =>
    update?.({ events: [...data.events, { id: shellId("event"), date, title: "New event" }] });

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {size === "medium" && (
        <div aria-hidden className="grid grid-cols-7 gap-[3px]">
          {WEEKDAYS.map((day) => (
            <span key={day} className="mx-auto h-[3px] w-2/3 rounded-full bg-gray-3/35" />
          ))}
        </div>
      )}
      {size !== "medium" && (
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <span key={day} className="text-center font-bureau text-[10px] text-typography-secondary">
              {large ? day : day[0]}
            </span>
          ))}
        </div>
      )}
      <div className={cn("grid grid-cols-7", size === "medium" ? "gap-[3px]" : "gap-1")}>
        {cells.map((date, i) =>
          date ? (
            <DayCell
              key={date}
              date={date}
              data={data}
              size={size}
              editing={adding === date}
              onStartAdd={update && size !== "medium" ? () => (large ? setAdding(date) : quickAdd(date)) : undefined}
              onEndAdd={() => setAdding(null)}
              onAdd={(title) => addEvent(date, title)}
              onEvent={update && ((next) => update({ events: data.events.map((e) => (e.id === next.id ? next : e)) }))}
              onRemove={update && ((id) => update({ events: data.events.filter((e) => e.id !== id) }))}
            />
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </div>
  );
}

function EventList({
  data,
  size,
  update,
}: {
  data: CalendarShellData;
  size: ShellSize;
  update?: (patch: Partial<CalendarShellData>) => void;
}) {
  const large = size === "large";
  const events = [...data.events]
    .filter((event) => event.date.startsWith(data.month))
    .sort((a, b) => a.date.localeCompare(b.date));
  const set = (next: CalendarEvent) => update?.({ events: data.events.map((e) => (e.id === next.id ? next : e)) });
  if (events.length === 0) {
    return (
      <p className={cn("font-bureau font-light text-typography-secondary", large ? "text-[13px]" : "text-[11px]")}>
        {update ? "Click a day to add an event" : "No events"}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-1">
      {events.map((event) => (
        <li key={event.id} className={cn("group flex min-w-0 items-center gap-2 rounded-[10px]", large ? "bg-gray-6 px-3 py-2" : "")}>
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: VIOLET }} />
          <span className={cn("shrink-0 font-bureau text-typography-secondary tabular-nums", large ? "w-12 text-[12px]" : "w-9 text-[11px]")}>
            {new Date(`${event.date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
          <InlineInput
            value={event.title}
            placeholder="Event"
            label="Event title"
            onChange={update && ((title) => set({ ...event, title }))}
            className={cn("w-0 flex-1 px-1", large ? "text-[13px]" : "text-[11px]")}
          />
          {large && (
            <InlineInput
              value={event.time ?? ""}
              placeholder="Time"
              label="Time"
              size={5}
              onChange={update && ((time) => set({ ...event, time: time || undefined }))}
              className="px-1 text-right text-[12px] text-typography-secondary"
            />
          )}
          {update && (
            <button
              type="button"
              aria-label={`Remove ${event.title}`}
              {...fieldEvents}
              onClick={(e) => {
                stopFieldEvent(e);
                update({ events: data.events.filter((other) => other.id !== event.id) });
              }}
              className="grid size-5 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:text-typography-primary focus-visible:opacity-100"
            >
              <X className="size-3" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function CalendarShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  className,
}: ShellProps<CalendarShellData>) {
  if (size === "small") return <ShellAppIcon kind="calendar" className={className} />;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="calendar" title={data.title} />
        <PreviewBody>
          <MonthGrid data={data} size="medium" />
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<CalendarShellData>) => onChange({ ...data, ...patch }) : undefined;
  const monthEvents = data.events.filter((event) => event.date.startsWith(data.month)).length;
  const monthTitles = [...new Set(data.events.filter((e) => e.date.startsWith(data.month)).map((e) => e.title))];

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle
        kind="calendar"
        size={size}
        value={data.title}
        onChange={update && ((title) => update({ title }))}
        onSubmit={onSubmit}
        aside={<MonthNav data={data} size={size} update={update} />}
      />
      <ShellBody size={size}>
        <div className="flex flex-wrap items-center gap-1.5">
          {large && <span className="font-bureau text-[12px] text-typography-secondary">Events</span>}
          {/* The chips are this month's events: adding one puts it on the 1st, removing
              one takes every event with that title off the month. */}
          <ChipList
            size={size}
            items={monthTitles}
            addLabel="Add event"
            onChange={
              update &&
              ((titles) =>
                update({
                  events: [
                    ...data.events.filter((e) => !e.date.startsWith(data.month) || titles.includes(e.title)),
                    ...titles
                      .filter((title) => !monthTitles.includes(title))
                      .map((title) => ({ id: shellId("event"), date: `${data.month}-01`, title })),
                  ],
                }))
            }
          />
        </div>
        <div className={cn("flex min-w-0", large ? "gap-6" : "flex-col gap-3")}>
          <div className="min-w-0 flex-1">
            <MonthGrid data={data} size={size} update={update} />
          </div>
          {large && (
            <aside className="flex w-72 shrink-0 flex-col gap-2">
              <span className="font-bureau text-[12px] text-typography-secondary">
                {monthEvents === 1 ? "1 event" : `${monthEvents} events`}
              </span>
              <EventList data={data} size={size} update={update} />
            </aside>
          )}
          {!large && <EventList data={data} size={size} update={update} />}
        </div>
      </ShellBody>
      {!large && <ShellDetail>{monthEvents ? (monthEvents === 1 ? "1 event" : `${monthEvents} events`) : null}</ShellDetail>}
    </ShellSurface>
  );
}
