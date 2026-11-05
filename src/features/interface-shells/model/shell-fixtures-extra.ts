import type {
  ChatShellData,
  FlowchartShellData,
  GuideShellData,
  MindmapShellData,
  ShellDataByKind,
  ShellState,
  TimelineShellData,
} from "./shell-types";

type Fixture<K extends keyof ShellDataByKind> = {
  states: Record<ShellState, ShellDataByKind[K]>;
  suggestionPrompt: string;
  history: { chatTitle: string; when: string };
};


/* ── Timeline ─────────────────────────────────────────────────────────── */

export const emptyTimeline: TimelineShellData = { title: "", events: [] };

const ferryHistory = [
  { id: "t1", date: "1898", title: "Pier opens", detail: "Built for the paddle steamers to the island." },
  { id: "t2", date: "1932", title: "Rebuilt in concrete", detail: "After the storm of 1931 took the wooden deck." },
  { id: "t3", date: "1971", title: "Last steam ferry", detail: "Diesel ferries replace the old steamers." },
  { id: "t4", date: "2009", title: "Service ends", detail: "The bridge opens and passenger numbers collapse." },
  { id: "t5", date: "2024", title: "Restored", detail: "The ticket hall reopens as a café and museum." },
];

const timelineFixture: Fixture<"timeline"> = {
  suggestionPrompt: "Give me a timeline of the Harbour Pier ferry, from when it opened to now.",
  history: { chatTitle: "Harbour Pier history", when: "Last week" },
  states: {
    empty: emptyTimeline,
    suggestion: {
      title: "The Harbour Pier ferry",
      events: ferryHistory.slice(0, 3).map(({ id, date, title }) => ({ id, date, title })),
    },
    history: { title: "The Harbour Pier ferry", events: ferryHistory },
  },
};

/* ── Flowchart ────────────────────────────────────────────────────────── */

export const emptyFlowchart: FlowchartShellData = { title: "", nodes: [], edges: [] };

const bookingNodes: FlowchartShellData["nodes"] = [
  { id: "f1", kind: "start", label: "Find a location" },
  { id: "f2", kind: "step", label: "Recce it" },
  { id: "f3", kind: "decision", label: "Free on our dates?" },
  { id: "f4", kind: "step", label: "Agree the fee" },
  { id: "f5", kind: "end", label: "Try the next one" },
  { id: "f6", kind: "decision", label: "Within budget?" },
  { id: "f7", kind: "step", label: "Negotiate" },
  { id: "f8", kind: "end", label: "Sign the agreement" },
];

const bookingEdges: FlowchartShellData["edges"] = [
  { from: "f1", to: "f2" },
  { from: "f2", to: "f3" },
  { from: "f3", to: "f4", label: "Yes" },
  { from: "f3", to: "f5", label: "No" },
  { from: "f4", to: "f6" },
  { from: "f6", to: "f8", label: "Yes" },
  { from: "f6", to: "f7", label: "No" },
  { from: "f7", to: "f8" },
];

const flowchartFixture: Fixture<"flowchart"> = {
  suggestionPrompt: "Map out how we book a location, including what happens if it's not free or over budget.",
  history: { chatTitle: "Location booking process", when: "2 weeks ago" },
  states: {
    empty: emptyFlowchart,
    suggestion: {
      title: "Booking a location",
      nodes: bookingNodes.slice(0, 5),
      edges: bookingEdges.slice(0, 4),
    },
    history: { title: "Booking a location", nodes: bookingNodes, edges: bookingEdges },
  },
};

/* ── Mind map ─────────────────────────────────────────────────────────── */

export const emptyMindmap: MindmapShellData = { title: "", branches: [] };

const leaf = (id: string, label: string) => ({ id, label, children: [] });

const mindmapFixture: Fixture<"mindmap"> = {
  suggestionPrompt: "Help me brainstorm the themes of The Last Ferry as a mind map.",
  history: { chatTitle: "Themes of the film", when: "Last month" },
  states: {
    empty: emptyMindmap,
    suggestion: {
      title: "The Last Ferry",
      branches: [
        { id: "b1", label: "Leaving", children: [] },
        { id: "b2", label: "The sea", children: [] },
        { id: "b3", label: "Memory", children: [] },
        { id: "b4", label: "The town", children: [] },
      ],
    },
    history: {
      title: "The Last Ferry",
      branches: [
        { id: "b1", label: "Leaving", children: [leaf("b1a", "The last crossing"), leaf("b1b", "Goodbyes on the pier")] },
        { id: "b2", label: "The sea", children: [leaf("b2a", "Grey water"), leaf("b2b", "The horn")] },
        { id: "b3", label: "Memory", children: [leaf("b3a", "Old tickets"), leaf("b3b", "Photos in the hall"), leaf("b3c", "Mara's father")] },
        { id: "b4", label: "The town", children: [leaf("b4a", "The bridge"), leaf("b4b", "Empty cafés")] },
      ],
    },
  },
};

