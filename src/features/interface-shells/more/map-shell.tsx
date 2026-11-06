import { MapPin, Star, X } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/shared/lib/css";
import { AddChip } from "../ui/shell-fields";
import { shellId, type MapPlace, type MapShellData, type ShellProps } from "../model/shell-types";
import {
  ChipList,
  PreviewBody,
  PreviewHead,
  ShellBody,
  ShellTitle,
} from "../ui/shell-kit";
import { ghostLabels } from "../ui/shell-accents";
import { ShellAppIcon } from "../ui/shell-icons";
import { fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const YELLOW = "#f2b630";

/**
 * A typed-in place has no coordinates yet: give it a steady spot from its name,
 * clear of the centre pin and as far as it can be from the pins already there.
 */
function spotFor(name: string, taken: { x: number; y: number }[]) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  let best = { x: 0.5, y: 0.2 };
  let bestGap = -1;
  for (let k = 0; k < 12; k++) {
    const seed = (hash >>> 0) + k * 2654435761;
    const angle = ((seed >>> 0) % 360) * (Math.PI / 180);
    const reach = 0.2 + (((seed >>> 9) % 100) / 100) * 0.2;
    const spot = { x: 0.5 + Math.cos(angle) * reach, y: 0.48 + Math.sin(angle) * reach * 0.8 };
    if (spot.y > 0.78 || spot.y < 0.12 || spot.x < 0.1 || spot.x > 0.9) continue;
    const gap = Math.min(1, ...taken.map((t) => Math.hypot(t.x - spot.x, (t.y - spot.y) * 1.4)));
    if (gap > bestGap) {
      best = spot;
      bestGap = gap;
    }
  }
  return best;
}

/**
 * A stylised street map, not real tiles: water, a few streets, a park. It is
 * the same drawing every time so pins read against a stable backdrop.
 */
