/**
 * What can be suggested for each interface while a request is typed on the
 * chat home, and how. Rules go by the kind of part, not by interface, so a
 * new interface only says which parts it has:
 *
 * - question: an open choice with no place on the card (who a document is
 *   for). Shown at once, as a choice with the model's guess, and updated as
 *   they type.
 * - collection: something added to (a search's filters, a checklist's
 *   items). Shown at once, outlined among the real ones, one click to add.
 * - slot: something they name themselves (a table's column names). Nothing
 *   until they start typing in it; then the matches (`typeahead`).
 * - default: a value the card already has a field for (a document's length).
 *   The guess sits in the field itself, in the AI colours, until changed.
 *
 * Read by the card and by the route (`api/_ai-prompt-choices.ts`), so it
 * imports nothing.
 */

export type PartKind = "question" | "collection" | "slot" | "default";
/** Where a collection, slot or default's values go on the card (a SuggestedGroup). */
export type PartGroup = "filters" | "items" | "columns" | "constraints" | "lengths";

export type SuggestionPart =
  | { kind: "question"; key: string; ask: string }
  | { kind: Exclude<PartKind, "question">; key: string; group: PartGroup; ask: string };

export type SuggestionProfile = {
  /** How a picked choice reads, for the model's examples. */
  phrases: string;
  parts: SuggestionPart[];
};

const q = (key: string, ask: string): SuggestionPart => ({ kind: "question", key, ask });

export const SUGGESTION_PARTS: Record<string, SuggestionProfile> = {
  document: {
    phrases: '"for the leadership team", "as a one-page memo", "covering the timeline and risks"',
    parts: [
      q("audience", "who will read it (leadership, the team, customers, a marker)"),
      q("purpose", "what it has to achieve (get a decision, align people, persuade, inform)"),
      q("form", "what kind of document (a one-pager, a memo, a full report, an essay)"),
      q("coverage", "what it must cover; several can hold at once (multi)"),
      q("voice", "how it should sound (formal, plain and direct, warm), only when it really varies"),
      q("fact", "one thing only they know that the writing hangs on (a date, a number, their main experience)"),
      { kind: "default", key: "length", group: "lengths", ask: 'a sensible target length for this document, as "~800 words" or "~2 pages"' },
    ],
  },
  table: {
    phrases: '"with a row per supplier", "from the last five years", "for about 20"',
    parts: [
      q("rows", "what one row is (each supplier, each shot, each paper)"),
      q("scope", "which ones belong in it (a time period, a region, a price range)"),
      q("count", "roughly how many rows (a shortlist of 5, about 20, everything)"),
      q("fact", "one thing only they know that the table hangs on (their budget, their city)"),
      { kind: "slot", key: "columns", group: "columns", ask: 'three to five columns this table should have, besides any it has, one to three words each ("Price", "Roast style")' },
    ],
  },
  search: {
    phrases: '"focusing on the latest news", "to compare the options"',
    parts: [
      q("angle", "what they want to come away with (compare options, the latest news, evidence for and against, how to do it)"),
      q("depth", "a quick answer or a thorough look"),
      { kind: "collection", key: "filters", group: "filters", ask: 'two to four short filter chips that sharpen this search: a time range, a source type, a place ("Past year", "Reviews", "Under £200")' },
    ],
  },
  tracker: {
    phrases: '"due by Friday", "grouped by week", "split between the team"',
    parts: [
      q("goal", "what done looks like, when the request is broad (moving in, the launch going live)"),
      q("deadline", "when it all has to be done by"),
      q("owners", "who does the work (just me, the team, named people)"),
      q("grouping", "how the items are grouped (by phase, by week, by owner)"),
      { kind: "collection", key: "items", group: "items", ask: 'four to six of the first things to do, as short checklist items in the imperative ("Book a removal van")' },
    ],
  },
  schedule: {
    phrases: '"over three days", "from 9 to 5", "around school pickup"',
    parts: [
      q("span", "how many days it covers, and when it starts"),
      q("hours", "the hours each day runs"),
      q("pace", "how packed the days are (relaxed, full, with breaks)"),
      { kind: "collection", key: "constraints", group: "constraints", ask: 'two to four limits to plan around, short ("No meetings before 10", "Lunch at 1")' },
    ],
  },
  reader: {
    phrases: '"looking for the key findings", "in plain terms"',
    parts: [
      q("goal", "what they want from the document (a summary, specific facts, risks, an answer to a question)"),
      q("depth", "the gist or every detail"),
      q("level", "how it should be explained (plain terms, expert)"),
    ],
  },
  guide: {
    phrases: '"for four people", "for a beginner", "without dairy"',
    parts: [
      q("people", "how many it's for, when it's a recipe or a group activity"),
      q("level", "their experience (a beginner, confident)"),
      q("limits", "what they have to work around (dietary needs, the tools they have, the time they have)"),
    ],
  },
  generator: {
    phrases: '"for an Instagram post", "in a warm tone", "as a watercolour"',
    parts: [
      q("use", "where it will be used (a poster, a social post, a slide, a website)"),
      q("look", "the tone of the writing or the style of the picture"),
      q("audience", "who it's for, when that changes the words or the look"),
    ],
  },
  dashboard: {
    phrases: '"tracking weekly revenue", "for the sales team", "from our CSV export"',
    parts: [
      q("measures", "what it should track (revenue, sign-ups, costs)"),
      q("audience", "who reads it (the team, leadership, clients)"),
      q("period", "the time it covers and how it's broken down (by week, by month)"),
      q("data", "where the numbers come from (sample numbers, their spreadsheet, a database)"),
    ],
  },
  article: {
    phrases: '"for a general reader", "with an interactive chart of", "using sample data"',
    parts: [
      q("audience", "who reads it (a general reader, students, experts)"),
      q("angle", "the one question the article answers"),
      q("data", "where the numbers come from (sample numbers, a dataset they have)"),
    ],
  },
};

/** Interfaces with suggestions on the chat home. */
export const SUGGESTION_KINDS = Object.keys(SUGGESTION_PARTS);

/** The parts of an interface that go straight into the card: collections, slots and defaults. */
export const fillParts = (kind: string) =>
  (SUGGESTION_PARTS[kind]?.parts ?? []).filter((part): part is Extract<SuggestionPart, { group: PartGroup }> => part.kind !== "question");
