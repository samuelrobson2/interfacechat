/**
 * The workbench's layout controller. Every change to the arrangement (opening,
 * minimizing, resizing, moving, presets, the divider) goes through
 * `applyLayoutChange`, which applies the request and any automatic
 * minimizations it forces as one transaction. It is pure: the store keeps the
 * undo history and the page derives what it draws from the result.
 *
 * Layout state is only placement. What an interface shows (its artifact, its
 * edits, its navigation stack) lives elsewhere, so moving or minimizing an
 * interface never touches it.
 */

import { layoutRules } from "./workbench-rules";

export type InstanceId = string;

/** How big an interface is drawn. Sidebar is Chat's own; the rest are everyone else's. */
export type Presentation = "minimized" | "medium" | "extended" | "large" | "sidebar";

export type Side = "left" | "right";

/** Supporting columns on either side, the main area between them, and the strip of app icons. */
export type Region = Side | "main" | "strip";

export type Placement = {
  presentation: Presentation;
  region: Region;
  /** Position within the region: main slot (left first), stack from the top, or strip order. */
  order: number;
};

export type LayoutEntry = Placement & {
  id: InstanceId;
  /** Chat has a sidebar instead of medium and extended medium. */
  chat: boolean;
  /** Last time the person did something inside it. Assistant updates don't count. */
  lastInteraction: number;
  /** Where a minimized interface goes back to. */
  restore?: Placement;
};

export type WorkspaceLayout = {
  entries: Record<InstanceId, LayoutEntry>;
  /** Share of the main area the first large interface takes when two are open. */
  divider: number;
  /**
   * Two large interfaces sit one above the other rather than side by side. Only
   * on the right, beside Chat's sidebar: never across the full page (`isStacked`).
   */
  stacked?: boolean;
  /** Share of the page Chat's sidebar takes, once dragged; unset, it's the default narrow column. */
  chatWidth?: number;
};

export type PresetId = "focus" | "pair" | "split" | "stack" | "research";

export type LayoutChange =
  /** Show it: from the strip back to where it was, or its default. */
  | { type: "open"; id: InstanceId }
  /**
   * Show it as a medium at the bottom of the supporting column (the side
   * without Chat's sidebar, right by default). Chat goes back where it was.
   */
  | { type: "support"; id: InstanceId }
  | { type: "present"; id: InstanceId; presentation: Presentation }
  /** Take it off the workbench altogether: no window, no icon in the strip. What it holds is kept, so it can be opened again. Chat can't be closed. */
  | { type: "close"; id: InstanceId }
  /**
   * Dragged somewhere. The presentation follows the region, or `size` when
   * the drop chose one (a side column's middle is an extended medium, its top
   * or bottom a medium). `stacked` says how the main area is shared from then on.
   */
  | { type: "move"; id: InstanceId; region: Region; order: number; stacked?: boolean; size?: "medium" | "extended" }
  /** Same presentation, the other side (or the other main slot: left is first, so the top when stacked). */
  | { type: "side"; id: InstanceId; side: Side }
  /** Two large interfaces: one above the other, or side by side. */
  | { type: "arrange"; stacked: boolean }
  | { type: "preset"; preset: PresetId }
  | { type: "divider"; ratio: number }
  /** How wide Chat's sidebar is, as a share of the page. */
  | { type: "chatWidth"; ratio: number };

/**
 * Room the controller has to respect beyond slot counts. `fits` says whether
 * an arrangement leaves every large interface wide enough; when it doesn't,
 * the least recently used large interface or side column is minimized.
 */
export type LayoutOptions = { fits?: (layout: WorkspaceLayout) => boolean };

export type LayoutResult = {
  layout: WorkspaceLayout;
  /** Interfaces minimized to make room. */
  evicted: InstanceId[];
  changed: boolean;
};

