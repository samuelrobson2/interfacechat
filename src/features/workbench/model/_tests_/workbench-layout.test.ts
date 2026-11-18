import { describe, expect, it } from "vitest";
import { dropChange, fitsWidth, layoutGeometry } from "../workbench-geometry";
import { DEFAULT_LAYOUT_RULES, withLayoutRules } from "../workbench-rules";
import {
  addEntry,
  applyLayoutChange,
  describePlacement,
  inRegion,
  isStacked,
  presentationsFor,
  restoreArrangement,
  touchEntry,
  type LayoutChange,
  type WorkspaceLayout,
} from "../workbench-layout";

/** Chat in the left sidebar, Document large, Search and Table medium on the right. */
function research(): WorkspaceLayout {
  let layout: WorkspaceLayout = { entries: {}, divider: 0.5 };
  const steps: [string, boolean, LayoutChange][] = [
    ["chat", true, { type: "move", id: "chat", region: "left", order: 0 }],
    ["table", false, { type: "move", id: "table", region: "right", order: 1 }],
    ["search", false, { type: "move", id: "search", region: "right", order: 0 }],
    ["doc", false, { type: "move", id: "doc", region: "main", order: 0 }],
  ];
  steps.forEach(([id, chat, change], index) => {
    layout = addEntry(layout, id, chat, index);
    layout = applyLayoutChange(layout, change, index).layout;
  });
  return layout;
}

const at = (layout: WorkspaceLayout, id: string) => {
  const entry = layout.entries[id];
  return entry && `${entry.presentation} ${entry.region} ${entry.order}`;
};

