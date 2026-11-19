import type { Rect, WorkspaceGeometry } from "./workbench-geometry";
import { describePlacement, type InstanceId, type LayoutChange, type LayoutEntry, type LayoutResult, type WorkspaceLayout } from "./workbench-layout";

/** One place an interface can go, as its layout menu offers it. */
export type PlacementOption = {
  /** Null for where it is now. */
  change: LayoutChange | null;
  result: LayoutResult;
  /** "Large, left", "Medium, right, top". */
  label: string;
  current: boolean;
};

const FIRST = -1;
const LAST = 1e9;

/**
 * Every place it could be dragged to, in a fixed order: the main area (alone,
 * left, right, top, bottom), then each side column (full height, top,
 * bottom). Moves the controller can't make collapse into others; the layout
 * rules decide what's left.
 */
function candidates(id: InstanceId): LayoutChange[] {
  const main = ([false, true] as const).flatMap((stacked) =>
    [FIRST, LAST].map((order): LayoutChange => ({ type: "move", id, region: "main", order, stacked })),
  );
  const sides = (["right", "left"] as const).flatMap((side): LayoutChange[] => [
    { type: "move", id, region: side, order: FIRST, size: "extended" },
    { type: "move", id, region: side, order: FIRST, size: "medium" },
    { type: "move", id, region: side, order: LAST, size: "medium" },
  ]);
  return [...main, ...sides];
}

const sameRect = (a: Rect | undefined, b: Rect | undefined) =>
  !!a && !!b && [a.x - b.x, a.y - b.y, a.width - b.width, a.height - b.height].every((d) => Math.abs(d) < 2);

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * The places one interface can go, each once: two moves that put it in the
 * same spot are one option (the one that minimizes least). Where it is now is
 * among them, marked. Minimizing isn't a place: it has its own button.
 */
export function placementOptions(
  layout: WorkspaceLayout,
  entry: LayoutEntry,
  preview: (change: LayoutChange) => LayoutResult,
  geometryOf: (layout: WorkspaceLayout) => WorkspaceGeometry,
): PlacementOption[] {
  const here = geometryOf(layout).frames[entry.id];
  const labelOf = (result: LayoutResult) => {
    const placed = result.layout.entries[entry.id];
    return capitalize(placed ? describePlacement(result.layout, placed) : "");
  };
  const current: PlacementOption = { change: null, result: { layout, evicted: [], changed: false }, label: labelOf({ layout, evicted: [], changed: false }), current: true };

  const options: { option: PlacementOption; rect: Rect }[] = [];
  let currentShown = false;
  for (const change of candidates(entry.id)) {
    const result = preview(change);
    const rect = geometryOf(result.layout).frames[entry.id];
    if (!rect) continue;
    if (!result.changed || sameRect(rect, here)) {
      // Where it already is: shown once, in its place in the order.
      if (!currentShown) options.push({ option: current, rect: here ?? rect });
      currentShown = true;
      continue;
    }
    const same = options.find((shown) => sameRect(shown.rect, rect));
    const option = { change, result, label: labelOf(result), current: false };
    if (!same) options.push({ option, rect });
    else if (!same.option.current && result.evicted.length < same.option.result.evicted.length) same.option = option;
  }
  if (!currentShown && here) options.unshift({ option: current, rect: here });
  return options.map(({ option }) => option);
}
