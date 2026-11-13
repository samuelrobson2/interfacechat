import { boardItems, canvasCounts } from "../model/canvas-layout";
import { countWords, parseBlocks } from "../model/markdown-blocks";
import { CHART_TYPE_META } from "../model/chart";
import { SHELL_META } from "../model/shell-meta";
import { appDetail } from "../apps/app-detail";
import type { ShellData, ShellDataByKind, ShellKind } from "../model/shell-types";

/**
 * The words an inline interface leads with: its title, and the one detail
 * that says what's in it ("1 of 4 done", "6 places near Harbour Pier").
 * Small shows only these; medium opens with them.
 */

/** Chat is the conversation itself: it never sits inside a reply. */
export const hasInline = (kind: ShellKind) => kind !== "chat";

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-12" → "December 2026". */
export function monthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  return year && m ? `${LONG_MONTHS[m - 1]} ${year}` : month;
}

/** A year, "YYYY-MM" or "YYYY-MM-DD", the way a timeline reads it. */
export function shortDate(date: string) {
  const [year, month, day] = date.split("-");
  if (!month) return year ?? date;
  const name = MONTHS[Number(month) - 1] ?? month;
  return day ? `${Number(day)} ${name} ${year}` : `${name} ${year}`;
}

/** Done and total, for interfaces that track progress. */
export function progressOf(kind: ShellKind, data: ShellData): { done: number; total: number } | null {
  if (kind === "tracker") {
    const { items } = data as ShellDataByKind["tracker"];
    return { done: items.filter((item) => item.done).length, total: items.length };
  }
  if (kind === "guide") {
    const { steps } = data as ShellDataByKind["guide"];
    return { done: steps.filter((step) => step.done).length, total: steps.length };
  }
  return null;
}

export function inlineTitle(kind: ShellKind, data: ShellData): string {
  const { title, query } = data as { title?: string; query?: string };
  return (title ?? query ?? "").trim() || SHELL_META[kind].label;
}

export function inlineDetail(kind: ShellKind, data: ShellData): string {
  switch (kind) {
    case "document": {
      const words = countWords(parseBlocks((data as ShellDataByKind["document"]).body));
      return words ? plural(words, "word") : "Nothing written yet";
    }
    case "search": {
      const { results, queries } = data as ShellDataByKind["search"];
      return results.length ? plural(results.length, "result") : plural(queries.length, "search", "searches");
    }
    case "table": {
      const { rows, columns } = data as ShellDataByKind["table"];
      return `${plural(rows.length, "row")} · ${plural(columns.length, "column")}`;
    }
    case "schedule": {
      const { dayCount, tasks } = data as ShellDataByKind["schedule"];
      return `${plural(dayCount, "day")} · ${plural(tasks.length, "task")}`;
    }
    case "tracker": {
      const { done, total } = progressOf(kind, data)!;
      return `${done} of ${total} done`;
    }
    case "guide": {
      const facts = (data as ShellDataByKind["guide"]).facts.filter((fact) => fact.value).slice(0, 2);
      if (facts.length) return facts.map((fact) => `${fact.label} ${fact.value}`).join(" · ");
      const { done, total } = progressOf(kind, data)!;
      return `${done} of ${plural(total, "step")} done`;
    }
    case "calendar": {
      const { month, events } = data as ShellDataByKind["calendar"];
      return `${plural(events.length, "event")} · ${monthLabel(month)}`;
    }
    case "reader": {
      const { source, pages } = data as ShellDataByKind["reader"];
      if (!source) return "No document yet";
      return pages ? `${source} · ${plural(pages, "page")}` : source;
    }
    case "map": {
      const { places, near } = data as ShellDataByKind["map"];
      return near ? `${plural(places.length, "place")} near ${near}` : plural(places.length, "place");
    }
    case "moodboard": {
      // What's on the canvas, by kind, leaving out kinds it has none of.
      const counts = canvasCounts(boardItems(data as ShellDataByKind["moodboard"]));
      const parts = [
        counts.images && plural(counts.images, "image"),
        counts.drawings && plural(counts.drawings, "drawing"),
        counts.components && plural(counts.components, "component"),
        counts.notes && plural(counts.notes, "note"),
        counts.colours && plural(counts.colours, "colour"),
      ].filter(Boolean);
      return parts.length ? parts.slice(0, 3).join(" · ") : "Empty canvas";
    }
    case "chart": {
      const chart = data as ShellDataByKind["chart"];
      const type = CHART_TYPE_META[chart.type].label;
      if (chart.type === "timeline") {
        const events = [...chart.events].sort((a, b) => a.date.localeCompare(b.date));
        const first = events[0];
        const last = events.at(-1);
        if (!first || !last) return `${type} · No events yet`;
        const span = first === last ? shortDate(first.date) : `${shortDate(first.date)} – ${shortDate(last.date)}`;
        return `${type} · ${plural(events.length, "event")} · ${span}`;
      }
      if (chart.type === "flowchart") return `${type} · ${plural(chart.nodes.length, "step")}`;
      const ideas = chart.branches.reduce((sum, branch) => sum + branch.children.length, 0);
      return `${type} · ${plural(chart.branches.length, "branch", "branches")} · ${plural(ideas, "idea")}`;
    }
    case "chat":
      return plural((data as ShellDataByKind["chat"]).messages.length, "message");
    case "dashboard":
    case "article":
      return appDetail(data as ShellDataByKind["dashboard"]);
    case "generator": {
      const { mode, variations, chosen } = data as ShellDataByKind["generator"];
      const what = mode === "image" ? "Image" : "Text";
      if (!variations.length) return `${what} · Not generated yet`;
      const picked = variations.findIndex((v) => v.id === chosen);
      return picked >= 0 ? `${what} · Variation ${picked + 1} chosen` : `${what} · ${plural(variations.length, "variation")}`;
    }
  }
}
