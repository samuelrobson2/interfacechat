import type { ShellKind } from "./shell-types";

export type ShellRetrieval = {
  /** When to choose this interface. Retrieval matches the user's words against it. */
  description: string;
  /** One line naming what this is not for, and which interface to use instead. */
  notFor: string;
  /** Example prompts that should retrieve this interface. */
  queries: string[];
  /** Near-miss prompts that should NOT open it. A draft that reads like one is pushed away. */
  avoidQueries: string[];
  /** Whole words or phrases that pull this interface in as you type, on the chat home. */
  triggers: string[];
};

/**
 * What a typed prompt is matched against when choosing an interface.
 * The library page edits the live copy; retrieval reads it.
 */
export const SHELL_RETRIEVAL: Record<ShellKind, ShellRetrieval> = {
  chat: {
    description:
      "A plain conversation: a question, an opinion, a quick fact or thinking something through out loud. Choose this when the answer is a few sentences in the thread and nothing needs to be built, tracked or laid out.",
    notFor:
      "Producing something to keep or work on (use the matching interface), or a long answer that needs structure (use a format such as Explainer).",
    queries: [
      "What makes a good opening shot?",
      "Do you think the title works?",
      "Quick question: is it 'grey' or 'gray' in British English?",
      "Help me think through whether to push the shoot back a week",
    ],
    avoidQueries: [
      "Write a paper on opening shots",
      "Find studies on opening shots",
      "Make a shot list for the opening",
    ],
    triggers: ["quick question", "what do you think", "do you think", "thoughts on", "hi", "hello", "hey", "chat", "talk through"],
  },
  document: {
    description:
      "Create or edit a piece of writing: a paper, essay, report, memo or email, drafted in place and revised through direct edits. Choose this when the person wants new writing produced, with a title, a structure and a target length.",
    notFor:
      "Understanding or finding something in a document they already have (use Reader), looking things up (use Search), or rows and columns (use Table).",
    queries: [
      "Write a paper on urban heat islands",
      "Draft a memo about the hiring plan",
      "Compose an essay on what cools a city street",
      "Write an email to the location manager confirming the dates",
    ],
    avoidQueries: [
      "Find sources on urban heat islands",
      "Explain this paper to me",
      "Make a table of essay topics with due dates",
    ],
    triggers: ["paper", "essay", "report", "memo", "article", "brief", "email", "write", "draft", "compose"],
  },
  search: {
    description:
      "The search itself, as a working surface: the query, the follow-up searches it runs, the sites and filters it narrows by, and what it has found so far. Choose this when the person wants to find information that isn't in front of them yet, and to steer how it's looked for.",
    notFor:
      "Reporting what was found (use the Cited results format), reading a document they already have (use Reader), writing (use Document), or places on a map (use Map).",
    queries: [
      "Find papers on sleep and memory",
      "Search for coffee roasters in North Beach",
      "Look up studies on deep sleep and long-term memory",
      "Find sources on scholar.google.com about heat islands",
    ],
    avoidQueries: [
      "Write a paper on sleep and memory",
      "Summarise this paper on sleep and memory",
      "Show cafés near the studio on a map",
    ],
    triggers: ["search", "find", "look up", "sources", "research", "studies", "papers on"],
  },
  table: {
    description:
      "Create, edit or compare structured information in rows and columns: shot lists, inventories, and options set against the same attributes. Choose this when one record per row, with named columns, is the clearest form.",
    notFor:
      "Prose (use Document), to-dos with owners and status (use Tracker), or tasks laid out in time (use Schedule).",
    queries: [
      "Turn this script into a shot list",
      "Make a comparison table of the shortlisted cameras",
      "Compare three cameras by weight, price and battery life",
      "Tabulate framing, cast and estimated time for each shot",
    ],
    avoidQueries: [
      "Write an essay comparing two cameras",
      "Find reviews of the shortlisted cameras",
      "Build a shoot schedule from this shot list",
    ],
    triggers: ["table", "tabulate", "shot list", "compare", "comparison", "columns", "rows", "inventory"],
  },
  schedule: {
    description:
      "Plan tasks across hours and days as a Gantt: durations, overlaps and order, with setups, travel and breaks. Choose this when the person needs to know what happens when, and for how long, over a day or a few.",
    notFor:
      "Choosing dates around people's availability (use Calendar), or a list of to-dos without times (use Tracker).",
    queries: [
      "Build a three-day shoot schedule from this shot list, allowing for setups, travel, breaks and cast availability",
      "Plan the launch week hour by hour",
      "Lay out the production plan as a Gantt chart",
      "Make a call sheet for Saturday's shoot",
    ],
    avoidQueries: [
      "Find three dates when everyone is free",
      "Create a checklist of what to book before the shoot",
      "What time does the ferry leave?",
    ],
    triggers: ["schedule", "gantt", "call sheet", "hour by hour", "itinerary", "setups", "breaks", "run of show"],
  },
  tracker: {
    description:
      "Turn a goal into steps and keep track of them: each item with an owner, a due date and whether it's done, grouped and updated as things change. Choose this when the person wants to see what needs doing and what needs attention.",
    notFor:
      "Times and durations (use Schedule), or comparing options across many columns (use Table).",
    queries: [
      "Create a checklist of everything we need to arrange before the shoot, with owners and deadlines",
      "Track the launch to-dos and who owns each one",
      "Make a packing list for the location trip",
      "List the open action items from today's meeting",
    ],
    avoidQueries: [
      "Make a table comparing three cameras",
      "Plan the shoot day hour by hour",
      "Write a memo about the hiring plan",
    ],
    triggers: ["checklist", "to-do", "todo", "to do", "tracker", "action items", "task list", "packing list", "owners", "deadlines"],
  },
  calendar: {
    description:
      "Arrange commitments on dates, see who is free and spot clashes, across a month. Choose this when the person wants to find, hold or add dates around other people's availability.",
    notFor:
      "Planning what happens hour by hour within a day (use Schedule), or tasks with deadlines (use Tracker).",
    queries: [
      "Find three shoot dates when our cast, crew and location are all available",
      "When is everyone free next month for a workshop?",
      "Hold two dates in December for the client review",
      "Add the rough cut review to the calendar on the 17th",
    ],
    avoidQueries: [
      "Plan Saturday's shoot hour by hour",
      "Create a checklist with owners and deadlines",
      "What day of the week is Christmas?",
    ],
    triggers: ["calendar", "available", "availability", "free on", "dates", "which days", "hold a date", "clash"],
  },
  reader: {
    description:
      "Open a document the person already has, a PDF, paper, contract or report, to understand it or find things in it: explain it, answer questions about it, pull out details, with the passages highlighted in the original. Choose this when the document exists and the job is reading it, not writing it.",
    notFor:
      "Writing a new document (use Document), or finding material online (use Search).",
    queries: [
      "Review this location agreement and highlight the fees, filming restrictions, cancellation terms and our responsibilities",
      "Explain this paper to me in plain terms",
      "What does this PDF say about cancellation?",
      "Pull out the key dates and obligations from this lease",
    ],
    avoidQueries: [
      "Write a location agreement for the shoot",
      "Find papers on location agreements",
      "What does force majeure mean?",
    ],
    triggers: ["review this", "explain this", "this paper", "this pdf", "this document", "this contract", "agreement", "highlight", "read this", "summarise this", "summarize this", "this report", "lease"],
  },
  map: {
    description:
      "Show places around a location, how far apart they are and how to get between them, with a shortlist to choose from. Choose this when where things are matters to the decision.",
    notFor:
      "Researching a topic that has no place (use Search), or a day's sequence of stops (use Schedule).",
    queries: [
      "Show me cafés near our main location so I can shortlist options for the second scene",
      "Map the hotels within walking distance of the venue",
      "Where are the nearest hardware stores to the studio?",
      "Find parking near the shoot location",
    ],
    avoidQueries: [
      "Find studies on urban heat islands",
      "Write a guide to the best cafés in town",
      "How far is Paris from London?",
      "Make a mind map of ideas for the campaign",
    ],
    triggers: ["map", "near", "nearby", "walking distance", "closest", "nearest", "around the corner", "directions", "route"],
  },
  timeline: {
    description:
      "Lay out events in time order, to show what happened when and how one thing led to another. Choose this for history, the story of a project, or a sequence of past changes.",
    notFor:
      "Planning future tasks with times (use Schedule), or choosing dates (use Calendar).",
    queries: [
      "Give me a timeline of the Harbour Pier ferry",
      "What happened on the project so far, in order?",
      "Show the history of 16mm film",
      "Lay out the key events of the war in order",
    ],
    avoidQueries: [
      "Build a three-day shoot schedule",
      "Find three dates when everyone is free",
      "Write a history essay on the pier",
    ],
    triggers: ["timeline", "history of", "chronology", "chronological", "in order of events", "what happened", "over the years", "since"],
  },
  flowchart: {
    description:
      "Map a process as steps and decisions, with the paths between them, so someone can follow it or spot where it breaks. Choose this for a how-to with branches, a decision tree or a workflow.",
    notFor:
      "A simple list of to-dos (use Tracker), or tasks laid out in time (use Schedule).",
    queries: [
      "Map out how we book a location, including what happens if it's not free",
      "Draw a decision tree for whether to reshoot a scene",
      "Make a flowchart of the approval process",
      "What's the workflow from shoot to edit?",
    ],
    avoidQueries: [
      "Create a checklist of what to book",
      "Plan the shoot hour by hour",
      "Explain how ferries dock",
    ],
    triggers: ["flowchart", "flow chart", "decision tree", "workflow", "process", "map out how", "if not", "what happens if", "steps"],
  },
  mindmap: {
    description:
      "Develop ideas as branches around a central topic, grouping related thoughts as they come. Choose this for brainstorming or seeing how ideas connect before structuring them.",
    notFor:
      "A finished outline or document (use Document), or images for a look (use Moodboard).",
    queries: [
      "Help me brainstorm the themes of the film as a mind map",
      "Mind map ideas for the campaign",
      "Branch out everything we could do for the launch",
      "Brainstorm angles for the documentary",
    ],
    avoidQueries: [
      "Map the cafés near the pier",
      "Write an outline for the script",
      "Create a moodboard for the film",
    ],
    triggers: ["mind map", "mindmap", "brainstorm", "branch out", "ideas for", "angles for", "spider diagram"],
  },
  guide: {
    description:
      "A recipe or how-to to follow along: what you need, then the steps in order, ticked off as you go, with timers where there's waiting. Recipes, flat-pack assembly, repairs, setups, workouts, garden jobs. Choose this when the person is going to do something themselves, one step at a time.",
    notFor:
      "A team's to-dos with owners and deadlines (use Tracker), a process with decisions (use Flowchart), or learning how something works (use Explainer).",
    queries: [
      "Give me a recipe for fish stew for the crew lunch, for 12",
      "How do I assemble an IKEA Billy bookcase?",
      "How do I rig a dolly track, step by step?",
      "Walk me through fixing a dripping tap",
      "A 30-minute bodyweight workout I can do at home",
    ],
    avoidQueries: [
      "Create a checklist of what to book, with owners and deadlines",
      "Explain how a ferry docks",
      "Make a flowchart of the approval process",
    ],
    triggers: [
      "recipe",
      "ingredients",
      "step by step",
      "step-by-step",
      "how do i",
      "how to make",
      "how to",
      "instructions",
      "assemble",
      "put together",
      "install",
      "fix",
      "repair",
      "workout",
      "serves",
      "cook",
      "bake",
    ],
  },
  moodboard: {
    description:
      "Collect and browse visual references, images, colours and words, to set a look before making something. Choose this when the person wants to explore or agree a visual direction.",
    notFor: "A list of shots (use Table), written creative notes (use Document), or finding images online by fact (use Search).",
    queries: [
      "Create a moodboard for the film with muted colours, natural window light and intimate handheld framing",
      "Pull together visual references for the brand refresh",
      "Make an inspiration board for a cosy autumn campaign",
      "Show me the look I'm after: warm, grainy and nostalgic",
    ],
    avoidQueries: [
      "Turn this script into a shot list",
      "Write a creative brief for the campaign",
      "Find stock photo sites with free licences",
    ],
    triggers: ["moodboard", "mood board", "inspiration", "visual references", "look and feel", "aesthetic", "palette", "vibe"],
  },
};

