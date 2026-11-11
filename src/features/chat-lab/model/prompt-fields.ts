import {
  CHAT_FORMAT_META,
  CHAT_PERSONA_META,
  chatFormatFor,
  chatPersonaFor,
  EMPTY_SHELL_DATA,
  type DocumentShellData,
  type SearchShellData,
  type ShellDataByKind,
  type ChatShellKind,
  type TableColumn,
  type TableShellData,
} from "@/features/interface-shells";

/**
 * The prompt on the chat home is the source of truth; the card is a structured
 * view of it. Each field is read from a span of the prompt, and editing a field
 * rewrites that span, so the two never drift apart.
 */

export type Span = { start: number; end: number };

export type PromptSpans = {
  /** The topic: a document's or table's title, a search's query. Always present, maybe empty. */
  title: Span;
  length?: Span;
  context?: Span;
  sources?: Span;
  columns?: Span;
  /** "10 rows" */
  rowCount?: Span;
  filters: { value: string; span: Span }[];
};

export type ParsedPrompt<K extends ChatShellKind = ChatShellKind> = {
  kind: K;
  data: ShellDataByKind[K];
  spans: PromptSpans;
};

/** What the composer is seeded with when an interface is picked on an empty draft. */
export const PROMPT_SEED: Record<ChatShellKind, string> = {
  chat: "",
  document: "Write a paper on ",
  search: "Search for ",
  table: "Make a table of ",
  schedule: "Build a schedule for ",
  tracker: "Make a checklist for ",
  calendar: "Put on a calendar: ",
  reader: "Explain this document: ",
  map: "Show me places near ",
  moodboard: "Make a moodboard for ",
  chart: "Brainstorm ",
  guide: "Give me a recipe for ",
};

const formatLabel = (format: keyof typeof CHAT_FORMAT_META | null) => (format ? CHAT_FORMAT_META[format].label : "");
const personaLabel = (persona: keyof typeof CHAT_PERSONA_META | null) => (persona ? CHAT_PERSONA_META[persona].label : "");

/** Verbs that name an interface's own form; only these are rewritten when switching. */
const KIND_VERB =
  /^(write|draft|compose|search(?: the web)?(?: for)?|find(?: me)?|look up|look for|make|build|create|tabulate)$/i;

const FRAME = new RegExp(
  [
    String.raw`^\s*(?:(?:hey|hi)[,!]?\s+)?`,
    String.raw`(?:(?:can|could|would) you\s+|please\s+|help me(?: to)?\s+|i (?:want|need|would like|'d like) to\s+)*`,
    String.raw`(?:(write|draft|compose|create|make|build|generate|prepare|plan|search(?: the web)?(?: for)?|find(?: me)?|look up|look for|research|tabulate|turn .+? into)\s+)?`,
    String.raw`(?:me\s+)?(?:(?:a|an|the|some)\s+)?`,
    String.raw`(?:(?:paper|essay|report|memo|article|brief|document|doc|table|spreadsheet|grid)s?\s+)?`,
    String.raw`(?:(?:on|about|for|of|regarding|comparing)\s+)?`,
    String.raw`(?:(?:a|an|the)\s+)?`,
  ].join(""),
  "i",
);

const DOMAIN = String.raw`(?:[a-z0-9-]+\.)+[a-z]{2,}`;
const LIST_JOIN = String.raw`(?:,\s*(?:and\s+|or\s+)?|\s+(?:and|or)\s+)`;

type Clause = {
  field: Exclude<keyof PromptSpans, "title" | "filters"> | "filter" | "each";
  span: Span;
  value: string;
};

const NUMBER_WORDS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  ten: "10",
};

function findAll(
  prompt: string,
  pattern: RegExp,
  field: Clause["field"],
  value: (m: RegExpExecArray) => string,
) {
  const clauses: Clause[] = [];
  const re = new RegExp(
    pattern.source,
    pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
  );
  for (let m = re.exec(prompt); m; m = re.exec(prompt)) {
    clauses.push({
      field,
      span: { start: m.index, end: m.index + m[0].length },
      value: value(m),
    });
    if (m[0].length === 0) re.lastIndex += 1;
  }
  return clauses;
}

