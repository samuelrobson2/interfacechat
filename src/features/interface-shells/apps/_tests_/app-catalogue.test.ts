import { describe, expect, it } from "vitest";
import { applyCatalogueOperations, CATALOGUE, readCatalogueValue } from "../../model/shell-catalogue";
import { appToCatalogue, catalogueToApp, catalogueToPieces, piecesToCatalogue } from "../app-catalogue";
import { dashboardFixture, HEAT_PIECES } from "../app-fixtures";
import type { DashboardShellData } from "../app-types";

const uploaded: DashboardShellData = {
  ...dashboardFixture,
  datasets: dashboardFixture.datasets.map((dataset) =>
    dataset.id === "sales"
      ? { ...dataset, source: { type: "upload", fileName: "till.csv", addedAt: "2026-11-12" }, rows: dataset.rows.slice(0, 12) }
      : dataset,
  ),
};

describe("Dashboard, and a document's live pieces, in the catalogue", () => {
  it("round-trips through what the model reads and writes", () => {
    const value = appToCatalogue(dashboardFixture);
    expect(CATALOGUE.dashboard.schema.safeParse(value).success).toBe(true);
    expect(catalogueToApp(value, dashboardFixture)).toEqual(dashboardFixture);

    const doc = { title: "Urban heat islands", body: "Intro.\n\n::scatter", ...piecesToCatalogue(HEAT_PIECES) };
    expect(CATALOGUE.document.schema.safeParse(doc).success).toBe(true);
    expect(catalogueToPieces(doc, HEAT_PIECES)).toEqual(HEAT_PIECES);
  });

  it("shows the person's data by its first rows, and never takes the model's rows for it", () => {
    const value = appToCatalogue(uploaded);
    const sales = value.datasets.find((d) => d.id === "sales")!;
    expect(sales).toMatchObject({ from: "yours", rowCount: 12 });
    expect(sales.rows).toHaveLength(5);

    const forged = { ...value, datasets: value.datasets.map((d) => (d.id === "sales" ? { ...d, from: "sample" as const, rows: [["x"]] } : d)) };
    expect(catalogueToApp(forged, uploaded).datasets.find((d) => d.id === "sales")).toEqual(uploaded.datasets[0]);
  });

  it("keeps the person's data when a rewrite leaves it out", () => {
    const rewrite = { ...appToCatalogue(uploaded), datasets: [] };
    expect(catalogueToApp(rewrite, uploaded).datasets.map((d) => d.id)).toEqual(["sales"]);
  });

  it("drops data the model claims is the person's when there's none", () => {
    const value = { ...appToCatalogue(dashboardFixture) };
    value.datasets = [{ id: "invented", label: "Invented", from: "yours", columns: ["a"], rows: [[1]] }];
    expect(catalogueToApp(value, undefined).datasets).toEqual([]);
  });

  it("keeps sample data shown in part", () => {
    const long: DashboardShellData = {
      ...dashboardFixture,
      datasets: [{ id: "big", label: "Big", source: { type: "generated" }, rows: Array.from({ length: 100 }, (_, i) => ({ i })) }],
    };
    const value = appToCatalogue(long);
    expect(value.datasets[0]).toMatchObject({ rowCount: 100 });
    expect(catalogueToApp(value, long).datasets[0]!.rows).toHaveLength(100);
  });

  it("reads a fill while it streams, leaving out the block still being written", () => {
    const partial = {
      title: "Sales",
      datasets: [{ id: "s", label: "S", from: "sample", columns: ["month", "revenue"], rows: [["Jan", 10], ["Feb"]] }],
      variables: [],
      blocks: [
        { type: "stat", id: "total", label: "Total", dataset: "s", field: "revenue", op: "sum" },
        { type: "chart", id: "by-month", dataset: "s" },
      ],
    };
    const value = readCatalogueValue("dashboard", partial)!;
    expect(value.datasets[0]!.rows).toEqual([["Jan", 10], ["Feb", null]]);
    expect(value.blocks.map((block) => block.id)).toEqual(["total"]);
  });

  it("patches one block, and refuses a patch that breaks it", () => {
    const value = appToCatalogue(dashboardFixture);
    const index = value.blocks.findIndex((block) => block.id === "by-month");
    const ok = applyCatalogueOperations("dashboard", value, [{ op: "replace", path: `/blocks/${index}/mark`, value: "bar" }]);
    expect(ok.ok && ok.value.blocks[index]).toMatchObject({ mark: "bar" });
    const bad = applyCatalogueOperations("dashboard", value, [{ op: "replace", path: `/blocks/${index}/mark`, value: "donut" }]);
    expect(bad.ok).toBe(false);
  });
});
