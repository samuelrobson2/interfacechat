import {
  CHART_TYPE_META,
  catalogueFields,
  isCatalogueKind,
  shellAvoidScore,
  shellPartsSummary,
  shellQueryMatchScore,
  shellRetrieval,
  CHAT_FORMAT_META,
  chatFormatRetrieval,
  type ChatFormatKind,
  type ShellKind,
  type ShellRetrieval,
} from "@/features/interface-shells";

export type VisualInterfaceKind =
  | "document"
  | "moodboard"
  | "blog"
  | "search"
  | "email"
  | "spreadsheet"
  | "chart"
  | "calendar"
  | "code"
  | "slides"
  | "checklist"
  | "outline"
  | "image"
  | "map"
  | "social"
  | "timeline"
  | "kanban"
  | "reader"
  | "schedule"
  | "explainer"
  | "proscons"
  | "ranked"
  | "flowchart"
  | "mindmap"
  | "guide"
  | "table";

export type VisualInterface = {
  id: VisualInterfaceKind;
  /** Short name for retrieval / LLM choice. */
  label: string;
  /** One-line description for the model when choosing among candidates. */
  description: string;
  /** Seed text dropped into the composer when the empty shell is clicked. */
  seed: string;
  /** Loose keywords that point a typed prompt at this interface. */
  match: RegExp;
  /** Higher wins when several matchers fire. */
  priority: number;
  /** Shown in the idle orbit before anything is typed. */
  ambient?: boolean;
};

