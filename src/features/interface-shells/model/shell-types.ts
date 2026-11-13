import type { ArticleShellData, DashboardShellData } from "../apps/app-types";
/** Every interface in the library. */
export const SHELL_KINDS = [
  "chat",
  "document",
  "search",
  "table",
  "schedule",
  "tracker",
  "calendar",
  "reader",
  "map",
  "moodboard",
  "chart",
  "guide",
  "generator",
  "dashboard",
  "article",
] as const;
export type ShellKind = (typeof SHELL_KINDS)[number];

/** Every interface can sit on the chat home and open beside a conversation. */
export const CHAT_SHELL_KINDS = SHELL_KINDS;
export type ChatShellKind = ShellKind;

/** The first three, whose fields fill from a typed prompt and which the fill API knows. */
export const FILLABLE_KINDS = ["document", "search", "table"] as const;
export type FillableKind = (typeof FILLABLE_KINDS)[number];

/**
 * - small: the app icon (header badges, docks).
 * - medium: an idle shell on the chat home, before anything is typed.
 * - medium-plus: the recognised shell while typing — editable, content arriving.
 * - large: the docked interface once the conversation starts.
 */
export const SHELL_SIZES = ["small", "medium", "medium-plus", "large"] as const;
export type ShellSize = (typeof SHELL_SIZES)[number];

/** Content states for medium and medium plus. */
export const SHELL_STATES = ["empty", "suggestion", "history"] as const;
export type ShellState = (typeof SHELL_STATES)[number];

/** Natural footprint per size; large is fluid wherever it docks. */
export const SHELL_DIMENSIONS: Record<ShellSize, { width: number; height: number }> = {
  small: { width: 64, height: 64 },
  medium: { width: 148, height: 148 },
  "medium-plus": { width: 280, height: 280 },
  large: { width: 760, height: 540 },
};

/**
 * Not shown in any design: a "project" is only a past chat that used several
 * interfaces, grouped in the menu. Kept on the data so past work can be grouped.
 */
type ProjectSlot = {
  /** Shown as a tag; omitted when the work stands on its own. */
  project?: string;
};

export type DocumentShellData = ProjectSlot & {
  title: string;
  /** Markdown: headings, paragraphs, lists and quotes. */
  body: string;
  /** Target length, e.g. "~1,500 words". */
  length?: string;
};

export type SearchResult = {
  id: string;
  title: string;
  snippet: string;
  url?: string;
};

export type SearchShellData = ProjectSlot & {
  query: string;
  filters: string[];
  /**
   * Other wordings the search would run from this query. Shown as the
   * starting point, before any results come back.
   */
  queries: string[];
  results: SearchResult[];
  /** Sites worth looking at first, as domains. */
  sources?: string[];
};

export type TableColumnType = "text" | "tag" | "image";

export type TableColumn = {
  id: string;
  label: string;
  type: TableColumnType;
};

export type TableRow = {
  id: string;
  /** Keyed by column id; image cells hold the image URL. */
  cells: Record<string, string>;
};

export type TableShellData = ProjectSlot & {
  title: string;
  /** What one row is, e.g. "One row per shot, in shooting order." */
  description?: string;
  columns: TableColumn[];
  rows: TableRow[];
  /** Rows expected before they arrive. */
  rowCount?: number;
};

export type ScheduleTaskType = "setup" | "shoot" | "travel" | "break";

export type ScheduleTask = {
  id: string;
  label: string;
  /** Index into `days`. */
  day: number;
  /** Hours from midnight, e.g. 7.5 for 7:30. */
  start: number;
  end: number;
  type: ScheduleTaskType;
};

export type ScheduleShellData = ProjectSlot & {
  title: string;
  /** How many days the plan covers ("a three-day shoot"). */
  dayCount: number;
  /** ISO date of the first day ("starting Thursday"); days are numbered without it. */
  start?: string;
  /** The working hours each day spans ("7am to 7pm"), e.g. [7, 19]. */
  hours: [number, number];
  tasks: ScheduleTask[];
  /** Limits to plan around, such as cast availability. */
  constraints: string[];
};

