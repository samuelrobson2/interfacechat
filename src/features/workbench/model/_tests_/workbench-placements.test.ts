import { describe, expect, it } from "vitest";
import { layoutGeometry } from "../workbench-geometry";
import { addEntry, applyLayoutChange, previewLayoutChange, type LayoutChange, type WorkspaceLayout } from "../workbench-layout";
import { placementOptions } from "../workbench-placements";
import { DEFAULT_LAYOUT_RULES, withLayoutRules } from "../workbench-rules";

/** Chat in the left sidebar, Document large, Search medium on the right. */
function layout(): WorkspaceLayout {
  let next: WorkspaceLayout = { entries: {}, divider: 0.5 };
  const steps: [string, boolean, LayoutChange][] = [
    ["chat", true, { type: "move", id: "chat", region: "left", order: 0 }],
    ["search", false, { type: "move", id: "search", region: "right", order: 0 }],
    ["doc", false, { type: "move", id: "doc", region: "main", order: 0 }],
  ];
  steps.forEach(([id, chat, change], index) => {
    next = addEntry(next, id, chat, index);
    next = applyLayoutChange(next, change, index).layout;
  });
  return next;
}

const options = (current: WorkspaceLayout, id: string) =>
  withLayoutRules(DEFAULT_LAYOUT_RULES, () =>
    placementOptions(
      current,
      current.entries[id]!,
      (change) => previewLayoutChange(current, change),
      (next) => layoutGeometry(next, { width: 1440, height: 900 }, { insetLeft: 72 }),
    ),
  );

describe("placement options", () => {
  it("offers each place once, marks where it is, and never offers minimize", () => {
    const list = options(layout(), "search");
    expect(list.filter((option) => option.current)).toHaveLength(1);
    expect(list.find((option) => option.current)?.label).toBe("Medium, right");
    expect(new Set(list.map((option) => option.label)).size).toBe(list.length);
    expect(list.some((option) => option.result.layout.entries.search?.presentation === "minimized")).toBe(false);
    expect(list.map((option) => option.label)).toEqual(
      expect.arrayContaining(["Large, left", "Large, right", "Large, top", "Large, bottom", "Extended medium, right"]),
    );
  });

  it("offers Chat its sidebar and large, nothing medium", () => {
    const list = options(layout(), "chat");
    expect(list.find((option) => option.current)?.label).toBe("Sidebar, left");
    expect(list.some((option) => /medium/i.test(option.label))).toBe(false);
  });
});
