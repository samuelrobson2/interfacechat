import { APP_EMPTY, APP_FIXTURES } from "../apps/app-fixtures";
import { EXTRA_EMPTY, EXTRA_FIXTURES } from "./shell-fixtures-extra";
import { MORE_EMPTY, MORE_FIXTURES } from "./shell-fixtures-more";
import { GENERATOR_EMPTY, GENERATOR_FIXTURES } from "./shell-fixtures-generator";
import { fillToShellData } from "./shell-fill";
import type {
  DocumentShellData,
  SearchShellData,
  ShellDataByKind,
  ShellKind,
  ShellState,
  TableColumn,
  TableShellData,
} from "./shell-types";

export type ShellFixture<K extends ShellKind> = {
  states: Record<ShellState, ShellDataByKind[K]>;
  /** The suggestion the "suggestion" state is seeded from. */
  suggestionPrompt: string;
  /** The past chat the "history" state comes from. */
  history: { chatTitle: string; when: string };
};

const emptyDocument: DocumentShellData = { title: "", body: "" };

const documentFixture: ShellFixture<"document"> = {
  suggestionPrompt: "Write a paper on urban heat islands",
  history: { chatTitle: "Urban heat islands paper", when: "3 days ago" },
  states: {
    empty: emptyDocument,
    suggestion: fillToShellData("document", {
      title: "Urban heat islands",
      text: "A short paper on why cities trap heat and what planners can do about it.",
      details: {
        outline: ["Why cities run hot", "Who it affects", "What cools a street", "Policy options"],
        length: "~1,500 words",
      },
    }),
    history: {
      title: "Urban heat islands",
      length: "~1,500 words",
      body: [
        "Cities run several degrees warmer than the land around them. Asphalt and roofs soak up sunlight all day and release it at night, so the hottest neighbourhoods barely cool down before morning.",
        "## Who it affects",
        "The burden is uneven. Districts with little tree cover and dense housing are often **4–7°C hotter** on summer afternoons than leafy suburbs a few miles away.",
        "- Older residents and young children\n- Outdoor workers\n- Households without air conditioning",
        "## What cools a street",
        "Shade does most of the work. A mature street tree can lower the surface temperature beneath it by more than 10°C, and reflective roofs cut the heat a building takes in.",
        "1. Plant and protect street trees\n2. Swap dark roofs for reflective coatings\n3. Open up water and green space",
        "> The coolest block in a heatwave is rarely the newest one. It is the one with the oldest trees.",
      ].join("\n\n"),
    },
  },
};

const emptySearch: SearchShellData = {
  query: "",
  filters: [],
  queries: [],
  results: [],
};

const searchFixture: ShellFixture<"search"> = {
  suggestionPrompt: "Find papers on sleep and memory",
  history: { chatTitle: "Coffee in North Beach", when: "Yesterday" },
  states: {
    empty: emptySearch,
    suggestion: fillToShellData("search", {
      title: "Studies on how deep sleep helps consolidate long-term memory in adults",
      text: "",
      details: {
        queries: [],
        filters: ["Papers"],
        sources: ["pubmed.ncbi.nlm.nih.gov", "nature.com", "scholar.google.com"],
      },
    }),
    history: {
      query: "Coffee roasters in North Beach",
      filters: ["North Beach", "Open now"],
      queries: [],
      results: [
        {
          id: "result-trieste",
          title: "Caffe Trieste",
          snippet:
            "A North Beach institution since 1956, pulling espresso from beans it roasts itself.",
          url: "https://www.caffetrieste.com",
        },
        {
          id: "result-graffeo",
          title: "Graffeo Coffee Roasting",
          snippet:
            "Family roastery on Columbus Avenue selling fresh beans by the pound over the counter.",
          url: "https://www.graffeo.com",
        },
        {
          id: "result-reveille",
          title: "Réveille Coffee",
          snippet:
            "Small-batch roaster with a bright café and seasonal single origins.",
          url: "https://www.reveillecoffee.com",
        },
        {
          id: "result-sightglass",
          title: "Sightglass Coffee",
          snippet:
            "San Francisco roaster a short ride away, known for its light, fruit-forward roasts.",
          url: "https://sightglasscoffee.com",
        },
      ],
    },
  },
};

