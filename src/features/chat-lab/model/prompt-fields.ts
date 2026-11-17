import {
  CHAT_FORMAT_META,
  CHAT_PERSONA_META,
  chatFormatFor,
  chatPersonaFor,
  EMPTY_SHELL_DATA,
  generatorModeFor,
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
  filters: { value: string; span: Span; listed?: boolean }[];
  /** "…, filtered to Past year and Reviews": filters with no wording of their own, kept together. */
  filterList?: Span;
};

export type ParsedPrompt<K extends ChatShellKind = ChatShellKind> = {
  kind: K;
  data: ShellDataByKind[K];
  spans: PromptSpans;
};

/** What the composer is seeded with when an interface is picked on an empty draft. */
export const PROMPT_SEED: Record<ChatShellKind, string> = {
  chat: "",
  notes: "Help me plan ",
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
  generator: "Generate ",
  dashboard: "Build a dashboard of ",
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
    ...findAll(prompt, /,?\s*\bfiltered\s+(?:to|by)\s+([^.;]+)/i, "filterList", (m) => m[1]!.trim()),
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
      // "…by price and range", "…including make, model and range": a list at the end names the columns too.
      // Only a list (two or more, joined by a comma or "and"), so "by Friday" stays in the topic.
      ...findAll(
        prompt,
        /\s+(?:by|including|showing|covering|listing|tracking)\s+((?:[\w-]+(?:\s+[\w-]+){0,2})(?:\s*,\s*[\w-]+(?:\s+[\w-]+){0,2})*\s*,?\s+(?:and|&)\s+[\w-]+(?:\s+[\w-]+){0,2})(?=\s*[.;]|\s*$|\s+(?:for|per)\s+(?:each|every)\b)/i,
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

const NUMBERS: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20 };
const numberOf = (word: string) => (/^\d+(\.\d+)?$/.test(word) ? Number(word) : NUMBERS[word.toLowerCase()]);

/** Words in a request that say what kind of guide it is, by the fact they fill. */
const GUIDE_KEYWORDS: { label: string; pattern: RegExp }[] = [
  { label: "Diet", pattern: /\b(vegetarian|vegan|gluten[- ]free|dairy[- ]free|nut[- ]free|halal|kosher|keto|low[- ]carb|pescatarian)\b/gi },
  { label: "Level", pattern: /\b(easy|simple|beginner|beginners|advanced)\b/gi },
  { label: "Style", pattern: /\b(quick|spicy|healthy|one[- ]pot|kid[- ]friendly|budget|cheap|slow[- ]cooked|traybake|no[- ]bake)\b/gi },
];

/**
 * A guide's facts, read from the request: "in 30 minutes" is its Time, "for
 * six people" what it Serves, and words like vegetarian or quick what kind it
 * is. What the request doesn't say is left for the card to suggest.
 */
export function guideFacts(prompt: string): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [];
  const half = /\bhalf an? hour\b/i.test(prompt);
  const time = prompt.match(/\b(\d+(?:\.\d+)?|an?|one|two|three|four|five|ten|twenty)\s*-?\s*(hours?|hrs?|minutes?|mins?)\b/i);
  if (half) facts.push({ label: "Time", value: "30 min" });
  else if (time) {
    const n = numberOf(time[1]!);
    if (n) facts.push({ label: "Time", value: /^h/i.test(time[2]!) ? `${n} ${n === 1 ? "hour" : "hours"}` : `${n} min` });
  }
  const people = prompt.match(/\b(?:for|serves|feeds|serving|feeding)\s+(\d+|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty)(?!\s*-?\s*(?:hours?|hrs?|minutes?|mins?)\b)(?:\s+(?:people|persons|guests|adults|kids|of us))?\b/i);
  if (people) facts.push({ label: "Serves", value: String(numberOf(people[1]!)) });
  for (const { label, pattern } of GUIDE_KEYWORDS) {
    const words = [...new Set([...prompt.matchAll(pattern)].map((m) => m[1]!.toLowerCase().replace(/\s+/g, "-")))];
    if (words.length) facts.push({ label, value: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(", ") });
  }
  return facts;
}

