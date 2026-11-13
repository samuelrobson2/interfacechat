import { describe, expect, it } from "vitest";
import { articleFixture, dashboardFixture, emptyArticle, emptyDashboard } from "../app-fixtures";
import {
  ALL,
  aggregate,
  datasetId,
  interpolate,
  parseDelimited,
  parseJsonRows,
  runQuery,
} from "../app-query";
import { articleSchema, dashboardSchema, type Row } from "../app-types";

const rows: Row[] = [
  { month: "Jan", monthIndex: 1, region: "North", revenue: 100 },
  { month: "Feb", monthIndex: 2, region: "North", revenue: 150 },
  { month: "Jan", monthIndex: 1, region: "City", revenue: 300 },
];

describe("runQuery", () => {
  const where = [
    { field: "region", op: "eq" as const, value: "$region" },
    { field: "monthIndex", op: "gte" as const, value: "$from" },
  ];

  it("reads variables into filters", () => {
    expect(runQuery(rows, { where }, { region: "North", from: 2 })).toEqual([rows[1]]);
  });

  it("switches a filter off for All", () => {
    expect(runQuery(rows, { where }, { region: ALL, from: 1 })).toHaveLength(3);
  });

  it("sorts and limits", () => {
    const top = runQuery(rows, { sort: { field: "revenue", dir: "desc" }, limit: 2 }, {});
    expect(top.map((row) => row.revenue)).toEqual([300, 150]);
  });
});

describe("aggregate", () => {
  it("sums, averages and counts", () => {
    expect(aggregate(rows, "revenue", "sum")).toBe(550);
    expect(aggregate(rows, "revenue", "mean")).toBeCloseTo(183.33, 1);
    expect(aggregate(rows, "revenue", "count")).toBe(3);
    expect(aggregate([], "revenue", "sum")).toBeNull();
  });
});

describe("parsing what people bring", () => {
  it("reads CSV with quotes, thousands and empty cells", () => {
    const parsed = parseDelimited('name,revenue,note\n"Smith, J",1,200,\n"Lee ""LJ""",950,"two\nlines"\n');
    expect(parsed).toEqual([
      { name: "Smith, J", revenue: 1, note: 200 },
      { name: 'Lee "LJ"', revenue: 950, note: "two\nlines" },
    ]);
  });

  it("reads quoted thousands as numbers", () => {
    expect(parseDelimited('city,people\nLeeds,"812,000"')).toEqual([{ city: "Leeds", people: 812000 }]);
  });

  it("reads TSV", () => {
    expect(parseDelimited("a\tb\n1\tx")).toEqual([{ a: 1, b: "x" }]);
  });

  it("finds the rows inside a JSON payload", () => {
    expect(parseJsonRows({ meta: {}, data: [{ a: "3", b: { c: 1 } }] })).toEqual([{ a: 3, b: '{"c":1}' }]);
  });

  it("names datasets after files, without clashing", () => {
    expect(datasetId("Café sales 2026.csv", [])).toBe("cafe_sales_2026");
    expect(datasetId("sales.csv", ["sales"])).toBe("sales_2");
  });
});

describe("interpolate", () => {
  it("shows a variable's label, not its id", () => {
    const variables = [{ kind: "slider" as const, id: "from", label: "From", min: 1, max: 3, step: 1, labels: ["Jan", "Feb", "Mar"], default: 1 }];
    expect(interpolate("Since {{from}}, {{missing}}", variables, { from: 2 })).toBe("Since Feb, {{missing}}");
  });
});

describe("fixtures", () => {
  it("fit the schema the model writes to", () => {
    expect(dashboardSchema.safeParse(dashboardFixture).success).toBe(true);
    expect(dashboardSchema.safeParse(emptyDashboard).success).toBe(true);
    expect(articleSchema.safeParse(articleFixture).success).toBe(true);
    expect(articleSchema.safeParse(emptyArticle).success).toBe(true);
  });

  it("only point blocks at datasets and variables that exist", () => {
    for (const app of [dashboardFixture, articleFixture]) {
      const datasets = new Set(app.datasets.map((d) => d.id));
      const variables = new Set(app.variables.map((v) => v.id));
      for (const block of app.blocks) {
        if ("dataset" in block) expect(datasets.has(block.dataset), block.id).toBe(true);
        if (block.type === "control") expect(variables.has(block.variable), block.id).toBe(true);
        if (block.type === "code") block.inputs.forEach((id) => expect(datasets.has(id), block.id).toBe(true));
      }
    }
  });
});
