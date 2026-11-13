import { ALL } from "./app-query";
import type { ArticleShellData, DashboardShellData, Row } from "./app-types";

/* ── Dashboard: café sales ────────────────────────────────────────────── */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const REGIONS: [string, number][] = [
  ["North", 38000],
  ["South", 31000],
  ["City", 52000],
];

/** Same numbers every load: a small wobble, summer up, a dip in August when the City site closed for a refit. */
function cafeSales(): Row[] {
  const rows: Row[] = [];
  REGIONS.forEach(([region, base], r) => {
    MONTHS.forEach((month, m) => {
      const season = 1 + 0.12 * Math.sin(((m - 3) / 12) * 2 * Math.PI);
      const growth = 1 + m * 0.018;
      const wobble = 1 + (((m * 7 + r * 13) % 9) - 4) / 100;
      const refit = region === "City" && month === "Aug" ? 0.55 : 1;
      const revenue = Math.round(base * season * growth * wobble * refit);
      const ticket = Math.round((8.4 + r * 0.9 + m * 0.05) * 100) / 100;
      rows.push({ month, monthIndex: m + 1, region, revenue, orders: Math.round(revenue / ticket), ticket });
    });
  });
  return rows;
}

const FORECAST_CODE = [
  "// A straight line through monthly revenue, carried three months on.",
  "const rows = data.sales.filter((r) => vars.region === \"__all__\" || r.region === vars.region);",
  "const byMonth = new Map();",
  "for (const r of rows) byMonth.set(r.monthIndex, (byMonth.get(r.monthIndex) || 0) + r.revenue);",
  "const points = [...byMonth].sort((a, b) => a[0] - b[0]);",
  "const n = points.length;",
  "const mx = points.reduce((s, p) => s + p[0], 0) / n;",
  "const my = points.reduce((s, p) => s + p[1], 0) / n;",
  "const slope =",
  "  points.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) /",
  "  points.reduce((s, p) => s + (p[0] - mx) ** 2, 0);",
  "const next = [\"Jan ’27\", \"Feb ’27\", \"Mar ’27\"].map((month, i) => ({",
  "  month,",
  "  revenue: Math.round(my + slope * (13 + i - mx)),",
  "}));",
  "emit(next);",
  "",
  "const k = (v) => \"$\" + Math.round(v / 1000) + \"k\";",
  "root.innerHTML =",
  "  \"<p style='margin:0 0 8px;color:#7a7a7a'>Trend \" + (slope >= 0 ? \"+\" : \"\") + k(slope) + \" a month</p>\" +",
  "  next.map((r) => \"<div style='display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee'>\" +",
  "    \"<span>\" + r.month + \"</span><b style='font-weight:500'>\" + k(r.revenue) + \"</b></div>\").join(\"\");",
].join("\n");

const regionAndWindow = [
  { field: "region", op: "eq" as const, value: "$region" },
  { field: "monthIndex", op: "gte" as const, value: "$from" },
];

export const dashboardFixture: DashboardShellData = {
  title: "Café sales",
  description: "Three sites, 2026. Sample numbers until the till export is connected.",
  datasets: [
    { id: "sales", label: "Sales by month", source: { type: "generated", note: "Written by the model" }, rows: cafeSales() },
    { id: "forecast", label: "Forecast", source: { type: "code", blockId: "forecast-code" }, rows: [] },
  ],
  variables: [
    {
      kind: "choice",
      id: "region",
      label: "Site",
      options: REGIONS.map(([region]) => ({ value: region, label: region })),
      includeAll: true,
      default: ALL,
    },
    { kind: "slider", id: "from", label: "From", min: 1, max: 12, step: 1, labels: MONTHS, default: 1 },
  ],
  blocks: [
    { type: "stat", id: "revenue", label: "Revenue", dataset: "sales", field: "revenue", op: "sum", format: "currency", query: { where: regionAndWindow } },
    { type: "stat", id: "orders", label: "Orders", dataset: "sales", field: "orders", op: "sum", query: { where: regionAndWindow } },
    { type: "stat", id: "ticket", label: "Average ticket", dataset: "sales", field: "ticket", op: "mean", format: "currency", query: { where: regionAndWindow } },
    {
      type: "stat",
      id: "half",
      label: "Second half vs first",
      dataset: "sales",
      field: "revenue",
      op: "sum",
      format: "currency",
      query: { where: [{ field: "region", op: "eq", value: "$region" }, { field: "monthIndex", op: "gte", value: 7 }] },
      compare: { where: [{ field: "region", op: "eq", value: "$region" }, { field: "monthIndex", op: "lte", value: 6 }] },
    },
    {
      type: "chart",
      id: "by-month",
      title: "Revenue by month",
      dataset: "sales",
      mark: "line",
      x: "month",
      y: "revenue",
      color: "region",
      query: { where: regionAndWindow },
      span: 8,
      height: 220,
    },
    {
      type: "chart",
      id: "by-region",
      title: "By site",
      dataset: "sales",
      mark: "arc",
      x: "region",
      y: "revenue",
      aggregate: "sum",
      query: { where: [{ field: "monthIndex", op: "gte", value: "$from" }] },
      span: 4,
      height: 220,
    },
    {
      type: "code",
      id: "forecast-code",
      title: "Next quarter",
      language: "javascript",
      source: FORECAST_CODE,
      inputs: ["sales"],
      output: "forecast",
      span: 6,
    },
    { type: "chart", id: "forecast-chart", title: "Forecast", dataset: "forecast", mark: "bar", x: "month", y: "revenue", span: 6, height: 160 },
    {
      type: "table",
      id: "best-months",
      title: "Best months",
      dataset: "sales",
      columns: ["month", "region", "revenue", "orders"],
      query: { where: regionAndWindow, sort: { field: "revenue", dir: "desc" }, limit: 6 },
      span: 12,
    },
  ],
};

