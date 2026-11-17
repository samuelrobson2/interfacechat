import { SHELL_FIXTURES, type ChatShellKind } from "@/features/interface-shells";
import type { KindData } from "./home-tiles";

/**
 * Something to try, shown on the chat home: one of the interfaces round the
 * headline grows to medium plus where it stands, filled with an example, with
 * the request that would make it as its title (Chat: as the message). Short
 * enough for one line of the title. Hard-coded for now.
 */
export type HomePeek = { kind: ChatShellKind; prompt: string };

/** Only the six round the headline: the rest sit at the edges, partly out of view. */
export const HOME_PEEKS: HomePeek[] = [
  { kind: "notes", prompt: "Plan a skincare shoot for next Thursday" },
  { kind: "chat", prompt: "What makes a good opening shot for a quiet film?" },
  { kind: "search", prompt: "Find papers on sleep and memory" },
  { kind: "table", prompt: "Make a shot list for The Last Ferry" },
  { kind: "tracker", prompt: "Checklist for everything before the shoot" },
  { kind: "guide", prompt: "A fish stew recipe for 12 crew" },
];

/** The example a peek is filled with: the interface's suggestion fixture, headed with the request (Search heads with its query; Chat's title is its message). */
export const peekValue = ({ kind, prompt }: HomePeek) =>
  ({ kind, data: { ...SHELL_FIXTURES[kind].states.suggestion, ...(kind === "search" ? { query: prompt } : { title: prompt }) } }) as KindData;

/** How long one shows (its request typing in and its parts arriving take about two seconds of it), and the pause before the next. */
export const PEEK_SHOW_MS = 7000;
export const PEEK_GAP_MS = 1800;
/** The first waits until the page has settled after the interfaces spin out. */
export const PEEK_FIRST_MS = 1600;

/** A different one from last time, so it never seems stuck. */
export function nextPeek(last: ChatShellKind | null, available: ChatShellKind[]): HomePeek | null {
  const options = HOME_PEEKS.filter((peek) => peek.kind !== last && available.includes(peek.kind));
  return options.length ? options[Math.floor(Math.random() * options.length)]! : null;
}
