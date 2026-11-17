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
];

export const ROLE_RULES: Record<InterfaceRole, string[]> = {
  make: [
    "Interfaces you make are what the person asked for. Write them from what the tracked interfaces say (the goal, the facts, the decisions), so nothing they've told you is lost or asked again.",
  ],
  track: [
    "Tracked interfaces hold this thread's working state. Keep them current as you go, in the same turn as anything else you do; don't wait to be asked and don't mention that you're doing it unless it matters.",
    "Record what the person tells you (a fact, a number, a decision, a preference) as soon as they say it.",
    "Don't remove or reword what the person wrote. Change a line only when it's now wrong (a date that moved, a question now answered).",
  ],
};

/* ── Layer 3: each interface ──────────────────────────────────────────── */

const linesOf = (body: string) => body.split("\n").map((line) => line.trim()).filter(Boolean);
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
/** A note's label ("when" in "When: Saturday"), if it has one. */
const labelOf = (line: string) => line.match(/^\s*([^:]{1,24}):\s/)?.[1]?.trim().toLowerCase() ?? null;

const notesTrack: RoleSpec<NotesShellData> = {
  rules: [
    "Notes is the scratchpad for the goal: one note a line, plain words, 'Label: value' where there's a label (When: Saturday at 7pm; Guests: 8, one vegetarian).",
    "A line can take a style from how it starts, as in Apple Notes: '## ' a heading, '- ' a bullet, '1. ' numbered, '[ ] ' a to-do ('[x] ' done), with **bold** inside a line. Use them only where they help (a short list under a heading); facts stay as plain 'Label: value' lines.",
    "Keep what's still open as 'Open: …' lines, a few at most, and replace one with the answer once it's settled.",
    "Don't copy into Notes what another interface holds (the progress tracker's stages, a recipe's steps): each thing lives in one place.",
    "Never add a line that repeats a fact already there under another label (Where and Location are the same fact); change that line instead if it's now more exact.",
    "Notes holds facts, decisions and what's still open, never the things you make. When they ask for something (a menu, a recipe, a schedule, a shot list, a list to shop from), make it as its own interface (open it and fill it), then note only what it settles (Menu: mushroom risotto, then tart).",
    "While the goal is still being worked out, don't make anything unasked: ask about what's open, a couple of things at a time, and offer what you could make from the notes next (a menu, a shopping list, a schedule, a shot list), by name.",
  ],
  contents: (data) => `Notes "${data.title}":\n${data.body.trim() || "(empty)"}`,
  tools: [
    {
      name: "notes_add",
      description: "Add lines to the Notes: facts, decisions, or what's still open. One note per line.",
      input: z.object({ lines: z.array(z.string()).min(1).describe('Lines to add, as "Label: value" where there is a label') }),
      apply: (data, input: { lines: string[] }) => {
        // One line per label: a newer "When: Saturday 7pm" replaces "When: next week". "Open:" lines are many.
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
        return { ok: true, data: { ...data, body: lines.join("\n") }, summary: [added && `Added ${added}`, changed && `updated ${changed}`].filter(Boolean).join(", ") + " line(s)." };
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
        if (!input.to.trim() && !/^open:/i.test(lines[at]!)) return { ok: false, error: "Only an answered 'Open:' line can be removed; change the line instead." };
        const next = input.to.trim() ? lines.map((line, i) => (i === at ? input.to.trim() : line)) : lines.filter((_, i) => i !== at);
        return { ok: true, data: { ...data, body: next.join("\n") }, summary: `Changed "${lines[at]}".` };
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
    "Start a progress tracker for the goal in the Notes, with its stages in order, when it has several (settle the guests, plan the menu, shop, prep). Only once; then keep it current with progress_add and progress_check.",
  input: z.object({
    title: z.string().describe("Short: the goal, as in Dinner party"),
    stages: z.array(z.string()).min(2).max(8).describe("Short stage names in the imperative"),
  }),
  rules: ["If the goal has several stages, start a progress tracker for it once (progress_start), early, and keep it current."],
};

export type InPlay = { kind: ShellKind; role: InterfaceRole; label: string };

/** The model's instructions for what's in play: base, then each role present, then each interface's own. */
export function rulesFor(inPlay: InPlay[]): string {
  const roles = [...new Set(inPlay.map((entry) => entry.role))];
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