export type TrackerItem = {
  id: string;
  label: string;
  owner?: string;
  /** Free text, e.g. "Fri 4 Dec". */
  due?: string;
  done: boolean;
  group?: string;
};

export type TrackerShellData = ProjectSlot & {
  title: string;
  groups: string[];
  items: TrackerItem[];
};

export type CalendarEvent = {
  id: string;
  /** ISO date. */
  date: string;
  title: string;
  /** Free text, e.g. "9am". */
  time?: string;
};

export type CalendarShellData = ProjectSlot & {
  title: string;
  /** ISO month, e.g. "2026-12". */
  month: string;
  events: CalendarEvent[];
};

/** A passage a chat answer relies on, marked in the original. */
export type ReaderHighlight = {
  id: string;
  /** Exact text from one of the passages. */
  quote: string;
  note?: string;
};

export type ReaderShellData = ProjectSlot & {
  title: string;
  /** The file being read. */
  source: string;
  pages?: number;
  /** What the person is searching for, or asking, in the document. Answers go in the chat. */
  query: string;
  passages: string[];
  highlights: ReaderHighlight[];
};

export type MapPlace = {
  id: string;
  name: string;
  kind?: string;
  distance?: string;
  /** Position on the map, 0–1 from the top left. */
  x: number;
  y: number;
  shortlisted?: boolean;
};

export type MapShellData = ProjectSlot & {
  query: string;
  /** The location searched around; drawn at the map's centre. */
  near: string;
  filters: string[];
  places: MapPlace[];
};

export type MoodboardImage = { id: string; src: string; caption?: string };

/** Something on the canvas, wherever the person put it. Positions are in board units from the top left. */
export type MoodboardItem = {
  id: string;
  kind: "image" | "note" | "colour" | "drawing" | "component";
  x: number;
  y: number;
  w: number;
  h?: number;
  /** Image: its URL. */
  src?: string;
  /** Image: its caption. Note: its words. */
  text?: string;
  /** Colour: a hex value. */
  colour?: string;
  /** Note: its paper colour. */
  tone?: ShellColour;
  /** Drawing: its SVG. Component: its HTML. Both made by the model and revisable by it. */
  code?: string;
};

export type MoodboardShellData = ProjectSlot & {
  title: string;
  keywords: string[];
  /** Hex colours. */
  palette: string[];
  images: MoodboardImage[];
  /**
   * The canvas at large: everything on it and where. Without it the canvas
   * lays out the images, keywords and palette; with it, those three are kept
   * in step for the smaller sizes and the model.
   */
  items?: MoodboardItem[];
};

export type TimelineEvent = {
  id: string;
  /** Sortable: a year, "YYYY-MM" or "YYYY-MM-DD". */
  date: string;
  title: string;
  detail?: string;
  colour?: ShellColour;
};

export type TimelineShellData = ProjectSlot & {
  title: string;
  events: TimelineEvent[];
};

export type FlowNodeKind = "start" | "step" | "decision" | "end";

export type FlowNode = { id: string; kind: FlowNodeKind; label: string; colour?: ShellColour };

export type FlowEdge = { from: string; to: string; label?: string };

export type FlowchartShellData = ProjectSlot & {
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
};

/** Colours a person can give an item on a canvas: design-system tokens. */
export const SHELL_COLOURS = ["blue-4", "mint-2", "rose-2", "orange-5", "green-5", "red-5", "gray-3"] as const;
export type ShellColour = (typeof SHELL_COLOURS)[number];

export type MindmapNode = {
  id: string;
  label: string;
  children: MindmapNode[];
  /** Set by the person; otherwise a branch takes its place in the default set, and ideas their branch's. */
  colour?: ShellColour;
};

