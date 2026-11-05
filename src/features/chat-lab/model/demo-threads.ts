import type {
  ChatLabArtefact,
  ChatLabArtefactKind,
  ChatLabMessage,
  ChatLabSession,
} from "./chat-lab-store";

const HOUR = 60 * 60 * 1000;

/** Bump when the demo content changes, to refresh the copies already seeded. */
export const DEMO_THREADS_VERSION = 5;

/**
 * The version each demo thread first shipped in. A thread newer than the copy
 * someone has seeded is added for them; older ones they deleted stay deleted.
 */
export const DEMO_THREAD_SINCE: Record<string, number> = {
  "demo-film-shoot": 5,
  "demo-north-beach": 5,
};

const turn = (
  id: string,
  question: string,
  answer: string,
): ChatLabMessage[] => [
  { id: `${id}-u`, role: "user", parts: [{ type: "text", text: question }] },
  {
    id: `${id}-a`,
    role: "assistant",
    parts: [{ type: "text", text: answer }],
  },
];

const thread = (
  id: string,
  title: string,
  hoursAgo: number,
  messages: ChatLabMessage[],
): ChatLabSession => {
  const at = Date.now() - hoursAgo * HOUR;
  return {
    id,
    title,
    messages,
    artefacts: {},
    activeArtefactId: null,
    createdAt: at,
    updatedAt: at,
  };
};

const artefact = (
  id: string,
  kind: ChatLabArtefactKind,
  title: string,
  content: string,
  sourceUserMessageId: string,
): ChatLabArtefact => ({
  id,
  kind,
  title,
  content,
  filters: [],
  sourceUserMessageId,
  pinned: false,
});

/** Past work that opened interfaces, so the chat home has history and projects to show. */
const withArtefacts = (
  session: ChatLabSession,
  artefacts: ChatLabArtefact[],
): ChatLabSession => ({
  ...session,
  artefacts: Object.fromEntries(artefacts.map((item) => [item.id, item])),
});

