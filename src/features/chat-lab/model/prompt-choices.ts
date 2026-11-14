import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SUGGESTION_KINDS, type ChatShellKind, type SuggestedGroup } from "@/features/interface-shells";
import { joinList } from "./prompt-fields";

/**
 * Choices for a request still being typed on the chat home: the few things
 * the result would otherwise guess (who a document is for, what it should
 * do, its form), each with options and the model's guess. Picking one writes
 * a short phrase into the prompt, as one sentence after the request
 * ("For the leadership team, as a one-pager."), so the prompt itself gets
 * better and stays the record of what was asked.
 *
 * Kept calm while typing: the model sees the choices already shown, by key,
 * and answers with changes (`/api/prompt-choices`). At most `MAX_SHOWN` show.
 */

/** Interfaces with a list of what usually changes the result (the route's FORKS). */
export const CHOICE_KINDS = SUGGESTION_KINDS as ChatShellKind[];
/** Not too much: the card has room for three. */
export const MAX_SHOWN = 3;
const SETTLE_MS = 700;
const MIN_WORDS = 3;

export type PromptChoiceOption = { label: string; phrase: string };
export type PromptChoice = {
  key: string;
  kind: string;
  ask: string;
  options: PromptChoiceOption[];
  guess: string[];
  multi: boolean;
  lead?: string;
  /** How an answer they type themselves reads in the request, {} for it: "for {}". */
  template: string;
  impact: number;
  said: number;
};

/** When the model gives no template, how a typed answer reads, by kind of choice. */
const TEMPLATES: Record<string, string> = {
  audience: "for {}",
  purpose: "to {}",
  form: "as {}",
  voice: "in a {} tone",
  fact: "with {}",
};

/** Their own words as an option, reading in the request through the choice's template. */
export function ownOption(choice: Pick<PromptChoice, "template" | "multi">, text: string): PromptChoiceOption {
  const label = text.trim();
  // A multi choice's items are noun phrases joined after its lead ("covering the budget"), so they go in as typed.
  const phrase = choice.multi ? label : choice.template.includes("{}") ? choice.template.replace("{}", label) : `${choice.template} ${label}`;
  return { label, phrase: phrase.trim() };
}
type Row = PromptChoice & { order: number; picked?: string[] };

const clamp = (value: unknown, low: number, high: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(high, Math.max(low, value)) : fallback;
const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** A choice as the model wrote it, held to what the card can show; null when it can't be saved. */
export function readChoice(raw: unknown): PromptChoice | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const key = text(r.key, 40).toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  const ask = text(r.ask, 32);
  const options = (Array.isArray(r.options) ? r.options : [])
    .map((option) => ({ label: text((option as Record<string, unknown>)?.label, 28), phrase: text((option as Record<string, unknown>)?.phrase, 80) }))
    .filter((option) => option.label && option.phrase)
    .slice(0, 4);
  if (!key || !ask || options.length < 2) return null;
  const labels = new Set(options.map((option) => option.label));
  const guess = (Array.isArray(r.guess) ? r.guess : []).filter((label): label is string => typeof label === "string" && labels.has(label));
  const kind = text(r.kind, 20) || "other";
  const template = text(r.template, 60);
  return {
    key,
    kind,
    ask,
    options,
    guess: guess.length ? guess : [options[0]!.label],
    multi: r.multi === true,
    lead: text(r.lead, 30) || undefined,
    template: template || TEMPLATES[kind] || "{}",
    impact: clamp(r.impact, 1, 5, 3),
    said: clamp(r.said, 0, 1, 0),
  };
}

/** Worth a place: a wrong guess would change a lot, and their words don't already say it. */
export const choiceScore = (choice: Pick<PromptChoice, "impact" | "said">) => (choice.impact / 5) * (1 - choice.said);
const SHOW_AT = 0.3;

