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

export type MoodboardShellData = ProjectSlot & {
  title: string;
  keywords: string[];
  /** Hex colours. */
  palette: string[];
  images: MoodboardImage[];
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
  className?: string;
};

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
