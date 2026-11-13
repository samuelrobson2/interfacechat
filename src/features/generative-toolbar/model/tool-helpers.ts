import type { GeneratedTool } from "./tool-spec";

/** What the person is pointing at: selected text inside the interface. */
export type ToolContext = { selection: string | null };

export const clip = (text: string, max = 28) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Two controls first, so the first set always has some, then actions, then a
 * control every third tool, so regenerating keeps the mix.
 */
export function mix<D>(controls: GeneratedTool<D>[], actions: GeneratedTool<D>[]): GeneratedTool<D>[] {
  const out: GeneratedTool<D>[] = [...controls.slice(0, 2)];
  const rest = controls.slice(2);
  actions.forEach((action, index) => {
    out.push(action);
    if (index % 2 === 1 && rest.length) out.push(rest.shift()!);
  });
  return [...out, ...rest];
}