export const VISUAL_INTERFACES: VisualInterface[] = [
  {
    id: "document",
    label: "Document",
    description: "Long-form writing: papers, essays, reports, memos",
    seed: "Write a paper on ",
    priority: 40,
    ambient: true,
    match:
      /\b(write|draft|compose)\b.*\b(paper|document|essay|report|memo)\b|\b(a |an |the )?(paper|document|essay|report|memo)\b.*\b(on|about|regarding)\b/i,
  },
  {
    id: "moodboard",
    label: "Moodboard",
    description: "Visual collage of references, colors, and aesthetic direction",
    seed: "Make a moodboard for ",
    priority: 55,
    ambient: true,
    match: /\b(mood\s*board|moodboard|collage|inspiration board|aesthetic board)\b/i,
  },
  {
    id: "blog",
    label: "Blog post",
    description: "Blog or newsletter article with a clear voice",
    seed: "Write a blog post about ",
    priority: 50,
    match: /\b(blog(\s*post)?|newsletter)\b/i,
  },
  {
    id: "search",
    label: "Search",
    description: "Web search with filters and a list of findings",
    seed: "Search for ",
    priority: 45,
    ambient: true,
    match:
      /\b(search|find|look\s*up|query)\b|\b(papers|research|studies|sources)\b.*\b(on|about|for)\b/i,
  },
  {
    id: "email",
    label: "Email",
    description: "Draft an email or reply",
    seed: "Draft an email about ",
    priority: 50,
    match: /\b(email|e-mail|mail|inbox|reply to)\b/i,
  },
  {
    id: "spreadsheet",
    label: "Spreadsheet",
    description: "Tabular data, budgets, or structured rows",
    seed: "Build a spreadsheet for ",
    priority: 48,
    match: /\b(spreadsheet|workbook|excel|csv|budget sheet)\b/i,
  },
  {
    id: "chart",
    label: "Chart",
    description: "Visualize numbers as a chart or dashboard",
    seed: "Chart the data for ",
    priority: 47,
    match:
      /\b(chart|graph|plot|visualize|visualise|dashboard)\b|\b(bar|line|pie)\s*(chart|graph)\b/i,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Schedule, agenda, or meeting plan",
    seed: "Plan a calendar for ",
    priority: 50,
    match: /\b(calendar|schedule|agenda|timeline of events|book a meeting)\b/i,
  },
  {
    id: "code",
    label: "Code",
    description: "Write or debug code and scripts",
    seed: "Write code for ",
    priority: 52,
    match:
      /\b(code|script|function|api|refactor|debug|typescript|python|javascript|sql)\b/i,
  },
  {
    id: "slides",
    label: "Slides",
    description: "Presentation deck or pitch slides",
    seed: "Make slides about ",
    priority: 50,
    match: /\b(slides?|deck|presentation|pitch)\b/i,
  },
  {
    id: "checklist",
    label: "Checklist",
    description: "Todo list or prioritized task checklist",
    seed: "Make a checklist for ",
    priority: 46,
    match: /\b(checklist|todo|to-?do|task list|prioriti[sz]e)\b/i,
  },
  {
    id: "outline",
    label: "Outline",
    description: "Structure or table of contents before writing",
    seed: "Outline ",
    priority: 42,
    match: /\b(outline|structure|skeleton|table of contents)\b/i,
  },
  {
    id: "image",
    label: "Image",
    description: "Generate or describe a picture / illustration",
    seed: "Generate an image of ",
    priority: 54,
    match:
      /\b(image|illustration|picture|photo|render|draw|generate (an? )?(image|picture|illustration))\b/i,
  },
  {
    id: "map",
    label: "Map",
    description: "Places, routes, or geographic layout",
    seed: "Map out ",
    priority: 48,
    match: /\b(map|geography|locations?|route|directions)\b/i,
  },
  {
    id: "reader",
    label: "Reader",
    description: "Understand or find things in a document someone already has",
    seed: "Explain this document: ",
    priority: 48,
    match: /\b(review this|explain this|summari[sz]e this|this (paper|contract|agreement|pdf|document|lease|report)|highlight the|flag (anything|the))\b/i,
  },
  {
    id: "schedule",
    label: "Schedule",
    description: "Tasks across hours and days, as a Gantt",
    seed: "Build a schedule for ",
    priority: 47,
    match: /\b(gantt|call sheet|hour by hour|shoot schedule|run of show)\b/i,
  },
  {
    id: "explainer",
    label: "Explainer",
    description: "Teach a topic in clear sections",
    seed: "Explain ",
    priority: 46,
    match: /\b(explain(?! this)|teach me|walk me through|help me understand|eli5)\b/i,
  },
  {
    id: "proscons",
    label: "Pros & cons",
    description: "Weigh the benefits and drawbacks of a choice",
    seed: "What are the pros and cons of ",
    priority: 48,
    match: /\b(pros and cons|pros|cons|trade-?offs|worth it|weigh up)\b/i,
  },
  {
    id: "ranked",
    label: "Ranked list",
    description: "Options in order, with a reason for each",
    seed: "Rank ",
    priority: 47,
    match: /\b(rank|ranked|ranking|prioriti[sz]e|top (three|five|3|5))\b/i,
  },
  {
    id: "flowchart",
    label: "Flowchart",
    description: "A process with steps and decisions",
    seed: "Make a flowchart of ",
    priority: 47,
    match: /\b(flow ?chart|decision tree|workflow)\b/i,
  },
  {
    id: "mindmap",
    label: "Mind map",
    description: "Ideas branching from a central topic",
    seed: "Brainstorm ",
    priority: 47,
    match: /\b(mind ?map|brainstorm|spider diagram)\b/i,
  },
  {
    id: "guide",
    label: "Guide",
    description: "A recipe or how-to to follow step by step",
    seed: "Give me a recipe for ",
    priority: 47,
    match: /\b(recipe|ingredients|step[- ]by[- ]step|how do i|instructions for)\b/i,
  },
  {
    id: "social",
    label: "Social post",
    description: "Short social post or thread",
    seed: "Write a social post about ",
    priority: 49,
    match: /\b(tweet|twitter|x\.com|linkedin|instagram|social post|thread)\b/i,
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Chronological sequence of events",
    seed: "Build a timeline of ",
    priority: 47,
    match: /\b(timeline|chronolog|history of|sequence of events)\b/i,
  },
  {
    id: "kanban",
    label: "Kanban",
    description: "Project board with columns and cards",
    seed: "Make a kanban board for ",
    priority: 51,
    match: /\b(kanban|scrum board|project board|pipeline board)\b/i,
  },
  {
    id: "table",
    label: "Table",
    description: "Comparison or data table",
    seed: "Make a table of ",
    priority: 49,
    match:
      /\b(table|tabulate|shot\s*list|comparison|compare .+ by|matrix|tracker|inventory|grid of|list of .+ with (columns|their))\b/i,
  },
];

