import type { SuggestionItem } from "@/services/chat";
import { targetKey, type PlotTarget } from "@/services/plot";

/**
 * Placeholder copy for the highlight popover.
 *
 * There is no endpoint for target-scoped chart suggestions yet, so the list is
 * derived locally from the element's role. Being local also means the ids are
 * ours rather than the server's, which is why picking one sends the text as
 * `instruction` instead of a `followup_suggestion_id`.
 */
const BY_ROLE: Record<string, readonly string[]> = {
  "axis-label": [
    "Make these labels bigger",
    "Rotate the labels",
    "Format them as thousands",
  ],
  "axis-title": [
    "Rename this axis",
    "Make the axis title bigger",
    "Hide the axis title",
  ],
  "axis-grid": [
    "Hide the gridlines",
    "Make the gridlines solid",
    "Make them lighter",
  ],
  "axis-domain": ["Hide the axis line", "Make the axis line stronger"],
  "axis-tick": ["Hide the tick marks", "Show fewer ticks"],
  "legend-symbol": [
    "Move the legend below the chart",
    "Make the swatches bigger",
    "Hide the legend",
  ],
  "legend-label": [
    "Make the legend labels bigger",
    "Move the legend below the chart",
    "Shorten these labels",
  ],
  "legend-title": ["Rename the legend", "Hide the legend title"],
  title: ["Rename the chart", "Make the title bigger", "Add a subtitle"],
  "title-text": ["Rename the chart", "Make the title bigger", "Add a subtitle"],
};

const FALLBACK = [
  "Explain what this shows",
  "Restyle this element",
  "Hide it",
] as const;

/** The clicked row's category, when it carries one — used to name the mark. */
const categoryOf = (datum?: Record<string, unknown>) => {
  const value = Object.values(datum ?? {}).find(
    (entry) => typeof entry === "string" && entry.trim().length > 0,
  );
  return typeof value === "string" ? value : null;
};

const markSuggestions = (target: PlotTarget) => {
  const category = categoryOf(target.datum);
  const measure = target.field ?? "value";

  return [
    category ? `Explain the ${category} ${measure}` : `Explain this ${measure}`,
    category ? `Compare ${category} with the rest` : "Compare it with the rest",
    "Turn this into a line chart",
    "Recolour this series",
  ];
};

export const highlightSuggestions = (target: PlotTarget): SuggestionItem[] => {
  const texts =
    target.role === "mark" ? markSuggestions(target) : BY_ROLE[target.role];
  const key = targetKey(target);

  return (texts ?? FALLBACK).map((text, index) => ({
    id: `${key}#${index}`,
    text,
  }));
};
