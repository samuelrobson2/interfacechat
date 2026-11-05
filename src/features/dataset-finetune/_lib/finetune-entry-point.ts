export const FINETUNE_ENTRY_QUERY_PARAM = "entry";

export const FINETUNE_ENTRY_POINTS = {
  dashboard: "dashboard",
  dataset: "dataset",
  autoscientist: "autoscientist",
} as const;

export type FinetuneEntryPoint =
  (typeof FINETUNE_ENTRY_POINTS)[keyof typeof FINETUNE_ENTRY_POINTS];

export function parseFinetuneEntryPoint(
  value: string | null | undefined,
): FinetuneEntryPoint | null {
  if (!value) return null;
  if (value === FINETUNE_ENTRY_POINTS.dashboard) return value;
  if (value === FINETUNE_ENTRY_POINTS.dataset) return value;
  if (value === FINETUNE_ENTRY_POINTS.autoscientist) return value;
  return null;
}

export function appendFinetuneEntryToRoute(
  route: string,
  entryPoint: FinetuneEntryPoint,
) {
  const separator = route.includes("?") ? "&" : "?";
  return `${route}${separator}${FINETUNE_ENTRY_QUERY_PARAM}=${entryPoint}`;
}
