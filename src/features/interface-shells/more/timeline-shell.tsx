import { Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { shellId, type ShellProps, type TimelineEvent, type TimelineShellData } from "../model/shell-types";
import { ghostLabels } from "../ui/shell-accents";
import { InlineInput, PreviewBody, PreviewHead, ShellBody, ShellDetail, ShellTitle } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { AutoTextarea, fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const LIME = "#6fa63a";

/** "1898", "2024-03" or "2024-03-05" as a number of years, for ordering and spacing. */
function when(date: string) {
  const [y, m = 1, d = 1] = date.split("-").map(Number);
  if (!y || Number.isNaN(y)) return Number.POSITIVE_INFINITY;
  return y + (m - 1) / 12 + (d - 1) / 365;
}

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

function Dot({ size, ghost }: { size: "xs" | "sm" | "md"; ghost?: boolean }) {
  return (
    <span
      className={cn(
        "block shrink-0 rounded-full border-2",
        size === "md" ? "size-4" : size === "sm" ? "size-3" : "size-2 border",
        ghost ? "border-dashed border-gray-3/60 bg-white" : "border-white",
      )}
      style={ghost ? undefined : { backgroundColor: LIME, boxShadow: `0 0 0 1px ${LIME}` }}
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
  if (size === "small") return <ShellAppIcon kind="timeline" className={className} />;

  const events = sorted(data.events);
  const ghost = events.length === 0;

  if (size === "medium") {
    const shown = ghost ? [] : events.slice(0, 5);
    const at = positions(shown);
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="timeline" title={data.title} />
        <PreviewBody className="justify-center">
          <div className="relative mx-1 h-12">
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gray-3/30" />
            {ghost
              ? ghostLabels("Event").map((label, i) => (
                  <span key={label} className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1 flex-col items-center gap-1" style={{ left: `${12 + i * 38}%` }}>
                    <Dot size="xs" ghost />
                    <span className="font-bureau text-[8px] font-light whitespace-nowrap text-typography-secondary">{label}</span>
                  </span>
                ))
              : shown.map((event, i) => (
                  <span
                    key={event.id}
                    className={cn("absolute flex -translate-x-1/2 flex-col items-center gap-0.5", i % 2 ? "top-1/2 -translate-y-1" : "bottom-1/2 translate-y-1 flex-col-reverse")}
                    style={{ left: `${6 + at[i]! * 88}%` }}
                  >
                    <Dot size="xs" />
                    <span className="font-bureau text-[8px] text-typography-secondary tabular-nums">{event.date.slice(0, 4)}</span>
                  </span>
                ))}
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
            {(ghost ? ghostLabels("Event") : events).map((event) =>
              typeof event === "string" ? (
                <li key={event} className="relative flex items-center gap-2.5">
                  <Dot size="sm" ghost />
                  <span className="font-bureau text-[12px] font-light text-typography-secondary">{event}</span>
                </li>
              ) : (
                <li key={event.id} className="relative flex min-w-0 items-center gap-2">
                  <Dot size="sm" />
                  <InlineInput value={event.date} placeholder="Year" label="Date" size={4} onChange={update && ((date) => set({ ...event, date }))} className="px-0.5 text-[11px] text-typography-secondary tabular-nums" />
                  <InlineInput value={event.title} placeholder="What happened" label="Event" onChange={update && ((title) => set({ ...event, title }))} className="flex-1 px-1 text-[12px]" />
                </li>
              ),
            )}
          </ol>
          {addButton}
        </ShellBody>
        <ShellDetail>
          {events.length > 1 ? `${events[0]!.date.slice(0, 4)}–${events.at(-1)!.date.slice(0, 4)}` : null}
        </ShellDetail>
      </ShellSurface>
    );
  }

  const at = positions(events);
  // Fill the card; only scroll once the events need more room than it has.
  // Cards alternate above and below, so only every other one can collide.
  const minWidth = Math.ceil(events.length / 2) * 170 + 150;

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle kind="timeline" size={size} value={data.title} onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} aside={addButton} />
      <div className="no-scrollbar min-h-0 flex-1 overflow-x-auto px-6 pt-2 pb-6">
        <div className="relative h-full min-h-[360px] w-full" style={{ minWidth }}>
          <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-3/25" />
          {ghost &&
            ghostLabels("Event").map((label, i) => (
              <div key={label} className="absolute top-1/2 flex -translate-x-1/2 -translate-y-2 flex-col items-center gap-2" style={{ left: `${15 + i * 35}%` }}>
                <Dot size="md" ghost />
                <span className="font-bureau text-[13px] font-light text-typography-secondary">{label}</span>
              </div>
            ))}
          {events.map((event, i) => {
            const above = i % 2 === 0;
            return (
              <div
                key={event.id}
                className={cn("group absolute flex w-[150px] -translate-x-1/2 flex-col items-center", above ? "bottom-1/2 -mb-2 flex-col-reverse" : "top-1/2 -mt-2")}
                style={{ left: `calc(75px + ${at[i]!} * (100% - 150px))` }}
              >
                <Dot size="md" />
                <span className="h-5 w-px bg-gray-3/40" />
                <div className="relative flex w-full flex-col gap-0.5 rounded-[12px] bg-gray-6 px-3 py-2">
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
                  {remove && (
                    <button
                      type="button"
                      aria-label={`Remove ${event.title || "event"}`}
                      {...fieldEvents}
                      onClick={(e) => {
                        stopFieldEvent(e);
                        remove(event.id);
                      }}
                      className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-white focus-visible:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ShellSurface>
  );
}