/** Threads to switch between while trying out multi-tasking. */
export const createDemoThreads = (): ChatLabSession[] => [
  withArtefacts(
    thread("demo-film-shoot", "Marketing film shoot", 30, [
      ...turn(
        "demo-film-shoot-1",
        "Find coastal locations near Big Sur for a brand film",
        "Four locations fit a coastal brand film within an hour of Big Sur. The results are in the search.",
      ),
      ...turn(
        "demo-film-shoot-2",
        "Make a schedule for a 3-day shoot across those locations",
        "Here's a three-day schedule, one row per day, with call times set for golden hour.",
      ),
      ...turn(
        "demo-film-shoot-3",
        "Write a creative brief for the crew",
        "The brief is in the document: the idea, the tone, and what each day needs to capture.",
      ),
    ]),
    [
      artefact(
        "demo-film-shoot-search",
        "search",
        "Coastal locations near Big Sur",
        [
          "- [Garrapata State Park](https://www.parks.ca.gov/?page_id=579) — Bluffs, sea stacks and a walkable beach, with no permit for small crews.",
          "- [Pfeiffer Beach](https://www.fs.usda.gov/recarea/lpnf/recarea/?recid=10942) — Keyhole Arch and purple sand. Best light in the hour before sunset.",
          "- [Bixby Creek Bridge](https://en.wikipedia.org/wiki/Bixby_Creek_Bridge) — The classic aerial. Drone use needs a permit from the county.",
          "- [Point Lobos](https://www.parks.ca.gov/?page_id=571) — Cypress groves and coves. Commercial filming needs a state park permit.",
        ].join("\n"),
        "demo-film-shoot-1-u",
      ),
      artefact(
        "demo-film-shoot-table",
        "table",
        "3-day shoot schedule",
        [
          "| Day | Location | Scenes | Crew call |",
          "| --- | --- | --- | --- |",
          "| 1 | Garrapata State Park | Opening walk, product close-ups | 5:30 am |",
          "| 2 | Pfeiffer Beach | Keyhole Arch hero shot, interviews | 3:00 pm |",
          "| 3 | Bixby Creek Bridge | Aerials, driving sequence | 6:00 am |",
        ].join("\n"),
        "demo-film-shoot-2-u",
      ),
      artefact(
        "demo-film-shoot-document",
        "document",
        "Creative brief",
        [
          "# Creative brief",
          "",
          "A short brand film about getting outside before the day starts. Quiet, wide, and warm.",
          "",
          "## What each day captures",
          "",
          "- **Day 1:** the walk in, and the product in hand.",
          "- **Day 2:** the hero shot through the arch, and two short interviews.",
          "- **Day 3:** the road, from above.",
        ].join("\n"),
        "demo-film-shoot-3-u",
      ),
    ],
  ),
  withArtefacts(
    thread(
      "demo-north-beach",
      "Coffee in North Beach",
      20,
      turn(
        "demo-north-beach",
        "Search for coffee roasters in North Beach",
        "Three roasters stand out in North Beach. The list is in the search.",
      ),
    ),
    [
      artefact(
        "demo-north-beach-search",
        "search",
        "Coffee roasters in North Beach",
        [
          "- [Caffe Trieste](https://www.caffetrieste.com) — The 1956 original. Roasts its own espresso blend.",
          "- [Caffe Roma](https://www.cafferoma.com) — Roasts in-house on Columbus Avenue.",
          "- [Graffeo Coffee](https://www.graffeo.com) — A roaster since 1935, beans only, no café.",
        ].join("\n"),
        "demo-north-beach-u",
      ),
    ],
  ),
  thread(
    "demo-churn",
    "Explaining Q3 Churn",
    2,
    turn(
      "demo-churn",
      "Why did Pro tier churn rise in Q3?",
      [
        "Three things line up with the jump from 3.1% to 4.4% monthly churn.",
        "",
        "**Price change.** The July increase hit annual renewals first, and most cancellations cite cost.",
        "",
        "**Onboarding gap.** Accounts that never connected a dataset in week one churned at twice the rate.",
        "",
        "**Support load.** First response time doubled in August while the team was short two people.",
        "",
        "The onboarding gap is the easiest to act on. Want a breakdown by signup cohort?",
      ].join("\n"),
    ),
  ),
  thread(
    "demo-launch",
    "Drafting Launch Email",
    5,
    turn(
      "demo-launch",
      "Draft a launch email for the new dashboard",
      [
        "**Subject:** Your data, one screen",
        "",
        "Hi {first_name},",
        "",
        "The new dashboard puts every dataset, model, and run in one place. Pin the views you check daily, and share them with your team in a click.",
        "",
        "It's live in your workspace now. Open it from the sidebar.",
        "",
        "Thanks,",
        "The Adaption team",
      ].join("\n"),
    ),
  ),
  thread(
    "demo-rag",
    "Comparing Fine-Tuning",
    26,
    turn(
      "demo-rag",
      "Should we fine-tune or use RAG for support tickets?",
      [
        "Start with retrieval, then fine-tune for tone once the answers are right.",
        "",
        "**RAG** picks up doc changes right away and is cheap to start, but tone depends on the prompt.",
        "",
        "**Fine-tuning** learns tone and format reliably, but every doc change needs a retrain.",
        "",
        "Most teams combine them: *RAG for facts, a light fine-tune for voice.*",
      ].join("\n"),
    ),
  ),
  thread(
    "demo-drought",
    "Summarising Drought Data",
    50,
    turn(
      "demo-drought",
      "Summarize the drought designations dataset",
      [
        "The dataset covers 3,142 counties from 2012 to 2024, with one row per county per designation.",
        "",
        "Designations peak in 2012 and 2021, and the Southwest accounts for 41% of all rows. About 6% of rows are missing an end date, mostly from 2024.",
      ].join("\n"),
    ),
  ),
];
