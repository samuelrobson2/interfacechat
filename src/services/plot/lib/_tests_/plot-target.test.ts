import { View, parse } from "vega";
import { compile, type TopLevelSpec } from "vega-lite";
import { numiVegaConfig } from "../numi-vega-config";
import { describeTarget } from "../plot-target";

/**
 * These tests pin the one genuinely fragile step of highlight mode: turning a
 * compiled Vega name back into a JSON Pointer that exists in the authored
 * Vega-Lite spec. Vega-Lite renames marks and scales while compiling
 * composition (`child_layer_0_marks`) and desugars composite marks into layers
 * the author never wrote (`layer_0_layer_1_layer_0_marks`), so a change in that
 * naming would silently start producing pointers that patch nothing.
 */

const rows = [
  { month: "Jan", region: "West", revenue: 120, cost: 40 },
  { month: "Feb", region: "West", revenue: 180, cost: 60 },
  { month: "Jan", region: "East", revenue: 90, cost: 30 },
  { month: "Feb", region: "East", revenue: 140, cost: 55 },
];

const render = async (spec: TopLevelSpec) => {
  const host = document.createElement("div");
  document.body.append(host);

  const { spec: vegaSpec } = compile(spec, { config: numiVegaConfig });
  const view = new View(parse(vegaSpec), { renderer: "svg", container: host });
  await view.data("table", rows).runAsync();

  return {
    host,
    cleanup: () => {
      view.finalize();
      host.remove();
    },
  };
};

const pointersFor = (host: HTMLElement, selector: string, spec: object) => {
  const rect = host.getBoundingClientRect();
  const found = new Set<string>();
  for (const node of host.querySelectorAll(selector)) {
    const target = describeTarget(node, rect, spec);
    if (target) found.add(target.pointer);
  }
  return found;
};

/** The container of a pointer must exist; the leaf itself may be added by a patch. */
const containerExists = (spec: object, pointer: string): boolean => {
  const segments = pointer.slice(1).split("/").slice(0, -1);
  let node: unknown = spec;
  for (const segment of segments) {
    if (node === null || typeof node !== "object") return false;
    node = (node as Record<string, unknown>)[segment];
  }
  return node !== undefined;
};

const MARKS = "g[class*='role-mark'] > *";
const AXIS_LABELS = "g[class*='role-axis-label'] > *";
const GRID = "g[class*='role-axis-grid'] > *";
const LEGEND_LABELS = "g[class*='role-legend-label'] > *";

describe("describeTarget pointer resolution", () => {
  it("keeps the layer index inside a facet", async () => {
    const spec: TopLevelSpec = {
      data: { name: "table" },
      facet: { field: "region", type: "nominal" },
      columns: 2,
      spec: {
        layer: [
          {
            mark: "bar",
            encoding: {
              x: { field: "month", type: "nominal" },
              y: { field: "revenue", type: "quantitative" },
            },
          },
          {
            mark: "line",
            encoding: {
              x: { field: "month", type: "nominal" },
              y: { field: "cost", type: "quantitative" },
            },
          },
        ],
      },
    };

    const { host, cleanup } = await render(spec);
    const pointers = pointersFor(host, MARKS, spec);

    expect(pointers).toEqual(
      new Set(["/spec/layer/0/mark", "/spec/layer/1/mark"]),
    );
    for (const pointer of pointers) {
      expect(containerExists(spec, pointer)).toBe(true);
    }
    cleanup();
  });

  it("collapses a desugared composite mark back to /mark", async () => {
    const spec: TopLevelSpec = {
      data: { name: "table" },
      mark: "boxplot",
      encoding: {
        x: { field: "region", type: "nominal" },
        y: { field: "revenue", type: "quantitative" },
      },
    };

    const { host, cleanup } = await render(spec);

    // Compiles to layer_0_layer_1_layer_0_marks and friends — none of which
    // correspond to a path the author could patch.
    expect(pointersFor(host, MARKS, spec)).toEqual(new Set(["/mark"]));
    cleanup();
  });

  it("distinguishes the two axes of independent layered scales", async () => {
    const spec: TopLevelSpec = {
      data: { name: "table" },
      layer: [
        {
          mark: "bar",
          encoding: {
            x: { field: "month", type: "nominal" },
            y: { field: "revenue", type: "quantitative" },
          },
        },
        {
          mark: "line",
          encoding: {
            x: { field: "month", type: "nominal" },
            y: { field: "cost", type: "quantitative" },
          },
        },
      ],
      resolve: { scale: { y: "independent" } },
    };

    const { host, cleanup } = await render(spec);
    const pointers = pointersFor(host, AXIS_LABELS, spec);

    expect(pointers).toContain("/layer/0/encoding/y/axis");
    expect(pointers).toContain("/layer/1/encoding/y/axis");
    for (const pointer of pointers) {
      expect(containerExists(spec, pointer)).toBe(true);
    }
    cleanup();
  });

  it("finds the layer that owns a hoisted legend scale", async () => {
    const spec: TopLevelSpec = {
      data: { name: "table" },
      layer: [
        {
          mark: "bar",
          encoding: {
            x: { field: "month", type: "nominal" },
            y: { field: "revenue", type: "quantitative" },
          },
        },
        {
          mark: "point",
          encoding: {
            x: { field: "month", type: "nominal" },
            y: { field: "cost", type: "quantitative" },
            color: { field: "region", type: "nominal" },
          },
        },
      ],
    };

    const { host, cleanup } = await render(spec);

    // The compiled scale is named plainly `color`, but the channel lives on
    // layer 1, so `/encoding/color/legend` would patch nothing.
    expect(pointersFor(host, LEGEND_LABELS, spec)).toEqual(
      new Set(["/layer/1/encoding/color/legend"]),
    );
    cleanup();
  });

  it("addresses axis parts and reports the painted style", async () => {
    const spec: TopLevelSpec = {
      data: { name: "table" },
      mark: "bar",
      encoding: {
        x: { field: "month", type: "nominal" },
        y: { field: "revenue", type: "quantitative", aggregate: "sum" },
      },
    };

    const { host, cleanup } = await render(spec);
    const rect = host.getBoundingClientRect();

    expect(pointersFor(host, AXIS_LABELS, spec)).toEqual(
      new Set(["/encoding/x/axis", "/encoding/y/axis"]),
    );
    expect(pointersFor(host, GRID, spec)).toEqual(
      new Set(["/encoding/y/axis/grid"]),
    );

    const label = host.querySelector(AXIS_LABELS);
    const target = describeTarget(label, rect, spec);

    // The 11px comes from the theme, not from the spec — which is exactly why
    // the backend needs it sent along to resolve "make it bigger".
    expect(target?.currentValues.fontSize).toBe(11);
    expect(target?.currentValues.fill).toBe("var(--chart-label)");
    expect(target?.field).toBe("month");
    expect(target?.channel).toBe("x");

    const gridline = host.querySelector(GRID);
    expect(
      describeTarget(gridline, rect, spec)?.currentValues.strokeDash,
    ).toEqual([2, 4]);

    cleanup();
  });
});
