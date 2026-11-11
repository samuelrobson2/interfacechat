import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { MapCanvas } from "../more/map-shell";
import { BRANCH } from "../more/mindmap-shell";
import { TYPE_STYLE } from "../more/schedule-shell";
import { LIME } from "../more/timeline-shell";
import type {
  FlowchartShellData,
  FlowNode,
  MapShellData,
  MindmapShellData,
  MoodboardShellData,
  ScheduleShellData,
  TimelineShellData,
} from "../model/shell-types";
import { canvasColour, tint } from "../ui/canvas-board";
import { InlineRemove, InlineText } from "./inline-edit";
import { InlineChip, InlineGhostLines, InlineMore } from "./inline-kit";
import { INLINE_META, INLINE_TEXT } from "./inline-styles";
import { shortDate } from "./inline-summary";

/**
 * Inline medium designs for the visual interfaces. Each takes an optional
 * `onChange`: with it, names can be edited where they stand and the obvious
 * toggles pressed, without changing size.
 */

type Editable<D> = { data: D; onChange?: (data: D) => void };

const hourText = (hour: number) => {
  const h = Math.floor(hour);
  const suffix = h >= 12 ? "pm" : "am";
  const twelve = h % 12 || 12;
  return hour % 1 ? `${twelve}:30${suffix}` : `${twelve}${suffix}`;
};

/** Each day as one track across the working hours, its tasks as coloured bars. */
export function ScheduleInline({ data }: Editable<ScheduleShellData>) {
  const [from, to] = data.hours;
  const span = Math.max(1, to - from);
  const at = (hour: number) => `${((Math.min(to, Math.max(from, hour)) - from) / span) * 100}%`;
  const days = Array.from({ length: Math.min(data.dayCount, 3) }, (_, day) => day);
  const start = data.start ? new Date(`${data.start}T00:00:00`) : null;
  const dayName = (day: number) => {
    if (!start) return `Day ${day + 1}`;
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    return date.toLocaleDateString("en-GB", { weekday: "short" });
  };
  if (!days.length) return <InlineGhostLines />;
  return (
    <div className="flex flex-col gap-1.5">
      {days.map((day) => (
        <div key={day} className="flex items-center gap-3">
          <span className={cn(INLINE_META, "w-10 shrink-0")}>{dayName(day)}</span>
          <div className="relative h-6 min-w-0 flex-1 rounded-[6px] bg-gray-6/70">
            {data.tasks
              .filter((task) => task.day === day)
              .map((task) => (
                <span
                  key={task.id}
                  title={`${task.label}, ${hourText(task.start)}–${hourText(task.end)}`}
                  className={cn(
                    "absolute inset-y-0.5 overflow-hidden rounded-[4px] px-1.5 font-bureau text-[11px] leading-5 whitespace-nowrap",
                    TYPE_STYLE[task.type].bar,
                  )}
                  style={{ left: at(task.start), width: `calc(${at(task.end)} - ${at(task.start)} - 2px)` }}
                >
                  {task.label}
                </span>
              ))}
          </div>
        </div>
      ))}
      <div className={cn(INLINE_META, "ml-[52px] flex justify-between text-[10.5px]")}>
        <span>{hourText(from)}</span>
        <span>{hourText(from + span / 2)}</span>
        <span>{hourText(to)}</span>
      </div>
      <InlineMore count={data.dayCount - days.length} noun="days" />
    </div>
  );
}

