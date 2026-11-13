import type { SuggestionPlace } from "@/features/interface-shells";
import type { ToolbarKind } from "./generate-tools";
import type { GeneratedTool } from "./tool-spec";

/**
 * Where each interface's suggestions go when a tool doesn't say: inside a row
 * the interface already has, beside what it acts on. Document's Length slider
 * sits by its word count; Generator's "Improve the prompt" in its prompt box.
 * Anything not listed sits in the toolbar.
 */
const PLACES: Partial<Record<ToolbarKind, Record<string, SuggestionPlace>>> = {
  document: { length: "footer", "target-length": "footer" },
  schedule: { start: "days", days: "days", pace: "days", buffers: "days" },
  generator: { "improve-prompt": "prompt", describe: "prompt" },
};

export function placeOf<D>(kind: ToolbarKind, tool: GeneratedTool<D>): SuggestionPlace {
  return tool.place ?? PLACES[kind]?.[tool.id] ?? "toolbar";
}

/** At most this many suggestions beside any one part, so the interface stays the focus. */
export const PER_PLACE = 3;
