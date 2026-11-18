import { canStackLarge, inRegion, isExtendedPair, isStacked, isVisible, type InstanceId, type LayoutChange, type WorkspaceLayout } from "./workbench-layout";
import { layoutRules } from "./workbench-rules";

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
  /** Centre of the gap between two large interfaces side by side; stacked, the gap between Chat and the stack. */
  dividerX?: number;
  /** The same, when one is above the other. */
  dividerY?: number;
  /** The gap between Chat's sidebar and what's beside it, where a bar sets Chat's width (not while stacked: the stack's bar does that). */
  chatDividerX?: number;
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

/** Chat's sidebar starts this share of the page wide; drag the bar beside it to change it (`chatWidth`). */
export const CHAT_SHARE = 0.24;

/** Chat's sidebar is the narrow column (or as wide as it's been dragged); a supporting column is a little wider. */
function columnWidth(layout: WorkspaceLayout, side: "left" | "right", width: number) {
  const column = inRegion(layout, side);
  if (column.length === 0) return 0;
  if (column.some((entry) => entry.presentation === "sidebar")) {
    // Dragged wider, it still leaves a large interface its narrowest.
    return layout.chatWidth
      ? clamp(width * layout.chatWidth, 300, Math.max(300, width - METRICS.gap - METRICS.minLarge))
      : clamp(width * CHAT_SHARE, 300, 380);
  }
  const one = clamp(width * 0.27, 320, 420);
  // Two extended medium side by side: room for both.
  return isExtendedPair(column) ? one * 2 + METRICS.gap : one;
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

  // Nominal regions: where things belong, and where drops land. Stacked, Chat's sidebar and the stack share the
  // width by the divider (half each to start), keeping each wide enough to use.
  const stacked = isStacked(layout) && inRegion(layout, "main").length >= 2;
  const rightWidth = columnWidth(layout, "right", content.width);
  // The width Chat and the stack share: everything left of a right column.
  const shared = content.width - (rightWidth ? rightWidth + gap : 0);
  const leftWidth = stacked
    ? clamp((shared - gap) * layout.divider, 300, Math.max(300, shared - gap - METRICS.minLarge))
    : columnWidth(layout, "left", content.width);
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
    // A column holding two, one above the other, grows to half the page at most: stacking never spans the full page.
    const grow = (side: "left" | "right", base: number, extra: number) =>
      inRegion(layout, side).length > 1 ? Math.max(base, Math.min(base + extra, (content.width - gap) / 2)) : base + extra;
    const grownLeft = grow("left", leftWidth, free * leftShare);
    if (columns.left) drawn.left = { ...columns.left, width: grownLeft };
    if (columns.right) {
      const grownRight = grow("right", rightWidth, free * (1 - leftShare));
      drawn.right = { ...columns.right, x: contentRight - grownRight, width: grownRight };
    }
  }

  for (const side of ["left", "right"] as const) {
    const column = drawn[side];
    if (!column) continue;
    const stack = inRegion(layout, side);
    // A medium is always half the column: alone it sits at the top, and a second goes below it. Extended
    // medium and Chat's sidebar take the whole column.
    const half = (column.height - gap) / 2;
    // With the rule on, a medium alone fills its column instead.
    const fills = layoutRules().mediumAloneFills && stack.length === 1;
    // Two extended medium: next to each other, full height, half the column's width each.
    const pair = isExtendedPair(stack);
    const halfWidth = (column.width - gap) / 2;
    stack.forEach((entry, index) => {
      frames[entry.id] = pair
        ? { ...column, x: column.x + index * (halfWidth + gap), width: halfWidth }
        : entry.presentation === "medium" && !fills
          ? { ...column, y: column.y + index * (half + gap), height: half }
          : { ...column };
    });
  }

  const large = inRegion(layout, "main");
  let dividerX: number | undefined;
  let dividerY: number | undefined;
  if (large.length === 1 && large[0]) {
    frames[large[0].id] = { ...main };
  } else if (large.length >= 2 && large[0] && large[1] && stacked) {
    // Half the height each; the divider is the bar beside Chat, setting how wide the stack is.
    const half = (main.height - gap) / 2;
    frames[large[0].id] = { ...main, height: half };
    frames[large[1].id] = { ...main, y: main.y + half + gap, height: main.height - half - gap };
    dividerX = main.x - gap / 2;
  } else if (large.length >= 2 && large[0] && large[1]) {
    const leftShare = (main.width - gap) * layout.divider;
    frames[large[0].id] = { ...main, width: leftShare };
    frames[large[1].id] = { ...main, x: main.x + leftShare + gap, width: main.width - leftShare - gap };
    dividerX = main.x + leftShare + gap / 2;
  }

  // Between Chat's sidebar and the interfaces beside it: a bar to set Chat's width.
  let chatDividerX: number | undefined;
  if (!stacked && large.length > 0) {
    if (inRegion(layout, "left").some((entry) => entry.presentation === "sidebar") && columns.left) {
      chatDividerX = columns.left.x + columns.left.width + gap / 2;
    } else if (inRegion(layout, "right").some((entry) => entry.presentation === "sidebar") && columns.right) {
      chatDividerX = columns.right.x - gap / 2;
    }
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

  return { size, frames, icons, strip, panel, content, main, columns, dividerX, dividerY, chatDividerX };
}