export type MindmapShellData = ProjectSlot & {
  /** The central topic. */
  title: string;
  /** Branches around the centre, each with its own ideas. */
  branches: MindmapNode[];
};

export type GuideNeed = {
  id: string;
  text: string;
  have: boolean;
  /** Sections such as Ingredients and Equipment, or Parts and Tools. */
  group?: string;
};

export type GuideStep = {
  id: string;
  text: string;
  /** Optional timer for the step, in minutes: simmering, glue drying, a rest. */
  minutes?: number;
  /** A tip or warning that belongs to this step: "Don't overtighten". */
  note?: string;
  done: boolean;
};

/** A short fact about the guide: Serves 12, Difficulty Medium, People 2. */
export type GuideFact = { label: string; value: string };

export type GuideShellData = ProjectSlot & {
  title: string;
  /** Serves, Time, Difficulty, People: whichever this kind of guide calls for. */
  facts: GuideFact[];
  /** Ingredients, parts, tools or requirements, optionally grouped. */
  needs: GuideNeed[];
  steps: GuideStep[];
};

/** What a Generator makes: writing or pictures. */
export const GENERATOR_MODES = ["text", "image"] as const;
export type GeneratorMode = (typeof GENERATOR_MODES)[number];

/** A picture the person adds for the model to work from. `src` is a data or remote URL. */
export type GeneratorReference = { id: string; src: string; name?: string };

/** One of the three outputs a run makes. Text holds `text`; an image holds `src`. */
export type GeneratorVariation = { id: string; text?: string; src?: string };

/**
 * The controls that shape a run. Text uses tone and length; images use style
 * and aspect; both use creativity, 0 (close to the prompt and references) to
 * 100 (free).
 */
export type GeneratorControls = {
  tone: string;
  /** "short", "medium" or "long", or the person's own ("Under 10 words"). */
  length: string;
  style: string;
  aspect: "1:1" | "3:2" | "2:3";
  creativity: number;
};

export type GeneratorShellData = ProjectSlot & {
  /** The prompt: what to make. */
  title: string;
  mode: GeneratorMode;
  references: GeneratorReference[];
  controls: GeneratorControls;
  /** The latest run's three variations. */
  variations: GeneratorVariation[];
  /** The variation the person picked, by id. */
  chosen?: string;
  /** Tones, styles and lengths the person added beyond the built-in ones. */
  options?: GeneratorOptions;
};

export type GeneratorOptions = { tones?: string[]; styles?: string[]; lengths?: string[] };

/**
 * What a Chart draws: ideas branching from a topic, events in order, or steps
 * and decisions. The model picks it from what's asked; the person can switch.
 */
export const CHART_TYPES = ["mindmap", "timeline", "flowchart"] as const;
export type ChartType = (typeof CHART_TYPES)[number];

/**
 * One interface for three kinds of chart. Each type's content is kept, so
 * switching type never loses work: `branches` for a mind map, `events` for a
 * timeline, `nodes` and `edges` for a flowchart. The title is shared.
 */