const DAY = "(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)";
const MONTH = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
/** When something happens, as written: "next week", "next Thursday", "on 12 March", "tomorrow at 7". */
const WHEN = new RegExp(
  String.raw`\b(?:(?:this|next|coming)\s+(?:week(?:end)?|month|year|${DAY})|(?:on\s+)?${DAY}(?:\s+(?:morning|afternoon|evening|night))?|tomorrow|tonight|today|(?:on\s+)?\d{1,2}(?:st|nd|rd|th)?\s+${MONTH}|${MONTH}\s+\d{1,2}(?:st|nd|rd|th)?|in\s+${MONTH})(?:\s+(?:at|from)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s*(?:-|–|to)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?)?\b`,
  "i",
);
/** How long: "half-day", "a full day", "3-day", "two hours". */
const SPAN = /\b(half[- ]day|full[- ]day|all[- ]day|(?:\d+|one|two|three|four|five|six|seven)[- ](?:day|week|hour|night)s?|(?:\d+|one|two|three|four|five|six)\s+(?:days|weeks|hours|nights))\b/i;
/** Counted things: "3 product shots", "2 lifestyle scenes", "one model", "8 guests". */
const COUNTED = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty)\s+((?:[a-z]+[- ]){0,2}?[a-z]+?s?)(?=\s*(?:,|\.|;|\band\b|\bwith\b|\bfor\b|\bin\b|\bat\b|\bon\b|$))/gi;
const NOT_COUNTED = /^(?:day|days|week|weeks|hour|hours|night|nights|minute|minutes|mins?|pm|am|of|to|or|and)\b/i;
/** Where: "Location is a rented loft in the Mission", "at the Harbour Pier". */
const WHERE = /\b(?:[Ll]ocation|[Vv]enue|[Pp]lace)\s+(?:is|will be|:)\s+([^.;]+)|\b(?:at|in)\s+((?:the\s+)?[A-Z][\w'-]*(?:\s+[A-Z][\w'-]*)*)/;
/** Who it's for: "for our skincare brand", "for my sister". Not "for a dinner party": that's the occasion. */
const FOR_WHOM = /\bfor\s+((?:our|my|his|her|their|your)\s+[^,.;]+?)(?=\s+(?:next|this|on|in|at|tomorrow|tonight|today)\b|[,.;]|$)/i;

const trimEnd = (text: string) => text.replace(/[\s,;.!?]+$/, "").trim();

/**
 * Notes for a goal, read from the request with rules, so they're there before
 * any model: the goal (its first sentence, less how it was asked), then one
 * plain line per fact it gives (when, how long, for whom, how many, where),
 * then any sentence after the first, as written. Each line is text the person
 * can change, in the form "Label: value".
 */
