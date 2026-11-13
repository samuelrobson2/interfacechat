import { SHELL_META, type DocBlank } from "@/features/interface-shells";
import type { ToolbarKind } from "./generate-tools";
import { paragraphTag } from "./paragraph-tags";
import { tableForModel, type ToolDiff, type ToolTable } from "./tool-table";
import { describeUse, normalizeTool, type GeneratedTool, type ToolScores, type ToolSpec, type ToolValue } from "./tool-spec";

/**
 * The model behind the toolbar. Two calls:
 * - `streamToolDiff`: changes to the toolbar's table for the interface as it is now.
 * - `runTool`: carry one out, as edits to the interface's data and/or a reply.
 */

const IMAGE = "[image]";

/** The data as the model reads it: pictures (data URLs) become "[image]" so they don't swamp it. */
export function snapshot(data: unknown): unknown {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === "string" && (value.startsWith("data:") || value.length > 4000 && !/\s/.test(value.slice(0, 200)))
        ? IMAGE
        : value,
    ),
  );
}

/** A tool as the model reads it: `apply` is a function, and doesn't travel. */
function specOf(tool: GeneratedTool<unknown> | ToolSpec): ToolSpec {
  const copy: Record<string, unknown> = { ...tool };
  delete copy.apply;
  return copy as ToolSpec;
}

const brief = (value: unknown) => {
  if (value === undefined) return "(none)";
  const text = typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value);
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
};

/**
 * What changed between two versions of the data, as short lines the model
 * can re-judge the table by ("/items/2/owner: \"Priya\" → (none)"), at most
 * `limit` of them. Lists of the same length compare item by item; others say
 * how many items there were.
 */
export function describeChanges(before: unknown, after: unknown, limit = 24): string[] {
  const out: string[] = [];
  const walk = (a: unknown, b: unknown, path: string) => {
    if (out.length >= limit || JSON.stringify(a) === JSON.stringify(b)) return;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        out.push(`${path || "/"}: ${a.length} → ${b.length} items`);
        // Still look at the items both have, so an edit beside an addition shows.
        for (let index = 0; index < Math.min(a.length, b.length); index++) walk(a[index], b[index], `${path}/${index}`);
        return;
      }
      a.forEach((item, index) => walk(item, b[index], `${path}/${index}`));
      return;
    }
    if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
      const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
      for (const key of keys) walk((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}/${key}`);
      return;
    }
    out.push(`${path || "/"}: ${brief(a)} → ${brief(b)}`);
  };
  walk(snapshot(before), snapshot(after), "");
  return out;
}

export type ToolStreamEvents = {
  onDiff: (diff: ToolDiff) => void;
  /** Time to the first tool, and in all, for the page's note. */
  onDone?: (timing: { ms: number; firstMs: number | null }) => void;
};

/**
 * Ask for changes to the toolbar's table, and hand each one over as it
 * streams in: a drop, a score, or a tool (held to the contract here too).
 */
export async function streamToolDiff<D>(
  kind: ToolbarKind,
  data: D,
  {
    table,
    selection,
    avoid,
    changes,
    count,
    signal,
  }: {
    table: ToolTable<D>;
    selection: string | null;
    avoid?: string[];
    /** What changed in the data since the table was last brought up to date (`describeChanges`). */
    changes?: string[];
    count: number;
    signal?: AbortSignal;
  },
  { onDiff, onDone }: ToolStreamEvents,
): Promise<void> {
  const response = await fetch("/api/toolbar-tools", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind,
      label: SHELL_META[kind].label,
      description: SHELL_META[kind].description,
      data: snapshot(data),
      selection,
      table: tableForModel(table),
      avoid,
      changes,
      count,
    }),
    signal,
  });
  if (!response.ok || !response.body) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error ?? `${response.status} ${response.statusText}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let firstMs: number | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let end: number;
    while ((end = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, end).trim();
      buffer = buffer.slice(end + 1);
      if (!line) continue;
      const event = JSON.parse(line) as {
        add?: unknown;
        ms?: number;
        score?: { id: string } & Partial<ToolScores>;
        drop?: string[];
        done?: { ms: number };
        error?: string;
      };
      if (event.error) throw new Error(event.error);
      if (event.drop) onDiff({ drop: event.drop });
      if (event.score) onDiff({ scores: [event.score] });
      if (event.add) {
        const tool = normalizeTool(event.add);
        if (tool) {
          firstMs ??= event.ms ?? null;
          onDiff({ add: [tool] });
        }
      }
      if (event.done) onDone?.({ ms: event.done.ms, firstMs });
    }
  }
}