export type ChartShellData = ProjectSlot & {
  title: string;
  type: ChartType;
  branches: MindmapNode[];
  events: TimelineEvent[];
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

/** How a chat reply's text is laid out. "plain" is an ordinary answer. */
export type ChatFormat = "plain" | "explainer" | "proscons" | "ranked";

/** Who is replying: the agent's voice for the whole thread. */
export type ChatPersona = "assistant" | "tutor" | "critic" | "brainstormer";

export type ChatShellData = ProjectSlot & {
  /** The opening message. */
  title: string;
  messages: ChatMessage[];
  /** How the reply's text is laid out, in the person's words ("Pros & cons"). Suggested from the query. */
  format?: string;
  /** Who replies or what it uses ("Critic", "Web search"). Suggested from the query. */
  persona?: string;
};

export type ShellDataByKind = {
  chat: ChatShellData;
  document: DocumentShellData;
  search: SearchShellData;
  table: TableShellData;
  schedule: ScheduleShellData;
  tracker: TrackerShellData;
  calendar: CalendarShellData;
  reader: ReaderShellData;
  map: MapShellData;
  moodboard: MoodboardShellData;
  chart: ChartShellData;
  guide: GuideShellData;
  generator: GeneratorShellData;
  dashboard: DashboardShellData;
  article: ArticleShellData;
};

export type ShellData = ShellDataByKind[ShellKind];

export type ShellStatus = "idle" | "loading";

export type ShellProps<D> = {
  size: ShellSize;
  data: D;
  /** Omit to render read-only. */
  onChange?: (data: D) => void;
  /** Explicit start (⌘↵, or Enter in a search bar). */
  onSubmit?: () => void;
  /** Send a question to the chat the interface is docked in. Absent outside a chat. */
  onAsk?: (text: string) => void;
  status?: ShellStatus;
  /** Draw the shell's own surface; off when a host frame already draws one. */
  surface?: boolean;
  /**
   * Draw the glyph beside the title. Off by default at large, where the
   * window's bar carries it; a host that frames other sizes can turn it off.
   */
  mark?: boolean;
  /** Host controls at the end of the large shell's toolbar (pin, close…). */
  actions?: React.ReactNode;
  /**
   * Large only: tools generated for what's in the interface now, drawn by the
   * host in the toolbar after the interface's own standard tools.
   */
  tools?: React.ReactNode;
  /**
   * Large only: generated tools that belong beside part of the interface
   * rather than in the toolbar, such as suggested filters in Search's filter
   * row. Each interface draws the places it has; see SUGGESTION_PLACES.
   */
  suggestions?: ShellSuggestions;
  /**
   * Values the model suggests adding, drawn among the real ones with the AI
   * outline: a suggested filter among the filters, a tone among the tones.
   * Clicking one adds it; values already present aren't shown.
   */
  suggested?: SuggestedValues;
  /** Dismissing a suggested value; without it, suggestions can only be accepted. */
  onDismissSuggestion?: (group: SuggestedGroup, value: string) => void;
  className?: string;
};

/**
 * Groups of values an interface can show suggestions in: Search's and Map's
 * filters, Generator's tones, styles and lengths, Schedule's constraints,
 * a Table's columns, a Tracker's items, a Moodboard canvas's notes.
 */
export const SUGGESTED_GROUPS = ["filters", "tones", "styles", "lengths", "constraints", "columns", "items", "notes"] as const;
export type SuggestedGroup = (typeof SUGGESTED_GROUPS)[number];
export type SuggestedValues = Partial<Record<SuggestedGroup, string[]>>;

/**
 * Where a suggested tool sits: the toolbar, or inside a row the interface
 * already has, beside what it acts on. It never gets a row of its own.
 * - footer: by Document's word count.
 * - days: by Schedule's day settings.
 * - prompt: in Generator's prompt box, by the references.
 * - board: floating on a Diagram's or Moodboard's canvas.
 * Suggested values (a filter, a tone, a column) are a separate thing: see
 * SuggestedValues, drawn among the real ones.
 */
export const SUGGESTION_PLACES = ["toolbar", "footer", "days", "prompt", "board"] as const;
export type SuggestionPlace = (typeof SUGGESTION_PLACES)[number];
export type ShellSuggestions = Partial<Record<Exclude<SuggestionPlace, "toolbar">, React.ReactNode>>;

export function isShellKind(kind: string | null | undefined): kind is ShellKind {
  return SHELL_KINDS.includes(kind as ShellKind);
}

export function isChatShellKind(kind: string | null | undefined): kind is ChatShellKind {
  return CHAT_SHELL_KINDS.includes(kind as ChatShellKind);
}

export function isFillableKind(kind: string | null | undefined): kind is FillableKind {
  return FILLABLE_KINDS.includes(kind as FillableKind);
}

let idCounter = 0;
export function shellId(prefix = "id") {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}