/** Kinds that have a real workspace panel today. */
export const IMPLEMENTABLE_INTERFACE_KINDS = [
  "document",
  "search",
  "table",
  "moodboard",
] as const;

export type ImplementableInterfaceKind =
  (typeof IMPLEMENTABLE_INTERFACE_KINDS)[number];

/** Map any library kind onto a panel we can actually open. */
export function resolveImplementableKind(
  kind: VisualInterfaceKind,
): ImplementableInterfaceKind {
  if (kind === "search") return "search";
  if (kind === "table" || kind === "spreadsheet") return "table";
  if (kind === "moodboard" || kind === "image") return "moodboard";
  return "document";
}

/** What the model's pick opens as: a panel kind, or a catalogue interface of its own. */
export function opensAsOf(kind: VisualInterfaceKind): ImplementableInterfaceKind | "tracker" {
  return kind === "checklist" ? "tracker" : resolveImplementableKind(kind);
}

export type InterfaceCandidate = {
  id: VisualInterfaceKind;
  label: string;
  description: string;
  /** Panel kind if the model opens this candidate. */
  opensAs: ImplementableInterfaceKind | "tracker";
  /** A format shapes the reply in the thread; only an interface opens. */
  layer: "interface" | "format";
};

const KIND_WORDS =
  /^(paper|document|essay|report|memo|blog(\s*post)?|newsletter|article|mood\s*board|moodboard|collage|email|e-mail|spreadsheet|workbook|chart|graph|dashboard|calendar|schedule|agenda|code|script|slides?|deck|presentation|checklist|outline|image|illustration|picture|map|tweet|thread|timeline|kanban|board|table)\s+/i;

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "for",
  "on",
  "about",
  "of",
  "to",
  "in",
  "and",
  "or",
  "with",
  "my",
  "me",
  "please",
  "can",
  "you",
  "help",
  "i",
  "want",
  "like",
  "make",
  "create",
  "build",
  "write",
  "draft",
  "compose",
  "search",
  "find",
  "look",
  "up",
  "query",
  "generate",
  "plan",
  "draw",
  "render",
  "prioritize",
  "prioritise",
  ...VISUAL_INTERFACES.flatMap((item) =>
    item.id.split(/(?=[A-Z])/).map((part) => part.toLowerCase()),
  ),
  "paper",
  "papers",
  "document",
  "essay",
  "report",
  "memo",
  "blog",
  "post",
  "newsletter",
  "article",
  "moodboard",
  "mood",
  "board",
  "collage",
  "email",
  "mail",
  "spreadsheet",
  "excel",
  "csv",
  "chart",
  "graph",
  "plot",
  "dashboard",
  "calendar",
  "schedule",
  "agenda",
  "code",
  "script",
  "slides",
  "slide",
  "deck",
  "presentation",
  "pitch",
  "checklist",
  "todo",
  "tasks",
  "outline",
  "image",
  "illustration",
  "picture",
  "photo",
  "map",
  "tweet",
  "thread",
  "timeline",
  "kanban",
  "table",
  "regarding",
]);

/** Asking for rows and columns beats incidental words (a film "script" isn't code). */
const TABULAR_CUES = /\b(shot\s*list|table|tabulate|columns?|rows?)\b/i;

/**
 * Retrieve the top library interfaces for a user turn. Cheap lexical + regex
 * ranking — the LLM then chooses among these or stays in plain chat.
 */