export const copyShellRetrieval = (profile: ShellRetrieval): ShellRetrieval => ({
  description: profile.description,
  notFor: profile.notFor,
  queries: [...profile.queries],
  avoidQueries: [...profile.avoidQueries],
  triggers: [...profile.triggers],
});
const copy = copyShellRetrieval;

/**
 * Chat formats: versions of a chat reply, chosen from the query the way an
 * interface is. They live under Chat, not beside it, because nothing opens:
 * the answer is laid out in the thread.
 */
export const CHAT_FORMAT_KINDS = ["explainer", "proscons", "ranked"] as const;
export type ChatFormatKind = (typeof CHAT_FORMAT_KINDS)[number];

export const CHAT_FORMAT_RETRIEVAL: Record<ChatFormatKind, ShellRetrieval> = {
  explainer: {
    description:
      "Lay the chat reply out as short headed sections in teaching order, each a plain explanation with an example, pitched at the person's level. Choose this when they want to learn about something.",
    notFor:
      "Explaining a document they already have (use Reader), or writing a paper or report (use Document).",
    queries: [
      "Explain how a ferry docks, simply",
      "Teach me how 16mm film works",
      "Walk me through how a call sheet is put together",
      "Help me understand what a location release covers",
    ],
    avoidQueries: [
      "Explain this paper to me",
      "Write a report on how ferries dock",
      "Find studies on how ferries dock",
    ],
    triggers: ["explain", "teach me", "walk me through", "help me understand", "how does", "how do", "what is", "eli5", "in simple terms", "learn about"],
  },
  proscons: {
    description:
      "Lay the chat reply out as pros and cons, each point weighted by how much it matters, ending with where it leans. Choose this when the person is deciding whether to do something.",
    notFor:
      "Putting several options in order (use Ranked list), or comparing options across many attributes (use Table).",
    queries: [
      "What are the pros and cons of shooting on 16mm film?",
      "Should we hire a drone operator or skip aerials?",
      "Weigh up moving the shoot to January",
      "Is it worth renting a second camera?",
    ],
    avoidQueries: [
      "Rank the cafés for scene 2",
      "Compare three cameras by weight, price and battery life",
      "Write an essay on film versus digital",
    ],
    triggers: ["pros and cons", "pros", "cons", "trade-offs", "tradeoffs", "worth it", "should we", "should i", "weigh up", "upsides"],
  },
  ranked: {
    description:
      "Lay the chat reply out as a numbered list, best first, with the criterion stated and the reason for each place. Choose this when the person wants to prioritise or be told which to go with.",
    notFor:
      "Weighing a single yes-or-no choice (use Pros & cons), or a full comparison grid (use Table).",
    queries: [
      "Rank the shortlisted cafés for scene 2 by how well they fit",
      "Which three locations should we prioritise?",
      "What's the best lens for handheld close-ups, and why?",
      "Order these tasks by urgency",
    ],
    avoidQueries: [
      "What are the pros and cons of shooting on film?",
      "Make a comparison table of the cameras",
      "Find cafés near the pier",
    ],
    triggers: ["rank", "ranked", "ranking", "prioritise", "prioritize", "best", "top three", "top 3", "top five", "in order of", "recommend"],
  },
};

