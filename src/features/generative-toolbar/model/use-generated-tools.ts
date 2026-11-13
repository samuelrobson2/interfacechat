import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  generateTools,
  type GeneratedTool,
  type ToolbarDataByKind,
  type ToolbarKind,
  type ToolContext,
} from "./generate-tools";
import { describeChanges, streamToolDiff } from "./toolbar-api";
import { placeOf } from "./tool-places";
import { applyDiff, clearUnpinned, dismissTool, emptyTable, pinTool, visibleTools, type ToolTable } from "./tool-table";
import type { ToolValue } from "./tool-spec";

/** How long the content has to sit still before the toolbar rethinks. The first look goes almost at once. */
const SETTLE_MS = { rules: 500, model: 900, first: 120 } as const;
/** The rules' stand-in for a model round trip. */
const THINK_MS = 700;

export type ToolbarStatus = "generating" | "ready";
/** Where the tools come from: the model, or the hand-written rules that stand in for it. */
export type ToolSource = "model" | "rules";
export type ToolTiming = { ms: number; firstMs: number | null };

/** Each regenerate slides a window along the rules' list, wrapping, so a new mix shows. */
function windowOf<T>(items: T[], size: number, round: number) {
  const start = items.length > size ? (round * size) % items.length : 0;
  return [...items.slice(start), ...items.slice(0, start)].slice(0, size);
}

/** The rules' answer as a table: the person's pinned tools, then the rules' current set. */
function rulesTable<D>(kind: ToolbarKind, table: ToolTable<D>, all: GeneratedTool<D>[], count: number, round: number) {
  const toolbar = all.filter((tool) => placeOf(kind, tool) === "toolbar");
  const beside = all.filter((tool) => placeOf(kind, tool) !== "toolbar");
  let next = emptyTable<D>();
  for (const row of Object.values(table.rows).filter((row) => row.pinned || row.dismissed).sort((a, b) => a.order - b.order)) {
    next = { rows: { ...next.rows, [row.tool.id]: { ...row, order: next.next } }, next: next.next + 1 };
  }
  for (const tool of [...windowOf(toolbar, count, round), ...beside]) next = applyDiff(kind, next, { add: [tool] });
  return next;
}

/**
 * The toolbar's tools for an interface as it is right now. It holds a table
 * of every tool suggested so far (`tool-table.ts`); any change to the content
 * or the selection waits for a pause, then asks for changes to that table,
 * and merges each as it streams in. So tools arrive one by one, a changed tool
 * updates in place, and the rest keep their places.
 *
 * - `pin` marks a tool as the person's once used: the model leaves it alone.
 * - `dismiss` closes a tool for good: the model won't offer it again.
 * - `regenerate` clears every open tool and asks for others.
 * - With `source: "rules"`, or when the model can't be reached, the
 *   hand-written rules fill the table instead, and `error` says why.
 */
export function useGeneratedTools<K extends ToolbarKind>(
  kind: K,
  data: ToolbarDataByKind[K],
  context: ToolContext,
  count: number,
  source: ToolSource = "rules",
) {
  type D = ToolbarDataByKind[K];
  const [table, setTable] = useState<ToolTable<D>>(emptyTable);
  const [status, setStatus] = useState<ToolbarStatus>("generating");
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState<ToolSource>(source);
  const [timing, setTiming] = useState<ToolTiming | null>(null);
  // Bumped by regenerate, so the effect asks again even when nothing else changed.
  const [round, setRound] = useState(0);
  const [avoid, setAvoid] = useState<string[]>([]);
  const selection = context.selection;

  // Read when a call goes out, not a reason to make one.
  const tableRef = useRef(table);
  useEffect(() => {
    tableRef.current = table;
  }, [table]);
  const asked = useRef(false);
  // The data the table was last brought up to date for, so the next call can say what changed.
  const judged = useRef<D | null>(null);

  // The rules' set: instant, and the fallback when the model can't be reached.
  const rules = useMemo(() => generateTools(kind, data, { selection }), [kind, data, selection]);

  useEffect(() => {
    const controller = new AbortController();
    const fallBack = () => {
      setTable((current) => rulesTable(kind, current, rules, count, round));
      setFrom("rules");
      setStatus("ready");
    };
    const delay = source === "rules" ? SETTLE_MS.rules : asked.current ? SETTLE_MS.model : SETTLE_MS.first;
    const timer = window.setTimeout(() => {
      asked.current = true;
      setStatus("generating");
      if (source === "rules") {
        window.setTimeout(() => !controller.signal.aborted && fallBack(), THINK_MS);
        return;
      }
      const changes = judged.current && Object.keys(tableRef.current.rows).length ? describeChanges(judged.current, data) : undefined;
      streamToolDiff(
        kind,
        data,
        { table: tableRef.current, selection, avoid, changes, count, signal: controller.signal },
        {
          onDiff: (diff) => {
            setTable((current) => applyDiff(kind, current, diff));
            setFrom("model");
          },
          onDone: setTiming,
        },
      )
        .then(() => {
          if (controller.signal.aborted) return;
          judged.current = data;
          setError(null);
          setStatus("ready");
        })
        .catch((reason: unknown) => {
          if (controller.signal.aborted) return;
          setError(reason instanceof Error ? reason.message : String(reason));
          // Keep what the model already gave; the rules only fill an empty bar.
          if (Object.keys(tableRef.current.rows).length) setStatus("ready");
          else fallBack();
        });
    }, delay);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
    // `rules` changes with kind, data and selection; avoid only matters with the round that set it.
  }, [rules, source, count, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const regenerate = useCallback(() => {
    const { table: kept, cleared } = clearUnpinned(tableRef.current);
    setTable(kept);
    setAvoid(cleared);
    setRound((value) => value + 1);
  }, []);

  const pin = useCallback((id: string, value?: ToolValue) => setTable((current) => pinTool(current, id, value)), []);
  const dismiss = useCallback((id: string) => setTable((current) => dismissTool(current, id)), []);

  const shown = useMemo(() => visibleTools(kind, table, count), [kind, table, count]);
  return { ...shown, status, from, error, timing, regenerate, pin, dismiss };
}
