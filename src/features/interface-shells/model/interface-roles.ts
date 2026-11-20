import { z } from "zod";
import { CATALOGUE, CATALOGUE_KINDS } from "./shell-catalogue.js";
import type { InterfaceRole, NotesShellData, ShellKind, TrackerShellData } from "./shell-types.js";

/**
 * What the chat model can do with each interface, by the role it has in the
 * thread (make: the thing asked for; track: the thread's working state). Each
 * interface declares its own rules and tools here, next to each other, and a
 * request only carries those of the interfaces in play: open nothing that
 * tracks, and the model sees no tracking rules or tools at all.
 *
 * The model's instructions are built in three layers (`rulesFor`):
 * 1. base: always, short;
 * 2. role: one block for make, one for track, each only when something in play has that role;
 * 3. interface: each interface's own lines for its role, only when it's in play.
 *
 * A tool's `apply` is what it does to the interface's data. The chat API runs
 * it to check the call (and tell the model what changed); the app runs the
 * same function to make the change. Read by both, so it imports nothing but
 * zod (and types).
 */

export type RoleTool<D = unknown> = {
  /** Unique across interfaces, and names the interface it writes to: notes_add, progress_check. */
  name: string;
  description: string;
  input: z.ZodType;
  /** The interface after the call, or an error the model can fix. */
  apply: (data: D, input: never) => { ok: true; data: D; summary: string } | { ok: false; error: string };
};

export type RoleSpec<D = unknown> = {
  /** Lines added to the model's instructions while this interface plays this role. */
  rules: string[];
  tools: RoleTool<D>[];
  /** How its contents read to the model, at the end of the prompt. */
  contents: (data: D) => string;
};

/* ── Layer 1 and 2: base and role ─────────────────────────────────────── */

export const BASE_RULES = [
  "Never ask for something an interface in play already answers.",
  "When asked to make or change something, do it now with sensible choices and say in a line what you chose; they'll change what they don't like. Anything you'd ask first (a time, a number) goes in as your best guess instead. Ask first only when it truly can't go ahead without them.",
];

/**
 * Which interface makes which thing, from each one's own description: the
 * model picks by what the thing is (something to read, steps to follow, a
 * timed plan), never by the words of the request.
 */
export const CHOOSING_RULE = `Pick the interface by what the thing is, not the words used to ask, unless they name the interface itself (a table, a checklist, a document): then make that one. Otherwise: ${CATALOGUE_KINDS.map((kind) => `${CATALOGUE[kind].label} for ${CATALOGUE[kind].makes}`).join("; ")}. One thing per interface: a menu and each of its recipes are separate.`;

export const ROLE_RULES: Record<InterfaceRole, string[]> = {
  make: [
    "Interfaces you make are what the person asked for. Write them from what the tracked interfaces say (the goal, the facts, the decisions), so nothing they've told you is lost or asked again.",
    CHOOSING_RULE,
    "Decide as you make it: where there's a choice (which main, which dessert), pick one that fits what the notes say instead of listing alternatives, and never ask them to choose between options you wrote yourself.",
    "What you'd write out that an interface holds (a menu, a shopping list, a recipe, a plan for the day, a comparison) is made as that interface, never written in your reply. When they say yes to something you offered to make, make it; when they ask for several things, make each one.",
    "Never ask which interface to use, or whether to put something in one: pick by what the thing is and make it.",
  ],
  track: [
    "Tracked interfaces hold this thread's working state. Keep them current as you go, in the same turn as anything else you do; don't wait to be asked and don't mention that you're doing it unless it matters.",
    "Record what the person tells you (a fact, a number, a decision, a preference) as soon as they say it.",
    "Keep every fact the person gave you: a line can be merged, moved or made more exact, and changed when it's now wrong (a date that moved, a question now answered), but what they told you is never lost.",
  ],
};

/* ── Layer 3: each interface ──────────────────────────────────────────── */

const linesOf = (body: string) => body.split("\n").map((line) => line.trim()).filter(Boolean);
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
/** Labels for what passes (a question once answered, a next step once done): a rewrite may drop these. */
const TRANSIENT = new Set(["open", "next", "todo", "to do", "question"]);
/**
 * A line that's really a thing to make: a long run of items (a shopping list, a
 * packing list) belongs in its own interface, not the notes. A decision that
 * names a few things (Menu: salad; lamb; tart) is fine.
 */
