import type {
  CalendarShellData,
  MapShellData,
  MoodboardShellData,
  ReaderShellData,
  ScheduleShellData,
  ScheduleTask,
  ShellDataByKind,
  ShellState,
  TrackerShellData,
} from "./shell-types";

/** Same shape as the first three fixtures; repeated here to avoid an import cycle. */
type Fixture<K extends keyof ShellDataByKind> = {
  states: Record<ShellState, ShellDataByKind[K]>;
  suggestionPrompt: string;
  history: { chatTitle: string; when: string };
};


/* ── Schedule ─────────────────────────────────────────────────────────── */

const task = (
  id: string,
  day: number,
  start: number,
  end: number,
  type: ScheduleTask["type"],
  label: string,
): ScheduleTask => ({ id, day, start, end, type, label });

export const emptySchedule: ScheduleShellData = {
  title: "",
  dayCount: 3,
  hours: [7, 19],
  tasks: [],
  constraints: [],
};

const scheduleFixture: Fixture<"schedule"> = {
  suggestionPrompt:
    "Build a three-day shoot schedule from this shot list, allowing for setups, travel, breaks and cast availability.",
  history: { chatTitle: "The Last Ferry shoot schedule", when: "Yesterday" },
  states: {
    empty: emptySchedule,
    suggestion: {
      title: "Three-day shoot schedule",
      dayCount: 3,
      hours: [7, 19],
      constraints: ["Mara from 10am", "Pier closed to public 12–2"],
      tasks: [
        task("s1", 0, 7, 8, "setup", "Load in at the pier"),
        task("s2", 0, 8, 10.5, "shoot", "Scene 1, dock at dawn"),
        task("s3", 0, 10.5, 11, "break", "Turnaround"),
        task("s4", 0, 11, 13, "shoot", "Scene 1, Mara on the pier"),
        task("s5", 1, 8, 9, "travel", "Unit move to the ferry"),
        task("s6", 1, 9, 12, "shoot", "Scene 2 on deck"),
      ],
    },
    history: {
      title: "The Last Ferry: shoot schedule",
      dayCount: 3,
      start: "2026-12-10",
      hours: [7, 19],
      constraints: ["Mara from 10am", "Pier closed to public 8–12", "Jonah wraps by 5pm Friday"],
      tasks: [
        task("h1", 0, 7, 8, "setup", "Load in at the pier"),
        task("h2", 0, 8, 10, "shoot", "1A Dock at dawn"),
        task("h3", 0, 10, 10.5, "setup", "Reset for dolly"),
        task("h4", 0, 10.5, 13, "shoot", "1B Mara walks the pier"),
        task("h5", 0, 13, 14, "break", "Lunch"),
        task("h6", 0, 14, 16.5, "shoot", "1C Ticket close-ups"),
        task("h7", 1, 7.5, 8.5, "travel", "Unit move to the ferry"),
        task("h8", 1, 8.5, 9.5, "setup", "Rig the upper deck"),
        task("h9", 1, 9.5, 12.5, "shoot", "2A The horn sounds"),
        task("h10", 1, 12.5, 13.5, "break", "Lunch on board"),
        task("h11", 1, 13.5, 17, "shoot", "2B Jonah on the deck"),
        task("h12", 2, 8, 9, "setup", "Gangway lights"),
        task("h13", 2, 9, 12, "shoot", "2C The gangway lifts"),
        task("h14", 2, 12, 13, "break", "Lunch"),
        task("h15", 2, 13, 15, "shoot", "Pickups and wildtrack"),
        task("h16", 2, 15, 16.5, "travel", "Wrap and load out"),
      ],
    },
  },
};

/* ── Tracker ──────────────────────────────────────────────────────────── */

export const emptyTracker: TrackerShellData = { title: "", groups: [], items: [] };