export type DataOperation = { op: "add" | "replace" | "remove"; path: string; value?: unknown };
export type RunResult<D> = { data: D | null; reply: string | null; summary: string };

/**
 * Carry out a tool on any interface but Document: the model streams edits
 * to its data, and each is applied as it arrives (`onData`), so the person
 * watches the cells and items change. An edit that doesn't fit is skipped,
 * not the whole run; `skipped` says how many.
 */
export async function runTool<D>(
  kind: ToolbarKind,
  data: D,
  tool: GeneratedTool<D>,
  value: ToolValue,
  selection: string | null,
  onData?: (data: D) => void,
): Promise<RunResult<D> & { skipped: number }> {
  const spec = specOf(tool as GeneratedTool<unknown>);
  const response = await fetch("/api/toolbar-run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind,
      label: SHELL_META[kind].label,
      data: snapshot(data),
      selection,
      tool: spec,
      request: describeUse(spec, value),
    }),
  });
  if (!response.ok || !response.body) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error ?? `${response.status} ${response.statusText}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let current = data;
  let applied = 0;
  let skipped = 0;
  // Set inside the read loop; typed so TypeScript doesn't take it as always null.
  let done = null as { summary: string; reply: string | null } | null;
  for (;;) {
    const { done: ended, value: chunk } = await reader.read();
    if (ended) break;
    buffer += decoder.decode(chunk, { stream: true });
    let end: number;
    while ((end = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, end).trim();
      buffer = buffer.slice(end + 1);
      if (!line) continue;
      const event = JSON.parse(line) as { operation?: DataOperation; done?: typeof done; error?: string };
      if (event.error) throw new Error(event.error);
      if (event.operation) {
        try {
          current = applyOperations(current, [event.operation]);
          applied += 1;
          onData?.(current);
        } catch {
          skipped += 1;
        }
      }
      if (event.done) done = event.done;
    }
  }
  if (!done) throw new Error("The model stopped before it finished");
  return { data: applied ? current : null, reply: done.reply, summary: done.summary, skipped };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const shapeOf = (value: unknown) => (Array.isArray(value) ? "list" : value === null ? "null" : typeof value);

/** A list item named in a path: by its id when the items have ids ("r2"), else by position ("2"). */
function indexIn(list: unknown[], key: string) {
  if (/^\d+$/.test(key)) return Number(key);
  const byId = list.findIndex((item) => isRecord(item) && item.id === key);
  return byId >= 0 ? byId : Number.NaN;
}

/**
 * Apply the model's edits to a copy of the data, after JSON Patch. Throws when
 * a path leads nowhere, an edit would overwrite a picture, or the result
 * changes the shape of a top-level field (a list becoming text), so a bad
 * edit never reaches the interface.
 */
export function applyOperations<D>(data: D, operations: DataOperation[]): D {
  const draft = structuredClone(data) as unknown;
  for (const { op, path, value } of operations) {
    if (!path.startsWith("/")) throw new Error(`"${path}" is not a path`);
    if (op !== "remove" && value === undefined) throw new Error(`${op} at ${path} has no value`);
    if (value === IMAGE) throw new Error(`${path} would lose its picture`);
    const keys = path.split("/").slice(1).map((key) => key.replace(/~1/g, "/").replace(/~0/g, "~"));
    const last = keys.pop()!;
    let parent: unknown = draft;
    let holder: unknown = null;
    for (const [index, key] of keys.entries()) {
      holder = parent;
      parent = Array.isArray(parent) ? parent[indexIn(parent, key)] : isRecord(parent) ? parent[key] : undefined;
      // Adding to the end of a text field (/body/-) appends to it, as a new paragraph.
      if (typeof parent === "string" && index === keys.length - 1 && last === "-" && op === "add" && typeof value === "string") {
        const text = `${parent.trimEnd()}\n\n${value.trim()}`;
        if (Array.isArray(holder)) holder[Number(key)] = text;
        else (holder as Record<string, unknown>)[key] = text;
        parent = undefined;
        break;
      }
      if (typeof parent !== "object" || parent === null) throw new Error(`Nothing at ${path}`);
    }
    if (parent === undefined) continue;
    if (Array.isArray(parent)) {
      const index = last === "-" ? parent.length : indexIn(parent, last);
      const limit = op === "add" ? parent.length : parent.length - 1;
      if (!Number.isInteger(index) || index < 0 || index > limit) throw new Error(`No position ${last} at ${path}`);
      if (op === "add") parent.splice(index, 0, value);
      else if (op === "replace") parent[index] = value;
      else parent.splice(index, 1);
    } else if (isRecord(parent)) {
      if (op === "remove") delete parent[last];
      else parent[last] = value;
    }
  }
  if (isRecord(data) && isRecord(draft)) {
    for (const [key, before] of Object.entries(data)) {
      if (before === undefined || before === null) continue;
      if (!(key in draft)) throw new Error(`The edit removed ${key}`);
      if (shapeOf(draft[key]) !== shapeOf(before)) throw new Error(`The edit turned ${key} into a ${shapeOf(draft[key])}`);
    }
  }
  return draft as D;
}

/* ── Rewriting one long text field, streamed ──────────────────────────── */

/** A Document's body, paragraph by paragraph: what `/api/toolbar-rewrite` numbers and edits. */
export const paragraphsOf = (text: string) => text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

const EDIT = /^@(replace|after|before|delete)\s+(\d+)(?:#([a-z0-9]{3}))?\s*$/;
const BLANK_TAG = /<blank>\s*(\{[\s\S]*?\})\s*<\/blank>/g;

/**
 * The model's <blank>{…}</blank> tags in `text`, as `{{key}}` tokens with
 * their blanks. A tag that doesn't parse is left out. While streaming, a tag
 * still being written is held back.
 */
export function readBlanks(text: string, taken: Record<string, unknown>, final: boolean) {
  const blanks: Record<string, DocBlank> = {};
  let out = text.replace(BLANK_TAG, (_, json: string) => {
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(json);
    } catch {
      return "";
    }
    const options = Array.isArray(raw.options) ? raw.options.filter((o): o is string => typeof o === "string").slice(0, 6) : [];
    const ask = typeof raw.ask === "string" ? raw.ask : "";
    if (!ask || options.length < 2) return "";
    let key = String(raw.key ?? "blank").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "blank";
    // A key the document already uses for another question gets a number.
    const clash = (candidate: string) => candidate in blanks || (candidate in taken && (taken[candidate] as DocBlank)?.ask !== ask);
    for (let n = 2; clash(key); n++) key = `${String(raw.key ?? "blank").toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}-${n}`;
    blanks[key] = {
      ask,
      kind: raw.kind === "unsure" || raw.kind === "yours" ? raw.kind : "only_you",
      options,
      placeholder: typeof raw.placeholder === "string" && raw.placeholder.trim() ? raw.placeholder.trim() : "choose",
      ...(raw.wait === true ? { wait: true } : {}),
    };
    return `{{${key}}}`;
  });
  if (!final) out = out.replace(/<blank>[\s\S]*$/, "").replace(/<(b(l(a(n(k>?)?)?)?)?)?$/, "");
  return { text: out, blanks };
}

/**
 * Read what `/api/toolbar-rewrite` has sent so far: its summary, any reply,
 * and the text with its paragraph edits applied. Paragraphs no edit names
 * stay as they are. While it's still streaming (`final` false), a
 * half-written edit line is held back, and the edit being written shows as
 * far as it has got.
 */
export function readRewrite(raw: string, paragraphs: string[], final: boolean, existing: Record<string, unknown> = {}) {
  const split = raw.match(/^([\s\S]*?)\n---\n?([\s\S]*)$/);
  const head = split ? split[1]! : raw;
  const summary = head.match(/^SUMMARY:\s*(.*)$/m)?.[1]?.trim() ?? "";
  const reply = head.match(/^REPLY:\s*([\s\S]*?)$/m)?.[1]?.trim() || null;
  if (!split) return { summary, reply, text: null as string | null, blanks: {} as Record<string, DocBlank>, misplaced: 0 };

  let lines = split[2]!.split("\n");
  if (!final && lines.length && /^@\w*\s*\d*#?[a-z0-9]{0,2}$/.test(lines.at(-1)!.trim()) && !EDIT.test(lines.at(-1)!.trim())) {
    lines = lines.slice(0, -1);
  }
  const replaced = new Map<number, string | null>();
  const blanks: Record<string, DocBlank> = {};
  const after = new Map<number, string[]>();
  type Edit = { op: string; index: number; text: string[] };
  let edit = null as Edit | null;
  const close = () => {
    if (!edit) return;
    const read = readBlanks(edit.text.join("\n").trim(), { ...existing, ...blanks }, final || edit !== lastEdit);
    Object.assign(blanks, read.blanks);
    const text = read.text.trim();
    if (edit.op === "drop") {
      edit = null;
      return;
    }
    if (edit.op === "delete") replaced.set(edit.index, null);
    else if (edit.op === "replace") replaced.set(edit.index, text || (final ? null : paragraphs[edit.index] ?? ""));
    else if (text) {
      const at = edit.op === "before" ? -1 : edit.index;
      after.set(at, [...(after.get(at) ?? []), text]);
    }
    edit = null;
  };
  // The last edit is the one still streaming; earlier ones are complete.
  let lastEdit = null as Edit | null;
  const edits: Edit[] = [];
  const tags = paragraphs.map(paragraphTag);
  // Where an edit lands: its number, if its tag agrees; else the paragraph its tag names; else nowhere.
  const resolve = (index: number, tag: string | undefined) => {
    if (!tag || tags[index] === tag) return index;
    const found = tags.indexOf(tag);
    return found >= 0 ? found : null;
  };
  let misplaced = 0;
  for (const line of lines) {
    const match = line.trim().match(EDIT);
    if (match) {
      const index = match[1] === "before" ? 0 : resolve(Number(match[2]), match[3]);
      if (index === null) {
        misplaced += 1;
        // Its text is read into a throwaway edit, so it lands nowhere.
        edits.push({ op: "drop", index: -1, text: [] });
      } else edits.push({ op: match[1]!, index, text: [] });
    } else edits.at(-1)?.text.push(line);
  }
  lastEdit = edits.at(-1) ?? null;
  for (const next of edits) {
    edit = next;
    close();
  }

  const out: string[] = [...(after.get(-1) ?? [])];
  paragraphs.forEach((paragraph, index) => {
    const next = replaced.has(index) ? replaced.get(index) : paragraph;
    if (next) out.push(next);
    out.push(...(after.get(index) ?? []));
  });
  // Edits past the end (an empty document's "@replace 0") are writing that goes at the end.
  const past = (index: number) => index >= paragraphs.length;
  const beyond = [...new Set([...replaced.keys(), ...after.keys()])].filter(past).sort((a, b) => a - b);
  for (const index of beyond) {
    const text = replaced.get(index);
    if (text) out.push(text);
    out.push(...(after.get(index) ?? []));
  }
  return { summary, reply, text: out.join("\n\n"), blanks, misplaced };
}

/**
 * Carry out a tool on a Document as edits to the paragraphs it changes, handing
 * over the body as it streams (`onText`) so the person watches it change.
 */
export async function rewriteDocument(
  data: { title?: string; body: string; blanks?: Record<string, DocBlank> },
  tool: GeneratedTool<unknown> | ToolSpec,
  value: ToolValue,
  selection: string | null,
  onText: (body: string, blanks: Record<string, DocBlank>) => void,
  signal?: AbortSignal,
  /** In place of the tool's own words, when there's more to say (a blank just filled). */
  request?: string,
): Promise<{ text: string | null; reply: string | null; summary: string; blanks: Record<string, DocBlank> }> {
  const paragraphs = paragraphsOf(data.body);
  const existing = data.blanks ?? {};
  const spec = specOf(tool as GeneratedTool<unknown>);
  const asked = request ?? describeUse(spec, value);
  const response = await fetch("/api/toolbar-rewrite", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind: "document",
      label: SHELL_META.document.label,
      title: data.title,
      paragraphs,
      selection,
      tool: spec,
      request: asked,
      blanks: Object.fromEntries(Object.entries(existing).map(([key, blank]) => [key, { ask: blank.ask, value: blank.value }])),
    }),
    signal,
  });
  if (!response.ok || !response.body) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error ?? `${response.status} ${response.statusText}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  let shown = "";
  for (;;) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    raw += decoder.decode(chunk, { stream: true });
    const { text, blanks } = readRewrite(raw, paragraphs, false, existing);
    if (text !== null && text !== shown) onText((shown = text), blanks);
  }
  const result = readRewrite(raw, paragraphs, true, existing);
  if (!result.summary && result.text === null && !result.reply) throw new Error("The model sent nothing back");
  // New blanks remember what was being done, so filling a waiting one can carry on with it.
  const blanks = Object.fromEntries(Object.entries(result.blanks).map(([key, blank]) => [key, { ...blank, request: asked }]));
  return { ...result, blanks, summary: result.summary || asked };
}