const LIST_ITEMS = 8;
const listInLine = (line: string) => line.slice(line.indexOf(":") + 1).split(/[,;]/).filter((item) => item.trim()).length > LIST_ITEMS;
const listError = (line: string) =>
  `"${line.slice(0, 60)}…" is a list of things, which Notes doesn't hold: make it as its own interface (a Checklist for things to buy or do) and note only what it settles.`;

/** The heading the to-dos sit under, last: what's left to do, apart from what's known. */
export const TODO_HEADING = "## To do";
const isTodo = (line: string) => /^\[( |x)\]\s/i.test(line);
/**
 * The notes as they're kept: what's known first (the goal, facts, decisions,
 * what's open), then the to-dos together under their heading, done or not.
 * Every notes tool writes through this, so the two never mix.
 */
export function withTodosLast(lines: string[]): string {
  const notes = lines.filter((line) => !isTodo(line) && !same(line, TODO_HEADING));
  const todos = lines.filter(isTodo);
  return [...notes, ...(todos.length ? [TODO_HEADING, ...todos] : [])].join("\n");
}

/** A note's label ("when" in "When: Saturday"), if it has one. */
const labelOf = (line: string) => line.match(/^\s*([^:]{1,24}):\s/)?.[1]?.trim().toLowerCase() ?? null;

const notesTrack: RoleSpec<NotesShellData> = {
  rules: [
    "Notes is the thread's working memory: one note a line, plain words, 'Label: value' where there's a label (When: Saturday at 7pm; Guests: 8, one vegetarian).",
    "It reads top to bottom: the goal; the facts; the decisions (Menu: …); what's still open ('Open: …', a few at most). Your to-dos go apart from the notes, as '[ ] Make the shopping list' ('[x]' once done); they're kept last under 'To do' for you. Status lives here: there's no separate tracker unless they ask for one.",
    "Keep it short and in that order as it grows: when lines are out of order, repeated, or no longer matter (an answered question, a step that's done and no longer useful), rewrite it with notes_rewrite. Facts are never dropped, only merged or made more exact.",
    "A line can take a style from how it starts, as in Apple Notes: '## ' a heading, '- ' a bullet, '1. ' numbered, '[ ] ' a to-do ('[x] ' done), with **bold** inside a line. Facts stay as plain 'Label: value' lines.",
    "Don't copy into Notes what another interface holds (a recipe's steps, a schedule's times): each thing lives in one place; the notes say only what it settles.",
    "Never add a line that repeats a fact already there under another label (Where and Location are the same fact); change that line instead if it's now more exact.",
    "Notes holds facts, decisions, what's next and what's open, never the things you make (no shopping list or menu written out in a line). When they ask for something, make it as its own interface (open it and fill it), then note what it settles and tick it off in what's next.",
    "While the goal is still being worked out, don't make anything unasked: ask about what's open (once, see Asking), and offer what you could make from the notes next (a menu, a shopping list, a schedule, a shot list), by name. A question whose answer is the thing itself (what's on the menu, what to buy) asks for it.",
  ],
  contents: (data) => `Notes "${data.title}":\n${data.body.trim() || "(empty)"}`,
  tools: [
    {
      name: "notes_add",
      description: "Add lines to the Notes: facts, decisions, or what's still open. One note per line.",
      input: z.object({ lines: z.array(z.string()).min(1).describe('Lines to add, as "Label: value" where there is a label') }),
      apply: (data, input: { lines: string[] }) => {
        // One line per label: a newer "When: Saturday 7pm" replaces "When: next week". "Open:" lines are many.
        const list = input.lines.find(listInLine);
        if (list) return { ok: false, error: listError(list) };
        let lines = linesOf(data.body);
        let added = 0;
        let changed = 0;
        for (const raw of input.lines.map((line) => line.trim()).filter(Boolean)) {
          if (lines.some((existing) => same(existing, raw))) continue;
          const label = labelOf(raw);
          const at = label && label !== "open" ? lines.findIndex((existing) => labelOf(existing) === label) : -1;
          if (at >= 0) {
            lines = lines.map((line, i) => (i === at ? raw : line));
            changed += 1;
          } else {
            lines = [...lines, raw];
            added += 1;
          }
        }
        if (!added && !changed) return { ok: true, data, summary: "Already in the notes." };
        return { ok: true, data: { ...data, body: withTodosLast(lines) }, summary: [added && `Added ${added}`, changed && `updated ${changed}`].filter(Boolean).join(", ") + " line(s)." };
      },
    },
    {
      name: "notes_rewrite",
      description:
        "Rewrite the whole Notes to keep them in order and short: reorder lines, merge repeats, drop answered 'Open:' lines and next-steps that no longer matter. Every fact must still be there (merged or made more exact is fine).",
      input: z.object({ body: z.string().describe("The whole notes, one note per line, in order: goal, facts, decisions, next, open") }),
      apply: (data, input: { body: string }) => {
        const before = linesOf(data.body);
        const after = linesOf(input.body);
        // A fact is a labelled line other than what's open; its label must survive (its value may become more exact).
        const kept = new Set(after.map(labelOf).filter(Boolean));
        const lost = before.filter((line) => {
          const label = labelOf(line);
          return label && !TRANSIENT.has(label) && !kept.has(label) && !after.some((next) => next.toLowerCase().includes(line.slice(line.indexOf(":") + 1).trim().toLowerCase()));
        });
        const list = after.find((line) => listInLine(line) && !before.includes(line));
        if (list) return { ok: false, error: listError(list) };
        if (lost.length) return { ok: false, error: `That would lose these facts: ${lost.join("; ")}. Keep them (merged or more exact is fine), or change one with notes_change if it's wrong.` };
        if (!after.length) return { ok: false, error: "The notes can't be empty." };
        return { ok: true, data: { ...data, body: withTodosLast(after) }, summary: `Rewrote the notes: ${before.length} lines to ${after.length}.` };
      },
    },
    {
      name: "notes_change",
      description: "Change one line in the Notes that's now wrong or answered: the line that starts with `line`, replaced by `to` (or removed, for an 'Open:' line now answered elsewhere, when `to` is empty).",
      input: z.object({
        line: z.string().describe("The start of the line to change, as it is now"),
        to: z.string().describe("The whole new line, or empty to remove an answered 'Open:' line"),
      }),
      apply: (data, input: { line: string; to: string }) => {
        const lines = linesOf(data.body);
        const at = lines.findIndex((line) => line.toLowerCase().startsWith(input.line.trim().toLowerCase()));
        if (at < 0) return { ok: false, error: `No line starts with "${input.line}". The notes are:\n${lines.join("\n")}` };
        if (listInLine(input.to)) return { ok: false, error: listError(input.to) };
        if (!input.to.trim() && !/^open:/i.test(lines[at]!)) return { ok: false, error: "Only an answered 'Open:' line can be removed; change the line instead." };
        const next = input.to.trim() ? lines.map((line, i) => (i === at ? input.to.trim() : line)) : lines.filter((_, i) => i !== at);
        return { ok: true, data: { ...data, body: withTodosLast(next) }, summary: `Changed "${lines[at]}".` };
      },
    },
  ],
};