/** The picked choices as one sentence for the prompt: "For the leadership team, as a one-pager, covering the timeline and risks." */
export function briefOf(rows: Row[]) {
  const parts = rows
    .filter((row) => row.picked?.length)
    .sort((a, b) => a.order - b.order)
    .map((row) => {
      const phrases = row.picked!.map((label) => row.options.find((option) => option.label === label)?.phrase).filter(Boolean) as string[];
      return row.multi ? `${row.lead ?? "covering"} ${joinList(phrases)}` : phrases[0];
    })
    .filter(Boolean) as string[];
  if (!parts.length) return "";
  const sentence = parts.join(", ");
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

/** Put the brief in the prompt: in place of the last one if it's still there, else as a new sentence at the end. */
export function withBrief(prompt: string, previous: string, next: string) {
  if (previous && prompt.includes(previous)) {
    return prompt.replace(previous, next).replace(/\s{2,}/g, " ").trimEnd();
  }
  if (!next) return prompt;
  const trimmed = prompt.trimEnd();
  const ended = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return `${ended} ${next}`;
}

async function streamChoices(
  body: unknown,
  signal: AbortSignal,
  on: {
    choice: (choice: PromptChoice) => void;
    score: (key: string, impact: number, said: number) => void;
    drop: (keys: string[]) => void;
    fill: (group: SuggestedGroup, values: string[]) => void;
  },
) {
  const response = await fetch("/api/prompt-choices", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok || !response.body) throw new Error(`${response.status}`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
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
        choice?: unknown;
        score?: { key: string; impact: number; said: number };
        drop?: string[];
        fill?: { group: SuggestedGroup; values: string[] };
        error?: string;
      };
      if (event.error) throw new Error(event.error);
      if (event.fill) on.fill(event.fill.group, event.fill.values);
      if (event.drop) on.drop(event.drop);
      if (event.score) on.score(event.score.key, event.score.impact, event.score.said);
      if (event.choice) {
        const choice = readChoice(event.choice);
        if (choice) on.choice(choice);
      }
    }
  }
}

export type PromptChoicesState = {
  /** What the card shows: picked ones, then the best of the rest, in the order they came. */
  shown: (PromptChoice & { picked?: string[] })[];
  thinking: boolean;
  /**
   * Pick (or, for multi, set) the options a choice holds; returns the prompt
   * with its brief. `own` is an answer they typed: it joins the options and is
   * picked (added to the rest, for multi).
   */
  pick: (key: string, labels: string[], prompt: string, own?: string) => string;
  /** Values for the card's own parts (a table's columns, a search's filters), shown in place for one-click adding. */
  suggested: Partial<Record<SuggestedGroup, string[]>>;
  /** Not this one: it won't be suggested again for this request. */
  dismiss: (group: SuggestedGroup, value: string) => void;
};

/**
 * The choices for `kind` while `draft` is typed. `kind` is null when no
 * interface card is open, or the open one has no list of choices.
 */