describe("layout controller", () => {
  it("closes an interface off the workbench, minimize only puts it away", () => {
    const minimized = applyLayoutChange(research(), { type: "present", id: "search", presentation: "minimized" }, 9).layout;
    expect(at(minimized, "search")).toMatch(/^minimized strip/);
    const closed = applyLayoutChange(research(), { type: "close", id: "search" }, 9).layout;
    expect(closed.entries.search).toBeUndefined();
    // The rest of the column closes up.
    expect(at(closed, "table")).toBe("medium right 0");
    // Chat can't be closed.
    expect(applyLayoutChange(research(), { type: "close", id: "chat" }, 9).changed).toBe(false);
  });

  it("builds the starting arrangement", () => {
    const layout = research();
    expect(at(layout, "chat")).toBe("sidebar left 0");
    expect(at(layout, "search")).toBe("medium right 0");
    expect(at(layout, "table")).toBe("medium right 1");
    expect(at(layout, "doc")).toBe("large main 0");
  });

  it("minimizes the least recently used interface to make room, in the same transaction", () => {
    let layout = research();
    layout = addEntry(layout, "map", false, 10);
    const result = applyLayoutChange(layout, { type: "present", id: "map", presentation: "medium" }, 11);
    // Map lands on the right; Table was used before Search, so Table goes.
    expect(result.evicted).toEqual(["table"]);
    expect(at(result.layout, "map")).toBe("medium right 1");
    expect(at(result.layout, "table")).toBe("minimized strip 0");
  });

  it("uses recency, not position, to choose what to minimize", () => {
    let layout = touchEntry(research(), "table", 20);
    layout = addEntry(layout, "map", false, 21);
    const result = applyLayoutChange(layout, { type: "present", id: "map", presentation: "medium" }, 22);
    expect(result.evicted).toEqual(["search"]);
  });

  it("splits the main area, then minimizes when a third large arrives", () => {
    let layout = research();
    const split = applyLayoutChange(layout, { type: "present", id: "search", presentation: "large" }, 10);
    // Search came from the right column, so it takes the right slot.
    expect(at(split.layout, "doc")).toBe("large main 0");
    expect(at(split.layout, "search")).toBe("large main 1");
    expect(describePlacement(split.layout, split.layout.entries.search!)).toBe("large, right");
    layout = split.layout;
    const third = applyLayoutChange(layout, { type: "present", id: "table", presentation: "large" }, 11);
    expect(third.evicted).toEqual(["doc"]);
  });

  it("makes an extended medium take its whole column (two side by side off)", () => {
    const result = withLayoutRules({ ...DEFAULT_LAYOUT_RULES, extendedPair: false }, () =>
      applyLayoutChange(research(), { type: "present", id: "search", presentation: "extended" }, 10),
    );
    expect(at(result.layout, "search")).toBe("extended right 0");
    expect(result.evicted).toEqual(["table"]);
  });

  it("restores a minimized interface to where it was", () => {
    const minimized = applyLayoutChange(research(), { type: "present", id: "table", presentation: "minimized" }, 10);
    expect(at(minimized.layout, "table")).toBe("minimized strip 0");
    const reopened = applyLayoutChange(minimized.layout, { type: "open", id: "table" }, 11);
    expect(at(reopened.layout, "table")).toBe("medium right 1");
  });

  it("opens from the strip as a medium in the supporting column", () => {
    let layout = applyLayoutChange(research(), { type: "present", id: "doc", presentation: "minimized" }, 10).layout;
    layout = applyLayoutChange(layout, { type: "present", id: "table", presentation: "minimized" }, 11).layout;
    const result = applyLayoutChange(layout, { type: "support", id: "doc" }, 12);
    // It was large, but comes back as a medium under Search on the right.
    expect(at(result.layout, "doc")).toBe("medium right 1");
    expect(result.evicted).toEqual([]);
  });

  it("keeps chat to its own options", () => {
    const layout = research();
    expect(applyLayoutChange(layout, { type: "present", id: "chat", presentation: "medium" }, 10).changed).toBe(false);
    const large = applyLayoutChange(layout, { type: "present", id: "chat", presentation: "large" }, 10);
    // From the left sidebar it takes the left slot beside the document.
    expect(at(large.layout, "chat")).toBe("large main 0");
    expect(at(large.layout, "doc")).toBe("large main 1");
  });

  it("follows the region on a move", () => {
    const result = applyLayoutChange(research(), { type: "move", id: "doc", region: "right", order: 0 }, 10);
    expect(at(result.layout, "doc")).toBe("medium right 0");
    expect(result.evicted).toEqual(["table"]);
  });

  it("undoes the whole arrangement, evictions included, but keeps recency", () => {
    const before = research();
    const result = applyLayoutChange(before, { type: "present", id: "search", presentation: "extended" }, 10);
    const touched = touchEntry(result.layout, "doc", 50);
    const undone = restoreArrangement(before, touched);
    expect(at(undone, "search")).toBe("medium right 0");
    expect(at(undone, "table")).toBe("medium right 1");
    expect(undone.entries.doc?.lastInteraction).toBe(50);
  });

  it("applies presets as one change", () => {
    const result = applyLayoutChange(research(), { type: "preset", preset: "split" }, 10);
    // The two most recently used non-chat interfaces: Document, then Search.
    expect(inRegion(result.layout, "main").map((entry) => entry.id)).toEqual(["doc", "search"]);
    expect(at(result.layout, "table")).toBe("minimized strip 0");
  });

  it("makes room when two large interfaces would be too narrow", () => {
    // 1300 wide: two columns leave the main area too small to split; one is enough room.
    const fits = (layout: WorkspaceLayout) => fitsWidth(layout, 1300);
    const result = applyLayoutChange(
      research(),
      { type: "present", id: "search", presentation: "large" },
      10,
      { fits },
    );
    // Chat stays: the right column makes room instead, though Chat was used least recently.
    expect(result.evicted).toEqual(["table"]);
    expect(result.layout.entries.chat).toMatchObject({ presentation: "sidebar", region: "left" });
    expect(fits(result.layout)).toBe(true);
    expect(inRegion(result.layout, "main").map((entry) => entry.id)).toEqual(["doc", "search"]);
  });

  it("grows chat into the main area when nothing large is left", () => {
    const moved = applyLayoutChange(research(), { type: "present", id: "doc", presentation: "minimized" }, 10).layout;
    const geometry = layoutGeometry(moved, { width: 1400, height: 800 });
    const chat = geometry.frames.chat!;
    // Chat reaches the right column; its nominal column is still the sidebar.
    expect(chat.x + chat.width).toBe(geometry.columns.right!.x - 12);
    expect(geometry.columns.left!.width).toBeLessThan(chat.width);
  });

  it("keeps a lone medium medium: half its column, at the top, with nothing stretched into the rest", () => {
    const moved = applyLayoutChange(research(), { type: "present", id: "table", presentation: "minimized" }, 10).layout;
    const geometry = layoutGeometry(moved, { width: 1400, height: 800 });
    expect(geometry.frames.search!.y).toBe(geometry.content.y);
    expect(geometry.frames.search!.height).toBeLessThan(geometry.content.height / 2);
    // Extended medium is the one that takes the whole column.
    const extended = applyLayoutChange(moved, { type: "present", id: "search", presentation: "extended" }, 11).layout;
    expect(layoutGeometry(extended, { width: 1400, height: 800 }).frames.search!.height).toBe(geometry.content.height);
  });

  it("stacks only on the right: the left column holds one interface", () => {
    let layout = applyLayoutChange(research(), { type: "move", id: "chat", region: "strip", order: 0 }, 10).layout;
    layout = applyLayoutChange(layout, { type: "move", id: "search", region: "left", order: 0 }, 11).layout;
    const result = applyLayoutChange(layout, { type: "move", id: "table", region: "left", order: 1 }, 12);
    expect(inRegion(result.layout, "left").map((entry) => entry.id)).toEqual(["table"]);
    expect(result.evicted).toEqual(["search"]);
  });

  it("derives frames from state", () => {
    const geometry = layoutGeometry(research(), { width: 1400, height: 800 });
    const search = geometry.frames.search!;
    const table = geometry.frames.table!;
    expect(search.y).toBe(geometry.content.y);
    expect(table.y).toBeGreaterThan(search.y + search.height);
    expect(geometry.frames.chat!.x).toBe(geometry.content.x);
    expect(geometry.frames.doc!.x).toBeGreaterThan(geometry.frames.chat!.width);
  });
});

