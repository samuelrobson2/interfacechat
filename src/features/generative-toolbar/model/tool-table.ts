import type { SuggestionPlace } from "@/features/interface-shells";
import type { ToolbarKind } from "./generate-tools";
import { withoutStandard } from "./standard-tools";
import { PER_PLACE, placeOf } from "./tool-places";
import { clampScores, toolScore, type GeneratedTool, type ToolScores, type ToolSpec, type ToolValue } from "./tool-spec";

/**
 * The toolbar's table: every tool suggested for this interface, one row each,
 * by key (the tool's `id`). The model never rebuilds it. Each call it sees the
 * table and answers with changes: tools to add or change, fresh scores for the
 * rest, keys to drop. What shows is worked out here, from the scores, so the
 * toolbar stays calm while the content changes: a re-scored tool can leave the
 * bar, but the ones that stay keep their places.
 *
 * Pinned rows (a tool that's been used) and dismissed rows (one the person
 * closed with ×) are the person's: the model can't change or drop them, and a
 * dismissed tool never shows again. It stays in the table so the model knows
 * not to bring it, or anything like it, back.
 */
export type ToolRow<D> = { tool: GeneratedTool<D>; order: number; pinned: boolean; dismissed?: boolean };
const settled = (row: { pinned: boolean; dismissed?: boolean } | undefined) => !!row && (row.pinned || !!row.dismissed);
export type ToolTable<D> = { rows: Record<string, ToolRow<D>>; next: number };

/** What one call answers with. */
export type ToolDiff = {
  add?: ToolSpec[];
  scores?: ({ id: string } & Partial<ToolScores>)[];
  drop?: string[];
};

/** Below this, a tool isn't worth a place, whatever room there is. */
export const SHOW_AT = 0.12;

export const emptyTable = <D>(): ToolTable<D> => ({ rows: {}, next: 0 });

/** A new tool joins at the end; a changed one keeps its place. Pinned rows don't change. */
export function addTool<D>(kind: ToolbarKind, table: ToolTable<D>, tool: GeneratedTool<D>): ToolTable<D> {
  if (!withoutStandard(kind, [tool]).length) return table;
  const row = table.rows[tool.id];
  if (settled(row)) return table;
  return {
    rows: { ...table.rows, [tool.id]: { tool, order: row?.order ?? table.next, pinned: false } },
    next: row ? table.next : table.next + 1,
  };
}

export function scoreTools<D>(table: ToolTable<D>, scores: NonNullable<ToolDiff["scores"]>): ToolTable<D> {
  const rows = { ...table.rows };
  for (const { id, ...raw } of scores) {
    const row = rows[id];
    if (!row || settled(row)) continue;
    rows[id] = { ...row, tool: { ...row.tool, ...clampScores(raw) } };
  }
  return { ...table, rows };
}

export function dropTools<D>(table: ToolTable<D>, ids: string[]): ToolTable<D> {
  const rows = { ...table.rows };
  for (const id of ids) if (rows[id] && !settled(rows[id])) delete rows[id];
  return { ...table, rows };
}

export function applyDiff<D>(kind: ToolbarKind, table: ToolTable<D>, diff: ToolDiff): ToolTable<D> {
  let next = dropTools(table, diff.drop ?? []);
  next = scoreTools(next, diff.scores ?? []);
  for (const tool of diff.add ?? []) next = addTool(kind, next, tool as GeneratedTool<D>);
  return next;
}

/** A tool once used: it stays, at the value it was used at. */
export function pinTool<D>(table: ToolTable<D>, id: string, value?: ToolValue): ToolTable<D> {
  const row = table.rows[id];
  if (!row) return table;
  const tool = value === undefined || row.tool.type === "action" ? row.tool : ({ ...row.tool, value } as GeneratedTool<D>);
  return { ...table, rows: { ...table.rows, [id]: { ...row, tool, pinned: true } } };
}

/** Closed with ×: it never shows again, and the model won't offer it again. */
export function dismissTool<D>(table: ToolTable<D>, id: string): ToolTable<D> {
  const row = table.rows[id];
  if (!row) return table;
  return { ...table, rows: { ...table.rows, [id]: { ...row, pinned: false, dismissed: true } } };
}

/** Every open row out: what a regenerate clears. Returns their labels, for the model to avoid. */
export function clearUnpinned<D>(table: ToolTable<D>): { table: ToolTable<D>; cleared: string[] } {
  const rows: ToolTable<D>["rows"] = {};
  const cleared: string[] = [];
  for (const [id, row] of Object.entries(table.rows)) {
    if (settled(row)) rows[id] = row;
    else cleared.push(row.tool.label);
  }
  return { table: { ...table, rows }, cleared };
}

export type Placed<D> = Partial<Record<Exclude<SuggestionPlace, "toolbar">, GeneratedTool<D>[]>>;

/**
 * What shows: in each place, pinned tools and then the best-scoring others,
 * up to the room there is, drawn in the order they arrived.
 */
export function visibleTools<D>(kind: ToolbarKind, table: ToolTable<D>, count: number) {
  const byPlace = new Map<SuggestionPlace, ToolRow<D>[]>();
  for (const row of Object.values(table.rows)) {
    if (row.dismissed || (!row.pinned && toolScore(row.tool) < SHOW_AT)) continue;
    const place = placeOf(kind, row.tool);
    byPlace.set(place, [...(byPlace.get(place) ?? []), row]);
  }
  const pick = (rows: ToolRow<D>[], room: number) =>
    [...rows]
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || toolScore(b.tool) - toolScore(a.tool) || a.order - b.order)
      .slice(0, room)
      .sort((a, b) => a.order - b.order)
      .map((row) => row.tool);

  const tools = pick(byPlace.get("toolbar") ?? [], count);
  const placed: Placed<D> = {};
  for (const [place, rows] of byPlace) if (place !== "toolbar") placed[place] = pick(rows, PER_PLACE);
  return { tools, placed };
}

/** The table as the model reads it: enough to judge each row, with the person's marked. */
export function tableForModel<D>(table: ToolTable<D>) {
  return Object.values(table.rows)
    .sort((a, b) => a.order - b.order)
    // `apply` is a function, so it doesn't travel.
    .map(({ tool, pinned, dismissed }) => ({
      ...tool,
      apply: undefined,
      ...(pinned ? { pinned: true } : {}),
      ...(dismissed ? { dismissed: true } : {}),
    }));
}
