import { describe, expect, it } from "vitest";
import { chatsPerKind, searchHistory, whenLabel } from "../history-search";

const chat = (id: string, title: string, updatedAt: number, said: string[], made: [string, string][]) => ({
  id,
  title,
  updatedAt,
  messages: said.map((text, i) => ({ role: i % 2 ? "assistant" : "user", parts: [{ type: "text", text }] })),
  artefacts: Object.fromEntries(made.map(([kind, name], i) => [`${id}-${i}`, { title: name, kind }])),
});
const kindOf = (artefact: { kind: string }) => artefact.kind as never;

const sessions = [
  chat("a", "Dinner party", 300, ["Help me plan food for Saturday", "Here's a menu with lamb"], [["document", "Menu"], ["guide", "Lamb"], ["guide", "Tart"]]),
  chat("b", "Skincare shoot", 500, ["Plan a half-day shoot in the Mission"], [["schedule", "Shoot day"], ["table", "Shot list"]]),
  chat("c", "Quick question", 100, ["What wine goes with beef?"], []),
];

describe("history", () => {
  it("lists every chat newest first, each with the interfaces it made, once each", () => {
    const all = searchHistory(sessions, {}, kindOf);
    expect(all.map((entry) => entry.id)).toEqual(["b", "a", "c"]);
    expect(all[1]!.kinds).toEqual(["document", "guide"]);
  });

  it("narrows as you type: by title, by what was said (with where), by what its interfaces are called", () => {
    expect(searchHistory(sessions, { query: "dinner" }, kindOf).map((entry) => entry.id)).toEqual(["a"]);
    const byWords = searchHistory(sessions, { query: "wine" }, kindOf);
    expect(byWords.map((entry) => entry.id)).toEqual(["c"]);
    expect(byWords[0]!.match).toContain("wine goes with beef");
    expect(searchHistory(sessions, { query: "shot list" }, kindOf).map((entry) => entry.id)).toEqual(["b"]);
    expect(searchHistory(sessions, { query: "nothing like this" }, kindOf)).toEqual([]);
  });

  it("shows only the chats that made an app picked on the right, and counts them", () => {
    expect(searchHistory(sessions, { kind: "guide" as never }, kindOf).map((entry) => entry.id)).toEqual(["a"]);
    expect(chatsPerKind(sessions, kindOf)).toEqual({ document: 1, guide: 1, schedule: 1, table: 1 });
  });

  it("says when as a list reads it", () => {
    const now = new Date("2026-11-20T15:00:00").getTime();
    expect(whenLabel(new Date("2026-11-19T09:00:00").getTime(), now)).toBe("Yesterday");
    expect(whenLabel(new Date("2026-11-02T09:00:00").getTime(), now)).toBe("2 Nov");
  });
});