/** The map beside the first places, starred where they're shortlisted. */
export function MapInline({ data, onChange }: Editable<MapShellData>) {
  const places = data.places.slice(0, 4);
  const update = (id: string, patch: Partial<MapShellData["places"][number]>) =>
    onChange?.({ ...data, places: data.places.map((place) => (place.id === id ? { ...place, ...patch } : place)) });
  return (
    <div className="flex min-w-0 gap-3">
      <MapCanvas data={data} size="medium" className="h-[140px] w-[42%] shrink-0 rounded-[12px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        {data.filters.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.filters.slice(0, 2).map((filter) => (
              <InlineChip key={filter}>{filter}</InlineChip>
            ))}
          </div>
        )}
        {places.length > 0 ? (
          places.map((place) => (
            <div key={place.id} className="flex min-w-0 items-center gap-2">
              {onChange ? (
                <button
                  type="button"
                  aria-pressed={Boolean(place.shortlisted)}
                  aria-label={place.shortlisted ? `Remove ${place.name} from the shortlist` : `Shortlist ${place.name}`}
                  onClick={() => update(place.id, { shortlisted: !place.shortlisted })}
                  className="shrink-0 cursor-pointer transition-transform active:scale-90"
                >
                  <Star className={cn("size-3.5", place.shortlisted ? "fill-[#f2b630] text-[#f2b630]" : "text-gray-3")} />
                </button>
              ) : (
                <Star
                  className={cn("size-3.5 shrink-0", place.shortlisted ? "fill-[#f2b630] text-[#f2b630]" : "text-gray-3")}
                  aria-label={place.shortlisted ? "Shortlisted" : undefined}
                />
              )}
              <InlineText
                value={place.name}
                onChange={onChange && ((name) => update(place.id, { name }))}
                className={cn(INLINE_TEXT, "min-w-0 flex-1 truncate")}
              />
              {place.distance && <span className={cn(INLINE_META, "shrink-0")}>{place.distance}</span>}
            </div>
          ))
        ) : (
          <InlineGhostLines />
        )}
        <InlineMore count={data.places.length - places.length} noun="places" />
      </div>
    </div>
  );
}

/** A strip of the images, then the palette and keywords. */
export function MoodboardInline({ data, onChange, selected }: Editable<MoodboardShellData> & { selected?: boolean }) {
  const images = data.images.slice(0, 4);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-4 gap-1.5">
        {(images.length ? images : [null, null, null, null]).map((image, index) =>
          image ? (
            <img key={image.id} src={image.src} alt={image.caption ?? ""} className="aspect-square w-full rounded-[10px] bg-gray-6 object-cover" />
          ) : (
            <span key={index} aria-hidden className="aspect-square rounded-[10px] bg-gray-6" />
          ),
        )}
      </div>
      {(data.palette.length > 0 || data.keywords.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {data.palette.slice(0, 6).map((colour) => (
            <span key={colour} title={colour} className="size-5 rounded-full ring-1 ring-black/5" style={{ backgroundColor: colour }} />
          ))}
          {data.palette.length > 0 && data.keywords.length > 0 && <span className="w-1" />}
          {data.keywords.slice(0, 4).map((keyword) => (
            <InlineChip key={keyword}>
              {keyword}
              {onChange && selected && (
                <InlineRemove
                  label={keyword}
                  onRemove={() => onChange({ ...data, keywords: data.keywords.filter((item) => item !== keyword) })}
                />
              )}
            </InlineChip>
          ))}
        </div>
      )}
    </div>
  );
}

