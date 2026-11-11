import {
  CATALOGUE,
  CATALOGUE_KINDS,
  applyCatalogueOperations,
  catalogueFields,
  readCatalogueValue,
} from "../shell-catalogue";

const table = {
  title: "Shots",
  columns: [{ label: "Shot" }, { label: "Framing" }],
  rows: [
    ["1", "Wide"],
    ["2", "Close-up"],
  ],
};

const tracker = {
  title: "Prep",
  items: [{ label: "Book van", done: false }, { label: "Call cast", owner: "Ana", done: false }],
};

describe("catalogue", () => {
  it("has one entry and one fill tool per interface", () => {
    for (const kind of CATALOGUE_KINDS) expect(CATALOGUE[kind].tool).toBe(`fill_${kind}`);
  });

  it("writes the fields the model reads from the schema", () => {
    const fields = catalogueFields("tracker");
    expect(fields).toContain("title (text, required)");
    expect(fields).toContain("placement (inline | window)");
    expect(fields).toContain("items (list, required)");
    expect(fields).toContain("Each: label (text, required)");
  });
});

describe("reading a fill as it streams", () => {
  it("takes a document whose body is still being written", () => {
    expect(readCatalogueValue("document", { title: "Memo", body: "## Why\n\nBecause" })).toEqual({
      title: "Memo",
      body: "## Why\n\nBecause",
    });
    expect(readCatalogueValue("document", { title: "Me" })).toEqual({ title: "Me", body: "" });
  });

  it("squares up a table mid-row and drops a column with no label yet", () => {
    const value = readCatalogueValue("table", {
      title: "Shots",
      columns: [{ label: "Shot" }, { label: "Framing", type: "tag" }, {}],
      rows: [["1", "Wide"], ["2"]],
    });
    expect(value?.columns).toEqual([{ label: "Shot" }, { label: "Framing", type: "tag" }]);
    expect(value?.rows).toEqual([
      ["1", "Wide"],
      ["2", ""],
    ]);
  });

  it("keeps tracker items that have their text", () => {
    const value = readCatalogueValue("tracker", { title: "Prep", items: [{ label: "Book van", owner: "Sam" }, { owner: "Ana" }] });
    expect(value?.items).toEqual([{ label: "Book van", owner: "Sam" }]);
  });

  it("only takes a placement it knows", () => {
    expect(readCatalogueValue("document", { title: "A", placement: "win" })?.placement).toBeUndefined();
    expect(readCatalogueValue("document", { title: "A", placement: "window" })?.placement).toBe("window");
  });

  it("reads nothing from nothing", () => {
    expect(readCatalogueValue("table", undefined)).toBeNull();
  });
});

describe("changing part of an interface", () => {
  it("replaces a cell, adds a row and removes one", () => {
    const result = applyCatalogueOperations("table", table, [
      { op: "replace", path: "/rows/1/1", value: "Medium" },
      { op: "add", path: "/rows/-", value: ["3", "Wide"] },
      { op: "remove", path: "/rows/0" },
    ]);
    expect(result).toEqual({ ok: true, value: { ...table, rows: [["2", "Medium"], ["3", "Wide"]] } });
  });

  it("keeps cells under their columns when a column is added or removed", () => {
    const added = applyCatalogueOperations("table", table, [{ op: "add", path: "/columns/1", value: { label: "Cast" } }]);
    expect(added.ok && added.value.rows[0]).toEqual(["1", "", "Wide"]);
    const removed = applyCatalogueOperations("table", table, [{ op: "remove", path: "/columns/0" }]);
    expect(removed.ok && removed.value.rows).toEqual([["Wide"], ["Close-up"]]);
  });

  it("ticks an item and renames the tracker", () => {
    const result = applyCatalogueOperations("tracker", tracker, [
      { op: "replace", path: "/items/0/done", value: true },
      { op: "replace", path: "/title", value: "Shoot prep" },
    ]);
    expect(result.ok && result.value.items[0]?.done).toBe(true);
    expect(result.ok && result.value.title).toBe("Shoot prep");
  });

  it("leaves the original alone", () => {
    applyCatalogueOperations("tracker", tracker, [{ op: "remove", path: "/items/0" }]);
    expect(tracker.items).toHaveLength(2);
  });

  it("says why a change can't be made", () => {
    expect(applyCatalogueOperations("table", table, [{ op: "replace", path: "/rows/9/0", value: "x" }])).toMatchObject({ ok: false });
    expect(applyCatalogueOperations("table", table, [{ op: "replace", path: "rows", value: [] }])).toMatchObject({ ok: false });
    expect(applyCatalogueOperations("tracker", tracker, [{ op: "replace", path: "/items/0/done", value: "yes" }])).toMatchObject({ ok: false });
    expect(applyCatalogueOperations("tracker", tracker, [{ op: "add", path: "/items/-" }])).toMatchObject({ ok: false });
  });
});
