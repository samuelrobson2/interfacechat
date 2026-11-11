import { inRegion, isVisible, type InstanceId, type LayoutChange, type WorkspaceLayout } from "./workbench-layout";

/**
 * Where everything is drawn, derived from layout state and the workspace's
 * size. Frames, the strip, the drop preview and the layout glyphs all read
 * from this, so they can't disagree.
 */

export type Rect = { x: number; y: number; width: number; height: number };
export type Size = { width: number; height: number };

export type GeometryOptions = {
  /** Width at the right of the top bar kept for the chat tools; the strip ends before it. */
  reserveRight?: number;
  /** Room at the panel's left for the app's menu, which floats over it. */
  insetLeft?: number;
  /** Room at the bottom for Chat's input while Chat is minimized. */
  reserveBottom?: number;
};

export type WorkspaceGeometry = {
  size: Size;
  /** Visible interfaces. */
  frames: Record<InstanceId, Rect>;
  /** Minimized interfaces' app icons. */
  icons: Record<InstanceId, Rect>;
  /** The top bar, where minimized interfaces wait. */
  strip: Rect;
  /** The white, dotted work area below the top bar. */
  panel: Rect;
  /** Inside the panel: the columns and the main area. */
  content: Rect;
  /**
   * Where the main area and side columns belong, for drops. Frames can be
   * drawn bigger: an interface grows into space nothing else is using.
   */
  main: Rect;
  columns: { left?: Rect; right?: Rect };
  /** Centre of the gap between two large interfaces side by side. */
  dividerX?: number;
  /** The same, when one is above the other. */
  dividerY?: number;
};

