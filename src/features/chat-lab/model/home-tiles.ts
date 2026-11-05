import {
  EMPTY_SHELL_DATA,
  SHELL_FIXTURES,
  CHAT_SHELL_KINDS,
  isChatShellKind,
  type ShellDataByKind,
  type ChatShellKind,
} from "@/features/interface-shells";
import type { ChatLabArtefact, ChatLabSession } from "./chat-lab-store";
import {
  artefactDocument,
  artefactSearch,
  artefactTable,
} from "./shell-adapters";

/** An interface kind with data of that kind, kept together so they can't drift apart. */
export type KindData = {
  [K in ChatShellKind]: { kind: K; data: ShellDataByKind[K] };
}[ChatShellKind];

/** A library interface in its empty state. */
export type BlankTile = { type: "blank"; id: string; kind: ChatShellKind };

/** An interface already filled with something worth starting. Drawn with a gradient border. */
export type SuggestedTile = {
  type: "suggested";
  id: string;
  /** What goes into the composer when it's picked. */
  prompt: string;
} & KindData;

/** The one interface a past chat used, in its history state. */
export type HistoryTile = {
  type: "history";
  id: string;
  sessionId: string;
  title: string;
  updatedAt: number;
} & KindData;

/** A past chat that used several interfaces: their small icons and a name. */
export type ProjectTile = {
  type: "project";
  id: string;
  sessionId: string;
  name: string;
  updatedAt: number;
  /** In the order they were first opened; the first one leads when the project matches. */
  interfaces: (KindData & { title: string })[];
};

export type HomeTile = BlankTile | SuggestedTile | HistoryTile | ProjectTile;

export type HomeTileContext = { sessions: ChatLabSession[] };

/**
 * Anything that puts tiles on the chat home. Sources are hard-coded or derived
 * today; each can be swapped for a real one without touching ranking or layout.
 */
export type HomeTileSource = (context: HomeTileContext) => HomeTile[];

/** One blank tile for each built interface. */
export const libraryTiles: HomeTileSource = () =>
  CHAT_SHELL_KINDS.map((kind) => ({ type: "blank", id: `blank-${kind}`, kind }));

/** Hard-coded for now: suggestions for the first three, so the resting home stays a few. */
export const suggestionTiles: HomeTileSource = () =>
  (["document", "search", "table"] as const).map((kind) => {
    const fixture = SHELL_FIXTURES[kind];
    return {
      type: "suggested",
      id: `suggested-${kind}`,
      prompt: fixture.suggestionPrompt,
      kind,
      data: fixture.states.suggestion,
    } as SuggestedTile;
  });

function artefactData(artefact: ChatLabArtefact): KindData | null {
  if (artefact.kind === "shell") return artefact.shell ? (artefact.shell as KindData) : null;
  if (!isChatShellKind(artefact.kind)) return null;
  switch (artefact.kind) {
    case "document":
      return { kind: "document", data: artefactDocument(artefact) };
    case "search":
      return { kind: "search", data: artefactSearch(artefact, artefact.title) };
    case "table":
      return { kind: "table", data: artefactTable(artefact) };
    default:
      return null;
  }
}

/**
 * Past chats as tiles: one interface makes a historical tile, several make a
 * project group. Chats without an interface stay off the home.
 */
export const pastWorkTiles: HomeTileSource = ({ sessions }) =>
  sessions.flatMap((session): HomeTile[] => {
    const interfaces = Object.values(session.artefacts).flatMap((artefact) => {
      const kindData = artefactData(artefact);
      return kindData ? [{ ...kindData, title: artefact.title }] : [];
    });
    const [first] = interfaces;
    if (!first) return [];
    if (interfaces.length === 1) {
      return [
        {
          type: "history",
          id: `history-${session.id}`,
          sessionId: session.id,
          title: first.title || session.title,
          updatedAt: session.updatedAt,
          kind: first.kind,
          data: first.data,
        } as HistoryTile,
      ];
    }
    return [
      {
        type: "project",
        id: `project-${session.id}`,
        sessionId: session.id,
        name: session.title,
        updatedAt: session.updatedAt,
        interfaces,
      },
    ];
  });

export const HOME_TILE_SOURCES: HomeTileSource[] = [
  libraryTiles,
  suggestionTiles,
  pastWorkTiles,
];

export function collectHomeTiles(
  context: HomeTileContext,
  sources: HomeTileSource[] = HOME_TILE_SOURCES,
): HomeTile[] {
  const seen = new Set<string>();
  return sources
    .flatMap((source) => source(context))
    .filter((tile) => (seen.has(tile.id) ? false : (seen.add(tile.id), true)));
}

/** The words a tile is about, for matching the draft against past and suggested work. */
export function tileText(tile: HomeTile): string {
  switch (tile.type) {
    case "blank":
      return "";
    case "suggested":
      return `${tile.prompt} ${titleOf(tile)}`;
    case "history":
      return `${tile.title} ${titleOf(tile)} ${tile.data.project ?? ""}`;
    case "project":
      return `${tile.name} ${tile.interfaces.map((item) => item.title).join(" ")}`;
  }
}

/** The title a shell shows: a search's query, otherwise its title. */
export function titleOf(kindData: KindData): string {
  const data = kindData.data as { query?: string; title?: string };
  return data.query ?? data.title ?? "";
}

export const emptyKindData = (kind: ChatShellKind): KindData =>
  ({ kind, data: EMPTY_SHELL_DATA[kind] }) as KindData;
