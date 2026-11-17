/**
 * Notes are plain text, a line at a time. A line's opening marks its style,
 * the way Apple Notes offers them, so the model (and anything else) can write
 * notes as text and they still draw as styled lines:
 *
 *   # Title            ## Heading          ### Subheading
 *   - Bulleted         – Dashed            1. Numbered
 *   [ ] To do          [x] Done            `Monostyled`
 *   Body text, with **bold**, *italic*, __underline__ and ~~strikethrough~~.
 *
 * Two spaces in front indent a list line one level.
 */

export const NOTE_STYLES = ["title", "heading", "subheading", "body", "mono", "bullet", "dash", "number", "check"] as const;
export type NoteStyle = (typeof NOTE_STYLES)[number];

export type NoteLine = { style: NoteStyle; indent: number; checked: boolean; text: string };

export const LIST_STYLES: NoteStyle[] = ["bullet", "dash", "number", "check"];
export const isList = (style: NoteStyle) => LIST_STYLES.includes(style);
export const MAX_INDENT = 4;

export function parseLine(raw: string): NoteLine {
  const lead = raw.match(/^ */)![0].length;
  const indent = Math.min(MAX_INDENT, Math.floor(lead / 2));
  const rest = raw.slice(lead);
  let m: RegExpMatchArray | null;
  if ((m = rest.match(/^### (.*)$/))) return { style: "subheading", indent: 0, checked: false, text: m[1]! };
  if ((m = rest.match(/^## (.*)$/))) return { style: "heading", indent: 0, checked: false, text: m[1]! };
  if ((m = rest.match(/^# (.*)$/))) return { style: "title", indent: 0, checked: false, text: m[1]! };
  if ((m = rest.match(/^(?:[-*] )?\[([ xX])\] ?(.*)$/))) return { style: "check", indent, checked: m[1] !== " ", text: m[2]! };
  if ((m = rest.match(/^[-*•] (.*)$/))) return { style: "bullet", indent, checked: false, text: m[1]! };
  if ((m = rest.match(/^– (.*)$/))) return { style: "dash", indent, checked: false, text: m[1]! };
  if ((m = rest.match(/^\d+[.)] (.*)$/))) return { style: "number", indent, checked: false, text: m[1]! };
  if ((m = rest.match(/^`(.+)`$/))) return { style: "mono", indent: 0, checked: false, text: m[1]! };
  return { style: "body", indent: 0, checked: false, text: rest };
}

const PREFIX: Record<NoteStyle, (line: NoteLine) => string> = {
  title: () => "# ",
  heading: () => "## ",
  subheading: () => "### ",
  body: () => "",
  mono: () => "",
  bullet: () => "- ",
  dash: () => "– ",
  number: () => "1. ",
  check: (line) => (line.checked ? "[x] " : "[ ] "),
};

export function writeLine(line: NoteLine): string {
  if (line.style === "mono") return line.text ? `\`${line.text}\`` : "";
  const indent = isList(line.style) ? "  ".repeat(line.indent) : "";
  return `${indent}${PREFIX[line.style](line)}${line.text}`;
}

export const parseNotes = (body: string) => body.split("\n").map(parseLine);
export const writeNotes = (lines: NoteLine[]) => lines.map(writeLine).join("\n");

/** The number a numbered line shows: its place in the run of numbered lines at its level. */
export function numberAt(lines: NoteLine[], index: number) {
  const line = lines[index]!;
  let n = 1;
  for (let i = index - 1; i >= 0; i--) {
    const other = lines[i]!;
    if (other.style === "number" && other.indent === line.indent) n += 1;
    else if (isList(other.style) && other.indent > line.indent) continue;
    else break;
  }
  return n;
}

/** A line set to a style; setting the style it already has goes back to body text. */
export function withStyle(line: NoteLine, style: NoteStyle): NoteLine {
  const next = line.style === style && style !== "body" ? "body" : style;
  return { ...line, style: next, indent: isList(next) ? line.indent : 0, checked: next === "check" ? line.checked : false };
}

/* ── Inline: bold, italic, underline, strikethrough ─────────────────────── */

export const INLINE = {
  bold: "**",
  italic: "*",
  underline: "__",
  strike: "~~",
} as const;
export type InlineStyle = keyof typeof INLINE;

export type InlineRun = { text: string; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean };

const TOKEN = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*\s][^*]*\*)/g;

/** A line's words as runs, each with the styles its markers give it (one level; markers don't nest). */
export function inlineRuns(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  let at = 0;
  for (const match of text.matchAll(TOKEN)) {
    const token = match[0];
    if (match.index! > at) runs.push({ text: text.slice(at, match.index) });
    if (token.startsWith("**")) runs.push({ text: token.slice(2, -2), bold: true });
    else if (token.startsWith("__")) runs.push({ text: token.slice(2, -2), underline: true });
    else if (token.startsWith("~~")) runs.push({ text: token.slice(2, -2), strike: true });
    else runs.push({ text: token.slice(1, -1), italic: true });
    at = match.index! + token.length;
  }
  if (at < text.length) runs.push({ text: text.slice(at) });
  return runs;
}

/**
 * Bold (or another style) on part of a line: the selection wrapped in its
 * markers, or unwrapped if it already is. With nothing selected, the whole
 * line. Returns the new text and where the selection is now.
 */
export function toggleInline(text: string, start: number, end: number, style: InlineStyle) {
  const mark = INLINE[style];
  if (start === end) [start, end] = [0, text.length];
  const inside = text.slice(start, end);
  // Already wrapped, inside or just outside the selection: take the markers off.
  if (inside.length > mark.length * 2 && inside.startsWith(mark) && inside.endsWith(mark)) {
    const plain = inside.slice(mark.length, -mark.length);
    return { text: text.slice(0, start) + plain + text.slice(end), start, end: start + plain.length };
  }
  if (text.slice(start - mark.length, start) === mark && text.slice(end, end + mark.length) === mark) {
    return { text: text.slice(0, start - mark.length) + inside + text.slice(end + mark.length), start: start - mark.length, end: end - mark.length };
  }
  return { text: text.slice(0, start) + mark + inside + mark + text.slice(end), start: start + mark.length, end: end + mark.length };
}
