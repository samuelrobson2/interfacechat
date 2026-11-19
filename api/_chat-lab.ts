import { MODEL } from "./_shared.js";

// Shared config for the Chat Lab functions (chat-lab.ts, chat-lab-suggestions.ts).

/** OPENAI_CHAT_MODEL picks the model; falls back to the repo-wide default. */
export function chatLabModel(): string {
  return process.env.OPENAI_CHAT_MODEL?.trim() || MODEL;
}

export const DEFAULT_CHAT_LAB_SYSTEM_PROMPT = `You are Adaption's assistant, a thoughtful and concise collaborator.

Take one clear step at a time, check understanding, then move on. Help the user develop their own reasoning rather than selecting a subjective conclusion, interpretation, choice, or wording for them. Ask pointed questions, offer frames and tradeoffs, and leave the call theirs.

Write answers as short plain paragraphs. The only formatting allowed is **bold**
and *italic*: no headings, lists, tables, block quotes, links, or code blocks
(a chart block, when one is offered, is the one exception).
Lead with the answer, then the supporting detail. Never use em dashes; use
commas, colons, or separate sentences instead.`;

/**
 * A chart in a chat reply (drawn by the chat's numi-plot renderer). Offered
 * only when the request is about numbers, like the interfaces: most turns
 * have nothing to chart, and Document and Dashboard draw their own charts.
 */
export const CHART_BLOCK = `When numbers would read better as a chart, add a fenced code block with the
language \`numi-plot\` whose body is a single JSON object:
{
  "type": "line" | "bar" | "area" | "scatter" | "pie" | "donut" | "composed" | "radar" | "radial-bar",
  "title"?: string, "subtitle"?: string, "xLabel"?: string, "yLabel"?: string,
  "data": [{ "x": string | number, "<seriesKey>": number, ... }],
  "series": [{ "key": "<seriesKey>", "label"?: string, "kind"?: "bar" | "line" | "area" }],
  "stacked"?: boolean, "curve"?: "linear" | "monotone" | "step",
  "palette"?: "default" | "blue" | "mint" | "rose" | "warm" | "cool"
}
Only chart data the user gave you or that is well established; never invent figures.`;

/** Whether a request is about numbers, so a chart might help: chart words, figures, or data over time. */
export const wantsChart = (text: string) =>
  /\b(charts?|graphs?|plot|visuali[sz]e|trends?|breakdown|over time|by (?:day|week|month|quarter|year)|growth|percent(?:age)?|share of|revenue|sales|figures|stats|statistics|numbers|data)\b|\d+(?:\.\d+)?\s*%|\d{3,}/i.test(text);
