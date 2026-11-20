import type { ShellKind } from "@/features/interface-shells";

/**
 * The Workspace's History: recent chats, newest first, each with the
 * interfaces it made; narrowed as you type (by its title, what was said, and
 * what its interfaces are called) and by an app picked on the right.
 */

type Part = { type: string; text?: string };
export type HistorySession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: { role: string; parts: Part[] }[];
  artefacts: Record<string, { title: string; role?: string }>;
};

export type HistoryEntry = {
  id: string;
  title: string;
  updatedAt: number;
  /** The interfaces it made, each kind once, in the order they were made. */
  kinds: ShellKind[];
  /** Where a search matched in what was said, when it wasn't the title: a few words around it. */
  match?: string;
};

const words = (query: string) => query.toLowerCase().split(/\s+/).filter(Boolean);
const textOf = (session: HistorySession) =>
  session.messages.flatMap((message) => message.parts.filter((part) => part.type === "text").map((part) => part.text ?? "")).join("\n");

/** A few words either side of where `word` is in `text`. */
function around(text: string, word: string) {
  const at = text.toLowerCase().indexOf(word);
  if (at < 0) return undefined;
  const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, at - 40)) + 1);
  const end = Math.min(text.length, at + word.length + 50);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

/**
 * The chats to show: newest first; with a query, only those whose title, words
 * or interfaces hold every word of it; with an app picked, only those that made
 * one. `kindOf` reads what an interface is drawn as.
 */
export function searchHistory<A extends HistorySession["artefacts"][string]>(
  sessions: (HistorySession & { artefacts: Record<string, A> })[],
  { query = "", kind = null }: { query?: string; kind?: ShellKind | null },
  kindOf: (artefact: A) => ShellKind,
): HistoryEntry[] {
  const asked = words(query);
  return [...sessions]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .flatMap((session) => {
      const made = Object.values(session.artefacts);
      const kinds = [...new Set(made.map(kindOf))];
      if (kind && !kinds.includes(kind)) return [];
      if (!asked.length) return [{ id: session.id, title: session.title, updatedAt: session.updatedAt, kinds }];
      const title = session.title.toLowerCase();
      const said = textOf(session);
      const named = made.map((artefact) => artefact.title).join(" ").toLowerCase();
      const haystack = `${title}\n${said.toLowerCase()}\n${named}`;
      if (!asked.every((word) => haystack.includes(word))) return [];
      const inTitle = asked.every((word) => title.includes(word));
      const match = inTitle ? undefined : asked.map((word) => around(said, word)).find(Boolean);
      return [{ id: session.id, title: session.title, updatedAt: session.updatedAt, kinds, ...(match ? { match } : {}) }];
    });
}

/** How many chats made each interface: the count on its app. */
export function chatsPerKind<A extends HistorySession["artefacts"][string]>(
  sessions: (HistorySession & { artefacts: Record<string, A> })[],
  kindOf: (artefact: A) => ShellKind,
): Partial<Record<ShellKind, number>> {
  const counts: Partial<Record<ShellKind, number>> = {};
  for (const session of sessions) {
    for (const kind of new Set(Object.values(session.artefacts).map(kindOf))) counts[kind] = (counts[kind] ?? 0) + 1;
  }
  return counts;
}

/** When, as a list reads it: a time today, "Yesterday", a weekday this week, else a date. */
export function whenLabel(at: number, now = Date.now()) {
  const day = (time: number) => new Date(new Date(time).toDateString()).getTime();
  const days = Math.round((day(now) - day(at)) / 86_400_000);
  if (days <= 0) return new Date(at).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return new Date(at).toLocaleDateString("en-GB", { weekday: "long" });
  return new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