/** Personas: who replies. Picked from the query the same way, and kept for the thread. */
export const CHAT_PERSONA_KINDS = ["tutor", "critic", "brainstormer"] as const;
export type ChatPersonaKind = (typeof CHAT_PERSONA_KINDS)[number];

export const CHAT_PERSONA_RETRIEVAL: Record<ChatPersonaKind, ShellRetrieval> = {
  tutor: {
    description:
      "Reply as a patient tutor: explain step by step, check understanding with a short question, and build on what the person knows. Choose this when they want to learn or be taught.",
    notFor: "A quick factual answer (use Assistant), or blunt feedback on their work (use Critic).",
    queries: ["Teach me how exposure works", "Quiz me on the three-act structure", "Help me understand lens compression", "I'm new to this, walk me through it"],
    avoidQueries: ["Tear my script apart", "Give me ten ideas for the poster", "What time is it in Tokyo?"],
    triggers: ["teach me", "quiz me", "i'm new to", "im new to", "help me learn", "help me understand", "tutor"],
  },
  critic: {
    description:
      "Reply as a candid critic: say what isn't working and why, specifically, then what would fix it. Choose this when the person wants honest feedback on their work.",
    notFor: "Encouragement or new ideas (use Brainstormer), or learning a topic (use Tutor).",
    queries: ["Be honest, does this opening work?", "Critique my logline", "Tear this draft apart", "What's weak about this pitch?"],
    avoidQueries: ["Teach me how loglines work", "Give me ideas for a logline", "Write a logline for the film"],
    triggers: ["be honest", "critique", "tear", "feedback on", "what's wrong with", "whats wrong with", "weak", "roast", "push back"],
  },
  brainstormer: {
    description:
      "Reply as a brainstorming partner: offer several distinct options, build on the person's ideas, and hold judgement until they choose. Choose this when they want ideas or angles.",
    notFor: "A single best answer (use Assistant), or honest critique (use Critic). A visual map of ideas is the Mind map interface.",
    queries: ["Give me ten ideas for the poster", "Riff with me on titles for the film", "What are some angles for the trailer?", "Throw some ideas at me for the opening"],
    avoidQueries: ["Critique my poster", "Make a mind map of ideas for the campaign", "Which title is best?"],
    triggers: ["ideas for", "riff", "throw some ideas", "angles", "spitball", "options for", "ten ideas", "some ideas"],
  },
};