describe("stacked large interfaces", () => {
  /** Chat in the sidebar with Document and Table large. */
  const pair = () => {
    const moved = applyLayoutChange(research(), { type: "present", id: "table", presentation: "large" }, 10).layout;
    return moved;
  };

  it("draws two large interfaces one above the other, half the height each, beside Chat at half the width", () => {
    const base = applyLayoutChange(pair(), { type: "present", id: "search", presentation: "minimized" }, 11).layout;
    const stacked = applyLayoutChange(base, { type: "arrange", stacked: true }, 12).layout;
    const { frames, dividerX, dividerY, main } = layoutGeometry(stacked, { width: 1400, height: 800 });
    const [first, second] = inRegion(stacked, "main");
    const top = frames[first!.id]!;
    const bottom = frames[second!.id]!;
    expect(top.width).toBe(main.width);
    expect(bottom.width).toBe(main.width);
    expect(bottom.y).toBeGreaterThan(top.y + top.height);
    expect(top.height).toBeCloseTo(bottom.height, 0);
    // The bar is beside Chat, and Chat and the stack share the width evenly to start.
    expect(dividerY).toBeUndefined();
    expect(dividerX).toBeLessThan(top.x);
    expect(frames.chat!.width).toBeCloseTo(top.width, -1);
    expect(describePlacement(stacked, inRegion(stacked, "main")[0]!)).toBe("large, top");
  });

  it("fits stacked where side by side would not", () => {
    const stacked = applyLayoutChange(pair(), { type: "arrange", stacked: true }, 11).layout;
    expect(fitsWidth(stacked, 1150)).toBe(true);
    const fits = (layout: WorkspaceLayout) => fitsWidth(layout, 1150);
    const back = applyLayoutChange(stacked, { type: "arrange", stacked: false }, 12, { fits });
    expect(back.evicted.length).toBeGreaterThan(0);
  });

  it("stacks on a drop near the top or bottom of the main area", () => {
    const layout = research();
    const geometry = layoutGeometry(layout, { width: 1400, height: 800 });
    const { main } = geometry;
    const bottom = dropChange(layout, geometry, "table", { x: main.x + main.width / 2, y: main.y + main.height - 20 });
    expect(bottom).toMatchObject({ region: "main", stacked: true });
    const result = applyLayoutChange(layout, bottom, 10).layout;
    expect(result.stacked).toBe(true);
    expect(inRegion(result, "main").map((entry) => entry.id)).toEqual(["doc", "table"]);
    const right = dropChange(layout, geometry, "table", { x: main.x + main.width - 20, y: main.y + main.height / 2 });
    expect(right).toMatchObject({ region: "main", stacked: false });
  });

  it("never stacks across the full page: without Chat's sidebar on the left, two large sit side by side", () => {
    const stacked = applyLayoutChange(pair(), { type: "arrange", stacked: true }, 11).layout;
    const noSidebar = applyLayoutChange(stacked, { type: "present", id: "chat", presentation: "minimized" }, 12).layout;
    const { dividerX, dividerY } = layoutGeometry(noSidebar, { width: 1600, height: 800 });
    expect(dividerY).toBeUndefined();
    expect(dividerX).toBeDefined();
    // And a drop near the top or bottom only offers side by side.
    const geometry = layoutGeometry(noSidebar, { width: 1600, height: 800 });
    const drop = dropChange(noSidebar, geometry, "table", { x: geometry.main.x + geometry.main.width / 2, y: geometry.main.y + geometry.main.height - 20 });
    expect(drop).toMatchObject({ stacked: false });
  });

  it("brings Chat in as the sidebar when stacked is chosen without it", () => {
    const noSidebar = applyLayoutChange(pair(), { type: "present", id: "chat", presentation: "minimized" }, 11).layout;
    const stacked = applyLayoutChange(noSidebar, { type: "arrange", stacked: true }, 12).layout;
    expect(stacked.entries.chat).toMatchObject({ presentation: "sidebar", region: "left" });
    expect(layoutGeometry(stacked, { width: 1400, height: 800 }).dividerX).toBeDefined();
  });

  it("stacks on a drop onto the bottom half of a large interface, bringing Chat from the page into its sidebar", () => {
    // Chat as the page (large) beside Document, Table medium on the right.
    let layout = applyLayoutChange(research(), { type: "present", id: "chat", presentation: "large" }, 10).layout;
    layout = applyLayoutChange(layout, { type: "present", id: "search", presentation: "minimized" }, 11).layout;
    const geometry = layoutGeometry(layout, { width: 1600, height: 1000 });
    const doc = geometry.frames.doc!;
    const drop = dropChange(layout, geometry, "table", { x: doc.x + doc.width / 2, y: doc.y + doc.height * 0.8 });
    expect(drop).toMatchObject({ region: "main", stacked: true });
    const result = applyLayoutChange(layout, drop, 12).layout;
    expect(result.entries.chat).toMatchObject({ presentation: "sidebar", region: "left" });
    expect(inRegion(result, "main").map((entry) => entry.id)).toEqual(["doc", "table"]);
    expect(isStacked(result)).toBe(true);
  });

  it("puts two side by side on a drop onto the right half of a large interface, not into the right column", () => {
    const pair = applyLayoutChange(research(), { type: "present", id: "table", presentation: "large" }, 10).layout;
    const stacked = applyLayoutChange(pair, { type: "arrange", stacked: true }, 11).layout;
    const geometry = layoutGeometry(stacked, { width: 1600, height: 1000 });
    const [top, bottom] = inRegion(stacked, "main");
    const rect = geometry.frames[top!.id]!;
    const drop = dropChange(stacked, geometry, bottom!.id, { x: rect.x + rect.width * 0.85, y: rect.y + rect.height / 2 });
    expect(drop).toMatchObject({ region: "main", stacked: false });
    const result = applyLayoutChange(stacked, drop, 12).layout;
    expect(inRegion(result, "main").map((entry) => entry.id)).toEqual([top!.id, bottom!.id]);
    expect(isStacked(result)).toBe(false);
    const frames = layoutGeometry(result, { width: 1600, height: 1000 }).frames;
    expect(frames[top!.id]!.width).toBeCloseTo(frames[bottom!.id]!.width, 0);
  });

  it("sets Chat's width from the bar beside it", () => {
    const one = applyLayoutChange(research(), { type: "present", id: "search", presentation: "minimized" }, 10).layout;
    const before = layoutGeometry(one, { width: 1600, height: 1000 });
    expect(before.chatDividerX).toBeDefined();
    const wider = applyLayoutChange(one, { type: "chatWidth", ratio: 0.4 }, 11).layout;
    expect(layoutGeometry(wider, { width: 1600, height: 1000 }).frames.chat!.width).toBeGreaterThan(before.frames.chat!.width);
  });

  it("never stretches two stacked mediums across the full page when nothing else is open", () => {
    let layout = applyLayoutChange(research(), { type: "present", id: "chat", presentation: "minimized" }, 10).layout;
    layout = applyLayoutChange(layout, { type: "present", id: "doc", presentation: "minimized" }, 11).layout;
    expect(inRegion(layout, "right")).toHaveLength(2);
    const { frames, content } = layoutGeometry(layout, { width: 2000, height: 1000 });
    expect(frames.search!.width).toBeLessThanOrEqual(content.width / 2);
    expect(frames.table!.width).toBe(frames.search!.width);
  });

  it("keeps Chat when a third large comes in: Chat, as the page, moves into its sidebar instead of minimizing", () => {
    // Chat as the page beside Document; Table dragged into the main area.
    let layout = applyLayoutChange(research(), { type: "present", id: "chat", presentation: "large" }, 10).layout;
    layout = applyLayoutChange(layout, { type: "present", id: "search", presentation: "minimized" }, 11).layout;
    const result = applyLayoutChange(layout, { type: "move", id: "table", region: "main", order: 9 }, 12, { fits: (next) => fitsWidth(next, 1600) });
    expect(result.evicted).not.toContain("chat");
    expect(result.layout.entries.chat).toMatchObject({ presentation: "sidebar", region: "left" });
    expect(inRegion(result.layout, "main").map((entry) => entry.id)).toEqual(["doc", "table"]);
  });

  it("undo brings back the arrangement", () => {
    const before = pair();
    const stacked = applyLayoutChange(before, { type: "arrange", stacked: true }, 11).layout;
    expect(restoreArrangement(before, stacked).stacked).toBeFalsy();
  });
});