export function retrieveInterfaces(
  draft: string,
  limit = 5,
): InterfaceCandidate[] {
  const text = draft.trim();
  if (!text) return [];

  const isDrafting = /\b(write|draft|compose)\b/i.test(text);
  const isLookup = /\b(search|find|look\s*up|query)\b/i.test(text);
  const isTabular = TABULAR_CUES.test(text);
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

  const scored = VISUAL_INTERFACES.map((item) => {
    let score = 0;
    if (item.match.test(text)) score += item.priority;
    if (item.id === "search" && isDrafting && !isLookup) score -= 30;
    if (item.id === "document" && isDrafting) score += 12;
    if (item.id === "search" && isLookup) score += 12;
    if (item.id === "table" && isTabular) score += 12;

    const libraryKind = libraryKindOf(item.id);
    const profile = libraryProfile(item.id);
    const haystack = `${item.id} ${item.label} ${profile?.description ?? item.description} ${
      profile?.queries.join(" ") ?? ""
    }`.toLowerCase();
    for (const word of words) {
      if (haystack.includes(word)) score += 6;
    }
    if (libraryKind)
      score += shellQueryMatchScore(libraryKind, text) - shellAvoidScore(libraryKind, text);
    if (item.ambient) score += 2;
    return { item, score };
  })
    // Need more than the ambient +2 bump so plain chat ("hi") stays chat-only.
    .filter((entry) => entry.score > 2)
    .sort((a, b) => b.score - a.score);

  // No library signal → no candidates; the model just chats.
  const picked = scored.slice(0, limit).map((entry) => entry.item);
  if (picked.length === 0) return [];

  return picked.map((item) => {
    const profile = libraryProfile(item.id);
    const libraryKind = libraryKindOf(item.id);
    const format = CHAT_FORMAT_OF[item.id];
    return {
      id: item.id,
      label: item.label,
      description: format
        ? formatCandidateText(format)
        : profile && libraryKind
          ? libraryCandidateText(libraryKind, profile) + chartTypeNote(item.id)
          : item.description,
      opensAs: opensAsOf(item.id),
      // A chat format lays out the reply; it never opens.
      layer: format ? "format" : "interface",
    };
  });
}

/**
 * What the model reads about a library interface: when to use it, what it isn't
 * for, its typed parts, and examples either side of the line.
 */