function clausesOf(kind: ChatShellKind, prompt: string): Clause[] {
  const clauses: Clause[] = [
    ...findAll(
      prompt,
      /,?\s*(?:\b(?:about|around|roughly)\s+|~\s*|\b)(\d[\d,]*|one|two|three|four|five|ten)\s*(words|pages?)\b/i,
      "length",
      (m) =>
        `~${NUMBER_WORDS[m[1]!.toLowerCase()] ?? m[1]} ${m[2]!.toLowerCase()}`,
    ),
    ...findAll(
      prompt,
      /,?\s*\b(?:covering|including|focus(?:ing)? on)\s+([^.;]+)/i,
      "context",
      (m) => m[1]!.trim(),
    ),
    ...findAll(
      prompt,
      new RegExp(
        String.raw`\s+(?:on|from|at)\s+(${DOMAIN}(?:${LIST_JOIN}${DOMAIN})*)`,
        "i",
      ),
      "sources",
      (m) => m[1]!,
    ),
    ...findAll(
      prompt,
      /,?\s*\b(?:since|after|before|from)\s+\d{4}\b/i,
      "filter",
      (m) => m[0].replace(/^,?\s*/, ""),
    ),
    ...findAll(prompt, /,?\s*\bpeer[- ]reviewed\b/i, "filter", (m) =>
      m[0].replace(/^,?\s*/, ""),
    ),
    ...findAll(
      prompt,
      /,?\s+in\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/,
      "filter",
      (m) => m[0].replace(/^,?\s*/, ""),
    ),
  ];
  if (kind === "table") {
    clauses.push(
      ...findAll(
        prompt,
        /\s+with\s+(?:columns?\s+(?:for\s+)?)?(.+?)(?=\s+(?:for|per)\s+(?:each|every)\b|,?\s*\b\d+\s+rows\b|[.;]|$)/i,
        "columns",
        (m) => m[1]!,
      ),
      ...findAll(
        prompt,
        /\s+(?:for|per)\s+(?:each|every)\s+([a-z][\w-]*)/i,
        "each",
        (m) => m[1]!,
      ),
      ...findAll(prompt, /,?\s*\b(\d+)\s+rows\b/i, "rowCount", (m) => m[1]!),
    );
  }
  // Earlier, longer clauses win; drop anything nested inside one already taken.
  clauses.sort(
    (a, b) => a.span.start - b.span.start || b.span.end - a.span.end,
  );
  const kept: Clause[] = [];
  for (const clause of clauses) {
    const last = kept[kept.length - 1];
    if (last && clause.span.start < last.span.end) continue;
    kept.push(clause);
  }
  // Context runs up to the next clause, not to the end of the sentence.
  for (let i = 0; i < kept.length; i += 1) {
    const clause = kept[i]!;
    const next = kept[i + 1];
    if (
      clause.field === "context" &&
      next &&
      next.span.start < clause.span.end
    ) {
      clause.span = { ...clause.span, end: next.span.start };
      clause.value = prompt
        .slice(clause.span.start, clause.span.end)
        .replace(/^,?\s*\S+(?:\s+on)?\s+/, "")
        .trim();
    }
  }
  return kept;
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

function splitList(text: string) {
  return text
    .split(new RegExp(LIST_JOIN, "i"))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function frameOf(prompt: string) {
  const match = prompt.match(FRAME);
  return { end: match?.[0].length ?? 0, verb: match?.[1] ?? null };
}

/** Read every field the card shows from the prompt, with where each one came from. */
export function parsePrompt<K extends ChatShellKind>(
  kind: K,
  prompt: string,
): ParsedPrompt<K> {
  const clauses = clausesOf(kind, prompt);
  const frame = frameOf(prompt);
  const topicStart = Math.min(frame.end, prompt.length);
  const nextClause = clauses.find((clause) => clause.span.start >= topicStart);
  let topicEnd = nextClause ? nextClause.span.start : prompt.length;
  while (topicEnd > topicStart && /[\s.,;!?]/.test(prompt[topicEnd - 1]!))
    topicEnd -= 1;
  const topic = prompt.slice(topicStart, topicEnd);

  const spans: PromptSpans = {
    title: { start: topicStart, end: topicEnd },
    filters: [],
  };
  const take = (field: Clause["field"]) =>
    clauses.find((clause) => clause.field === field);
  for (const clause of clauses) {
    if (clause.field === "filter")
      spans.filters.push({ value: clause.value, span: clause.span });
    else if (clause.field !== "each") spans[clause.field] = clause.span;
  }

  let data: ShellDataByKind[ChatShellKind];
  if (kind === "document") {
    const doc: DocumentShellData = {
      ...EMPTY_SHELL_DATA.document,
      title: capitalize(topic),
      body: take("context")?.value ?? "",
      length: take("length")?.value,
    };
    data = doc;
  } else if (kind === "search") {
    const search: SearchShellData = {
      ...EMPTY_SHELL_DATA.search,
      query: topic,
      filters: spans.filters.map((filter) => filter.value),
      sources: take("sources") ? splitList(take("sources")!.value) : undefined,
    };
    data = search;
  } else if (kind === "chat") {
    // A chat card holds the message itself, not a topic pulled out of it.
    data = {
      ...EMPTY_SHELL_DATA.chat,
      title: prompt.trim(),
      // Suggested from the query; both stay free text the person can change.
      format: formatLabel(chatFormatFor(prompt).format),
      persona: personaLabel(chatPersonaFor(prompt)),
    };
  } else if (kind !== "table") {
    // The other interfaces fill their title (a map, its query) from the topic;
    // everything else is set on the card.
    const key = kind === "map" ? "query" : "title";
    data = { ...EMPTY_SHELL_DATA[kind], [key]: capitalize(topic) } as ShellDataByKind[ChatShellKind];
  } else {
    const each = take("each")?.value;
    const span = topic.match(
      /\b(\d+)-(day|week|scene|episode|shot|location)\b/i,
    );
    const leadLabel = each ?? span?.[2];
    const labels = splitList(take("columns")?.value ?? "");
    if (
      leadLabel &&
      !labels.some((label) => label.toLowerCase() === leadLabel.toLowerCase())
    ) {
      labels.unshift(leadLabel);
    }
    const columns: TableColumn[] = labels.map((label, index) => ({
      id: `col-${index}`,
      label: capitalize(label),
      type: /image|photo|picture|reference|thumbnail/i.test(label)
        ? "image"
        : "text",
    }));
    const rowCount =
      take("rowCount")?.value ?? (span && !each ? span[1] : undefined);
    const table: TableShellData = {
      ...EMPTY_SHELL_DATA.table,
      title: capitalize(topic),
      // No columns named yet: keep the blank table's placeholder columns.
      columns: columns.length ? columns : EMPTY_SHELL_DATA.table.columns,
      rows: [],
      rowCount: rowCount ? Number(rowCount) : undefined,
    };
    data = table;
  }
  return { kind, data: data as ShellDataByKind[K], spans };
}

function splice(prompt: string, span: Span, text: string) {
  return `${prompt.slice(0, span.start)}${text}${prompt.slice(span.end)}`;
}

/** Add a clause at the end of the prompt, before any closing punctuation. */
function append(prompt: string, clause: string, separator: string) {
  const trimmed = prompt.replace(/[\s.!?]+$/, "");
  const tail = prompt.slice(trimmed.length).trim();
  return `${trimmed}${separator}${clause}${tail}`;
}

function setClause(
  prompt: string,
  span: Span | undefined,
  clause: string,
  separator: string,
) {
  if (span) {
    const lead = prompt.slice(span.start, span.end).match(/^,?\s*/)?.[0] ?? "";
    return clause
      ? splice(prompt, span, `${lead || separator}${clause}`)
      : splice(prompt, span, "");
  }
  return clause ? append(prompt, clause, separator) : prompt;
}

export type PromptField =
  | "title"
  | "length"
  | "context"
  | "sources"
  | "filters"
  | "columns"
  | "rowCount";

/** Rewrite one field's span in the prompt. Empty values remove the span; missing spans are added. */
export function writePromptField(
  kind: ChatShellKind,
  prompt: string,
  field: PromptField,
  value: string | string[] | number | undefined,
): string {
  const { spans, data } = parsePrompt(kind, prompt);
  switch (field) {
    case "title": {
      const text = String(value ?? "");
      if (!prompt.trim()) return text ? `${PROMPT_SEED[kind]}${text}` : prompt;
      const current = prompt.slice(spans.title.start, spans.title.end);
      // Keep the person's own capitalisation where only the card capitalised it.
      const next =
        current && text.toLowerCase() === current.toLowerCase()
          ? current
          : text;
      return splice(
        prompt,
        spans.title,
        kind === "search" ? next : matchCase(current, next),
      );
    }
    case "length": {
      const text = String(value ?? "").trim();
      return setClause(
        prompt,
        spans.length,
        text ? `about ${text.replace(/^~\s*/, "")}` : "",
        ", ",
      );
    }
    case "context": {
      const text = String(value ?? "")
        .replace(/\s*\n+\s*/g, " ")
        .trim();
      return setClause(
        prompt,
        spans.context,
        text ? `covering ${text}` : "",
        ", ",
      );
    }
    case "sources": {
      const items = (value as string[] | undefined) ?? [];
      return setClause(
        prompt,
        spans.sources,
        items.length ? `on ${joinList(items)}` : "",
        " ",
      );
    }
    case "columns": {
      const lead = kind === "table" ? leadColumn(prompt) : null;
      const labels = ((value as string[] | undefined) ?? []).filter(
        (label) => !lead || label.toLowerCase() !== lead.toLowerCase(),
      );
      return setClause(
        prompt,
        spans.columns,
        labels.length ? `with ${joinList(labels.map(lowerFirst))}` : "",
        " ",
      );
    }
    case "rowCount": {
      const count = Number(value) || 0;
      return setClause(
        prompt,
        spans.rowCount,
        count ? `${count} rows` : "",
        ", ",
      );
    }
    case "filters": {
      const next = (value as string[] | undefined) ?? [];
      const keep = new Set(next.map((item) => item.toLowerCase()));
      let out = prompt;
      // Remove from the end so earlier spans stay valid.
      for (const filter of [...spans.filters].reverse()) {
        if (!keep.has(filter.value.toLowerCase()))
          out = splice(out, filter.span, "");
      }
      const had = new Set(
        (data as SearchShellData).filters?.map((item) => item.toLowerCase()) ??
          [],
      );
      for (const item of next)
        if (!had.has(item.toLowerCase())) out = append(out, item, ", ");
      return out;
    }
  }
}

function leadColumn(prompt: string) {
  return (
    prompt.match(/\s+(?:for|per)\s+(?:each|every)\s+([a-z][\w-]*)/i)?.[1] ??
    prompt.match(/\b\d+-(day|week|scene|episode|shot|location)\b/i)?.[1] ??
    null
  );
}

const lowerFirst = (text: string) =>
  /^[A-Z][a-z]/.test(text)
    ? text.charAt(0).toLowerCase() + text.slice(1)
    : text;

/** The card capitalises titles; write them back in the prompt's own case. */
function matchCase(current: string, next: string) {
  if (current && current.charAt(0) === current.charAt(0).toLowerCase())
    return lowerFirst(next);
  return next;
}

const sameList = (a: string[] = [], b: string[] = []) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

export type CardEdit = {
  prompt: string;
  /** Changes the prompt can't hold (a project, typed rows); the card keeps these itself. */
  extras: Partial<ShellDataByKind[ChatShellKind]>;
};

/** Turn an edit made on the card into an edit of the prompt. */
export function applyCardEdit<K extends ChatShellKind>(
  kind: K,
  prompt: string,
  previous: ShellDataByKind[K],
  next: ShellDataByKind[K],
): CardEdit {
  let out = prompt;
  const extras: Record<string, unknown> = {};
  const write = (
    field: PromptField,
    value: string | string[] | number | undefined,
  ) => {
    out = writePromptField(kind, out, field, value);
  };
  if (next.project !== previous.project) extras.project = next.project;

  if (kind === "document") {
    const [a, b] = [previous as DocumentShellData, next as DocumentShellData];
    if (a.title !== b.title) write("title", b.title);
    if (a.length !== b.length) write("length", b.length);
    if (a.body !== b.body) {
      // A single line reads as context in the prompt; longer writing stays on the card.
      if (b.body.includes("\n")) extras.body = b.body;
      else write("context", b.body);
    }
  } else if (kind === "search") {
    const [a, b] = [previous as SearchShellData, next as SearchShellData];
    if (a.query !== b.query) write("title", b.query);
    if (!sameList(a.filters, b.filters)) write("filters", b.filters);
    if (!sameList(a.sources, b.sources)) write("sources", b.sources);
    if (!sameList(a.queries, b.queries)) extras.queries = b.queries;
  } else if (kind !== "table") {
    // Only the title lives in the prompt; the rest of the card keeps itself.
    const key = kind === "map" ? "query" : "title";
    const [a, b] = [previous as Record<string, unknown>, next as Record<string, unknown>];
    if (kind === "chat") {
      if (a.title !== b.title) out = String(b.title ?? "");
    } else if (a[key] !== b[key]) write("title", String(b[key] ?? ""));
    for (const field of Object.keys(b)) {
      if (field !== key && field !== "project" && a[field] !== b[field]) extras[field] = b[field];
    }
  } else {
    const [a, b] = [previous as TableShellData, next as TableShellData];
    if (a.title !== b.title) write("title", b.title);
    const labels = (table: TableShellData) =>
      table.columns.map((column) => column.label);
    if (!sameList(labels(a), labels(b))) {
      write(
        "columns",
        labels(b).filter((label) => label.trim()),
      );
      if (b.columns.some((column) => !column.label.trim()))
        extras.columns = b.columns;
    }
    if (a.rowCount !== b.rowCount) write("rowCount", b.rowCount);
    if (a.description !== b.description) extras.description = b.description;
    if (a.rows !== b.rows) extras.rows = b.rows;
  }
  return { prompt: out, extras: extras as CardEdit["extras"] };
}

/**
 * Rewrite a prompt into another interface's form, keeping the topic and every
 * detail after it: "Write a paper on heat" → "Search for heat". Prompts that
 * don't open with an interface's own verb ("Help me plan…") are left alone.
 */
export function reframePrompt(prompt: string, toKind: ChatShellKind): string {
  if (!prompt.trim()) return PROMPT_SEED[toKind];
  const frame = frameOf(prompt);
  if (!frame.verb || !KIND_VERB.test(frame.verb)) return prompt;
  return `${PROMPT_SEED[toKind]}${prompt.slice(frame.end)}`;
}