/** Every large interface at least `minLarge` wide in a workspace this wide. */
export function fitsWidth(layout: WorkspaceLayout, width: number) {
  const { frames } = layoutGeometry(layout, { width, height: 800 });
  return inRegion(layout, "main").every((entry) => (frames[entry.id]?.width ?? 0) >= METRICS.minLarge);
}

/** Far end of a region; the controller normalizes it. */
const END = 1e9;
/** Over a large interface, a drop this close to the page's edge still goes to the side column there. */
const EDGE_BAND = 56;

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

  // Dropped on a large interface (not Chat, not itself): its top or bottom half stacks with it, its left or right
  // half puts the two side by side. This wins over the side columns, except in a thin band at the page's edge.
  const others = inRegion(layout, "main").filter((entry) => entry.id !== id);
  const over = others.find((entry) => {
    const rect = geometry.frames[entry.id];
    return !entry.chat && rect && point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  });
  const overRect = over && geometry.frames[over.id];
  const atEdge = point.x < content.x + EDGE_BAND || point.x > content.x + content.width - EDGE_BAND;
  if (overRect && !atEdge) {
    const sideways = (point.x - overRect.x) / (overRect.width || 1) - 0.5;
    const upDown = (point.y - overRect.y) / (overRect.height || 1) - 0.5;
    const hasChat = Object.values(layout.entries).some((entry) => entry.chat);
    const canStack = hasChat && layoutRules().largeStacked;
    const stack = canStack && (Math.abs(upDown) > Math.abs(sideways) || !layoutRules().largeSideBySide);
    if (stack) return { type: "move", id, region: "main", order: upDown < 0 ? -1 : END, stacked: true };
    if (layoutRules().largeSideBySide) {
      // Beside it: before it on its left half, after it on its right.
      return { type: "move", id, region: "main", order: sideways < 0 ? over!.order - 0.5 : over!.order + 0.5, stacked: false };
    }
  }

  const leftEdge = columns.left ? columns.left.x + columns.left.width : content.x + content.width * 0.18;
  const rightEdge = columns.right ? columns.right.x : content.x + content.width * 0.82;
  // A column that doesn't stack holds one: it goes at the top.
  if (point.x < leftEdge) return { type: "move", id, region: "left", order: top || !layoutRules().leftStack ? -1 : END };
  if (point.x > rightEdge) {
    // The right side by height: its middle makes an extended medium (full height), its top or bottom a medium in that slot.
    const dragged = layout.entries[id];
    const share = (point.y - content.y) / (content.height || 1);
    if (dragged && !dragged.chat && layoutRules().extended && share > 1 / 3 && share < 2 / 3) {
      return { type: "move", id, region: "right", order: END, size: "extended" };
    }
    const size = dragged && !dragged.chat ? ("medium" as const) : undefined;
    return { type: "move", id, region: "right", order: top || !layoutRules().rightStack ? -1 : END, ...(size ? { size } : {}) };
  }

  if (others.length === 0) return { type: "move", id, region: "main", order: 0 };
  // Which edge of the main area the point is nearest, as shares of its size.
  const across = (point.x - main.x) / (main.width || 1) - 0.5;
  const down = (point.y - main.y) / (main.height || 1) - 0.5;
  // Top or bottom only beside Chat's sidebar: stacking never spans the full page. Without side by side, it stacks.
  const stacked = canStackLarge(layout) && (Math.abs(down) > Math.abs(across) || !layoutRules().largeSideBySide);
  const first = stacked ? down < 0 : across < 0;
  return { type: "move", id, region: "main", order: first ? -1 : END, stacked };
}