function libraryCandidateText(kind: ShellKind, profile: ShellRetrieval) {
  const examples = profile.queries.filter((q) => q.trim()).slice(0, 4);
  const nearMisses = profile.avoidQueries.filter((q) => q.trim()).slice(0, 3);
  return [
    profile.description.trim(),
    profile.notFor.trim() && `Not for: ${profile.notFor.trim()}`,
    // A catalogue interface's fields come from the schema the model fills.
    `Parts: ${isCatalogueKind(kind) ? catalogueFields(kind) : shellPartsSummary(kind)}.`,
    examples.length && `Opens for: ${examples.map((q) => `"${q}"`).join(", ")}.`,
    nearMisses.length && `Does not open for: ${nearMisses.map((q) => `"${q}"`).join(", ")}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Mind map, timeline and flowchart are Chart's types: say which one this candidate opens. */
function chartTypeNote(kind: VisualInterfaceKind) {
  if (kind !== "mindmap" && kind !== "timeline" && kind !== "flowchart") return "";
  return ` Opens Chart as a ${CHART_TYPE_META[kind].label.toLowerCase()}.`;
}

/** Chat formats: versions of a chat reply, described to the model like an interface's parts. */
const CHAT_FORMAT_OF: Partial<Record<VisualInterfaceKind, ChatFormatKind>> = {
  explainer: "explainer",
  proscons: "proscons",
  ranked: "ranked",
};

/** The one candidate for a first reply whose format was chosen on the Chat card. */
export function chatFormatCandidate(format: ChatFormatKind): InterfaceCandidate {
  const item = VISUAL_INTERFACES.find((entry) => entry.id === format)!;
  return { id: item.id, label: item.label, description: formatCandidateText(format), opensAs: "document", layer: "format" };
}

function formatCandidateText(format: ChatFormatKind) {
  const profile = chatFormatRetrieval(format);
  const examples = profile.queries.filter((q) => q.trim()).slice(0, 4);
  return [
    profile.description.trim(),
    profile.notFor.trim() && `Not for: ${profile.notFor.trim()}`,
    `Lay the text out like this example:\n${CHAT_FORMAT_META[format].example}`,
    examples.length && `Use for: ${examples.map((q) => `"${q}"`).join(", ")}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** The library interface whose description, parts and examples describe this kind. */
const LIBRARY_KIND: Partial<Record<VisualInterfaceKind, ShellKind>> = {
  document: "document",
  search: "search",
  table: "table",
  spreadsheet: "table",
  // Three ways the model can ask for a chart; each opens Chart as that type.
  timeline: "chart",
  schedule: "schedule",
  flowchart: "chart",
  mindmap: "chart",
  guide: "guide",
  checklist: "tracker",
  calendar: "calendar",
  reader: "reader",
  map: "map",
  moodboard: "moodboard",
};

function libraryKindOf(kind: VisualInterfaceKind): ShellKind | null {
  return LIBRARY_KIND[kind] ?? null;
}

function libraryProfile(kind: VisualInterfaceKind) {
  const format = CHAT_FORMAT_OF[kind];
  if (format) return chatFormatRetrieval(format);
  const libraryKind = libraryKindOf(kind);
  return libraryKind ? shellRetrieval(libraryKind) : null;
}

/**
 * Pick the interface a draft is aiming at. Drafting verbs beat lookup when both
 * could match ("write a paper on AI" → document; "search for papers on AI" →
 * search).
 */
export function matchVisualInterface(
  draft: string,
): VisualInterfaceKind | null {
  const text = draft.trim();
  if (!text) return null;

  const isDrafting = /\b(write|draft|compose)\b/i.test(text);
  const isLookup = /\b(search|find|look\s*up|query)\b/i.test(text);
  const isTabular = TABULAR_CUES.test(text);

  let best: { id: VisualInterfaceKind; score: number } | null = null;
  for (const item of VISUAL_INTERFACES) {
    if (!item.match.test(text)) continue;
    let score = item.priority;
    if (item.id === "search" && isDrafting && !isLookup) score -= 30;
    if (item.id === "document" && isDrafting) score += 12;
    if (item.id === "search" && isLookup) score += 12;
    if (item.id === "table" && isTabular) score += 12;
    if (!best || score > best.score) best = { id: item.id, score };
  }

  let queryBest: { id: VisualInterfaceKind; score: number } | null = null;
  for (const kind of ["document", "search", "table"] as const) {
    const score = shellQueryMatchScore(kind, text);
    if (score >= 24 && (!queryBest || score > queryBest.score)) queryBest = { id: kind, score };
  }
  if (queryBest && (!best || queryBest.score > best.score)) return queryBest.id;
  return best?.id ?? null;
}

/** Exactly three shells: the ambient set, with a non-ambient match swapping in. */
export function orbitingInterfaces(
  active: VisualInterfaceKind | null,
): VisualInterfaceKind[] {
  const ambient = VISUAL_INTERFACES.filter((item) => item.ambient)
    .map((item) => item.id)
    .slice(0, 3);
  if (!active || ambient.includes(active)) return ambient;
  return [...ambient.slice(0, 2), active];
}

/**
 * The customization fragment — whatever remains after stripping the interface
 * scaffolding. "Write a paper on AI" → "AI"; "search for papers on AI" →
 * "papers on AI".
 */
export function extractCustomization(draft: string): string {
  let text = draft.trim();
  if (!text) return "";

  text = text.replace(
    /^(can you |could you |please |help me (to )?|i (want to |would like to |need to )|i'd like to )/i,
    "",
  );
  text = text.replace(
    /^(search( for)?|find( me)?|look up|query|write( me| a| an)?|draft( me| a| an)?|compose( a| an)?|create( a| an)?|make( a| an)?|build( a| an)|generate( a| an)?|plan( a| an)?|chart|plot|visualize|visualise|outline|map out|draw|render)\s+/i,
    "",
  );
  text = text.replace(/^(a |an |the )\s+/i, "");
  text = text.replace(KIND_WORDS, "");
  text = text.replace(/^(on|about|regarding|for|of)\s+/i, "");

  return text.trim();
}

/** Short chips for the search graphic, derived from the customization text. */
export function customizationFilters(
  customization: string,
  limit = 3,
): string[] {
  const seen = new Set<string>();
  const chips: string[] = [];
  for (const raw of customization.split(/[^A-Za-z0-9+#-]+/)) {
    const word = raw.trim();
    if (word.length < 2) continue;
    const key = word.toLowerCase();
    if (STOPWORDS.has(key) || seen.has(key)) continue;
    seen.add(key);
    chips.push(word);
    if (chips.length >= limit) break;
  }
  return chips;
}

export function promptForInterface(
  kind: VisualInterfaceKind,
  customization: string,
): string {
  const item = VISUAL_INTERFACES.find((entry) => entry.id === kind)!;
  const topic = customization.trim();
  if (!topic) return item.seed.trimEnd();
  return `${item.seed}${topic}`;
}

export function interfaceSeed(kind: VisualInterfaceKind): string {
  return VISUAL_INTERFACES.find((entry) => entry.id === kind)!.seed;
}
