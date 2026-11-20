import { SHELL_META } from "./shell-meta.js";
import type { ShellKind } from "./shell-types.js";

/**
 * Asking for an interface by name: "@Table" in the prompt box, picked from the
 * list "@" opens. Drawn in the box as the interface's icon and name (as offers
 * are in chat), and read by the chat API, which makes exactly that interface,
 * and by the home page, which opens its card. Read by the app and the API, so
 * it imports only the interfaces' names.
 */

/** The interfaces that can be asked for by name: the ones a chat makes. */
export const MENTIONABLE: ShellKind[] = ["document", "table", "tracker", "guide", "schedule", "search", "generator", "dashboard"];

// "@Table", or "@ Table" as picking one writes it: the space is the gap between the icon (drawn over the "@") and the name.
const pattern = () => new RegExp(`@ ?(${MENTIONABLE.map((kind) => SHELL_META[kind].label).join("|")})\\b`, "gi");
const kindOf = (label: string) => MENTIONABLE.find((kind) => SHELL_META[kind].label.toLowerCase() === label.toLowerCase()) ?? null;

export type Mention = { kind: ShellKind; start: number; end: number; /** Where the name starts, after the "@" and any space. */ nameAt: number };

/** Every interface named in the text, where its "@Name" is. */
export function mentionsIn(text: string): Mention[] {
  return [...text.matchAll(pattern())].flatMap((match) => {
    const kind = kindOf(match[1] ?? "");
    const start = match.index ?? 0;
    return kind ? [{ kind, start, end: start + match[0].length, nameAt: start + match[0].length - (match[1] ?? "").length }] : [];
  });
}

/** The first interface the text asks for by name, if any. */
export const mentionedKind = (text: string): ShellKind | null => mentionsIn(text)[0]?.kind ?? null;

/** The text without its "@Name"s, and the little word that tied one in ("in @Table", "as a @Guide"): what's asked for, for a title. */
export const withoutMentions = (text: string) =>
  text
    .replace(new RegExp(`(?:\\s+(?:in|into|as|on|with|using|via|for)(?:\\s+(?:a|an|the))?)?\\s*${pattern().source}`, "gi"), "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();

/** The interfaces that start with what's typed after "@", for the list it opens. */
export const mentionMatches = (query: string) =>
  MENTIONABLE.filter((kind) => SHELL_META[kind].label.toLowerCase().startsWith(query.trim().toLowerCase()));
