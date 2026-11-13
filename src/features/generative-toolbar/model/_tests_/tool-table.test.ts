import { describe, expect, it } from "vitest";
import type { ToolSpec } from "../tool-spec";
import { applyDiff, clearUnpinned, dismissTool, emptyTable, pinTool, SHOW_AT, tableForModel, visibleTools } from "../tool-table";

const action = (id: string, extra: Partial<ToolSpec> = {}): ToolSpec =>
  ({ type: "action", id, label: id, detail: "", icon: "sparkles", impact: 3, fit: 0.8, done: 0, ...extra }) as ToolSpec;

describe("the tool table", () => {
  it("keeps a changed tool in its place and adds new ones at the end", () => {
    let table = applyDiff("table", emptyTable(), { add: [action("a"), action("b"), action("c")] });
    table = applyDiff("table", table, { add: [action("b", { label: "b again" }), action("d")] });
    const { tools } = visibleTools("table", table, 5);
    expect(tools.map((tool) => tool.label)).toEqual(["a", "b again", "c", "d"]);
  });

  it("shows the best few, in the order they arrived", () => {
    let table = applyDiff("table", emptyTable(), {
      add: [action("a", { impact: 1 }), action("b", { impact: 5 }), action("c", { impact: 4 })],
    });
    expect(visibleTools("table", table, 2).tools.map((tool) => tool.id)).toEqual(["b", "c"]);
    table = applyDiff("table", table, { scores: [{ id: "c", done: 1 }] });
    expect(visibleTools("table", table, 2).tools.map((tool) => tool.id)).toEqual(["a", "b"]);
  });

  it("hides what isn't worth a place, and drops what no longer applies", () => {
    let table = applyDiff("table", emptyTable(), { add: [action("a", { fit: 0.1 }), action("b"), action("c")] });
    expect(visibleTools("table", table, 5).tools.map((tool) => tool.id)).toEqual(["b", "c"]);
    expect(SHOW_AT).toBeGreaterThan(0.6 * 0.1 * 1);
    table = applyDiff("table", table, { drop: ["b"] });
    expect(Object.keys(table.rows)).toEqual(["a", "c"]);
  });

  it("leaves pinned tools alone, and keeps them through a regenerate", () => {
    let table = applyDiff("table", emptyTable(), { add: [action("a"), action("b")] });
    table = pinTool(table, "a");
    table = applyDiff("table", table, { add: [action("a", { label: "changed" })], scores: [{ id: "a", done: 1 }], drop: ["a"] });
    expect(table.rows.a?.tool.label).toBe("a");
    expect(visibleTools("table", table, 5).tools.map((tool) => tool.id)).toContain("a");
    const { table: kept, cleared } = clearUnpinned(table);
    expect(Object.keys(kept.rows)).toEqual(["a"]);
    expect(cleared).toEqual(["b"]);
    expect(tableForModel(kept)[0]).toMatchObject({ id: "a", pinned: true });
  });

  it("never takes a tool that repeats the interface's own", () => {
    const table = applyDiff("search", emptyTable(), { add: [action("when", { jobs: ["time-filter"] }), action("more")] });
    expect(Object.keys(table.rows)).toEqual(["more"]);
  });

  it("never shows a dismissed tool again, and keeps it for the model to avoid", () => {
    let table = applyDiff("table", emptyTable(), { add: [action("a"), action("b")] });
    table = dismissTool(table, "a");
    table = applyDiff("table", table, { add: [action("a", { label: "back again" })], drop: ["a"] });
    expect(visibleTools("table", table, 5).tools.map((tool) => tool.id)).toEqual(["b"]);
    expect(clearUnpinned(table).table.rows.a?.dismissed).toBe(true);
    expect(tableForModel(table)[0]).toMatchObject({ id: "a", label: "a", dismissed: true });
  });
});