const trackerFixture: Fixture<"tracker"> = {
  suggestionPrompt:
    "Create a checklist of everything we need to arrange before the shoot, with owners and deadlines.",
  history: { chatTitle: "Pre-shoot checklist", when: "2 days ago" },
  states: {
    empty: emptyTracker,
    suggestion: {
      title: "Pre-shoot checklist",
      groups: ["Locations", "Cast & crew", "Equipment", "Paperwork"],
      items: [
        { id: "t1", label: "Confirm the pier booking", group: "Locations", done: false },
        { id: "t2", label: "Send call sheets", group: "Cast & crew", done: false },
        { id: "t3", label: "Book the dolly and track", group: "Equipment", done: false },
        { id: "t4", label: "Sign the location agreement", group: "Paperwork", done: false },
      ],
    },
    history: {
      title: "Pre-shoot checklist",
      groups: ["Locations", "Cast & crew", "Equipment", "Paperwork"],
      items: [
        { id: "h1", label: "Confirm the pier booking", owner: "Priya", due: "Mon 30 Nov", group: "Locations", done: true },
        { id: "h2", label: "Recce the ferry's upper deck", owner: "Sam", due: "Wed 2 Dec", group: "Locations", done: true },
        { id: "h3", label: "Shortlist a café for scene 2", owner: "Sam", due: "Fri 4 Dec", group: "Locations", done: false },
        { id: "h4", label: "Send call sheets", owner: "Ana", due: "Tue 8 Dec", group: "Cast & crew", done: false },
        { id: "h5", label: "Confirm Mara's and Jonah's availability", owner: "Ana", due: "Thu 3 Dec", group: "Cast & crew", done: true },
        { id: "h6", label: "Book the dolly and track", owner: "Leo", due: "Fri 4 Dec", group: "Equipment", done: true },
        { id: "h7", label: "Hire a macro lens", owner: "Leo", due: "Mon 7 Dec", group: "Equipment", done: false },
        { id: "h8", label: "Sign the location agreement", owner: "Priya", due: "Wed 2 Dec", group: "Paperwork", done: false },
        { id: "h9", label: "Get public liability insurance", owner: "Priya", due: "Fri 4 Dec", group: "Paperwork", done: false },
      ],
    },
  },
};

/* ── Calendar ─────────────────────────────────────────────────────────── */

export const emptyCalendar: CalendarShellData = {
  title: "",
  month: "2026-12",
  events: [],
};

const calendarFixture: Fixture<"calendar"> = {
  suggestionPrompt:
    "Put the recce, the three shoot days and the rough cut review on a December calendar.",
  history: { chatTitle: "December shoot", when: "Last week" },
  states: {
    empty: emptyCalendar,
    suggestion: {
      title: "December shoot",
      month: "2026-12",
      events: [
        { id: "e0", date: "2026-12-04", title: "Recce", time: "10am" },
        { id: "e1", date: "2026-12-10", title: "Shoot day 1" },
        { id: "e2", date: "2026-12-11", title: "Shoot day 2" },
        { id: "e3", date: "2026-12-12", title: "Shoot day 3" },
        { id: "e4", date: "2026-12-17", title: "Rough cut review" },
      ],
    },
    history: {
      title: "December shoot",
      month: "2026-12",
      events: [
        { id: "e0", date: "2026-12-04", title: "Recce", time: "10am" },
        { id: "e5", date: "2026-12-07", title: "Costume fitting", time: "2pm" },
        { id: "e1", date: "2026-12-10", title: "Shoot day 1: pier", time: "7am" },
        { id: "e2", date: "2026-12-11", title: "Shoot day 2: ferry", time: "7:30am" },
        { id: "e3", date: "2026-12-12", title: "Shoot day 3: gangway", time: "8am" },
        { id: "e6", date: "2026-12-14", title: "Wrap drinks", time: "6pm" },
        { id: "e4", date: "2026-12-17", title: "Rough cut review", time: "11am" },
        { id: "e7", date: "2026-12-21", title: "Sound mix" },
      ],
    },
  },
};

/* ── Reader ───────────────────────────────────────────────────────────── */

export const emptyReader: ReaderShellData = {
  title: "",
  source: "",
  query: "",
  passages: [],
  highlights: [],
};

const agreement = [
  "This Location Agreement is made between Harbour Pier Ltd (the Owner) and Northlight Films (the Producer) for filming of the production known as The Last Ferry.",
  "The Producer may use the pier, the ticket hall and the upper car park from 07:00 to 19:00 on the agreed filming days. The Producer will pay a location fee of £1,800 per filming day, plus a refundable damage deposit of £2,500, due seven days before the first filming day.",
  "Filming must not obstruct public access to the ferry between 12:00 and 14:00. No drones may be flown over the water without the harbour master's written permission, and no open flames or smoke effects are allowed on the pier.",
  "If the Producer cancels more than fourteen days before the first filming day, the deposit is returned in full. Cancellation within fourteen days forfeits 50% of the location fee; within 48 hours, the full fee is payable.",
  "The Producer is responsible for leaving the location in the condition it was found, for removing all equipment by 20:00 each day, and for holding public liability insurance of at least £5 million for the whole period.",
  "Either party may end this agreement if the other breaches it and does not put the breach right within three days of written notice.",
];