const blankColumns: TableColumn[] = [
  { id: "col-a", label: "", type: "text" },
  { id: "col-b", label: "", type: "text" },
  { id: "col-c", label: "", type: "text" },
];

const emptyTable: TableShellData = { title: "", columns: blankColumns, rows: [] };

const shotColumns: TableColumn[] = [
  { id: "shot", label: "Shot", type: "text" },
  { id: "description", label: "Description", type: "text" },
  { id: "framing", label: "Framing", type: "tag" },
  { id: "movement", label: "Camera movement", type: "tag" },
  { id: "cast", label: "Cast", type: "text" },
  { id: "equipment", label: "Equipment", type: "text" },
  { id: "time", label: "Est. time", type: "text" },
];

const historyColumns: TableColumn[] = [
  ...shotColumns.slice(0, 1),
  { id: "reference", label: "Reference", type: "image" },
  ...shotColumns.slice(1),
];

const shot = (
  id: string,
  cells: Record<string, string>,
): TableShellData["rows"][number] => ({ id, cells });

const tableFixture: ShellFixture<"table"> = {
  suggestionPrompt:
    "Turn this script into a shot list with framing, camera movement, cast, equipment and estimated time for each shot.",
  history: { chatTitle: "The Last Ferry shot list", when: "Last week" },
  states: {
    empty: emptyTable,
    suggestion: fillToShellData("table", {
      title: "Shot list",
      text: "One row per shot, in shooting order.",
      details: {
        columns: shotColumns.map(({ label, type }) => ({ label, type })),
        rowCount: 12,
      },
    }),
    history: {
      title: "Scenes 1–2 shot list",
      description: "Every shot in the opening two scenes, in shooting order.",
      columns: historyColumns,
      rows: [
        shot("row-1", {
          shot: "1A",
          reference: "https://picsum.photos/seed/ferry-dock/320/200",
          description: "Fog rolls over the empty dock at dawn",
          framing: "Wide",
          movement: "Static",
          cast: "None",
          equipment: "Tripod, 24mm",
          time: "20 min",
        }),
        shot("row-2", {
          shot: "1B",
          reference: "https://picsum.photos/seed/ferry-walk/320/200",
          description: "Mara walks the length of the pier",
          framing: "Medium",
          movement: "Dolly",
          cast: "Mara",
          equipment: "Dolly track, 35mm",
          time: "45 min",
        }),
        shot("row-3", {
          shot: "1C",
          reference: "https://picsum.photos/seed/ferry-ticket/320/200",
          description: "Her hand grips a crumpled ticket",
          framing: "Close-up",
          movement: "Static",
          cast: "Mara",
          equipment: "Macro 100mm",
          time: "15 min",
        }),
        shot("row-4", {
          shot: "2A",
          reference: "https://picsum.photos/seed/ferry-horn/320/200",
          description: "The ferry horn sounds across the water",
          framing: "Wide",
          movement: "Pan",
          cast: "None",
          equipment: "Tripod, 50mm",
          time: "15 min",
        }),
        shot("row-5", {
          shot: "2B",
          reference: "https://picsum.photos/seed/ferry-deck/320/200",
          description: "Jonah watches her from the upper deck",
          framing: "Medium",
          movement: "Handheld",
          cast: "Jonah",
          equipment: "Gimbal, 35mm",
          time: "30 min",
        }),
        shot("row-6", {
          shot: "2C",
          reference: "https://picsum.photos/seed/ferry-eyes/320/200",
          description: "Their eyes meet as the gangway lifts",
          framing: "Close-up",
          movement: "Push in",
          cast: "Mara, Jonah",
          equipment: "Slider, 85mm",
          time: "40 min",
        }),
      ],
    },
  },
};

export const SHELL_FIXTURES: { [K in ShellKind]: ShellFixture<K> } = {
  document: documentFixture,
  search: searchFixture,
  table: tableFixture,
  ...MORE_FIXTURES,
  ...EXTRA_FIXTURES,
  ...GENERATOR_FIXTURES,
  ...APP_FIXTURES,
};

export const EMPTY_SHELL_DATA: { [K in ShellKind]: ShellDataByKind[K] } = {
  document: emptyDocument,
  search: emptySearch,
  table: emptyTable,
  ...MORE_EMPTY,
  ...EXTRA_EMPTY,
  ...GENERATOR_EMPTY,
  ...APP_EMPTY,
};
