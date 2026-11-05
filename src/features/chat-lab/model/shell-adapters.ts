import {
  EMPTY_SHELL_DATA,
  parseMarkdownTable,
  parseSearchResults,
  serializeMarkdownTable,
  type DocumentShellData,
  type SearchShellData,
  type ShellDataByKind,
  type TableShellData,
} from "@/features/interface-shells";
import type { ChatLabArtefact } from "./chat-lab-store";
import { extractCustomization, promptForInterface } from "./visual-interfaces";

export const EXPANDABLE_INTERFACE_KINDS = ["document", "search", "table", "moodboard"] as const;
export type ExpandableInterfaceKind = (typeof EXPANDABLE_INTERFACE_KINDS)[number];

export function isExpandableInterface(
  kind: string | null | undefined,
): kind is ExpandableInterfaceKind {
  return EXPANDABLE_INTERFACE_KINDS.includes(kind as ExpandableInterfaceKind);
}

/** Moodboards aren't in the shell library yet; their draft is a title and notes. */
export type StarterDataByKind = ShellDataByKind & { moodboard: DocumentShellData };
export type StarterData = StarterDataByKind[ExpandableInterfaceKind];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * A table's title and columns read off the request: "a shot list with framing,
 * cast and equipment for each shot" → "Shot list" / Shot, Framing, Cast, Equipment.
 */
export function tableDraft(draft: string): TableShellData {
  const text = draft.trim();
  const subject = text.match(
    /\b(?:into|make|build|create|draft|give me|generate)\s+(?:me\s+)?(?:a|an|the)?\s*([\w\s-]{3,40}?)\s+(?:with|for|of|from|that|showing|listing)\b/i,
  )?.[1];
  const listed = text.match(/\bwith\s+(.+?)(?:\s+(?:for|per)\s+(?:each|every)\s+([\w-]+)|[.?!]|$)/i);
  const each =
    listed?.[2] ?? text.match(/\b(?:for|per)\s+(?:each|every)\s+([\w-]+)/i)?.[1];

  const labels = (listed?.[1] ?? "")
    .split(/,\s*(?:and\s+)?|\s+and\s+/)
    .map((label) => label.trim())
    .filter((label) => label.length > 0 && label.length <= 30);
  if (each) labels.unshift(each);

  return {
    title: capitalize(subject?.trim() || extractCustomization(text)),
    columns: labels.map((label, index) => ({
      id: `col-${index}`,
      label: capitalize(label),
      type: /image|photo|picture|reference|thumbnail/i.test(label) ? "image" : "text",
    })),
    rows: [],
  };
}

/** What a shell shows on the home screen, from what's been typed so far. */
export function draftShellData<K extends ExpandableInterfaceKind>(
  kind: K,
  draft: string,
): StarterDataByKind[K] {
  const topic = extractCustomization(draft);
  switch (kind) {
    case "search":
      return { ...EMPTY_SHELL_DATA.search, query: topic } as StarterDataByKind[K];
    case "table":
      return tableDraft(draft) as StarterDataByKind[K];
    default:
      return { title: topic, body: "" } as StarterDataByKind[K];
  }
}

/** Title the new session's interface opens with. */
export function starterTitle(kind: ExpandableInterfaceKind, data: StarterData) {
  return (kind === "search" ? (data as SearchShellData).query : (data as DocumentShellData).title).trim();
}

const namedColumns = (table: TableShellData) =>
  table.columns.filter((column) => column.label.trim());

/** The first message, built from a shell the person filled in on the home screen. */
export function promptFromShellData(
  kind: ExpandableInterfaceKind,
  data: StarterData,
  draft: string,
): string {
  if (kind === "search") {
    const search = data as SearchShellData;
    const query = search.query.trim() || "Search…";
    const filters = search.filters.length ? `\n\nFilters: ${search.filters.join(", ")}` : "";
    const queries = search.queries.length
      ? `\n\nAlso search:\n${search.queries.map((item) => `- ${item}`).join("\n")}`
      : "";
    return `Search the web for: ${query}${filters}${queries}`;
  }
  if (kind === "table") {
    const table = data as TableShellData;
    const base = draft.trim() || promptForInterface("table", table.title);
    const columns = namedColumns(table).map((column) => column.label);
    return columns.length ? `${base}\n\nColumns: ${columns.join(", ")}` : base;
  }
  const doc = data as DocumentShellData;
  const base = promptForInterface(kind, doc.title);
  return doc.body.trim() ? `${base}\n\nContext:\n${doc.body.trim()}` : base;
}

/** Interface content to seed a new session with, before the model writes. */
export function seedArtefactContent(kind: ExpandableInterfaceKind, data: StarterData | null) {
  if (kind !== "table" || !data) return undefined;
  const columns = namedColumns(data as TableShellData);
  return columns.length ? serializeMarkdownTable(columns, []) : undefined;
}

/** The editor has its own title field, so a leading `# Heading` becomes the title. */
export function artefactDocument(artefact: ChatLabArtefact): DocumentShellData {
  const heading = artefact.content.match(/^\s*#\s+(.+)\n*/);
  if (heading?.[1]) {
    return {
      title: heading[1].trim(),
      body: artefact.content.slice(heading[0].length),
    };
  }
  return { title: artefact.title, body: artefact.content };
}

export function artefactSearch(artefact: ChatLabArtefact, query: string): SearchShellData {
  return {
    query,
    filters: artefact.filters ?? [],
    queries: [],
    results: parseSearchResults(artefact.content),
  };
}

export function artefactTable(artefact: ChatLabArtefact): TableShellData {
  const parsed = parseMarkdownTable(artefact.content);
  return {
    title: artefact.title,
    columns: parsed?.columns ?? [],
    rows: parsed?.rows ?? [],
  };
}