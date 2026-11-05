/** A chart title is free text, so path separators have to go. */
export const toChartFileName = (title?: string) =>
  `${(title ?? "chart").replace(/[\\/:*?"<>|]/g, "-")}.png`;
