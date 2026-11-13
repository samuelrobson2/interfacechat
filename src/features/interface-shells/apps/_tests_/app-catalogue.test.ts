import { describe, expect, it } from "vitest";
import { applyCatalogueOperations, CATALOGUE, readCatalogueValue } from "../../model/shell-catalogue";
import { appToCatalogue, catalogueToApp } from "../app-catalogue";
import { articleFixture, dashboardFixture } from "../app-fixtures";
import type { DashboardShellData } from "../app-types";

const uploaded: DashboardShellData = {
  ...dashboardFixture,
  datasets: dashboardFixture.datasets.map((dataset) =>
    dataset.id === "sales"
      ? { ...dataset, source: { type: "upload", fileName: "till.csv", addedAt: "2026-11-12" }, rows: dataset.rows.slice(0, 12) }
      : dataset,
  ),
};

describe("Dashboard and Article in the catalogue", () => {
  it("round-trips through what the model reads and writes", () => {
    for (const [kind, data] of [["dashboard", dashboardFixture], ["article", articleFixture]] as const) {
      const value = appToCatalogue(kind, data);
      expect(CATALOGUE[kind].schema.safeParse(value).success).toBe(true);
      expect(catalogueToApp(kind, value, data)).toEqual(data);
    }
  });

  it("shows the person's data by its first rows, and never takes the model's rows for it", () => {
    const value = appToCatalogue("dashboard", uploaded);
    const sales = value.datasets.find((d) => d.id === "sales")!;
    expect(sales).toMatchObject({ from: "yours", rowCount: 12 });
    expect(sales.rows).toHaveLength(5);

    const forged = { ...value, datasets: value.datasets.map((d) => (d.id === "sales" ? { ...d, from: "sample" as const, rows: [["x"]] } : d)) };
    expect(catalogueToApp("dashboard", forged, uploaded).datasets.find((d) => d.id === "sales")).toEqual(uploaded.datasets[0]);
  });

  it("keeps the person's data when a rewrite leaves it out", () => {
    const rewrite = { ...appToCatalogue("dashboard", uploaded), datasets: [] };
    expect(catalogueToApp("dashboard", rewrite, uploaded).datasets.map((d) => d.id)).toEqual(["sales"]);
  });

  it("drops data the model claims is the person's when there's none", () => {
    const value = { ...appToCatalogue("dashboard", dashboardFixture) };
    value.datasets = [{ id: "invented", label: "Invented", from: "yours", columns: ["a"], rows: [[1]] }];
    expect(catalogueToApp("dashboard", value, undefined).datasets).toEqual([]);
  });

  it("keeps sample data shown in part", () => {
    const long: DashboardShellData = {
      ...dashboardFixture,
      datasets: [{ id: "big", label: "Big", source: { type: "generated" }, rows: Array.from({ length: 100 }, (_, i) => ({ i })) }],
    };
    const value = appToCatalogue("dashboard", long);
    expect(value.datasets[0]).toMatchObject({ rowCount: 100 });
    expect(catalogueToApp("dashboard", value, long).datasets[0]!.rows).toHaveLength(100);
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
    const value = appToCatalogue("dashboard", dashboardFixture);
    const index = value.blocks.findIndex((block) => block.id === "by-month");
    const ok = applyCatalogueOperations("dashboard", value, [{ op: "replace", path: `/blocks/${index}/mark`, value: "bar" }]);
    expect(ok.ok && ok.value.blocks[index]).toMatchObject({ mark: "bar" });
    const bad = applyCatalogueOperations("dashboard", value, [{ op: "replace", path: `/blocks/${index}/mark`, value: "donut" }]);
    expect(bad.ok).toBe(false);
  });
});
