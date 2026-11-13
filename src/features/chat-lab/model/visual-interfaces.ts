import {
  CHART_TYPE_META,
  catalogueFields,
  isCatalogueKind,
  SHELL_ROUTE_FLOOR,
  scoreProfile,
  shellKindScore,
  shellPartsSummary,
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
  | "table"
  | "dashboard"
  | "article";

export type VisualInterface = {
  id: VisualInterfaceKind;
  /** Short name for retrieval / LLM choice. */
  label: string;
  /** One-line description for the model when choosing among candidates. */
  description: string;
  /** Seed text dropped into the composer when the empty shell is clicked. */
  seed: string;
  /**
   * Keywords for an interface the library doesn't score (Blog, Email, Code…),
   * and to choose between items that share one (Chart's types, Table and
   * Spreadsheet). Library interfaces are scored by their retrieval profile.
   */
  match: RegExp;
  /** Shown in the idle orbit before anything is typed. */
  ambient?: boolean;
};

export const VISUAL_INTERFACES: VisualInterface[] = [
  {
    id: "document",
    label: "Document",
    description: "Long-form writing: papers, essays, reports, memos",
    seed: "Write a paper on ",
    ambient: true,
    match:
      /\b(write|draft|compose)\b.*\b(paper|document|essay|report|memo)\b|\b(a |an |the )?(paper|document|essay|report|memo)\b.*\b(on|about|regarding)\b/i,
  },
  {
    id: "moodboard",
    label: "Canvas",
    description: "Visual collage of references, colors, and aesthetic direction",
    seed: "Make a moodboard for ",
    ambient: true,
    match: /\b(mood\s*board|moodboard|collage|inspiration board|aesthetic board)\b/i,
  },
  {
    id: "blog",
    label: "Blog post",
    description: "Blog or newsletter article with a clear voice",
    seed: "Write a blog post about ",
    match: /\b(blog(\s*post)?|newsletter)\b/i,
  },
  {
    id: "search",
    label: "Search",
    description: "Web search with filters and a list of findings",
    seed: "Search for ",
    ambient: true,
    match:
      /\b(search|find|look\s*up|query)\b|\b(papers|research|studies|sources)\b.*\b(on|about|for)\b/i,
  },
  {
    id: "email",
    label: "Email",
    description: "Draft an email or reply",
    seed: "Draft an email about ",
    match: /\b(email|e-mail|mail|inbox|reply to)\b/i,
  },
  {
    id: "spreadsheet",
    label: "Spreadsheet",
    description: "Tabular data, budgets, or structured rows",
    seed: "Build a spreadsheet for ",
    match: /\b(spreadsheet|workbook|excel|csv|budget sheet)\b/i,
  },
  {
    id: "chart",
    label: "Chart",
    description: "Visualize numbers as a chart",
    seed: "Chart the data for ",
    match:
      /\b(chart|graph|plot|visualize|visualise)\b|\b(bar|line|pie)\s*(chart|graph)\b/i,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Figures, charts and tables over data, with filters and runnable code",
    seed: "Build a dashboard of ",
    match: /\b(dashboards?|kpis?|metrics|analytics|data app)\b/i,
  },
  {
    id: "article",
    label: "Article",
    description: "An interactive article: prose with live charts, controls and code",
    seed: "Write an interactive article on ",
    match: /\b(interactive (article|essay|post|piece)|data stor(y|ies)|explorables?|live charts?)\b/i,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Schedule, agenda, or meeting plan",
    seed: "Plan a calendar for ",
    match: /\b(calendar|schedule|agenda|timeline of events|book a meeting)\b/i,
  },
  {
    id: "code",
    label: "Code",
    description: "Write or debug code and scripts",
    seed: "Write code for ",
    match:
      /\b(code|script|function|api|refactor|debug|typescript|python|javascript|sql)\b/i,
  },
  {
    id: "slides",
    label: "Slides",
    description: "Presentation deck or pitch slides",
    seed: "Make slides about ",
    match: /\b(slides?|deck|presentation|pitch)\b/i,
  },
  {
    id: "checklist",
    label: "Checklist",
    description: "Todo list or prioritized task checklist",
    seed: "Make a checklist for ",
    match: /\b(checklist|todo|to-?do|task list|prioriti[sz]e)\b/i,
  },
  {
    id: "outline",
    label: "Outline",
    description: "Structure or table of contents before writing",
    seed: "Outline ",
    match: /\b(outline|structure|skeleton|table of contents)\b/i,
  },
  {
    id: "image",
    label: "Image",
    description: "Generate or describe a picture / illustration",
    seed: "Generate an image of ",
    match:
      /\b(image|illustration|picture|photo|render|draw|generate (an? )?(image|picture|illustration))\b/i,
  },
  {
    id: "map",
    label: "Map",
    description: "Places, routes, or geographic layout",
    seed: "Map out ",
    match: /\b(map|geography|locations?|route|directions)\b/i,
  },
  {
    id: "reader",
    label: "Reader",
    description: "Understand or find things in a document someone already has",
    seed: "Explain this document: ",
    match: /\b(review this|explain this|summari[sz]e this|this (paper|contract|agreement|pdf|document|lease|report)|highlight the|flag (anything|the))\b/i,
  },
  {
    id: "schedule",
    label: "Schedule",
    description: "Tasks across hours and days, as a Gantt",
    seed: "Build a schedule for ",
    match: /\b(gantt|call sheet|hour by hour|shoot schedule|run of show)\b/i,
  },
  {
    id: "explainer",
    label: "Explainer",
    description: "Teach a topic in clear sections",
    seed: "Explain ",
    match: /\b(explain(?! this)|teach me|walk me through|help me understand|eli5)\b/i,
  },
  {
    id: "proscons",
    label: "Pros & cons",
    description: "Weigh the benefits and drawbacks of a choice",
    seed: "What are the pros and cons of ",
    match: /\b(pros and cons|pros|cons|trade-?offs|worth it|weigh up)\b/i,
  },
  {
    id: "ranked",
    label: "Ranked list",
    description: "Options in order, with a reason for each",
    seed: "Rank ",
    match: /\b(rank|ranked|ranking|prioriti[sz]e|top (three|five|3|5))\b/i,
  },
  {
    id: "flowchart",
    label: "Flowchart",
    description: "A process with steps and decisions",
    seed: "Make a flowchart of ",
    match: /\b(flow ?chart|decision tree|workflow)\b/i,
  },
  {
    id: "mindmap",
    label: "Mind map",
    description: "Ideas branching from a central topic",
    seed: "Brainstorm ",
    match: /\b(mind ?map|brainstorm|spider diagram)\b/i,
  },
  {
    id: "guide",
    label: "Guide",
    description: "A recipe or how-to to follow step by step",
    seed: "Give me a recipe for ",
    match: /\b(recipe|ingredients|step[- ]by[- ]step|how do i|instructions for)\b/i,
  },
  {
    id: "social",
    label: "Social post",
    description: "Short social post or thread",
    seed: "Write a social post about ",
    match: /\b(tweet|twitter|x\.com|linkedin|instagram|social post|thread)\b/i,
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Chronological sequence of events",
    seed: "Build a timeline of ",
    match: /\b(timeline|chronolog|history of|sequence of events)\b/i,
  },
  {
    id: "kanban",
    label: "Kanban",
    description: "Project board with columns and cards",
    seed: "Make a kanban board for ",
    match: /\b(kanban|scrum board|project board|pipeline board)\b/i,
  },
  {
    id: "table",
    label: "Table",
    description: "Comparison or data table",
    seed: "Make a table of ",
    match:
      /\b(table|tabulate|shot\s*list|comparison|compare .+ by|matrix|inventory|grid of|list of .+ with (columns|their))\b/i,
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

/** Library interfaces the model fills through the catalogue, holding their own data. */
export type ShellCatalogueOpen = "tracker" | "dashboard" | "article";

/** What the model's pick opens as: a panel kind, or a catalogue interface of its own. */
export function opensAsOf(kind: VisualInterfaceKind): ImplementableInterfaceKind | ShellCatalogueOpen {
  if (kind === "checklist") return "tracker";
  if (kind === "dashboard" || kind === "article") return kind;
  return resolveImplementableKind(kind);
}

export type InterfaceCandidate = {
  id: VisualInterfaceKind;
  label: string;
  description: string;
  /** Panel kind if the model opens this candidate. */
  opensAs: ImplementableInterfaceKind | ShellCatalogueOpen;
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

/** A keyword for an interface the library doesn't score counts as one trigger would. */
const KEYWORD_POINTS = 20;
/** Between items that share a library interface, their own words decide. */
const OWN_WORD_POINTS = 4;

/**
 * How strongly a draft asks for this item, on the library's scale: the same
 * score the chat home routes by, so a thread and the home agree.
 */
function itemScore(item: VisualInterface, text: string): number {
  const format = CHAT_FORMAT_OF[item.id];
  // One point short of the same evidence for an interface, as on the home.
  if (format) return Math.max(0, scoreProfile(chatFormatRetrieval(format), text).total - 1);
  const libraryKind = libraryKindOf(item.id);
  if (!libraryKind) return item.match.test(text) ? KEYWORD_POINTS : 0;
  const own = SHARED_LIBRARY_KINDS.has(libraryKind) && item.match.test(text) ? OWN_WORD_POINTS : 0;
  return shellKindScore(libraryKind, text) + own;
}

/** Every item the draft gives any evidence for, best first. */
function rankInterfaces(draft: string) {
  const text = draft.trim();
  if (!text) return [];
  return VISUAL_INTERFACES.map((item) => ({ item, score: itemScore(item, text) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        // On a tie, the library interface itself before its variants (Table before Spreadsheet).
        Number(libraryKindOf(b.item.id) === b.item.id) - Number(libraryKindOf(a.item.id) === a.item.id),
    );
}

/**
 * Retrieve the top library interfaces for a user turn, scored as the chat home
 * scores them. The model then chooses among these or stays in plain chat.
 */
export function retrieveInterfaces(
  draft: string,
  limit = 5,
): InterfaceCandidate[] {
  const scored = rankInterfaces(draft);

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
  dashboard: "dashboard",
  article: "article",
  calendar: "calendar",
  reader: "reader",
  map: "map",
  moodboard: "moodboard",
};

/** Library interfaces more than one item opens, such as Chart. */
const SHARED_LIBRARY_KINDS = new Set(
  Object.values(LIBRARY_KIND).filter((kind, index, all) => all.indexOf(kind) !== index),
);

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
 * The interface a draft is asking for, if it clearly asks for one: the best
 * scored item that clears the floor the chat home routes by.
 */
export function matchVisualInterface(
  draft: string,
): VisualInterfaceKind | null {
  const best = rankInterfaces(draft)[0];
  return best && best.score >= SHELL_ROUTE_FLOOR ? best.item.id : null;
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
