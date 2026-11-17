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

/** Each suggested item names where it goes: the group it belongs in, after the item it follows. */
function trackerValues(data: ToolbarDataByKind["tracker"]): SuggestedValues {
  const shoot = has(`${data.title} ${data.items.map((item) => item.label).join(" ")}`, /\b(shoot|location|crew|cast|film)\b/);
  const words = shoot ? ["Check the weather forecast", "Share the call sheet", "Book catering"] : ["Set a kick-off date", "Share the plan", "Agree who signs off"];
  const groups = data.groups.length ? data.groups : [undefined];
  return {
    items: words.map((value, i) => {
      const group = groups[i % groups.length];
      const inGroup = data.items.filter((item) => item.group === group);
      const after = inGroup[Math.min(inGroup.length - 1, i)]?.label;
      return { value, ...(group ? { group } : {}), ...(after ? { after } : {}) };
    }),
  };
}

/** Notes for the canvas: words for what its images and colours share. */
function canvasValues(data: ToolbarDataByKind["moodboard"]): SuggestedValues {
  const film = /\b(film|ferry|shoot|scene)\b/i.test(`${data.title} ${data.keywords.join(" ")}`);
  return { notes: film ? ["Salt-faded colour", "Long quiet takes", "Breath on cold glass"] : ["Soft daylight", "Worn textures", "Room to breathe"] };
}

/** The next sentence a document could take: where the writing stops, offered in place. */
function documentValues(data: ToolbarDataByKind["document"]): SuggestedValues {
  const body = data.body.trim();
  if (!body) return {};
  const heat = has(`${data.title} ${body}`, /\b(heat|tree|cool|street)\b/);
  return {
    // After the paragraph it builds on (by its opening words).
    text: heat
      ? [{ value: "Planting is also the cheapest fix: a street tree costs less over its life than the air conditioning it replaces.", after: "Shade does most of the work" }]
      : ["The next step is to test this against a real example, and say what would change your mind."],
  };
}

function scheduleValues(): SuggestedValues {
  // Whole lines as well as constraints, each after the task it follows: a reset after the first set-up, a wrap at the end.
  return {
    constraints: ["Lunch 1–2pm", "Wrap by 7pm", "Golden hour at 4:30pm"],
    tasks: [{ value: "Safety walk of the pier", after: "Load in" }, "Wrap and return keys"],
  };
}

const VALUES: Partial<{ [K in ToolbarKind]: (data: ToolbarDataByKind[K]) => SuggestedValues }> = {
  generator: generatorValues,
  search: searchValues,
  table: tableValues,
  tracker: trackerValues,
  schedule: scheduleValues,
  moodboard: canvasValues,
  document: documentValues,
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
    Object.entries(values).map(([group, list]) => [group, list.filter((value) => !dismissed[group as SuggestedGroup]?.includes(typeof value === "string" ? value : value.value))]),
  );
}