const progressTrack: RoleSpec<TrackerShellData> = {
  rules: [
    "The progress tracker holds the goal's stages (Settle the guest list, Plan the menu, Shop, Prep), not the items inside any one thing you make.",
    "Tick a stage when the thing for it is made or settled; add a stage when the plan grows. Keep it to a handful.",
  ],
  contents: (data) =>
    `Progress "${data.title}":\n${data.items.map((item) => `[${item.done ? "x" : " "}] ${item.label}`).join("\n") || "(no stages yet)"}`,
  tools: [
    {
      name: "progress_add",
      description: "Add stages to the goal's progress tracker, in order.",
      input: z.object({ stages: z.array(z.string()).min(1).describe("Short stage names in the imperative: Plan the menu") }),
      apply: (data, input: { stages: string[] }) => {
        const added = input.stages.map((stage) => stage.trim()).filter((stage) => stage && !data.items.some((item) => same(item.label, stage)));
        if (!added.length) return { ok: true, data, summary: "Already there." };
        const items = [...data.items, ...added.map((label, i) => ({ id: `stage-${Date.now().toString(36)}-${i}`, label, done: false }))];
        return { ok: true, data: { ...data, items }, summary: `Added ${added.length} stage${added.length === 1 ? "" : "s"}.` };
      },
    },
    {
      name: "progress_check",
      description: "Mark a stage of the goal done (or not done).",
      input: z.object({ stage: z.string().describe("The stage's name, or its start"), done: z.boolean() }),
      apply: (data, input: { stage: string; done: boolean }) => {
        const item = data.items.find((entry) => entry.label.toLowerCase().startsWith(input.stage.trim().toLowerCase()));
        if (!item) return { ok: false, error: `No stage called "${input.stage}". Stages: ${data.items.map((entry) => entry.label).join("; ")}` };
        return { ok: true, data: { ...data, items: data.items.map((entry) => (entry === item ? { ...entry, done: input.done } : entry)) }, summary: `${item.label}: ${input.done ? "done" : "not done"}.` };
      },
    },
  ],
};