export const METRICS = {
  gap: 12,
  /** Narrowest a large interface may be drawn; below it the controller makes room. */
  minLarge: 440,
  topBar: 56,
  /** Space between the panel's edge and the interfaces in it. */
  panelInset: 12,
  icon: 30,
  iconGap: 8,
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Chat's sidebar is the narrow column; a supporting column is a little wider. */
function columnWidth(layout: WorkspaceLayout, side: "left" | "right", width: number) {
  const column = inRegion(layout, side);
  if (column.length === 0) return 0;
  return column.some((entry) => entry.presentation === "sidebar")
    ? clamp(width * 0.24, 300, 380)
    : clamp(width * 0.27, 320, 420);
}

export function layoutGeometry(
  layout: WorkspaceLayout,
  size: Size,
  options: GeometryOptions = {},
): WorkspaceGeometry {
  const { gap, topBar, icon, iconGap, panelInset } = METRICS;
  const panel: Rect = { x: 0, y: topBar, width: size.width, height: Math.max(0, size.height - topBar) };
  const left = Math.max(panelInset, options.insetLeft ?? 0);
  const content: Rect = {
    x: panel.x + left,
    y: panel.y + panelInset,
    width: Math.max(0, panel.width - left - panelInset),
    height: Math.max(0, panel.height - panelInset * 2 - (options.reserveBottom ?? 0)),
  };
  const frames: Record<InstanceId, Rect> = {};

  // Nominal regions: where things belong, and where drops land.
  const leftWidth = columnWidth(layout, "left", content.width);
  const rightWidth = columnWidth(layout, "right", content.width);
  const contentRight = content.x + content.width;
  const columns: WorkspaceGeometry["columns"] = {};
  if (leftWidth) columns.left = { ...content, width: leftWidth };
  if (rightWidth) columns.right = { ...content, x: contentRight - rightWidth, width: rightWidth };

  const mainX = leftWidth ? content.x + leftWidth + gap : content.x;
  const mainRight = rightWidth ? contentRight - rightWidth - gap : contentRight;
  const main: Rect = { ...content, x: mainX, width: Math.max(0, mainRight - mainX) };

  // Drawn regions: free space never sits empty. With nothing large, Chat's
  // column takes the main area; without Chat, the columns share it.
  const drawn = { ...columns };
  if (inRegion(layout, "main").length === 0 && (leftWidth || rightWidth)) {
    const both = Boolean(leftWidth && rightWidth);
    const free = content.width - leftWidth - rightWidth - (both ? gap : 0);
    const chatSide = (["left", "right"] as const).find((side) =>
      inRegion(layout, side).some((entry) => entry.presentation === "sidebar"),
    );
    const leftShare = !both
      ? (leftWidth ? 1 : 0)
      : chatSide
        ? (chatSide === "left" ? 1 : 0)
        : leftWidth / (leftWidth + rightWidth);
    const grownLeft = leftWidth + free * leftShare;
    if (columns.left) drawn.left = { ...columns.left, width: grownLeft };
    if (columns.right) {
      const grownRight = rightWidth + free * (1 - leftShare);
      drawn.right = { ...columns.right, x: contentRight - grownRight, width: grownRight };
    }
  }

  for (const side of ["left", "right"] as const) {
    const column = drawn[side];
    if (!column) continue;
    const stack = inRegion(layout, side);
    // Two mediums share a column; anything alone takes all of it.
    const half = (column.height - gap) / 2;
    stack.forEach((entry, index) => {
      frames[entry.id] =
        entry.presentation === "medium" && stack.length > 1
          ? { ...column, y: column.y + index * (half + gap), height: half }
          : { ...column };
    });
  }

  const large = inRegion(layout, "main");
  let dividerX: number | undefined;
  let dividerY: number | undefined;
  if (large.length === 1 && large[0]) {
    frames[large[0].id] = { ...main };
  } else if (large.length >= 2 && large[0] && large[1] && layout.stacked) {
    const topShare = (main.height - gap) * layout.divider;
    frames[large[0].id] = { ...main, height: topShare };
    frames[large[1].id] = { ...main, y: main.y + topShare + gap, height: main.height - topShare - gap };
    dividerY = main.y + topShare + gap / 2;
  } else if (large.length >= 2 && large[0] && large[1]) {
    const leftShare = (main.width - gap) * layout.divider;
    frames[large[0].id] = { ...main, width: leftShare };
    frames[large[1].id] = { ...main, x: main.x + leftShare + gap, width: main.width - leftShare - gap };
    dividerX = main.x + leftShare + gap / 2;
  }

  // The strip runs right to left from just before the chat tools.
  const strip: Rect = { x: 0, y: 0, width: size.width, height: topBar };
  const stripEnd = size.width - (options.reserveRight ?? 0);
  const minimized = inRegion(layout, "strip").filter((entry) => !isVisible(entry));
  const icons: Record<InstanceId, Rect> = {};
  minimized.forEach((entry, index) => {
    const fromEnd = minimized.length - index;
    icons[entry.id] = {
      x: stripEnd - fromEnd * icon - (fromEnd - 1) * iconGap,
      y: (topBar - icon) / 2,
      width: icon,
      height: icon,
    };
  });

  return { size, frames, icons, strip, panel, content, main, columns, dividerX, dividerY };
}

/** Every large interface at least `minLarge` wide in a workspace this wide. */
export function fitsWidth(layout: WorkspaceLayout, width: number) {
  const { frames } = layoutGeometry(layout, { width, height: 800 });
  return inRegion(layout, "main").every((entry) => (frames[entry.id]?.width ?? 0) >= METRICS.minLarge);
}

/** Far end of a region; the controller normalizes it. */
const END = 1e9;

/**
 * The move a drop at `point` asks for: the top bar minimizes, a side column
 * takes it at the top or bottom, and the main area takes the edge it's
 * dropped nearest: left or right for side by side, top or bottom to stack.
 */
export function dropChange(
  layout: WorkspaceLayout,
  geometry: WorkspaceGeometry,
  id: InstanceId,
  point: { x: number; y: number },
): LayoutChange {
  const { strip, columns, main, content } = geometry;
  if (point.y <= strip.y + strip.height) return { type: "move", id, region: "strip", order: END };

  const top = point.y < content.y + content.height / 2;
  const leftEdge = columns.left ? columns.left.x + columns.left.width : content.x + content.width * 0.18;
  const rightEdge = columns.right ? columns.right.x : content.x + content.width * 0.82;
  if (point.x < leftEdge) return { type: "move", id, region: "left", order: top ? -1 : END };
  if (point.x > rightEdge) return { type: "move", id, region: "right", order: top ? -1 : END };

  const others = inRegion(layout, "main").filter((entry) => entry.id !== id);
  if (others.length === 0) return { type: "move", id, region: "main", order: 0 };
  // Which edge of the main area the point is nearest, as shares of its size.
  const across = (point.x - main.x) / (main.width || 1) - 0.5;
  const down = (point.y - main.y) / (main.height || 1) - 0.5;
  const stacked = Math.abs(down) > Math.abs(across);
  const first = stacked ? down < 0 : across < 0;
  return { type: "move", id, region: "main", order: first ? -1 : END, stacked };
}