describe("layout rules", () => {
  const rules = (patch: Partial<typeof DEFAULT_LAYOUT_RULES>) => ({ ...DEFAULT_LAYOUT_RULES, ...patch });

  it("with right stacking off, the right column holds one", () => {
    withLayoutRules(rules({ rightStack: false }), () => {
      const result = applyLayoutChange(research(), { type: "move", id: "doc", region: "right", order: 9 }, 20);
      expect(inRegion(result.layout, "right")).toHaveLength(1);
    });
  });

  it("with a lone medium filling its column, it takes the whole column", () => {
    const one = applyLayoutChange(research(), { type: "present", id: "table", presentation: "minimized" }, 10).layout;
    withLayoutRules(rules({ mediumAloneFills: true }), () => {
      const geometry = layoutGeometry(one, { width: 1400, height: 800 });
      expect(geometry.frames.search!.height).toBe(geometry.content.height);
    });
  });

  it("with extended medium off, the size menu doesn't offer it", () => {
    withLayoutRules(rules({ extended: false }), () => {
      expect(presentationsFor({ chat: false })).not.toContain("extended");
    });
  });

  it("with side by side off, two large stack beside Chat's sidebar", () => {
    const pair = applyLayoutChange(research(), { type: "present", id: "table", presentation: "large" }, 10).layout;
    withLayoutRules(rules({ largeSideBySide: false }), () => {
      expect(isStacked(pair)).toBe(true);
      expect(layoutGeometry(pair, { width: 1400, height: 800 }).dividerY).toBeUndefined();
    });
  });

  it("with stacking off, Stacked can't be chosen", () => {
    const pair = applyLayoutChange(research(), { type: "present", id: "table", presentation: "large" }, 10).layout;
    withLayoutRules(rules({ largeStacked: false }), () => {
      expect(applyLayoutChange(pair, { type: "arrange", stacked: true }, 11).changed).toBe(false);
    });
  });
});

