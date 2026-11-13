import type { GeneratorControls, GeneratorShellData, ShellDataByKind, ShellState } from "./shell-types";

/** Same shape as the first three fixtures; repeated here to avoid an import cycle. */
type Fixture<K extends keyof ShellDataByKind> = {
  states: Record<ShellState, ShellDataByKind[K]>;
  suggestionPrompt: string;
  history: { chatTitle: string; when: string };
};

export const DEFAULT_GENERATOR_CONTROLS: GeneratorControls = {
  tone: "Warm",
  length: "short",
  style: "Photo",
  aspect: "1:1",
  creativity: 50,
};

export const emptyGenerator: GeneratorShellData = {
  title: "",
  mode: "image",
  references: [],
  controls: DEFAULT_GENERATOR_CONTROLS,
  variations: [],
};

const picture = (id: string, seed: string) => ({ id, src: `https://picsum.photos/seed/${seed}/600/600` });

const generatorFixture: Fixture<"generator"> = {
  suggestionPrompt: "Generate a poster image of the last ferry leaving at dawn, muted colours",
  history: { chatTitle: "The Last Ferry poster", when: "Yesterday" },
  states: {
    empty: emptyGenerator,
    suggestion: {
      ...emptyGenerator,
      title: "A poster image of the last ferry leaving at dawn, muted colours",
      controls: { ...DEFAULT_GENERATOR_CONTROLS, style: "Film still", aspect: "2:3" },
      references: [{ id: "r1", src: "https://picsum.photos/seed/ferry-sea/400/400", name: "Grey water" }],
    },
    history: {
      ...emptyGenerator,
      title: "A poster image of the last ferry leaving at dawn, muted colours",
      controls: { ...DEFAULT_GENERATOR_CONTROLS, style: "Film still", aspect: "2:3" },
      references: [{ id: "r1", src: "https://picsum.photos/seed/ferry-sea/400/400", name: "Grey water" }],
      variations: [picture("v1", "ferry-dawn"), picture("v2", "ferry-window"), picture("v3", "ferry-cabin")],
      chosen: "v1",
    },
  },
};

export const GENERATOR_FIXTURES = { generator: generatorFixture };
export const GENERATOR_EMPTY = { generator: emptyGenerator };
