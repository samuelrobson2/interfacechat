import { shellFillOf } from "./shell-fill";
import { isFillableKind, type ShellDataByKind, type ShellKind } from "./shell-types";

/** The kind of value a part holds, like a tool parameter's type. */
export type ShellPartType =
  | "text"
  | "markdown"
  | "target"
  | "list"
  | "tags"
  | "domains"
  | "columns"
  | "count"
  | "links"
  | "tasks"
  | "items"
  | "dates"
  | "file"
  | "highlights"
  | "place"
  | "places"
  | "colours"
  | "images"
  | "date"
  | "hours"
  | "events"
  | "level"
  | "sections"
  | "weighted"
  | "ranking"
  | "flow"
  | "branches"
  | "needs"
  | "steps"
  | "format"
  | "persona"
  | "facts";

export type ShellPart = {
  key: string;
  label: string;
  type: ShellPartType;
  /** What goes in it, written for the model the way a tool parameter is described. */
  description: string;
  /** The part has to be filled before the interface makes sense. */
  required?: boolean;
};

export const SHELL_PART_TYPE_HINT: Record<ShellPartType, string> = {
  text: "One line of plain text",
  markdown: "Markdown: headings, paragraphs, lists",
  target: "A target such as ~1,500 words",
  list: "An ordered list of short lines",
  tags: "Short free-text chips",
  domains: "Website domains",
  columns: "Named columns, each text, tag or image",
  count: "A whole number",
  links: "Real links, one per line, never invented",
  tasks: "Tasks with a day, start, end and type",
  items: "To-dos with an owner, a due date and done",
  dates: "Chosen dates, each with a note",
  file: "The document being worked on",
  highlights: "Exact quoted passages, each with an optional note",
  place: "A location",
  places: "Places with a distance, some shortlisted",
  colours: "Hex colours",
  images: "Images, each with a caption",
  date: "A date",
  hours: "A start and end hour",
  events: "Dated events with a title",
  level: "Beginner, Intermediate or Expert",
  sections: "Headed sections, each with its explanation",
  weighted: "Points, each weighted 1 to 3",
  ranking: "Items in order, best first, each with a reason",
  flow: "Steps and decisions joined by labelled paths",
  branches: "Branches around the centre, each with ideas",
  needs: "Ingredients or requirements, ticked off when gathered",
  steps: "Steps in order, each with an optional timer",
  format: "How a reply's text is laid out",
  persona: "Who replies",
  facts: "Short labelled values, such as Serves 12",
};