export function usePromptChoices(
  kind: ChatShellKind | null,
  label: string,
  draft: string,
  /** What the card's own parts hold now, by group: its columns, filters, items, length. */
  has: Partial<Record<SuggestedGroup, string[]>> = {},
): PromptChoicesState {
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [fills, setFills] = useState<Partial<Record<SuggestedGroup, string[]>>>({});
  const [dismissed, setDismissed] = useState<string[]>([]);
  const fillsRef = useRef(fills);
  const hasRef = useRef(has);
  const dismissedRef = useRef(dismissed);
  useEffect(() => {
    fillsRef.current = fills;
    hasRef.current = has;
    dismissedRef.current = dismissed;
  });
  const [thinking, setThinking] = useState(false);
  // The request the choices were last worked out for: until then, the card shows they're coming.
  const [judged, setJudged] = useState("");
  const next = useRef(0);
  // The sentence the choices last wrote into the prompt.
  const [brief, setBrief] = useState("");
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // A new interface, or an empty draft, starts over.
  const [shownFor, setShownFor] = useState<ChatShellKind | null>(kind);
  const cleared = !draft.trim();
  if (shownFor !== kind || (cleared && Object.keys(rows).length)) {
    setShownFor(kind);
    setRows({});
    setBrief("");
    setFills({});
    setDismissed([]);
  }

  // The request without the brief the choices wrote: what the model judges.
  const request = brief ? draft.replace(brief, "").trim() : draft.trim();
  const active = Boolean(kind && CHOICE_KINDS.includes(kind) && request.split(/\s+/).length >= MIN_WORDS);

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setThinking(true);
      const table = Object.values(rowsRef.current).map((row) => ({
        key: row.key,
        ask: row.ask,
        options: row.options.map((option) => option.label),
        guess: row.guess,
        impact: row.impact,
        said: row.said,
        ...(row.picked?.length ? { picked: row.picked } : {}),
      }));
      const shown = Object.fromEntries(
        Object.entries(fillsRef.current).map(([group, values]) => [group, (values ?? []).filter((value) => !dismissedRef.current.includes(value))]),
      );
      streamChoices({ kind, label, prompt: request, table, has: hasRef.current, shown }, controller.signal, {
        fill: (group, values) =>
          setFills((current) => ({ ...current, [group]: values.filter((value) => !dismissedRef.current.includes(value)) })),
        choice: (choice) =>
          setRows((current) => {
            const row = current[choice.key];
            if (row?.picked?.length) return current;
            return { ...current, [choice.key]: { ...choice, order: row?.order ?? next.current++ } };
          }),
        score: (key, impact, said) =>
          setRows((current) => {
            const row = current[key];
            if (!row || row.picked?.length) return current;
            return { ...current, [key]: { ...row, impact: clamp(impact, 1, 5, row.impact), said: clamp(said, 0, 1, row.said) } };
          }),
        drop: (keys) =>
          setRows((current) => {
            const out = { ...current };
            for (const key of keys) if (out[key] && !out[key].picked?.length) delete out[key];
            return out;
          }),
      })
        .then(() => setJudged(request))
        .catch(() => {})
        .finally(() => {
          if (!controller.signal.aborted) setThinking(false);
        });
    }, SETTLE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [active, kind, label, request]);

  const shown = useMemo(() => {
    const all = Object.values(rows);
    const picked = all.filter((row) => row.picked?.length);
    const open = all
      .filter((row) => !row.picked?.length && choiceScore(row) >= SHOW_AT)
      .sort((a, b) => choiceScore(b) - choiceScore(a))
      .slice(0, Math.max(0, MAX_SHOWN - picked.length));
    return [...picked, ...open].sort((a, b) => a.order - b.order);
  }, [rows]);

  const pick = useCallback((key: string, labels: string[], prompt: string, own?: string) => {
    const current = rowsRef.current;
    const row = current[key];
    if (!row) return prompt;
    let options = row.options;
    let chosen = labels;
    if (own?.trim()) {
      const option = ownOption(row, own);
      if (!options.some((item) => item.label.toLowerCase() === option.label.toLowerCase())) options = [...options, option];
      const label = options.find((item) => item.label.toLowerCase() === option.label.toLowerCase())!.label;
      chosen = row.multi ? [...labels.filter((item) => item !== label), label] : [label];
    }
    const updated = { ...current, [key]: { ...row, options, picked: chosen.length ? chosen : undefined } };
    rowsRef.current = updated;
    setRows(updated);
    const nextBrief = briefOf(Object.values(updated));
    setBrief(nextBrief);
    return withBrief(prompt, brief, nextBrief);
  }, [brief]);

  // Before the first choices land, "thinking" covers the pause before the call too, so something shows at once.
  const waiting = active && !shown.length && request !== judged;
  const suggested = useMemo(
    () =>
      active
        ? Object.fromEntries(Object.entries(fills).map(([group, values]) => [group, (values ?? []).filter((value) => !dismissed.includes(value))]))
        : {},
    [fills, active, dismissed],
  );
  const dismiss = useCallback((_group: SuggestedGroup, value: string) => setDismissed((current) => [...current, value]), []);

  return { shown: active || shown.some((row) => row.picked) ? shown : [], thinking: active && (thinking || waiting), pick, suggested, dismiss };
}