/* ── Guide ────────────────────────────────────────────────────────────── */

export const emptyGuide: GuideShellData = { title: "", facts: [], needs: [], steps: [] };

const stewNeeds = [
  "2 kg white fish, in chunks",
  "1 kg mussels, cleaned",
  "4 onions and 6 cloves of garlic",
  "2 fennel bulbs",
  "2 tins of tomatoes",
  "2 litres of fish stock",
  "A bunch of parsley",
  "4 loaves of crusty bread",
].map((text, i) => ({ id: `n${i}`, text, have: false, group: "Ingredients" }));

const stewSteps = [
  { id: "s1", text: "Soften the onions, garlic and fennel in a big pot of olive oil.", minutes: 10 },
  { id: "s2", text: "Add the tomatoes and stock and bring to a simmer.", minutes: 20 },
  { id: "s3", text: "Lower in the fish and simmer gently.", minutes: 6, note: "Don't stir, or the fish breaks up." },
  { id: "s4", text: "Add the mussels, cover, and cook until they open. Throw away any that stay shut.", minutes: 4 },
  { id: "s5", text: "Scatter with parsley and serve with the bread." },
];

const guideFixture: Fixture<"guide"> = {
  suggestionPrompt: "Give me a recipe for fish stew for the crew lunch on shoot day 1, for 12 people.",
  history: { chatTitle: "Crew lunch: fish stew", when: "Yesterday" },
  states: {
    empty: emptyGuide,
    suggestion: {
      title: "Fish stew for the crew",
      facts: [
        { label: "Serves", value: "12" },
        { label: "Time", value: "45 min" },
      ],
      needs: stewNeeds.slice(0, 4),
      steps: stewSteps.slice(0, 3).map((step) => ({ ...step, done: false })),
    },
    history: {
      title: "Fish stew for the crew",
      facts: [
        { label: "Serves", value: "12" },
        { label: "Time", value: "45 min" },
      ],
      needs: [
        ...stewNeeds.map((need, i) => ({ ...need, have: i < 5 })),
        { id: "e1", text: "A 10-litre pot", have: true, group: "Equipment" },
        { id: "e2", text: "A slotted spoon", have: false, group: "Equipment" },
      ],
      steps: stewSteps.map((step, i) => ({ ...step, done: i < 2 })),
    },
  },
};

/* ── Chat ─────────────────────────────────────────────────────────────── */

export const emptyChat: ChatShellData = { title: "", messages: [] };

const chatFixture: Fixture<"chat"> = {
  suggestionPrompt: "What makes a good opening shot for a quiet film?",
  history: { chatTitle: "Opening shot", when: "Yesterday" },
  states: {
    empty: emptyChat,
    suggestion: { title: "What makes a good opening shot for a quiet film?", messages: [] },
    history: {
      title: "What makes a good opening shot?",
      messages: [
        { id: "m1", role: "user", text: "What makes a good opening shot for a quiet film?" },
        { id: "m2", role: "assistant", text: "Hold on one image long enough that the audience settles into your pace. The empty dock at dawn does that: nothing happens, and that's the point." },
        { id: "m3", role: "user", text: "How long is too long?" },
        { id: "m4", role: "assistant", text: "Once the frame stops giving anything new. Around eight to twelve seconds for a static wide, longer if the light is changing." },
      ],
    },
  },
};

export const EXTRA_FIXTURES = {
  chat: chatFixture,
  timeline: timelineFixture,
  flowchart: flowchartFixture,
  mindmap: mindmapFixture,
  guide: guideFixture,
};

export const EXTRA_EMPTY = {
  chat: emptyChat,
  timeline: emptyTimeline,
  flowchart: emptyFlowchart,
  mindmap: emptyMindmap,
  guide: emptyGuide,
};
