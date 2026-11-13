import {
  columnsOf,
  type AppBlock,
  type AppBlockOf,
  type AppShellData,
  type ArticleShellData,
  type DashboardShellData,
  type Row,
} from "@/features/interface-shells";
import { clip, mix, type ToolContext } from "./tool-helpers";
import type { GeneratedTool } from "./tool-spec";

const titleCase = (field: string) =>
  field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const sampleSets = (data: AppShellData) => data.datasets.filter((dataset) => dataset.source.type === "generated");
const rowsOf = (data: AppShellData, id: string): Row[] => data.datasets.find((d) => d.id === id)?.rows ?? [];

/** Blocks reading a column their dataset doesn't have: what a swapped-in file breaks. */
function brokenBlocks(data: AppShellData) {
  return data.blocks.filter((block) => {
    if (!("dataset" in block)) return false;
    const rows = rowsOf(data, block.dataset);
    if (!rows.length) return false;
    const have = new Set(Object.keys(rows[0] ?? {}));
    const fields =
      block.type === "chart" ? [block.x, block.y, block.color] : block.type === "stat" ? [block.field] : block.columns ?? [];
    return fields.some((field) => field && !have.has(field));
  });
}

/** The lowest point of a line chart, when it's well below the rest: something worth explaining. */
function dipIn(data: AppShellData) {
  const chart = data.blocks.find((block): block is AppBlockOf<"chart"> => block.type === "chart" && block.mark === "line");
  if (!chart) return null;
  const totals = new Map<string, number>();
  for (const row of rowsOf(data, chart.dataset)) {
    const y = Number(row[chart.y]);
    if (Number.isFinite(y)) totals.set(String(row[chart.x]), (totals.get(String(row[chart.x])) ?? 0) + y);
  }
  const points = [...totals];
  if (points.length < 3) return null;
  const mean = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
  const [x, y] = points.reduce((low, point) => (point[1] < low[1] ? point : low));
  return y < mean * 0.9 ? { x, field: chart.y } : null;
}

/* ── Dashboard ────────────────────────────────────────────────────────── */

const DENSITY: Record<string, 12 | 6 | 4> = { roomy: 12, balanced: 6, dense: 4 };

export function dashboardTools(data: DashboardShellData): GeneratedTool<DashboardShellData>[] {
  if (data.datasets.length === 0) {
    return [
      {
        type: "choice",
        id: "template",
        label: "Start as",
        detail: "A layout to begin from",
        icon: "chart",
        options: [
          { id: "sales", label: "Sales" },
          { id: "funnel", label: "Funnel" },
          { id: "ops", label: "Operations" },
        ],
        value: "",
      },
      {
        type: "action",
        id: "sample",
        label: "Use sample numbers",
        detail: "Shape the layout now, swap your data in later",
        icon: "sparkles",
      },
      { type: "action", id: "from-file", label: "Build from a file", detail: "Upload a CSV and get a first draft", icon: "table" },
    ];
  }

  const charts = data.blocks.filter((block): block is AppBlockOf<"chart"> => block.type === "chart");
  const main = charts.find((chart) => chart.mark !== "arc");
  const spans = charts.map((chart) => chart.span ?? 6);
  const density = spans.every((span) => span === 12) ? "roomy" : spans.every((span) => span <= 4) ? "dense" : "balanced";

  const controls: GeneratedTool<DashboardShellData>[] = [];
  if (main) {
    controls.push({
      type: "choice",
      id: "main-chart",
      label: clip(main.title ?? "Chart", 14),
      detail: `How ${main.title ?? "the main chart"} draws`,
      icon: "chart",
      options: [
        { id: "line", label: "Line" },
        { id: "bar", label: "Bar" },
        { id: "area", label: "Area" },
      ],
      value: main.mark,
      apply: (d, value) => ({
        ...d,
        blocks: d.blocks.map((block) =>
          block.id === main.id ? { ...block, mark: value as AppBlockOf<"chart">["mark"] } : block,
        ),
      }),
    });
  }
  controls.push(
    {
      type: "choice",
      id: "density",
      label: "Density",
      detail: "How many charts sit side by side",
      icon: "grid",
      options: [
        { id: "roomy", label: "Roomy" },
        { id: "balanced", label: "Balanced" },
        { id: "dense", label: "Dense" },
      ],
      value: density,
      apply: (d, value) => ({
        ...d,
        blocks: d.blocks.map((block): AppBlock => (block.type === "chart" ? { ...block, span: DENSITY[value] ?? 6 } : block)),
      }),
    },
    {
      type: "toggle",
      id: "compare",
      label: "Vs last period",
      detail: "Show each figure against the period before",
      icon: "sort",
      value: data.blocks.some((block) => block.type === "stat" && block.compare),
    },
  );

  const actions: GeneratedTool<DashboardShellData>[] = [];
  const samples = sampleSets(data);
  if (samples[0]) {
    actions.push({
      type: "action",
      id: "replace-sample",
      label: "Use real data",
      detail: `${samples[0].label} is sample numbers`,
      icon: "table",
    });
  }
  const broken = brokenBlocks(data);
  if (broken.length) {
    actions.push({
      type: "action",
      id: "map-columns",
      label: "Match the columns",
      detail: `${broken.length} block${broken.length === 1 ? "" : "s"} read columns the data doesn't have`,
      icon: "table",
    });
  }
  const dip = dipIn(data);
  if (dip) {
    actions.push({ type: "action", id: "dip", label: "Explain the dip", detail: `${titleCase(dip.field)} fell in ${dip.x}`, icon: "search" });
  }
  // A number column no figure shows yet becomes a KPI here.
  const first = data.datasets.find((dataset) => dataset.source.type !== "code" && dataset.rows.length);
  const shown = new Set(data.blocks.flatMap((block) => (block.type === "stat" ? [block.field] : [])));
  const unshown = first
    ? columnsOf(first.rows).find((column) => column.type === "number" && !shown.has(column.name) && !/index|id$/i.test(column.name))
    : undefined;
  if (first && unshown) {
    actions.push({
      type: "action",
      id: "add-kpi",
      label: `Add ${clip(titleCase(unshown.name), 14)}`,
      detail: `A figure for the total ${titleCase(unshown.name).toLowerCase()}`,
      icon: "plus",
      apply: (d) => ({
        ...d,
        blocks: [
          { type: "stat", id: `stat-${unshown.name}`, label: titleCase(unshown.name), dataset: first.id, field: unshown.name, op: "sum" },
          ...d.blocks,
        ],
      }),
    });
  }
  if (!data.blocks.some((block) => block.type === "code")) {
    actions.push({ type: "action", id: "forecast", label: "Add a forecast", detail: "Code that projects the trend forward", icon: "chart" });
  }
  actions.push({ type: "action", id: "alert", label: "Alert me", detail: "When a figure moves past a line you set", icon: "bell" });
  return mix(controls, actions);
}

