import { describe, expect, it } from "vitest";
import { fitsWidth, layoutGeometry } from "../workbench-geometry";
import {
  addEntry,
  applyLayoutChange,
  describePlacement,
  inRegion,
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

  it("makes an extended medium take its whole column", () => {
    const result = applyLayoutChange(research(), { type: "present", id: "search", presentation: "extended" }, 10);
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
    // Chat's column was used before Document, so the chat sidebar is minimized.
    expect(result.evicted).toEqual(["chat"]);
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

  it("lets a lone medium take its whole column", () => {
    const moved = applyLayoutChange(research(), { type: "present", id: "table", presentation: "minimized" }, 10).layout;
    const geometry = layoutGeometry(moved, { width: 1400, height: 800 });
    expect(geometry.frames.search!.height).toBe(geometry.content.height);
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