/** Events along a line, dated above and named below. */
export function TimelineInline({ data, onChange }: Editable<TimelineShellData>) {
  const events = [...data.events].sort((a, b) => a.date.localeCompare(b.date));
  const shown = events.slice(0, 5);
  if (!shown.length) return <InlineGhostLines />;
  const edge = `${50 / shown.length}%`;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        {/* The line runs between the first and last dots. */}
        <span aria-hidden className="absolute top-[24px] h-px bg-gray-3/35" style={{ left: edge, right: edge }} />
        <div className="grid" style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))` }}>
          {shown.map((event) => {
            const colour = event.colour ? canvasColour(event.colour) : LIME;
            return (
              <div key={event.id} className="flex min-w-0 flex-col items-center gap-1.5 px-1 text-center">
                <span className={cn(INLINE_META, "text-[11px] whitespace-nowrap")}>{shortDate(event.date)}</span>
                <span
                  aria-hidden
                  className="relative size-2.5 rounded-full ring-4 ring-background-primary"
                  style={{ backgroundColor: colour }}
                />
                <InlineText
                  value={event.title}
                  onChange={
                    onChange &&
                    ((title) =>
                      onChange({ ...data, events: data.events.map((item) => (item.id === event.id ? { ...item, title } : item)) }))
                  }
                  className="line-clamp-2 font-bureau text-[12.5px] leading-[1.35] text-typography-primary"
                />
              </div>
            );
          })}
        </div>
      </div>
      <InlineMore count={events.length - shown.length} noun="events" />
    </div>
  );
}

/** The main path from the start, step by step, with each branch's label. */
function mainPath(data: FlowchartShellData, limit: number) {
  const start = data.nodes.find((node) => node.kind === "start") ?? data.nodes[0];
  const path: { node: FlowNode; via?: string }[] = [];
  const seen = new Set<string>();
  let current = start;
  let via: string | undefined;
  while (current && !seen.has(current.id) && path.length < limit) {
    path.push({ node: current, via });
    seen.add(current.id);
    const edge = data.edges.find((candidate) => candidate.from === current!.id && !seen.has(candidate.to));
    via = edge?.label;
    current = edge ? data.nodes.find((node) => node.id === edge.to) : undefined;
  }
  return path;
}

/** The flow from its start, as a chain of steps. Decisions carry a diamond. */
export function FlowchartInline({ data, onChange }: Editable<FlowchartShellData>) {
  const path = mainPath(data, 6);
  if (!path.length) return <InlineGhostLines />;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {path.map(({ node, via }, index) => {
          const colour = node.colour ? canvasColour(node.colour) : undefined;
          return (
            <span key={node.id} className="flex items-center gap-1.5">
              {index > 0 && (
                <>
                  <ArrowRight className="size-3.5 shrink-0 text-gray-3" />
                  {via && <span className={cn(INLINE_META, "-ml-0.5")}>{via}</span>}
                </>
              )}
              <span
                className={cn(
                  "inline-flex max-w-[180px] items-center gap-1.5 border px-2.5 py-1 font-bureau text-[12.5px] text-typography-primary",
                  node.kind === "start" || node.kind === "end" ? "rounded-full" : "rounded-[8px]",
                  !colour && "border-gray-3/30",
                )}
                style={colour ? { backgroundColor: tint(colour, 12), borderColor: tint(colour, 40) } : undefined}
              >
                {node.kind === "decision" && <span aria-hidden className="size-2 shrink-0 rotate-45 bg-orange-5/70" />}
                <InlineText
                  value={node.label}
                  onChange={
                    onChange &&
                    ((label) =>
                      onChange({ ...data, nodes: data.nodes.map((item) => (item.id === node.id ? { ...item, label } : item)) }))
                  }
                  className="truncate"
                />
              </span>
            </span>
          );
        })}
      </div>
      <InlineMore count={data.nodes.length - path.length} noun="steps" />
    </div>
  );
}

/** The branches off the central topic, each with its ideas. */
export function MindmapInline({ data, onChange }: Editable<MindmapShellData>) {
  const branches = data.branches.slice(0, 4);
  if (!branches.length) return <InlineGhostLines />;
  return (
    <div className="flex flex-col gap-2 border-l-2 border-[#a45cf0]/25 pl-3">
      {branches.map((branch, index) => {
        const colour = branch.colour ? canvasColour(branch.colour) : BRANCH[index % BRANCH.length]!;
        const ideas = branch.children.map((child) => child.label).filter(Boolean);
        return (
          <div key={branch.id} className="flex min-w-0 items-center gap-2">
            <span
              className="shrink-0 rounded-full px-2 py-0.5 font-bureau text-[12.5px]"
              style={{ backgroundColor: tint(colour, 13), color: colour }}
            >
              <InlineText
                value={branch.label}
                placeholder="Branch"
                onChange={
                  onChange &&
                  ((label) =>
                    onChange({
                      ...data,
                      branches: data.branches.map((item) => (item.id === branch.id ? { ...item, label } : item)),
                    }))
                }
              />
            </span>
            <span className={cn(INLINE_TEXT, "min-w-0 truncate text-[13px] font-light text-typography-secondary")}>
              {ideas.slice(0, 3).join(" · ")}
              {ideas.length > 3 && ` · +${ideas.length - 3}`}
            </span>
          </div>
        );
      })}
      <InlineMore count={data.branches.length - branches.length} noun="branches" />
    </div>
  );
}