describe("two extended medium side by side", () => {
  it("keeps both on the right, full height, next to each other", () => {
    let layout = research(); // chat sidebar left, doc large, search + table medium right
    layout = applyLayoutChange(layout, { type: "present", id: "search", presentation: "extended" }, 10).layout;
    expect(layout.entries.search?.presentation).toBe("extended");
    // The other one in the column goes extended too, rather than being put away.
    expect(layout.entries.table?.presentation).toBe("extended");
    expect(layout.entries.table?.region).toBe("right");
    const geometry = layoutGeometry(layout, { width: 2400, height: 1000 });
    const a = geometry.frames.search!;
    const b = geometry.frames.table!;
    expect(a.height).toBe(b.height);
    expect(a.y).toBe(b.y);
    expect(b.x).toBeGreaterThan(a.x + a.width);
  });
});

describe("dropping on the right side", () => {
  it("makes a medium at the top or bottom, and an extended medium in the middle", () => {
    const layout = research();
    const geometry = layoutGeometry(layout, { width: 2400, height: 1000 });
    const right = geometry.content.x + geometry.content.width - 10;
    const at = (share: number) => ({ x: right, y: geometry.content.y + geometry.content.height * share });
    expect(dropChange(layout, geometry, "doc", at(0.1))).toMatchObject({ region: "right", order: -1, size: "medium" });
    expect(dropChange(layout, geometry, "doc", at(0.9))).toMatchObject({ region: "right", size: "medium" });
    expect(dropChange(layout, geometry, "doc", at(0.5))).toMatchObject({ region: "right", size: "extended" });
    const moved = applyLayoutChange(layout, dropChange(layout, geometry, "doc", at(0.5)), 20).layout;
    expect(moved.entries.doc?.presentation).toBe("extended");
  });
});