/* ── Article ──────────────────────────────────────────────────────────── */

export function articleTools(data: ArticleShellData, { selection }: ToolContext): GeneratedTool<ArticleShellData>[] {
  if (selection) {
    const quoted = `“${clip(selection, 22)}”`;
    return [
      { type: "action", id: "sel-chart", label: "Chart this", detail: `Find the data behind ${quoted}`, icon: "chart" },
      { type: "action", id: "sel-interactive", label: "Make it explorable", detail: `Add a control that changes ${quoted}`, icon: "sliders" },
      { type: "action", id: "sel-cite", label: "Cite this", detail: `A source for ${quoted}`, icon: "search" },
    ];
  }
  if (data.blocks.length === 0) {
    return [
      { type: "action", id: "outline", label: "Draft the piece", detail: "Prose, a chart, and something to play with", icon: "sparkles" },
      { type: "action", id: "from-data", label: "Find the story", detail: "In data you bring from the Data menu", icon: "search" },
    ];
  }

  const code = data.blocks.filter((block): block is AppBlockOf<"code"> => block.type === "code");
  const charts = data.blocks.filter((block): block is AppBlockOf<"chart"> => block.type === "chart");
  const staticChart = charts.find((chart) => !chart.query?.where?.some((clause) => String(clause.value).startsWith("$")) && !code.some((c) => c.output === chart.dataset));

  const controls: GeneratedTool<ArticleShellData>[] = [
    {
      type: "slider",
      id: "reading-level",
      label: "Reading level",
      detail: "Who the prose is written for",
      icon: "sliders",
      min: { label: "Plain" },
      max: { label: "Expert" },
      steps: ["Plain", "General", "Expert"],
      value: 1,
    },
  ];
  if (code.length) {
    controls.push({
      type: "choice",
      id: "code",
      label: "Code",
      detail: "Show the working, or only its results",
      icon: "text",
      options: [
        { id: "shown", label: "Shown" },
        { id: "hidden", label: "Hidden" },
      ],
      value: code.every((block) => block.showCode) ? "shown" : "hidden",
      apply: (d, value) => ({
        ...d,
        blocks: d.blocks.map((block): AppBlock => (block.type === "code" ? { ...block, showCode: value === "shown" } : block)),
      }),
    });
  }
  controls.push({
    type: "toggle",
    id: "annotate",
    label: "Annotate charts",
    detail: "Call out the point each chart makes",
    icon: "chart",
    value: false,
  });

  const actions: GeneratedTool<ArticleShellData>[] = [];
  if (staticChart) {
    actions.push({
      type: "action",
      id: "interactive",
      label: "Make it explorable",
      detail: `Let readers steer “${clip(staticChart.title ?? "the chart", 26)}”`,
      icon: "sliders",
    });
  }
  const samples = sampleSets(data);
  if (samples.length) {
    actions.push({ type: "action", id: "check", label: "Check the numbers", detail: `${samples[0]!.label} is sample data`, icon: "search" });
  }
  actions.push(
    { type: "action", id: "headline", label: "Sharper headline", detail: `Than “${clip(data.title || "Untitled", 26)}”`, icon: "text" },
    { type: "action", id: "dashboard", label: "Make a dashboard", detail: "The same data, as figures at a glance", icon: "chart" },
  );
  return mix(controls, actions);
}