const readerFixture: Fixture<"reader"> = {
  suggestionPrompt: "What happens if we cancel the Harbour Pier booking late?",
  history: { chatTitle: "Harbour Pier agreement", when: "3 days ago" },
  states: {
    empty: emptyReader,
    suggestion: {
      title: "Harbour Pier location agreement",
      source: "harbour-pier-agreement.pdf",
      pages: 6,
      query: "cancel",
      passages: agreement,
      highlights: [],
    },
    history: {
      title: "Harbour Pier location agreement",
      source: "harbour-pier-agreement.pdf",
      pages: 6,
      query: "What happens if we cancel late?",
      passages: agreement,
      highlights: [
        { id: "r1", quote: "If the Producer cancels more than fourteen days before the first filming day, the deposit is returned in full." },
        { id: "r2", quote: "Cancellation within fourteen days forfeits 50% of the location fee", note: "After Thu 26 Nov" },
        { id: "r3", quote: "within 48 hours, the full fee is payable" },
      ],
    },
  },
};

/* ── Map ──────────────────────────────────────────────────────────────── */

export const emptyMap: MapShellData = { query: "", near: "", filters: [], places: [] };

const cafes = [
  { id: "m1", name: "Tide Café", kind: "Café", distance: "2 min", x: 0.58, y: 0.36 },
  { id: "m2", name: "The Ticket Office", kind: "Café", distance: "4 min", x: 0.36, y: 0.58 },
  { id: "m3", name: "Saltworks Coffee", kind: "Café", distance: "6 min", x: 0.72, y: 0.66 },
  { id: "m4", name: "Harbour Kitchen", kind: "Café & bar", distance: "7 min", x: 0.24, y: 0.3 },
  { id: "m5", name: "Gull & Anchor", kind: "Pub", distance: "9 min", x: 0.82, y: 0.24 },
  { id: "m6", name: "Morning Rope", kind: "Café", distance: "11 min", x: 0.16, y: 0.76 },
];

const mapFixture: Fixture<"map"> = {
  suggestionPrompt:
    "Show me cafés near our main location so I can shortlist options for the second scene.",
  history: { chatTitle: "Cafés for scene 2", when: "4 days ago" },
  states: {
    empty: emptyMap,
    suggestion: {
      query: "Cafés",
      near: "Harbour Pier",
      filters: ["Window seating", "Quiet mornings"],
      places: cafes.slice(0, 4),
    },
    history: {
      query: "Cafés",
      near: "Harbour Pier",
      filters: ["Window seating", "Quiet mornings", "Allows filming"],
      places: cafes.map((place) =>
        place.id === "m1" || place.id === "m3" ? { ...place, shortlisted: true } : place,
      ),
    },
  },
};

/* ── Moodboard ────────────────────────────────────────────────────────── */

export const emptyMoodboard: MoodboardShellData = {
  title: "",
  keywords: [],
  palette: [],
  images: [],
};

const ref = (id: string, seed: string, caption: string, w = 400, h = 500) => ({
  id,
  src: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  caption,
});

const moodboardFixture: Fixture<"moodboard"> = {
  suggestionPrompt:
    "Create a moodboard for the film with muted colours, natural window light and intimate handheld framing.",
  history: { chatTitle: "The Last Ferry look", when: "Last week" },
  states: {
    empty: emptyMoodboard,
    suggestion: {
      title: "The Last Ferry: look",
      keywords: ["Muted colours", "Natural window light", "Handheld", "Intimate"],
      palette: ["#6f7d7a", "#b9b2a5", "#d8cfc0", "#3e4a4f", "#a3786a"],
      images: [
        ref("i1", "ferry-window", "Window light"),
        ref("i2", "ferry-hands", "Close and handheld", 400, 300),
        ref("i3", "ferry-sea", "Grey water"),
        ref("i4", "ferry-coat", "Worn textures", 400, 300),
      ],
    },
    history: {
      title: "The Last Ferry: look",
      keywords: ["Muted colours", "Natural window light", "Handheld", "Intimate", "Early morning"],
      palette: ["#6f7d7a", "#b9b2a5", "#d8cfc0", "#3e4a4f", "#a3786a"],
      images: [
        ref("h1", "ferry-window", "Window light"),
        ref("h2", "ferry-hands", "Close and handheld", 400, 300),
        ref("h3", "ferry-sea", "Grey water"),
        ref("h4", "ferry-coat", "Worn textures", 400, 300),
        ref("h5", "ferry-cabin", "Cabin interiors", 400, 300),
        ref("h6", "ferry-dawn", "Dawn over the dock"),
        ref("h7", "ferry-rope", "Rope and rust", 400, 300),
        ref("h8", "ferry-face", "Faces in half shadow"),
      ],
    },
  },
};

export const MORE_FIXTURES = {
  schedule: scheduleFixture,
  tracker: trackerFixture,
  calendar: calendarFixture,
  reader: readerFixture,
  map: mapFixture,
  moodboard: moodboardFixture,
};

export const MORE_EMPTY = {
  schedule: emptySchedule,
  tracker: emptyTracker,
  calendar: emptyCalendar,
  reader: emptyReader,
  map: emptyMap,
  moodboard: emptyMoodboard,
};