function Streets() {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <pattern id={`${id}-water`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 2h4" stroke="#cfe3ea" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="#f3f1ec" />
      <path d="M0 82 C 20 78, 38 90, 60 86 S 92 80, 100 84 V100 H0Z" fill="#dcebf0" />
      <path d="M0 82 C 20 78, 38 90, 60 86 S 92 80, 100 84 V100 H0Z" fill={`url(#${id}-water)`} />
      <rect x="66" y="8" width="22" height="16" rx="3" fill="#e3ecd9" />
      <g stroke="#ffffff" strokeLinecap="round" fill="none">
        <path d="M-2 30 L102 22" strokeWidth="3.2" />
        <path d="M-2 60 L102 54" strokeWidth="2.6" />
        <path d="M30 -2 L40 102" strokeWidth="2.6" />
        <path d="M64 -2 L58 102" strokeWidth="3.2" />
        <path d="M10 -2 L18 80" strokeWidth="1.6" />
        <path d="M84 -2 L80 82" strokeWidth="1.6" />
        <path d="M-2 44 L102 38" strokeWidth="1.4" />
        <path d="M-2 72 L60 70" strokeWidth="1.4" />
      </g>
      <path d="M44 74 L50 86" stroke="#c9c2b4" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function Pin({
  place,
  size,
  onToggle,
}: {
  place: MapPlace;
  size: "medium" | "medium-plus" | "large";
  onToggle?: () => void;
}) {
  const dot = size === "medium" ? "size-2" : size === "large" ? "size-6" : "size-4";
  const body = (
    <span
      className={cn(
        "grid place-items-center rounded-full border-2 border-white shadow-[0_1px_3px_rgba(26,23,24,0.3)]",
        dot,
        place.shortlisted ? "text-white" : "bg-white text-typography-secondary",
      )}
      style={place.shortlisted ? { backgroundColor: YELLOW } : undefined}
    >
      {size === "large" && <Star className="size-3" fill={place.shortlisted ? "currentColor" : "none"} />}
    </span>
  );
  const style = { left: `${place.x * 100}%`, top: `${place.y * 100}%` };
  const label = size === "large" && (
    <span className="pointer-events-none absolute top-full left-1/2 mt-0.5 -translate-x-1/2 rounded-full bg-white/90 px-1.5 font-bureau text-[10px] whitespace-nowrap text-typography-primary shadow-[0_1px_2px_rgba(26,23,24,0.12)]">
      {place.name}
    </span>
  );
  if (!onToggle) {
    return (
      <span className="absolute -translate-x-1/2 -translate-y-1/2" style={style}>
        {body}
        {label}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label={`${place.shortlisted ? "Remove" : "Add"} ${place.name} ${place.shortlisted ? "from" : "to"} the shortlist`}
      aria-pressed={Boolean(place.shortlisted)}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onToggle();
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-[0.9]"
      style={style}
    >
      {body}
      {label}
    </button>
  );
}

function MapCanvas({
  data,
  size,
  onToggle,
  className,
}: {
  data: MapShellData;
  size: "medium" | "medium-plus" | "large";
  onToggle?: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Streets />
      {data.near && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-typography-primary">
          <MapPin className={size === "medium" ? "size-3.5" : "size-6"} fill={YELLOW} strokeWidth={1.5} />
        </span>
      )}
      {data.places.map((place) => (
        <Pin key={place.id} place={place} size={size} onToggle={onToggle ? () => onToggle(place.id) : undefined} />
      ))}
      {data.places.length === 0 &&
        ghostLabels("Place").map((label, i) => (
          <span
            key={label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${[30, 66, 46][i]}%`, top: `${[34, 42, 68][i]}%` }}
          >
            <span
              className={cn(
                "rounded-full border-2 border-dashed border-gray-3/60 bg-white/70",
                size === "medium" ? "size-2" : "size-4",
              )}
            />
            {size !== "medium" && (
              <span className="mt-0.5 rounded-full bg-white/80 px-1.5 font-bureau text-[10px] font-light whitespace-nowrap text-typography-secondary">
                {label}
              </span>
            )}
          </span>
        ))}
    </div>
  );
}

export function MapShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  className,
}: ShellProps<MapShellData>) {
  const [onlyShortlist, setOnlyShortlist] = useState(false);
  if (size === "small") return <ShellAppIcon kind="map" className={className} />;

  const title = data.query && data.near ? `${data.query} near ${data.near}` : data.query;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="map" title={title} />
        <PreviewBody>
          <MapCanvas data={data} size="medium" className="flex-1 rounded-[8px]" />
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<MapShellData>) => onChange({ ...data, ...patch }) : undefined;
  const toggle = update
    ? (id: string) =>
        update({
          places: data.places.map((place) =>
            place.id === id ? { ...place, shortlisted: !place.shortlisted } : place,
          ),
        })
    : undefined;
  const shortlisted = data.places.filter((place) => place.shortlisted).length;
  const remove = update ? (id: string) => update({ places: data.places.filter((place) => place.id !== id) }) : undefined;
  const listed = onlyShortlist ? data.places.filter((place) => place.shortlisted) : data.places;
  const addPlace = update
    ? (name: string) =>
        update({
          places: [...data.places, { id: shellId("place"), name, ...spotFor(name, data.places), shortlisted: onlyShortlist }],
        })
    : undefined;

  const near = (
    <label
      className={cn(
        "flex min-w-0 items-center gap-1.5 rounded-full bg-gray-6 pr-3 pl-2 font-bureau text-typography-primary",
        large ? "h-8 text-[13px]" : "h-6 text-[11px]",
      )}
    >
      <MapPin className={cn("shrink-0 text-typography-secondary", large ? "size-4" : "size-3")} />
      <span className="shrink-0 text-typography-secondary">Near</span>
      <input
        value={data.near}
        placeholder="Add a place"
        readOnly={!update}
        aria-label="Near"
        size={Math.max(8, data.near.length)}
        {...fieldEvents}
        onKeyDown={stopFieldEvent}
        onChange={(event) => update?.({ near: event.target.value })}
        className="min-w-0 bg-transparent outline-none placeholder:text-typography-secondary"
      />
    </label>
  );

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle
        kind="map"
        size={size}
        value={data.query}
        onChange={update && ((query) => update({ query }))}
        onSubmit={onSubmit}
      />
      <ShellBody size={size} className={large ? "min-h-0" : undefined}>
        <div className="flex flex-wrap items-center gap-1.5">
          {near}
          <ChipList
            size={size}
            items={data.filters}
            addLabel="Add a filter"
            onChange={update && ((filters) => update({ filters }))}
          />
        </div>
        {large ? (
          <div className="flex min-h-0 flex-1 gap-4">
            <MapCanvas data={data} size="large" onToggle={toggle} className="min-h-[300px] flex-[3] rounded-[14px]" />
            <div className="flex min-w-0 flex-[2] flex-col gap-2">
            <div className="flex gap-1">
              {[
                { label: `All ${data.places.length}`, value: false },
                { label: `Shortlist ${shortlisted}`, value: true },
              ].map((tab) => (
                <button
                  key={String(tab.value)}
                  type="button"
                  aria-pressed={onlyShortlist === tab.value}
                  {...fieldEvents}
                  onClick={(event) => {
                    stopFieldEvent(event);
                    setOnlyShortlist(tab.value);
                  }}
                  className={cn(
                    "rounded-full px-2.5 py-1 font-bureau text-[12px] tabular-nums transition-colors",
                    onlyShortlist === tab.value ? "bg-gray-6 text-typography-primary" : "text-typography-secondary hover:text-typography-primary",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {data.places.length === 0 && (
              <ul className="flex flex-col gap-2 px-2.5">
                {ghostLabels("Place").map((label) => (
                  <li key={label} className="font-bureau text-[13px] font-light text-typography-secondary">
                    {label}
                  </li>
                ))}
              </ul>
            )}
            <ul className="no-scrollbar flex min-w-0 flex-col gap-1 overflow-y-auto">
              {listed.map((place) => (
                <li key={place.id} className="group relative">
                  <button
                    type="button"
                    {...fieldEvents}
                    onClick={(event) => {
                      stopFieldEvent(event);
                      toggle?.(place.id);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left hover:bg-gray-6"
                  >
                    <Star
                      className="size-4 shrink-0"
                      style={{ color: place.shortlisted ? YELLOW : undefined }}
                      fill={place.shortlisted ? YELLOW : "none"}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-bureau text-[13px] text-typography-primary">{place.name}</span>
                      <span className="font-bureau text-[11px] text-typography-secondary">
                        {[place.kind, place.distance && `${place.distance} walk`].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </button>
                  {remove && (
                    <button
                      type="button"
                      aria-label={`Remove ${place.name}`}
                      {...fieldEvents}
                      onClick={(event) => {
                        stopFieldEvent(event);
                        remove(place.id);
                      }}
                      className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-white hover:text-typography-primary focus-visible:opacity-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {addPlace && (
              <div className="px-1">
                <AddChip size="md" placeholder="Place name" onSubmitValue={addPlace}>
                  Add a place
                </AddChip>
              </div>
            )}
            </div>
          </div>
        ) : (
          <MapCanvas data={data} size="medium-plus" onToggle={toggle} className="h-[120px] shrink-0 rounded-[12px]" />
        )}
      </ShellBody>
    </ShellSurface>
  );
}
