import { artefactCatalogueKind, artefactCatalogueValue, catalogueArtefactPatch, newCatalogueArtefact } from "../catalogue-adapters";
import type { ChatLabArtefact } from "../chat-lab-store";

const base = { id: "a", title: "T", content: "", filters: [], sourceUserMessageId: null, pinned: false };

describe("catalogue adapters", () => {
  it("round-trips a table through its markdown", () => {
    const artefact = { ...base, kind: "table" } as ChatLabArtefact;
    const value = { title: "Shots", columns: [{ label: "Shot" }, { label: "Framing" }], rows: [["1", "Wide"], ["2", "Close-up"]] };
    const patch = catalogueArtefactPatch(artefact, value)!;
    const read = artefactCatalogueValue({ ...artefact, title: patch.title!, content: patch.content! });
    expect(read).toMatchObject({ title: "Shots", rows: value.rows });
  });

  it("fills a tracker and keeps item ids by position", () => {
    const made = newCatalogueArtefact("tracker", "Prep");
    const artefact = { ...base, ...made } as ChatLabArtefact;
    expect(artefactCatalogueKind(artefact)).toBe("tracker");
    const first = catalogueArtefactPatch(artefact, { title: "Prep", items: [{ label: "Book van", group: "Kit" }] })!;
    const second = catalogueArtefactPatch({ ...artefact, shell: first.shell }, { title: "Prep", items: [{ label: "Book van", group: "Kit" }, { label: "Call cast", done: true }] })!;
    const data = second.shell!.data as { groups: string[]; items: { id: string; done: boolean }[] };
    expect(data.groups).toEqual(["Kit"]);
    expect(data.items.map((item) => item.id)).toEqual(["item-0", "item-1"]);
    expect(data.items.map((item) => item.done)).toEqual([false, true]);
    expect(artefactCatalogueValue({ ...artefact, shell: second.shell })).toMatchObject({ items: [{ label: "Book van" }, { label: "Call cast", done: true }] });
  });

  it("fills a dashboard opened in a thread, sample data and all", () => {
    const made = newCatalogueArtefact("dashboard", "Café sales");
    const artefact = { ...base, ...made } as ChatLabArtefact;
    expect(artefactCatalogueKind(artefact)).toBe("dashboard");
    const patch = catalogueArtefactPatch(artefact, {
      title: "Café sales",
      datasets: [{ id: "sales", label: "Sales", from: "sample", columns: ["month", "revenue"], rows: [["Jan", 10], ["Feb", 12]] }],
      variables: [],
      blocks: [{ type: "stat", id: "total", label: "Revenue", dataset: "sales", field: "revenue", op: "sum" }],
    })!;
    const data = patch.shell!.data as { datasets: { source: { type: string }; rows: unknown[] }[]; blocks: unknown[] };
    expect(data.datasets[0]).toMatchObject({ source: { type: "generated" }, rows: [{ month: "Jan", revenue: 10 }, { month: "Feb", revenue: 12 }] });
    expect(data.blocks).toHaveLength(1);
    expect(artefactCatalogueValue({ ...artefact, shell: patch.shell })).toMatchObject({ datasets: [{ from: "sample" }] });
  });

  it("leaves other interfaces to themselves", () => {
    expect(artefactCatalogueKind({ ...base, kind: "search" } as ChatLabArtefact)).toBeNull();
  });
});
