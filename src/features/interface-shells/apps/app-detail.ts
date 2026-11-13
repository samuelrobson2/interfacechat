import type { AppBlock, AppShellData } from "./app-types";

/** What a block is, in a few words, for outlines and the model's summaries. */
export function blockLabel(block: AppBlock): string {
  switch (block.type) {
    case "text":
      return block.markdown.replace(/^#+\s*/, "").split("\n")[0]?.slice(0, 60) || "Text";
    case "stat":
      return block.label;
    case "chart":
      return block.title ?? `${block.y} by ${block.x}`;
    case "table":
      return block.title ?? `${block.dataset} table`;
    case "control":
      return `Control: ${block.variable}`;
    case "code":
      return block.title ?? "Code";
  }
}

/** "3 charts · 2 datasets · sample data", for inline and medium plus. */
export function appDetail(data: AppShellData): string {
  const charts = data.blocks.filter((block) => block.type === "chart").length;
  const sample = data.datasets.some((dataset) => dataset.source.type === "generated");
  const parts = [
    charts ? `${charts} chart${charts === 1 ? "" : "s"}` : `${data.blocks.length} block${data.blocks.length === 1 ? "" : "s"}`,
    `${data.datasets.length} dataset${data.datasets.length === 1 ? "" : "s"}`,
    ...(sample ? ["sample data"] : []),
  ];
  return data.blocks.length || data.datasets.length ? parts.join(" · ") : "Nothing built yet";
}