export function notesFromPrompt(prompt: string): { title: string; body: string } {
  const text = prompt.trim();
  const [first = "", ...rest] = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
  // How it was asked ("Help me", "Can you help us", "I need to") isn't the goal.
  let goal = trimEnd(first).replace(/^(?:(?:can|could|would) you\s+|please\s+|hey,?\s+)?(?:help (?:me|us)(?: to)?|i need to|we need to|i(?:'m| am) trying to|we(?:'re| are) trying to|i want to|we want to|i(?:'d| would) like to|let's|lets)\s+/i, "");
  const lines: string[] = [];
  const when = text.match(WHEN)?.[0];
  if (when) goal = goal.replace(when, "");
  const span = text.match(SPAN)?.[1];
  const forWhom = first.match(FOR_WHOM)?.[1];
  goal = trimEnd(goal.replace(/\s{2,}/g, " "));
  lines.push(`Goal: ${goal}`);
  if (when) lines.push(`When: ${trimEnd(when.replace(/^on\s+/i, ""))}`);
  if (span) lines.push(`Length: ${span.replace(/-/g, " ").toLowerCase()}`);
  if (forWhom) lines.push(`For: ${trimEnd(forWhom)}`);
  const counted = [...text.matchAll(COUNTED)]
    .filter((m) => !NOT_COUNTED.test(m[2]!) && !SPAN.test(m[0]))
    .map((m) => `${m[1]} ${m[2]}`);
  if (counted.length) lines.push(`Includes: ${counted.join(", ")}`);
  const where = text.match(WHERE);
  if (where) lines.push(`Where: ${trimEnd(where[1] ?? where[2]!)}`);
  // Anything said after the first sentence that the lines above don't already hold.
  for (const sentence of rest) {
    const said = trimEnd(sentence);
    const covered = (counted.length && COUNTED.test(said)) || (where?.[1] && said.includes(where[1].trim()));
    COUNTED.lastIndex = 0;
    if (said && !covered) lines.push(said);
  }
  const title = goal.replace(/^(?:plan|organi[sz]e|put together|pull together|coordinate|arrange|host|throw)\s+/i, "");
  return { title: capitalize(title || goal), body: lines.join("\n") };
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
  // The topic is the first sentence's; what follows (a brief added from the card's choices) isn't the title.
  const sentenceEnd = prompt.slice(topicStart).search(/[.!?](?:\s|$)/);
  if (sentenceEnd >= 0) topicEnd = Math.min(topicEnd, topicStart + sentenceEnd);
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
    else if (clause.field === "filterList") {
      spans.filterList = clause.span;
      for (const value of splitList(clause.value))
        spans.filters.push({ value, span: clause.span, listed: true });
    } else if (clause.field !== "each") spans[clause.field] = clause.span;
  }

  let data: ShellDataByKind[ChatShellKind];
  if (kind === "notes") {
    data = { ...EMPTY_SHELL_DATA.notes, ...notesFromPrompt(prompt) };
  } else if (kind === "document") {
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
  } else if (kind === "generator") {
    // The prompt is what to make; it also says whether that's writing or pictures.
    data = { ...EMPTY_SHELL_DATA.generator, title: capitalize(topic), mode: generatorModeFor(prompt) };
  } else if (kind === "guide") {
    // What the prompt says goes into the guide's own controls: how long, for how many, and what kind.
    data = { ...EMPTY_SHELL_DATA.guide, title: capitalize(topic), facts: guideFacts(prompt) } as ShellDataByKind[ChatShellKind];
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
        labels.length ? `with columns for ${joinList(labels.map(lowerFirst))}` : "",
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
      // Filters with wording of their own ("since 2020", "in Lisbon") go one by one, from the end so earlier spans stay valid.
      for (const filter of [...spans.filters].reverse()) {
        if (!filter.listed && !keep.has(filter.value.toLowerCase()))
          out = splice(out, filter.span, "");
      }
      void data;
      // A new filter that reads as its own wording ("in North Beach", "since 2020") is added as itself.
      const ownFilters = () =>
        new Set(parsePrompt(kind, out).spans.filters.filter((filter) => !filter.listed).map((filter) => filter.value.toLowerCase()));
      for (const item of next) {
        if (ownFilters().has(item.toLowerCase())) continue;
        const tried = append(out, item, ", ");
        const read = parsePrompt(kind, tried).spans.filters.some((filter) => !filter.listed && filter.value.toLowerCase() === item.toLowerCase());
        if (read) out = tried;
      }
      // The rest live together in one clause, written again whole: "…, filtered to Past year and Reviews".
      const reparsed = parsePrompt(kind, out).spans;
      const own = ownFilters();
      const listed = next.filter((item) => !own.has(item.toLowerCase()));
      if (reparsed.filterList) out = splice(out, reparsed.filterList, "");
      return listed.length ? append(out, `filtered to ${joinList(listed)}`, ", ") : out;
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
