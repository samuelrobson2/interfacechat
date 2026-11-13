import documentIcon from "@/shared/assets/images/3d/interfaces/document.png";
import documentGlyph from "@/shared/assets/images/3d/interfaces/document-glyph.png";
import searchIcon from "@/shared/assets/images/3d/interfaces/search.png";
import searchGlyph from "@/shared/assets/images/3d/interfaces/search-glyph.png";
import tableIcon from "@/shared/assets/images/3d/interfaces/table.png";
import tableGlyph from "@/shared/assets/images/3d/interfaces/table-glyph.png";
import scheduleIcon from "@/shared/assets/images/3d/interfaces/schedule.png";
import scheduleGlyph from "@/shared/assets/images/3d/interfaces/schedule-glyph.png";
import trackerIcon from "@/shared/assets/images/3d/interfaces/tracker.png";
import trackerGlyph from "@/shared/assets/images/3d/interfaces/tracker-glyph.png";
import calendarIcon from "@/shared/assets/images/3d/interfaces/calendar.png";
import calendarGlyph from "@/shared/assets/images/3d/interfaces/calendar-glyph.png";
import readerIcon from "@/shared/assets/images/3d/interfaces/reader.png";
import readerGlyph from "@/shared/assets/images/3d/interfaces/reader-glyph.png";
import mapIcon from "@/shared/assets/images/3d/interfaces/map.png";
import mapGlyph from "@/shared/assets/images/3d/interfaces/map-glyph.png";
import moodboardIcon from "@/shared/assets/images/3d/interfaces/moodboard.png";
import moodboardGlyph from "@/shared/assets/images/3d/interfaces/moodboard-glyph.png";
import timelineGlyph from "@/shared/assets/images/3d/interfaces/timeline-glyph.png";
import flowchartIcon from "@/shared/assets/images/3d/interfaces/flowchart.png";
import flowchartGlyph from "@/shared/assets/images/3d/interfaces/flowchart-glyph.png";
import mindmapGlyph from "@/shared/assets/images/3d/interfaces/mindmap-glyph.png";
import guideIcon from "@/shared/assets/images/3d/interfaces/guide.png";
import guideGlyph from "@/shared/assets/images/3d/interfaces/guide-glyph.png";
import chatIcon from "@/shared/assets/images/3d/interfaces/chat.png";
import chatGlyph from "@/shared/assets/images/3d/interfaces/chat-glyph.png";
import { motion, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/shared/lib/css";
import { SHELL_META } from "../model/shell-meta";
import type { ChartType, ShellKind } from "../model/shell-types";

// A white frosted-glass 3D object on a flat colour, the object rendered in
// the same glass style as the product's other 3D images.
const ICON_SRC: Record<ShellKind, string> = {
  document: documentIcon,
  search: searchIcon,
  table: tableIcon,
  schedule: scheduleIcon,
  tracker: trackerIcon,
  calendar: calendarIcon,
  reader: readerIcon,
  map: mapIcon,
  moodboard: moodboardIcon,
  chart: flowchartIcon,
  guide: guideIcon,
  generator: moodboardIcon,
  dashboard: tableIcon,
  article: documentIcon,
  chat: chatIcon,
};


/**
 * Generator, Dashboard and Article have no artwork of their own yet: they
 * borrow Moodboard's, Table's and Document's, shifted in hue so each reads apart.
 */
const ICON_FILTER: Partial<Record<ShellKind, string>> = {
  generator: "hue-rotate(-62deg) saturate(0.9)",
  dashboard: "hue-rotate(130deg) saturate(1.1)",
  article: "hue-rotate(-45deg) saturate(1.1)",
};
const filterOf = (kind: ShellKind) => (ICON_FILTER[kind] ? { filter: ICON_FILTER[kind] } : undefined);

export function ShellAppIcon({ kind, className }: { kind: ShellKind; className?: string }) {
  return (
    <img
      src={ICON_SRC[kind]}
      alt={SHELL_META[kind].label}
      draggable={false}
      data-shell-mark=""
      style={filterOf(kind)}
      className={cn(
        "block size-full rounded-[22.5%] object-cover select-none",
        className,
      )}
    />
  );
}

const GLYPH_SRC: Record<ShellKind, string> = {
  document: documentGlyph,
  search: searchGlyph,
  table: tableGlyph,
  schedule: scheduleGlyph,
  tracker: trackerGlyph,
  calendar: calendarGlyph,
  reader: readerGlyph,
  map: mapGlyph,
  moodboard: moodboardGlyph,
  chart: flowchartGlyph,
  guide: guideGlyph,
  generator: moodboardGlyph,
  dashboard: tableGlyph,
  article: documentGlyph,
  chat: chatGlyph,
};

/**
 * The interface mark used inside a shell: the same 3D object, tinted to the
 * interface colour, with no tile and no border.
 */
export function ShellGlyph({ kind, className }: { kind: ShellKind; className?: string }) {
  return (
    <img
      src={GLYPH_SRC[kind]}
      alt=""
      draggable={false}
      data-shell-mark=""
      style={filterOf(kind)}
      className={cn("block shrink-0 object-contain select-none", className)}
    />
  );
}

/**
 * The app tile and the tinted glyph stacked, so a morph can crossfade between
 * them. `tile` is 1 for the app icon and 0 for the glyph.
 */
export function ShellMarkCrossfade({
  kind,
  tile,
}: {
  kind: ShellKind;
  tile: MotionValue<number>;
}) {
  const glyph = useTransform(tile, (value) => 1 - value);
  return (
    <>
      <motion.img
        src={ICON_SRC[kind]}
        alt=""
        draggable={false}
        style={{ opacity: tile, ...filterOf(kind) }}
        className="absolute inset-0 size-full rounded-[22.5%] object-cover select-none"
      />
      <motion.img
        src={GLYPH_SRC[kind]}
        alt=""
        draggable={false}
        style={{ opacity: glyph, ...filterOf(kind) }}
        className="absolute inset-0 size-full object-contain select-none"
      />
    </>
  );
}

export const DocumentAppIcon = ({ className }: { className?: string }) => (
  <ShellAppIcon kind="document" className={className} />
);

export const SearchAppIcon = ({ className }: { className?: string }) => (
  <ShellAppIcon kind="search" className={className} />
);

export const TableAppIcon = ({ className }: { className?: string }) => (
  <ShellAppIcon kind="table" className={className} />
);

const CHART_TYPE_GLYPH: Record<ChartType, string> = {
  mindmap: mindmapGlyph,
  timeline: timelineGlyph,
  flowchart: flowchartGlyph,
};

/** A chart type's own mark, for choosing between them inside Chart. */
export function ChartTypeGlyph({ type, className }: { type: ChartType; className?: string }) {
  return <img src={CHART_TYPE_GLYPH[type]} alt="" draggable={false} className={cn("shrink-0 object-contain", className)} />;
}