/** Two large interfaces share the main area at most. */
export const MAIN_SLOTS = 2;
/** A side column is two mediums tall. */
export const SIDE_UNITS = 2;
/** How many interfaces a side column holds: two, one above the other, where the rules let that side stack. */
const sideEntries = (side: Side) => ((side === "left" ? layoutRules().leftStack : layoutRules().rightStack) ? 2 : 1);
export const DIVIDER_RANGE = [0.25, 0.75] as const;
/** How narrow and how wide Chat's sidebar can be dragged, as shares of the page. */
export const CHAT_WIDTH_RANGE = [0.18, 0.6] as const;

const UNITS: Record<Presentation, number> = {
  minimized: 0,
  medium: 1,
  extended: 2,
  sidebar: 2,
  large: 1,
};

/** Push to the end of a region; normalized away straight after. */
const LAST = 1e9;
const FIRST = -1;

export const PRESENTATION_LABEL: Record<Presentation, string> = {
  minimized: "Minimize",
  medium: "Medium",
  extended: "Extended medium",
  large: "Large",
  sidebar: "Full sidebar",
};

export const PRESETS: { id: PresetId; label: string; description: string }[] = [
  { id: "focus", label: "Chat", description: "Chat large, everything else minimized." },
  { id: "pair", label: "Chat + one", description: "Chat in the sidebar and the latest interface large." },
  { id: "split", label: "Side by side", description: "Chat in the sidebar and the two latest interfaces large." },
  { id: "stack", label: "Stacked", description: "Chat in the sidebar and the two latest interfaces large, one above the other." },
  { id: "research", label: "Research", description: "Chat in the sidebar, one large, two medium on the right." },
];

/** The options a size menu offers, in order. */
export function presentationsFor(entry: Pick<LayoutEntry, "chat">): Presentation[] {
  if (entry.chat) return ["minimized", "sidebar", "large"];
  return layoutRules().extended ? ["minimized", "medium", "extended", "large"] : ["minimized", "medium", "large"];
}

const isSide = (region: Region | undefined): region is Side => region === "left" || region === "right";

/** Whether two large interfaces may stack here: the rules allow it, and Chat's sidebar is on the left for them to sit beside. */
export function canStackLarge(layout: WorkspaceLayout) {
  return layoutRules().largeStacked && inRegion(layout, "left").some((entry) => entry.chat && entry.presentation === "sidebar");
}

/**
 * Whether the main area is drawn stacked now, where stacking can be: two large
 * stack by default, one above the other; side by side only when chosen (the
 * layout menu, a drag to the side) or when stacking isn't allowed.
 */
export function isStacked(layout: WorkspaceLayout) {
  return canStackLarge(layout) && (layout.stacked !== false || !layoutRules().largeSideBySide);
}

/** How many large interfaces the main area holds: two where they can sit side by side or stack, else one. */
export function mainSlots(layout: WorkspaceLayout) {
  return layoutRules().largeSideBySide || canStackLarge(layout) ? MAIN_SLOTS : 1;
}

const defaultSide = (entry: LayoutEntry): Side => (entry.chat ? "left" : "right");

export function isVisible(entry: LayoutEntry) {
  return entry.presentation !== "minimized";
}