const livePersonas = Object.fromEntries(
  Object.entries(CHAT_PERSONA_RETRIEVAL).map(([kind, profile]) => [kind, copyShellRetrieval(profile)]),
) as Record<ChatPersonaKind, ShellRetrieval>;

export function chatPersonaRetrieval(kind: ChatPersonaKind): ShellRetrieval {
  return livePersonas[kind];
}

export function setChatPersonaRetrieval(kind: ChatPersonaKind, next: ShellRetrieval) {
  livePersonas[kind] = copyShellRetrieval(next);
}

/** Who a draft is asking to hear from, if anyone in particular. */
export function chatPersonaFor(draft: string): ChatPersonaKind | null {
  let best: { kind: ChatPersonaKind | null; score: number } = { kind: null, score: 0 };
  for (const kind of CHAT_PERSONA_KINDS) {
    const score = scoreProfile(livePersonas[kind], draft).total;
    if (score >= SHELL_ROUTE_FLOOR && score > best.score) best = { kind, score };
  }
  return best.kind;
}

const liveFormats = Object.fromEntries(
  Object.entries(CHAT_FORMAT_RETRIEVAL).map(([kind, profile]) => [kind, copyShellRetrieval(profile)]),
) as Record<ChatFormatKind, ShellRetrieval>;