/**
 * Making: every interface the model writes (the catalogue) brings its own
 * lines on how to write it well. Its tools are its fill tool (write it, or a
 * new one) and update_interface (change part of it), built from its schema by
 * the chat API.
 */
const makeSpecs = Object.fromEntries(
  CATALOGUE_KINDS.map((kind) => [kind, { make: { rules: CATALOGUE[kind].guidance, tools: [], contents: () => "" } as RoleSpec<unknown> }]),
) as Partial<Record<ShellKind, Partial<Record<InterfaceRole, RoleSpec<unknown>>>>>;

export const ROLE_SPECS: Partial<Record<ShellKind, Partial<Record<InterfaceRole, RoleSpec<unknown>>>>> = {
  ...makeSpecs,
  notes: { track: notesTrack as unknown as RoleSpec<unknown> },
  tracker: { ...makeSpecs.tracker, track: progressTrack as unknown as RoleSpec<unknown> },
};

export const roleSpec = (kind: ShellKind, role: InterfaceRole): RoleSpec<unknown> | undefined =>
  ROLE_SPECS[kind]?.[role] as RoleSpec<unknown> | undefined;

/** Which interface and role a tool belongs to, by its name. */
export const ROLE_TOOL_OWNER: Record<string, { kind: ShellKind; role: InterfaceRole }> = Object.fromEntries(
  Object.entries(ROLE_SPECS).flatMap(([kind, roles]) =>
    Object.entries(roles ?? {}).flatMap(([role, spec]) => (spec?.tools ?? []).map((tool) => [tool.name, { kind: kind as ShellKind, role: role as InterfaceRole }])),
  ),
);

/** A tool call run against an interface's data: what the app applies and the API checks. */
export function applyRoleTool(name: string, data: unknown, input: unknown) {
  const owner = ROLE_TOOL_OWNER[name];
  const tool = owner && roleSpec(owner.kind, owner.role)?.tools.find((entry) => entry.name === name);
  if (!tool) return { ok: false as const, error: `No tool ${name}.` };
  const parsed = tool.input.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues.map((issue) => issue.message).join("; ") };
  return tool.apply(data, parsed.data as never);
}

/**
 * Starting a tracked interface the thread doesn't have yet: while Notes is
 * tracked and there's no progress tracker, the model can lay out the goal's
 * stages in one.
 */
export const PROGRESS_START = {
  name: "progress_start",
  description:
    "Start a separate progress tracker for the goal, with its stages in order. Only when the person asks to track progress in its own place; otherwise status lives in the Notes' next-steps checklist.",
  input: z.object({
    title: z.string().describe("Short: the goal, as in Dinner party"),
    stages: z.array(z.string()).min(2).max(8).describe("Short stage names in the imperative"),
  }),
  rules: ["Track status in the Notes. Start a separate progress tracker (progress_start) only if the person asks for one."],
};

export type InPlay = { kind: ShellKind; role: InterfaceRole; label: string };

/**
 * The model's instructions for what's in play: base, then each role present, then each interface's own.
 * `making`: the turn can make interfaces, so the make rules hold even before one is open.
 */
export function rulesFor(inPlay: InPlay[], { making = false }: { making?: boolean } = {}): string {
  const roles = [...new Set<InterfaceRole>([...(making ? (["make"] as const) : []), ...inPlay.map((entry) => entry.role)])];
  const own = inPlay.flatMap((entry) => {
    const spec = roleSpec(entry.kind, entry.role);
    return spec?.rules.length ? [`${entry.label} (${entry.role === "track" ? "tracked" : "being made"}):\n${spec.rules.map((line) => `- ${line}`).join("\n")}`] : [];
  });
  return [
    BASE_RULES.map((line) => `- ${line}`).join("\n"),
    ...roles.flatMap((role) => (ROLE_RULES[role].length ? [ROLE_RULES[role].map((line) => `- ${line}`).join("\n")] : [])),
    ...own,
  ].join("\n\n");
}
