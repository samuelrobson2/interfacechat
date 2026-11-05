import type { PlotSpec } from "../model/plot-schema";

/** Builds a safe file-name stem from the chart title, falling back to its type. */
export const plotFileBase = (spec: PlotSpec): string => {
  const base = (spec.title ?? spec.type)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "chart";
};

/** Header for the categorical/temporal axis column in the data view. */
export const xColumnHeader = (spec: PlotSpec): string =>
  spec.xLabel ?? "Category";

/** Series bound to a real data column: `[{ key, label }]`. */
export const dataColumns = (spec: PlotSpec): { key: string; label: string }[] =>
  spec.series.map((s) => ({ key: s.key, label: s.label ?? s.key }));
