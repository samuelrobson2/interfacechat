import type { TopLevelSpec } from "vega-lite";

/** What `VegaChart` renders: a spec plus the rows it references by name. */
export type VegaPayload = {
  spec: TopLevelSpec;
  datasets: Record<string, readonly unknown[]>;
};

/** The name a spec falls back to when it declares no named dataset. */
const DEFAULT_DATASET_NAME = "table";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A spec names the rows it reads (`data: { name: "table" }`). */
const datasetName = (spec: Record<string, unknown>) => {
  const { data } = spec;
  if (isRecord(data) && typeof data.name === "string") return data.name;
  return DEFAULT_DATASET_NAME;
};

/**
 * Pairs an authored spec with its rows.
 *
 * The API keeps the two apart: a spec references its rows by dataset name
 * instead of embedding them, so the rows have to reach Vega under that name.
 */
export const toVegaPayload = (
  spec: Record<string, unknown>,
  rows?: readonly unknown[] | null,
): VegaPayload => ({
  spec: spec as unknown as TopLevelSpec,
  datasets: { [datasetName(spec)]: rows ?? [] },
});

/** Vega-Lite allows a multi-line heading, spelled as an array of lines. */
const readLines = (value: unknown) => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.join(" ").trim();
  return "";
};

/** A heading is either `title: "…"` or `title: { text, subtitle }`. */
export const readSpecHeading = (spec: Record<string, unknown>) => {
  const { title } = spec;
  if (!isRecord(title)) return { text: readLines(title), subtitle: "" };

  return { text: readLines(title.text), subtitle: readLines(title.subtitle) };
};

/** Drops the heading, for callers that draw it outside the chart frame. */
export const withoutSpecHeading = (spec: Record<string, unknown>) => {
  const rest = { ...spec };
  delete rest.title;
  return rest;
};