/** The parts each interface is made of, in the order they appear. */
export const SHELL_PARTS: Record<ShellKind, ShellPart[]> = {
  chat: [
    { key: "title", label: "Message", type: "text", required: true, description: "What the person asked or said." },
    { key: "format", label: "Reply", type: "format", description: "How the reply's text is laid out: Chat, Explainer, Pros & cons or Ranked list. Chosen from the query." },
    { key: "persona", label: "As", type: "persona", description: "Who replies: Assistant, Tutor, Critic or Brainstormer. Chosen from the query, kept for the thread." },
    { key: "messages", label: "Thread", type: "list", description: "The conversation so far." },
  ],
  document: [
    { key: "title", label: "Title", type: "text", required: true, description: "The topic, as the document's heading." },
    { key: "body", label: "Body", type: "markdown", description: "The writing itself. A suggestion holds only a one-line opening." },
    { key: "outline", label: "Outline", type: "list", description: "The section headings, read from the body's ## headings." },
    { key: "length", label: "Length", type: "target", description: "How long the finished piece should be." },
  ],
  search: [
    { key: "query", label: "Query", type: "text", required: true, description: "What to search for, as someone would type it." },
    { key: "queries", label: "Also searching", type: "list", description: "The follow-up searches it runs to cover the question." },
    { key: "filters", label: "Filters", type: "tags", description: "Constraints such as since 2020, peer-reviewed, in London." },
    { key: "sources", label: "Sources", type: "domains", description: "Sites to search, such as scholar.google.com." },
    { key: "results", label: "Found so far", type: "links", description: "What the search has turned up. Written into the reply as Cited results." },
  ],
  table: [
    { key: "title", label: "Title", type: "text", required: true, description: "What the table is, such as Shot list." },
    { key: "description", label: "Each row", type: "text", description: "What one row stands for, such as one shot." },
    { key: "columns", label: "Columns", type: "columns", required: true, description: "The columns, keeping any names the person asked for." },
    { key: "rowCount", label: "Rows", type: "count", description: "How many rows to expect." },
  ],
  schedule: [
    { key: "title", label: "Title", type: "text", required: true, description: "What the schedule is for." },
    { key: "dayCount", label: "Days", type: "count", required: true, description: "How many days the plan covers, from 'a three-day shoot'." },
    { key: "start", label: "Starts", type: "date", description: "The first day, from 'starting Thursday'. Days are numbered without it." },
    { key: "hours", label: "Hours", type: "hours", description: "The working day, from '7am to 7pm'." },
    { key: "tasks", label: "Tasks", type: "tasks", required: true, description: "Each task with its day, start and end, and whether it's setup, shooting, travel or a break." },
    { key: "constraints", label: "Plan around", type: "tags", description: "Limits such as cast availability or location hours." },
  ],
  tracker: [
    { key: "title", label: "Title", type: "text", required: true, description: "What the checklist is for." },
    { key: "items", label: "Items", type: "items", required: true, description: "Each thing to do, with an owner and a due date." },
    { key: "groups", label: "Groups", type: "tags", description: "Optional sections, such as Locations or Crew." },
  ],
  calendar: [
    { key: "title", label: "Title", type: "text", required: true, description: "What the events are for, such as December shoot." },
    { key: "month", label: "Month", type: "text", description: "The month shown, as YYYY-MM." },
    { key: "events", label: "Events", type: "events", required: true, description: "Events on the calendar, each with a date, a title and an optional time." },
  ],
  reader: [
    { key: "source", label: "Document", type: "file", required: true, description: "The document the person attached." },
    { key: "query", label: "Search or ask", type: "text", description: "What the person is searching for or asking, such as cancellation, or What happens if we cancel late? Answers go in the chat, not here." },
    { key: "highlights", label: "Found", type: "highlights", description: "Exact quotes the chat's answer relies on, each with an optional short note, marked in the document." },
  ],
  map: [
    { key: "query", label: "Looking for", type: "text", required: true, description: "The kind of place, such as cafés." },
    { key: "near", label: "Near", type: "place", required: true, description: "The location to search around." },
    { key: "filters", label: "Filters", type: "tags", description: "Constraints such as open by 7am or seats 8." },
    { key: "places", label: "Places", type: "places", description: "Real places with a distance. Shortlisted ones are starred." },
  ],
  timeline: [
    { key: "title", label: "Title", type: "text", required: true, description: "What the timeline covers." },
    { key: "events", label: "Events", type: "events", required: true, description: "What happened, each with a date (a year, YYYY-MM or YYYY-MM-DD) and a line of detail." },
  ],
  flowchart: [
    { key: "title", label: "Title", type: "text", required: true, description: "The process." },
    { key: "nodes", label: "Steps", type: "flow", required: true, description: "One start, the steps and yes/no decisions, and the ends." },
    { key: "edges", label: "Paths", type: "flow", description: "Arrows between steps. A decision's two paths are labelled Yes and No." },
  ],
  mindmap: [
    { key: "title", label: "Centre", type: "text", required: true, description: "The central topic." },
    { key: "branches", label: "Branches", type: "branches", required: true, description: "Four to six main ideas, each with a few ideas of its own." },
  ],
  guide: [
    { key: "title", label: "Title", type: "text", required: true, description: "What it makes or gets done." },
    { key: "facts", label: "Facts", type: "facts", description: "Two or three that this kind of guide calls for: Serves and Time for a recipe; Time, Difficulty and People for assembly." },
    { key: "needs", label: "You need", type: "needs", required: true, description: "Ingredients, parts, tools or requirements, with amounts, grouped (Ingredients and Equipment; Parts and Tools)." },
    { key: "steps", label: "Steps", type: "steps", required: true, description: "One action per step, in order. Minutes where there's waiting; a note for a tip or warning." },
  ],
  moodboard: [
    { key: "title", label: "Title", type: "text", required: true, description: "What the look is for." },
    { key: "keywords", label: "Keywords", type: "tags", description: "The look in words, such as natural window light." },
    { key: "palette", label: "Palette", type: "colours", description: "Five or so colours." },
    { key: "images", label: "Images", type: "images", description: "Reference images, each with a short caption." },
  ],
};