export function chatFormatRetrieval(kind: ChatFormatKind): ShellRetrieval {
  return liveFormats[kind];
}

export function setChatFormatRetrieval(kind: ChatFormatKind, next: ShellRetrieval) {
  liveFormats[kind] = copyShellRetrieval(next);
}

const live = Object.fromEntries(
  Object.entries(SHELL_RETRIEVAL).map(([kind, profile]) => [kind, copy(profile)]),
) as Record<ShellKind, ShellRetrieval>;

export function shellRetrieval(kind: ShellKind): ShellRetrieval {
  return live[kind];
}

export function setShellRetrieval(kind: ShellKind, next: ShellRetrieval) {
  live[kind] = copy(next);
}

const QUERY_STOPWORDS = new Set([
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
  "this",
  "that",
  "into",
  "from",
  "each",
  "per",
  "their",
  "write",
  "draft",
  "compose",
  "search",
  "find",
  "look",
  "make",
  "build",
  "create",
  "turn",
]);

function contentWords(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length > 2 && !QUERY_STOPWORDS.has(word));
}

/** How closely a draft resembles any one of these prompts: 36 for a full match, up to 28 for most of its words. */
function similarity(queries: string[], draft: string): number {
  const text = draft.trim().toLowerCase();
  if (text.length < 8) return 0;
  let best = 0;
  for (const query of queries) {
    const q = query.trim().toLowerCase();
    if (q.length < 4) continue;
    if (text.includes(q)) {
      best = Math.max(best, 36);
      continue;
    }
    const words = contentWords(q);
    if (words.length < 2) continue;
    const hits = words.filter((word) => text.includes(word)).length;
    if (hits < 2) continue;
    const ratio = hits / words.length;
    if (ratio < 0.6) continue;
    best = Math.max(best, Math.round(28 * ratio));
  }
  return best;
}

