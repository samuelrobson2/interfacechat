import { useEffect, useMemo, useState } from "react";
import type { SuggestionPlace } from "@/features/interface-shells";
import {
  generateTools,
  type GeneratedTool,
  type ToolbarDataByKind,
  type ToolbarKind,
  type ToolContext,
} from "./generate-tools";
import { PER_PLACE, placeOf } from "./tool-places";

/** How long the content has to sit still before the toolbar rethinks. */
const SETTLE_MS = 500;
/** The stand-in for the model's round trip. */
const THINK_MS = 700;

export type ToolbarStatus = "generating" | "ready";

type Placed<D> = Partial<Record<Exclude<SuggestionPlace, "toolbar">, GeneratedTool<D>[]>>;

/** Each regenerate slides a window along the list, wrapping, so a new mix shows. */
function windowOf<T>(items: T[], size: number, round: number) {
  const start = items.length > size ? (round * size) % items.length : 0;
  return [...items.slice(start), ...items.slice(0, start)].slice(0, size);
}

/**
 * The tools for an interface as it is right now: `tools` for the toolbar,
 * and `placed` for the ones that sit beside the part they act on. Any change
 * to the content or the selection waits for a pause, then shows the toolbar
 * thinking before the new set lands — as it would with a model behind it.
 * Regenerate shows the next tools in the list rather than the same ones.
 */
export function useGeneratedTools<K extends ToolbarKind>(
  kind: K,
  data: ToolbarDataByKind[K],
  context: ToolContext,
  count: number,
) {
  type D = ToolbarDataByKind[K];
  const [status, setStatus] = useState<ToolbarStatus>("generating");
  const [landed, setLanded] = useState<{ tools: GeneratedTool<D>[]; placed: Placed<D> }>({ tools: [], placed: {} });
  const [round, setRound] = useState(0);
  const selection = context.selection;

  // What the model would come back with now.
  const next = useMemo(() => {
    const all = generateTools(kind, data, { selection });
    const toolbar: GeneratedTool<D>[] = [];
    const placed: Placed<D> = {};
    for (const tool of all) {
      const place = placeOf(kind, tool);
      if (place === "toolbar") toolbar.push(tool);
      else (placed[place] ??= []).push(tool);
    }
    for (const place of Object.keys(placed) as (keyof Placed<D>)[]) placed[place] = windowOf(placed[place]!, PER_PLACE, round);
    return { tools: windowOf(toolbar, count, round), placed };
  }, [kind, data, selection, count, round]);

  useEffect(() => {
    // While typing, the current tools stay; only once things settle does it think.
    const think = window.setTimeout(() => setStatus("generating"), SETTLE_MS);
    const land = window.setTimeout(() => {
      setLanded(next);
      setStatus("ready");
    }, SETTLE_MS + THINK_MS);
    return () => {
      window.clearTimeout(think);
      window.clearTimeout(land);
    };
  }, [next]);

  return { ...landed, status, regenerate: () => setRound((value) => value + 1) };
}