export const emptyDashboard: DashboardShellData = { title: "", description: "", datasets: [], variables: [], blocks: [] };

/* ── Article: hot streets ─────────────────────────────────────────────── */

const NEIGHBOURHOODS: [string, number, number][] = [
  ["Riverside", 31, 33.1],
  ["Old Market", 9, 40.6],
  ["Hillcrest", 38, 31.4],
  ["Station Quarter", 6, 41.2],
  ["Parkside", 44, 30.2],
  ["Docklands", 12, 39.0],
  ["Elm Row", 24, 35.0],
  ["Canal Side", 17, 37.3],
];

const COOLING_CODE = [
  "// About 0.12°C cooler for every point of canopy added, capped at 45% cover.",
  "const perPoint = 0.12;",
  "const rows = data.heat.map((r) => {",
  "  const added = Math.max(0, Math.min(vars.trees, 45 - r.treeCover));",
  "  return { neighbourhood: r.neighbourhood, cooling: Math.round(added * perPoint * 10) / 10 };",
  "});",
  "emit(rows);",
  "",
  "const hottest = data.heat.reduce((a, b) => (b.surfaceTemp > a.surfaceTemp ? b : a));",
  "const drop = rows.find((r) => r.neighbourhood === hottest.neighbourhood).cooling;",
  "const mean = rows.reduce((s, r) => s + r.cooling, 0) / rows.length;",
  "root.innerHTML =",
  "  \"<p style='margin:0'>\" + hottest.neighbourhood + \" goes from <b style='font-weight:500'>\" + hottest.surfaceTemp + \"°C</b> to \" +",
  "  \"<b style='font-weight:500'>\" + (hottest.surfaceTemp - drop).toFixed(1) + \"°C</b>. Across all eight, afternoons cool by \" +",
  "  mean.toFixed(1) + \"°C on average.</p>\";",
].join("\n");

export const articleFixture: ArticleShellData = {
  title: "Why some streets run 7°C hotter",
  subtitle: "Tree cover, surface heat and what planting would change. Sample data.",
  datasets: [
    {
      id: "heat",
      label: "Neighbourhood heat",
      source: { type: "generated", note: "Written by the model" },
      rows: NEIGHBOURHOODS.map(([neighbourhood, treeCover, surfaceTemp]) => ({ neighbourhood, treeCover, surfaceTemp })),
    },
    { id: "cooling", label: "Cooling", source: { type: "code", blockId: "cooling-code" }, rows: [] },
  ],
  variables: [{ kind: "slider", id: "trees", label: "Extra tree cover", min: 0, max: 30, step: 5, unit: " points", default: 10 }],
  blocks: [
    {
      type: "text",
      id: "intro",
      markdown:
        "On a July afternoon, the pavement in **Station Quarter** reaches 41°C. Two miles away, under the plane trees of Parkside, it is 30°C. The difference isn't the weather; it's shade.",
    },
    {
      type: "chart",
      id: "scatter",
      title: "Tree cover against afternoon surface temperature",
      caption: "Eight neighbourhoods, July afternoons.",
      dataset: "heat",
      mark: "point",
      x: "treeCover",
      y: "surfaceTemp",
      height: 220,
    },
    {
      type: "text",
      id: "middle",
      markdown:
        "## What planting would change\n\nThe line is steep: every ten points of canopy is worth about a degree. Move the slider to add cover everywhere, and the code below works out each street's afternoon.",
    },
    { type: "control", id: "trees-control", variable: "trees" },
    {
      type: "code",
      id: "cooling-code",
      title: "What if we planted more?",
      language: "javascript",
      source: COOLING_CODE,
      inputs: ["heat"],
      output: "cooling",
      showCode: true,
    },
    {
      type: "chart",
      id: "cooling-chart",
      title: "How much each street cools",
      dataset: "cooling",
      mark: "bar",
      x: "neighbourhood",
      y: "cooling",
      height: 200,
    },
    {
      type: "text",
      id: "close",
      markdown:
        "With {{trees}} more canopy, the hottest streets gain the most, because they start with the least. The cheapest degree in the city is a tree on a street that has none.",
    },
  ],
};

export const emptyArticle: ArticleShellData = { title: "", subtitle: "", datasets: [], variables: [], blocks: [] };

/* ── As library fixtures ──────────────────────────────────────────────── */

type Fixture<D> = {
  states: { empty: D; suggestion: D; history: D };
  suggestionPrompt: string;
  history: { chatTitle: string; when: string };
};

/** The suggestion is the plan before the model fills it in: data and the first figures. */
export const APP_FIXTURES: { dashboard: Fixture<DashboardShellData>; article: Fixture<ArticleShellData> } = {
  dashboard: {
    suggestionPrompt: "Build a dashboard of our café sales by site and month, with a forecast",
    history: { chatTitle: "Café sales dashboard", when: "2 days ago" },
    states: {
      empty: emptyDashboard,
      suggestion: { ...dashboardFixture, blocks: dashboardFixture.blocks.filter((block) => block.type === "stat" || block.id === "by-month") },
      history: dashboardFixture,
    },
  },
  article: {
    suggestionPrompt: "Write an interactive article on why some streets run hotter, with a slider for tree cover",
    history: { chatTitle: "Hot streets explainer", when: "Last week" },
    states: {
      empty: emptyArticle,
      suggestion: { ...articleFixture, blocks: articleFixture.blocks.slice(0, 2) },
      history: articleFixture,
    },
  },
};

export const APP_EMPTY = { dashboard: emptyDashboard, article: emptyArticle };