/**
 * What filling blanks asks the rewrite for: finish what was being done when
 * they were left, using the answers, and rewrite whatever depends on them.
 * The model doesn't reliably say which blanks it stopped at, so this never
 * relies on it: an opening that stopped is finished, a complete document only
 * updated. Either way the blanks stay blanks.
 */
export function blankFollowUp(blanks: Record<string, DocBlank>, keys: string[], body: string) {
  const answered = keys
    .filter((key) => blanks[key]?.value)
    .map((key) => `{{${key}}} ("${blanks[key]!.ask}") = "${blanks[key]!.value}"`)
    .join(", ");
  const paragraphs = paragraphsOf(body);
  let holding = -1;
  paragraphs.forEach((paragraph, index) => {
    if (keys.some((key) => paragraph.includes(`{{${key}}}`))) holding = index;
  });
  const request = keys.map((key) => blanks[key]?.request).find(Boolean);
  return [
    `The person has answered: ${answered}.`,
    request
      ? `These were left while doing "${request}". If the document doesn't yet do all of that, write the rest now, in full, using their answers: add it with @after ${Math.max(holding, paragraphs.length - 1, 0)}.`
      : "",
    `Rewrite anything already written that depends on the answers (amounts, counts, plans), and leave the rest.`,
    `Keep every paragraph with a blank in it exactly as it is: the {{key}} slots stay, and show their answers. Wherever you use an answer later, write its {{key}}, not the answer itself. You may leave new blanks further on.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * The blanks to answer before following up on `key`: every other empty blank
 * left by the same run. The model asks related things together, so the
 * writing carries on once, when the last of them is filled.
 */
export function blanksStillOpen(blanks: Record<string, DocBlank>, key: string) {
  const request = blanks[key]?.request;
  return Object.entries(blanks)
    .filter(([other, blank]) => other !== key && blank.request === request && blank.value === undefined)
    .map(([other]) => other);
}