/** Entries in a region, in order. */
export function inRegion(layout: WorkspaceLayout, region: Region): LayoutEntry[] {
  return Object.values(layout.entries)
    .filter((entry) => entry.region === region)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

/**
 * Two extended medium side by side: the supporting column (not Chat's) holds
 * a pair at full height, next to each other, and widens to fit them.
 */
export function isExtendedPair(entries: LayoutEntry[]) {
  return (
    layoutRules().extended &&
    layoutRules().extendedPair &&
    entries.length === 2 &&
    !entries.some((entry) => entry.chat) &&
    entries.every((entry) => entry.presentation === "extended")
  );
}

function sideUnits(entries: LayoutEntry[]) {
  return entries.reduce((sum, entry) => sum + UNITS[entry.presentation], 0);
}

/** Which side a large interface reads as: its slot when split (the first is left, or the top), otherwise none. */
function mainSide(layout: WorkspaceLayout, entry: LayoutEntry): Side | null {
  const main = inRegion(layout, "main");
  if (main.length < 2) return null;
  return main[0]?.id === entry.id ? "left" : "right";
}

/** Where an interface lands when it changes to `presentation`, keeping its side where it can. */
function placementFor(layout: WorkspaceLayout, entry: LayoutEntry, presentation: Presentation): Placement {
  if (presentation === "minimized") return { presentation, region: "strip", order: LAST };

  if (presentation === "large") {
    if (entry.region === "main") return { presentation, region: "main", order: entry.order };
    if (entry.restore?.region === "main") return { presentation, region: "main", order: entry.restore.order };
    // From a side column, it takes the main slot on that side.
    const from = isSide(entry.region) ? entry.region : isSide(entry.restore?.region) ? entry.restore.region : null;
    return { presentation, region: "main", order: from === "left" ? FIRST : LAST };
  }

  const side: Side = isSide(entry.region)
    ? entry.region
    : isSide(entry.restore?.region)
      ? entry.restore.region
      : (mainSide(layout, entry) ?? defaultSide(entry));
  const order =
    entry.region === side ? entry.order : entry.restore?.region === side ? entry.restore.order : LAST;
  return { presentation, region: side, order };
}

/** The side for supporting interfaces: right, unless Chat's sidebar is there. */
export function supportingSide(layout: WorkspaceLayout): Side {
  const chatOnRight = inRegion(layout, "right").some((entry) => entry.presentation === "sidebar");
  return chatOnRight ? "left" : "right";
}

/** Moves follow the region: main is large, the strip is minimized, a side keeps a side size. */
function presentationForRegion(entry: LayoutEntry, region: Region): Presentation {
  if (region === "main") return "large";
  if (region === "strip") return "minimized";
  if (entry.chat) return "sidebar";
  return entry.presentation === "extended" ? "extended" : "medium";
}

function minimize(entry: LayoutEntry): LayoutEntry {
  if (!isVisible(entry)) return entry;
  return {
    ...entry,
    restore: { presentation: entry.presentation, region: entry.region, order: entry.order },
    presentation: "minimized",
    region: "strip",
    order: LAST,
  };
}

function place(entry: LayoutEntry, placement: Placement, now: number): LayoutEntry {
  const next: LayoutEntry = { ...entry, ...placement, lastInteraction: now };
  if (placement.presentation === "minimized") {
    next.restore = isVisible(entry)
      ? { presentation: entry.presentation, region: entry.region, order: entry.order }
      : entry.restore;
  }
  return next;
}

/** Least recently used first; protected interfaces are never picked. */
function evictionOrder(entries: LayoutEntry[], keep: Set<InstanceId>) {
  return entries
    .filter((entry) => !keep.has(entry.id))
    .sort((a, b) => a.lastInteraction - b.lastInteraction || a.id.localeCompare(b.id));
}

/** Minimize the least recently used interfaces until every region fits. */
function enforceCapacity(layout: WorkspaceLayout, keep: Set<InstanceId>, options: LayoutOptions): InstanceId[] {
  const evicted: InstanceId[] = [];
  const evict = (entry: LayoutEntry) => {
    layout.entries[entry.id] = minimize(entry);
    evicted.push(entry.id);
  };

  let main = inRegion(layout, "main");
  // A third large interface comes in while Chat is one of the large: Chat makes room by moving into its sidebar,
  // rather than being minimized. Whatever else is in the left column goes to the top bar.
  const chatInMain = main.find((entry) => entry.chat && !keep.has(entry.id));
  if (main.length > mainSlots(layout) && chatInMain) {
    for (const item of inRegion(layout, "left")) if (!item.chat) evict(item);
    layout.entries[chatInMain.id] = { ...chatInMain, presentation: "sidebar", region: "left", order: 0 };
    main = inRegion(layout, "main");
  }
  for (const entry of evictionOrder(main, keep)) {
    if (main.length <= mainSlots(layout)) break;
    evict(entry);
    main = inRegion(layout, "main");
  }

  for (const side of ["left", "right"] as const) {
    let column = inRegion(layout, side);
    // Two in the column and one of them extended: with the rule on, both go full height, side by side, rather than one going.
    if (layoutRules().extended && layoutRules().extendedPair && column.length === 2 && !column.some((entry) => entry.chat) && column.some((entry) => entry.presentation === "extended")) {
      for (const entry of column) if (entry.presentation !== "extended") layout.entries[entry.id] = { ...entry, presentation: "extended" };
      column = inRegion(layout, side);
    }
    for (const entry of evictionOrder(column, keep)) {
      if (isExtendedPair(column) || (sideUnits(column) <= SIDE_UNITS && column.length <= sideEntries(side))) break;
      evict(entry);
      column = inRegion(layout, side);
    }
  }

  // Width: a large interface or a whole side column goes, whichever was used least recently.
  while (options.fits && !options.fits(layout)) {
    const groups: { ids: InstanceId[]; recency: number }[] = [];
    for (const entry of inRegion(layout, "main")) {
      if (!keep.has(entry.id)) groups.push({ ids: [entry.id], recency: entry.lastInteraction });
    }
    for (const side of ["left", "right"] as const) {
      const column = inRegion(layout, side);
      if (column.length && !column.some((entry) => keep.has(entry.id))) {
        groups.push({
          ids: column.map((entry) => entry.id),
          recency: Math.max(...column.map((entry) => entry.lastInteraction)),
        });
      }
    }
    // Chat goes last: any interface makes room before it does.
    const hasChat = (group: { ids: InstanceId[] }) => group.ids.some((id) => layout.entries[id]?.chat);
    const oldest = groups.sort((a, b) => Number(hasChat(a)) - Number(hasChat(b)) || a.recency - b.recency)[0];
    if (!oldest) break;
    for (const id of oldest.ids) {
      const entry = layout.entries[id];
      if (entry) evict(entry);
    }
  }
  return evicted;
}

/** Orders become 0…n-1 in every region. */
function normalize(layout: WorkspaceLayout) {
  for (const region of ["left", "right", "main", "strip"] as const) {
    inRegion(layout, region).forEach((entry, index) => {
      if (entry.order !== index) layout.entries[entry.id] = { ...entry, order: index };
    });
  }
}

const clampDivider = (ratio: number) => Math.min(DIVIDER_RANGE[1], Math.max(DIVIDER_RANGE[0], ratio));

function byRecency(entries: LayoutEntry[]) {
  return [...entries].sort((a, b) => b.lastInteraction - a.lastInteraction || a.id.localeCompare(b.id));
}

/** A preset's placements, picking interfaces by how recently they were used. */
function presetPlacements(layout: WorkspaceLayout, preset: PresetId): Map<InstanceId, Placement> {
  const all = Object.values(layout.entries);
  const chat = all.find((entry) => entry.chat);
  const others = byRecency(all.filter((entry) => !entry.chat));
  const placements = new Map<InstanceId, Placement>();
  const set = (entry: LayoutEntry | undefined, placement: Placement) => {
    if (entry) placements.set(entry.id, placement);
  };

  if (preset === "focus") {
    set(chat, { presentation: "large", region: "main", order: 0 });
  } else {
    set(chat, { presentation: "sidebar", region: "left", order: 0 });
    set(others[0], { presentation: "large", region: "main", order: 0 });
    if (preset === "split" || preset === "stack") set(others[1], { presentation: "large", region: "main", order: 1 });
    if (preset === "research") {
      set(others[1], { presentation: "medium", region: "right", order: 0 });
      set(others[2], { presentation: "medium", region: "right", order: 1 });
    }
  }
  return placements;
}

/** Chat into its sidebar on the left, where two large stack beside it; anything else in that column goes to the top bar. */
function chatToSidebar(layout: WorkspaceLayout, now: number) {
  const chat = Object.values(layout.entries).find((item) => item.chat);
  if (!chat || canStackLarge(layout)) return;
  for (const item of inRegion(layout, "left")) if (!item.chat) layout.entries[item.id] = minimize(item);
  layout.entries[chat.id] = place(chat, { presentation: "sidebar", region: "left", order: 0 }, now);
}

/** Apply a change and whatever minimizations it forces, as one transaction. */
export function applyLayoutChange(
  layout: WorkspaceLayout,
  change: LayoutChange,
  now: number,
  options: LayoutOptions = {},
): LayoutResult {
  const next: WorkspaceLayout = { ...layout, entries: { ...layout.entries } };
  const unchanged: LayoutResult = { layout, evicted: [], changed: false };

  if (change.type === "divider") {
    const divider = clampDivider(change.ratio);
    return divider === layout.divider ? unchanged : { layout: { ...next, divider }, evicted: [], changed: true };
  }

  if (change.type === "chatWidth") {
    const chatWidth = Math.min(CHAT_WIDTH_RANGE[1], Math.max(CHAT_WIDTH_RANGE[0], change.ratio));
    return chatWidth === layout.chatWidth ? unchanged : { layout: { ...next, chatWidth }, evicted: [], changed: true };
  }

  if (change.type === "preset") {
    const placements = presetPlacements(layout, change.preset);
    for (const entry of Object.values(layout.entries)) {
      const placement = placements.get(entry.id);
      // Kept interfaces don't count as used; only what the preset shows does.
      next.entries[entry.id] = placement ? { ...entry, ...placement } : minimize(entry);
    }
    if (change.preset === "split" || change.preset === "stack") {
      next.divider = 0.5;
      next.stacked = change.preset === "stack";
    }
    normalize(next);
    return { layout: next, evicted: [], changed: !sameArrangement(layout, next) };
  }

  if (change.type === "arrange") {
    // Only to an arrangement the rules allow.
    if (change.stacked ? !layoutRules().largeStacked : !layoutRules().largeSideBySide) return unchanged;
    if (isStacked(layout) === change.stacked && !!layout.stacked === change.stacked) return unchanged;
    next.stacked = change.stacked;
    if (change.stacked) chatToSidebar(next, now);
    // Side by side needs the width; the one used last stays.
    const latest = byRecency(inRegion(next, "main"))[0];
    const evicted = enforceCapacity(next, new Set(latest ? [latest.id] : []), options);
    normalize(next);
    return { layout: next, evicted, changed: true };
  }

  const entry = layout.entries[change.id];
  if (!entry) return unchanged;

  if (change.type === "close") {
    if (entry.chat) return unchanged;
    delete next.entries[change.id];
    normalize(next);
    return { layout: next, evicted: [], changed: true };
  }

  let placement: Placement;
  switch (change.type) {
    case "open":
      if (isVisible(entry)) return unchanged;
      placement = entry.restore
        ? placementFor(layout, entry, entry.restore.presentation)
        : entry.chat
          ? { presentation: "sidebar", region: "left", order: 0 }
          : { presentation: "large", region: "main", order: LAST };
      break;
    case "support":
      if (entry.chat) return applyLayoutChange(layout, { type: "open", id: entry.id }, now, options);
      if (entry.presentation === "medium" && entry.region === supportingSide(layout)) return unchanged;
      placement = { presentation: "medium", region: supportingSide(layout), order: LAST };
      break;
    case "present":
      if (!presentationsFor(entry).includes(change.presentation)) return unchanged;
      if (change.presentation === entry.presentation) return unchanged;
      placement = placementFor(layout, entry, change.presentation);
      break;
    case "move":
      placement = {
        presentation:
          change.size && isSide(change.region) && !entry.chat && (change.size === "medium" || layoutRules().extended)
            ? change.size
            : presentationForRegion(entry, change.region),
        region: change.region,
        order: change.order,
      };
      if (change.stacked !== undefined) next.stacked = change.stacked;
      break;
    case "side": {
      if (entry.region === "main") {
        placement = { ...entry, order: change.side === "left" ? FIRST : LAST };
      } else if (isSide(entry.region)) {
        placement = { ...entry, region: change.side, order: LAST };
      } else {
        return unchanged;
      }
      break;
    }
  }

  next.entries[entry.id] = place(entry, placement, now);
  // Dropped to stack: the stack sits beside Chat's sidebar, so Chat goes there (from the page, or the top bar).
  if (change.type === "move" && change.region === "main" && change.stacked && layoutRules().largeStacked && !entry.chat) {
    chatToSidebar(next, now);
  }
  const evicted = enforceCapacity(next, new Set([entry.id]), options);
  normalize(next);
  return { layout: next, evicted, changed: !sameArrangement(layout, next) };
}

/** A preview of a change without committing it. */
export function previewLayoutChange(layout: WorkspaceLayout, change: LayoutChange, options: LayoutOptions = {}) {
  return applyLayoutChange(layout, change, Number.MAX_SAFE_INTEGER, options);
}

/** Recency only: not a layout change and never in the undo history. */
export function touchEntry(layout: WorkspaceLayout, id: InstanceId, now: number): WorkspaceLayout {
  const entry = layout.entries[id];
  if (!entry) return layout;
  return { ...layout, entries: { ...layout.entries, [id]: { ...entry, lastInteraction: now } } };
}

/** Placement and divider only, ignoring recency. */
export function sameArrangement(a: WorkspaceLayout, b: WorkspaceLayout) {
  if (a.divider !== b.divider || !!a.stacked !== !!b.stacked || a.chatWidth !== b.chatWidth) return false;
  const ids = Object.keys(a.entries);
  if (ids.length !== Object.keys(b.entries).length) return false;
  return ids.every((id) => {
    const x = a.entries[id];
    const y = b.entries[id];
    return (
      !!x && !!y && x.presentation === y.presentation && x.region === y.region && x.order === y.order
    );
  });
}

/**
 * Undo restores the whole arrangement but not recency: what the person last
 * touched is still what they last touched.
 */
export function restoreArrangement(snapshot: WorkspaceLayout, current: WorkspaceLayout): WorkspaceLayout {
  const entries: Record<InstanceId, LayoutEntry> = {};
  for (const [id, entry] of Object.entries(snapshot.entries)) {
    // Only interfaces that still exist.
    const now = current.entries[id];
    if (now) entries[id] = { ...entry, lastInteraction: now.lastInteraction };
  }
  // Interfaces created after the snapshot stay, minimized.
  for (const [id, entry] of Object.entries(current.entries)) {
    if (!entries[id]) entries[id] = { ...minimize(entry), order: LAST };
  }
  const layout: WorkspaceLayout = { entries, divider: snapshot.divider, stacked: snapshot.stacked, chatWidth: snapshot.chatWidth };
  normalize(layout);
  return layout;
}

/** Add an interface to the strip, ready to open. Not a layout change on its own. */
export function addEntry(layout: WorkspaceLayout, id: InstanceId, chat: boolean, now: number): WorkspaceLayout {
  const layoutWithEntry: WorkspaceLayout = {
    ...layout,
    entries: {
      ...layout.entries,
      [id]: { id, chat, presentation: "minimized", region: "strip", order: LAST, lastInteraction: now },
    },
  };
  normalize(layoutWithEntry);
  return layoutWithEntry;
}

/** "large, right", "medium, left, top": what the glyph shows, in words. */
export function describePlacement(layout: WorkspaceLayout, entry: LayoutEntry): string {
  const size = PRESENTATION_LABEL[entry.presentation].toLowerCase();
  if (entry.presentation === "minimized") return "minimized";
  if (entry.presentation === "sidebar") return `sidebar, ${entry.region}`;
  if (entry.region === "main") {
    const side = mainSide(layout, entry);
    if (!side) return size;
    return `${size}, ${isStacked(layout) ? (side === "left" ? "top" : "bottom") : side}`;
  }
  if (entry.presentation === "medium") {
    const column = inRegion(layout, entry.region);
    const position = column.length > 1 ? (column[0]?.id === entry.id ? ", top" : ", bottom") : "";
    return `${size}, ${entry.region}${position}`;
  }
  return `${size}, ${entry.region}`;
}
