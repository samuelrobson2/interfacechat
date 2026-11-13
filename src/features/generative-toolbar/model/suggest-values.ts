import type { SuggestedGroup, SuggestedValues } from "@/features/interface-shells";
import type { ToolbarDataByKind, ToolbarKind } from "./generate-tools";

/*
 * A stand-in for the model's suggested values: things to add that sit among
 * the real ones (a filter among the filters, a tone among the tones), outlined
 * until accepted. It reads the content the way the model would.
 */

const words = (text: string) => text.toLowerCase();
const has = (text: string, pattern: RegExp) => pattern.test(words(text));

function generatorValues(data: ToolbarDataByKind["generator"]): SuggestedValues {
  const prompt = data.title;
  const poster = has(prompt, /\b(poster|print|cover|flyer)\b/);
  const product = has(prompt, /\b(product|packshot|bottle|shoe|trainer|mug)\b/);
  const brand = has(prompt, /\b(brand|tagline|slogan|name|coffee|launch)\b/);
  return {
    styles: poster ? ["Risograph", "Swiss poster", "Cinematic"] : product ? ["Studio light", "Flat lay", "Macro"] : ["Cinematic", "Minimal", "Collage"],
    tones: brand ? ["Confident", "Warm-hearted", "Wry"] : ["Nostalgic", "Confident", "Wry"],
    lengths: brand ? ["Under 6 words", "One line"] : ["One line", "A short paragraph"],
  };
}

function searchValues(data: ToolbarDataByKind["search"]): SuggestedValues {
  const local = has(data.query, /\b(near|in|cafés?|cafes?|restaurants?|roasters?|shops?|bars?)\b/);
  // Not times or types: Search's own Time and Type pickers already offer those.
  return { filters: local ? ["Reviews", "Open late", "Independent"] : ["Primary sources", "Peer-reviewed", "Expert takes"] };
}

function tableValues(data: ToolbarDataByKind["table"]): SuggestedValues {
  const labels = data.columns.map((column) => words(column.label));
  const shots = labels.some((label) => /shot|framing|camera/.test(label));
  return { columns: shots ? ["Status", "Location", "Lens notes"] : ["Status", "Owner", "Notes"] };
}

function trackerValues(data: ToolbarDataByKind["tracker"]): SuggestedValues {
  const shoot = has(`${data.title} ${data.items.map((item) => item.label).join(" ")}`, /\b(shoot|location|crew|cast|film)\b/);
  return {
    items: shoot ? ["Share the call sheet", "Check the weather forecast", "Book catering"] : ["Set a kick-off date", "Share the plan", "Agree who signs off"],
  };
}

/** Notes for the canvas: words for what its images and colours share. */
function canvasValues(data: ToolbarDataByKind["moodboard"]): SuggestedValues {
  const film = /\b(film|ferry|shoot|scene)\b/i.test(`${data.title} ${data.keywords.join(" ")}`);
  return { notes: film ? ["Salt-faded colour", "Long quiet takes", "Breath on cold glass"] : ["Soft daylight", "Worn textures", "Room to breathe"] };
}

function scheduleValues(): SuggestedValues {
  return { constraints: ["Lunch 1–2pm", "Wrap by 7pm", "Golden hour at 4:30pm"] };
}

const VALUES: Partial<{ [K in ToolbarKind]: (data: ToolbarDataByKind[K]) => SuggestedValues }> = {
  generator: generatorValues,
  search: searchValues,
  table: tableValues,
  tracker: trackerValues,
  schedule: scheduleValues,
  moodboard: canvasValues,
};

/** Suggested values for an interface, less any the person dismissed. */
export function suggestValues<K extends ToolbarKind>(
  kind: K,
  data: ToolbarDataByKind[K],
  dismissed: Partial<Record<SuggestedGroup, string[]>>,
): SuggestedValues {
  const make = VALUES[kind] as ((data: ToolbarDataByKind[K]) => SuggestedValues) | undefined;
  const values = make?.(data) ?? {};
  return Object.fromEntries(
    Object.entries(values).map(([group, list]) => [group, list.filter((value) => !dismissed[group as SuggestedGroup]?.includes(value))]),
  );
}