/** Lowercase words separated by single spaces, padded so phrases match on word edges. */
function wordText(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim()} `;
}

/** Which trigger words or phrases the draft contains, as whole words. */
function triggerHits(triggers: string[], draft: string): string[] {
  const text = wordText(draft);
  if (text.trim().length === 0) return [];
  return triggers.filter((trigger) => {
    const phrase = wordText(trigger);
    return phrase.trim() !== "" && text.includes(phrase);
  });
}

export type ShellScore = {
  total: number;
  triggers: number;
  queries: number;
  /** Subtracted: how closely the draft reads like a "should not open" prompt. */
  avoid: number;
  matchedTriggers: string[];
};

export function scoreProfile(profile: ShellRetrieval, draft: string): ShellScore {
  const matchedTriggers = triggerHits(profile.triggers, draft);
  const triggers = Math.min(matchedTriggers.length, 2) * 20;
  const queries = similarity(profile.queries, draft);
  const avoid = similarity(profile.avoidQueries, draft);
  return {
    total: Math.max(0, triggers + queries - avoid),
    triggers,
    queries,
    avoid,
    matchedTriggers,
  };
}

/**
 * How strongly a typed prompt resembles this interface's example queries.
 * A full example, or most of its distinctive words, scores high.
 */
export function shellQueryMatchScore(kind: ShellKind, draft: string): number {
  return similarity(live[kind].queries, draft);
}

/** How closely a draft reads like one of this interface's "should not open" prompts. */
export function shellAvoidScore(kind: ShellKind, draft: string): number {
  return similarity(live[kind].avoidQueries, draft);
}

/**
 * How many of this interface's trigger words or phrases the draft contains, as
 * whole words. Two hits count fully; more add nothing.
 */
export function shellTriggerScore(kind: ShellKind, draft: string): number {
  return Math.min(triggerHits(live[kind].triggers, draft).length, 2) * 20;
}

/** Everything that says a draft is asking for this kind of interface, less what says it isn't. */
export function shellKindScore(kind: ShellKind, draft: string): number {
  const own = scoreProfile(live[kind], draft).total;
  // A query that asks for one of Chat's formats or personas is a query for Chat.
  if (kind === "chat") return Math.max(own, chatModeScore(draft));
  return own;
}

/** How strongly a draft asks for a particular reply format or assistant. */
function chatModeScore(draft: string) {
  let persona = 0;
  for (const kind of CHAT_PERSONA_KINDS) persona = Math.max(persona, scoreProfile(livePersonas[kind], draft).total);
  return Math.max(chatFormatFor(draft).score, persona >= SHELL_ROUTE_FLOOR ? persona : 0);
}

/** Which version of a chat reply a draft is asking for, if any. */
export function chatFormatFor(draft: string): { format: ChatFormatKind | null; score: number } {
  let best: { format: ChatFormatKind | null; score: number } = { format: null, score: 0 };
  for (const kind of CHAT_FORMAT_KINDS) {
    const score = scoreProfile(liveFormats[kind], draft).total;
    if (score >= SHELL_ROUTE_FLOOR && score > best.score) best = { format: kind, score };
  }
  return best;
}

/** The score broken into its parts, for showing why a draft routes where it does. */
export function shellScoreBreakdown(kind: ShellKind, draft: string): ShellScore {
  return scoreProfile(live[kind], draft);
}

/** The lowest kind score that brings an interface forward on the chat home (its hint floor). */
export const SHELL_ROUTE_FLOOR = 12;

export type ShellRoute = { kind: ShellKind | null; scores: Record<ShellKind, number> };

function routeWith(profiles: Record<ShellKind, ShellRetrieval>, draft: string): ShellRoute {
  const scores = {} as Record<ShellKind, number>;
  let kind: ShellKind | null = null;
  for (const k of Object.keys(profiles) as ShellKind[]) {
    scores[k] = scoreProfile(profiles[k], draft).total;
    if (k === "chat") scores[k] = Math.max(scores[k], chatModeScore(draft));
    if (scores[k] >= SHELL_ROUTE_FLOOR && (kind === null || scores[k] > scores[kind])) kind = k;
  }
  return { kind, scores };
}

/** Which interface a draft would open today, if any. */
export function routeShellDraft(draft: string): ShellRoute {
  return routeWith(live, draft);
}
