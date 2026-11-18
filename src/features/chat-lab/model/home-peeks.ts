import type {
  ChatShellData,
  ChatShellKind,
  GuideShellData,
  NotesShellData,
  SearchShellData,
  TableShellData,
  TrackerShellData,
} from "@/features/interface-shells";
import type { KindData } from "./home-tiles";

/**
 * Something to try, shown on the chat home: one of the interfaces round the
 * headline grows to medium plus where it stands, filled with an example, with
 * the request that would make it as its title (Chat: as the message). Short
 * enough for one line of the title. Hard-coded for now.
 *
 * Each shows a different everyday use, so someone new sees the range at a
 * glance: Notes plans a trip, Chat answers a quick question, Search researches
 * a purchase, Table compares options, Tracker keeps a move on track, Guide
 * walks through a recipe.
 */
export type HomePeek = { kind: ChatShellKind; prompt: string; data: KindData["data"] };

/** Planning: a weekend away, what's settled and what isn't. */
const notes: NotesShellData = {
  title: "",
  body: ["Goal: a long weekend in Lisbon", "When: 3 to 6 May", "Budget: about £600", "Going: me and Alex", "Still to decide: where to stay"].join("\n"),
};

/** A quick question: the message is the request itself. */
const chat: ChatShellData = { title: "", messages: [] };

/** Research before buying: what to look for, and where. */
const search: SearchShellData = {
  query: "",
  queries: [],
  filters: ["Reviews", "Under £100"],
  sources: ["runnersworld.com", "which.co.uk", "reddit.com"],
  results: [],
};

/** Comparing options side by side. */
const table: TableShellData = {
  title: "",
  columns: [
    { id: "phone", label: "Phone", type: "text" },
    { id: "price", label: "Price", type: "text" },
    { id: "battery", label: "Battery", type: "tag" },
    { id: "camera", label: "Camera", type: "tag" },
  ],
  rows: [
    { id: "p1", cells: { phone: "Pixel 9", price: "£799", battery: "All day", camera: "Great" } },
    { id: "p2", cells: { phone: "iPhone 16", price: "£799", battery: "All day", camera: "Great" } },
    { id: "p3", cells: { phone: "Galaxy S25", price: "£749", battery: "Long", camera: "Good" } },
  ],
};

/** Life admin: what's done and what's left, in order. */
const tracker: TrackerShellData = {
  title: "",
  groups: ["This month", "Moving day"],
  items: [
    { id: "m1", label: "Book a removal van", group: "This month", done: true },
    { id: "m2", label: "Give notice to the landlord", group: "This month", done: false },
    { id: "m3", label: "Redirect the post", group: "This month", done: false },
    { id: "m4", label: "Pack the kitchen", group: "Moving day", done: false },
    { id: "m5", label: "Hand back the keys", group: "Moving day", done: false },
  ],
};

/** Step by step: a recipe to cook along to. */
const guide: GuideShellData = {
  title: "",
  facts: [
    { label: "Serves", value: "4" },
    { label: "Time", value: "35 min" },
  ],
  needs: [
    { id: "n1", text: "300 g risotto rice", have: false, group: "Ingredients" },
    { id: "n2", text: "400 g mushrooms, sliced", have: false, group: "Ingredients" },
    { id: "n3", text: "1 litre hot vegetable stock", have: false, group: "Ingredients" },
    { id: "n4", text: "1 onion and 2 cloves of garlic", have: false, group: "Ingredients" },
  ],
  steps: [
    { id: "s1", text: "Soften the onion and garlic in a little olive oil.", minutes: 5, done: false },
    { id: "s2", text: "Add the mushrooms and cook until golden.", minutes: 8, done: false },
    { id: "s3", text: "Stir in the rice, then add the stock a ladle at a time.", minutes: 18, done: false },
    { id: "s4", text: "Finish with butter and parmesan, and serve.", minutes: 2, done: false },
  ],
};

/** Only the six round the headline: the rest sit at the edges, partly out of view. */
export const HOME_PEEKS: HomePeek[] = [
  { kind: "notes", prompt: "Plan a weekend in Lisbon", data: notes },
  { kind: "chat", prompt: "How do I ask for a pay rise?", data: chat },
  { kind: "search", prompt: "Find the best running shoes", data: search },
  { kind: "table", prompt: "Compare three phones", data: table },
  { kind: "tracker", prompt: "Checklist for moving house", data: tracker },
  { kind: "guide", prompt: "Mushroom risotto for 4", data: guide },
];

/** The example a peek is filled with, headed with its request (Search heads with its query; Chat's title is its message). */
export const peekValue = ({ kind, prompt, data }: Pick<HomePeek, "kind" | "prompt" | "data">) =>
  ({ kind, data: { ...data, ...(kind === "search" ? { query: prompt } : { title: prompt }) } }) as KindData;

/** How long one shows (its request typing in and its parts arriving take about two seconds of it), and the pause before the next. */
export const PEEK_SHOW_MS = 7000;
export const PEEK_GAP_MS = 1800;
/** The first waits until the page has settled after the interfaces spin out. */
export const PEEK_FIRST_MS = 1600;

/** A different one from last time, so it never seems stuck. */
export function nextPeek(last: ChatShellKind | null, available: ChatShellKind[]): HomePeek | null {
  const options = HOME_PEEKS.filter((peek) => peek.kind !== last && available.includes(peek.kind));
  return options.length ? options[Math.floor(Math.random() * options.length)]! : null;
}