const live = Object.fromEntries(
  Object.entries(SHELL_PARTS).map(([kind, parts]) => [kind, parts.map((part) => ({ ...part }))]),
) as Record<ShellKind, ShellPart[]>;

export function shellParts(kind: ShellKind): ShellPart[] {
  return live[kind];
}

export function setShellParts(kind: ShellKind, next: ShellPart[]) {
  live[kind] = next.map((part) => ({ ...part }));
}

/** The parts as one line for the model, like a tool's parameter list. */
export function shellPartsSummary(kind: ShellKind): string {
  return live[kind]
    .map((part) => `${part.key} (${part.type}${part.required ? ", required" : ""}): ${part.description}`)
    .join("; ");
}

/** What a part currently holds in this data, as display text. Empty means unfilled. */
/** One item of a list part, as a short line. */
function itemText(item: unknown): string {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return String(item ?? "");
  const record = item as Record<string, unknown>;
  if (typeof record.date === "string")
    return typeof record.title === "string" ? `${formatDay(record.date)} · ${record.title}` : formatDay(record.date);
  if (typeof record.label === "string" && typeof record.value === "string") return `${record.label} ${record.value}`;
  const text = record.label ?? record.name ?? record.title ?? record.heading ?? record.text ?? record.quote ?? record.caption ?? "";
  return typeof text === "string" ? text : "";
}

const hourText = (hour: number) =>
  `${String(Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`;

function formatDay(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** A part's value read straight off its data: for interfaces past the first three, and chat formats. */
export function partValueOf(data: unknown, key: string): string | string[] {
  const value = (data as Record<string, unknown>)[key];
  if (key === "hours" && Array.isArray(value)) return value.map((h) => hourText(Number(h))).join("–");
  if (Array.isArray(value)) return value.map(itemText).filter(Boolean);
  if (typeof value === "number") return String(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDay(value);
  return typeof value === "string" ? value : "";
}

export function shellPartValue<K extends ShellKind>(
  kind: K,
  data: ShellDataByKind[K],
  key: string,
): string | string[] {
  if (!isFillableKind(kind)) return partValueOf(data, key);
  const fill = shellFillOf(kind, data as ShellDataByKind[typeof kind]);
  const details = fill.details as Record<string, unknown>;
  switch (key) {
    case "title":
    case "query":
      return fill.title;
    case "body":
    case "description":
      return fill.text;
    case "length":
      return (details.length as string | undefined) ?? "";
    case "rowCount": {
      const count = details.rowCount as number | undefined;
      return count ? `~${count}` : "";
    }
    case "columns":
      return ((details.columns as { label: string; type: string }[] | undefined) ?? []).map(
        (column) => (column.type === "text" ? column.label : `${column.label} (${column.type})`),
      );
    case "results":
      return ((details.results as { title: string }[] | undefined) ?? []).map((r) => r.title);
    default: {
      const value = details[key];
      return Array.isArray(value) ? (value as string[]) : typeof value === "string" ? value : "";
    }
  }
}
