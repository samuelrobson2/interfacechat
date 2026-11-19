import { useEffect, useState } from "react";
import type { ShellKind, SuggestedGroup, SuggestedValues } from "@/features/interface-shells";

/** Interfaces the suggestion pass has something to offer for (api/_ai-interface-suggest.ts). Not Guide: a recipe or how-to is followed as written, with no suggestions in it. */
export const SUGGESTABLE: ShellKind[] = ["document", "notes", "search", "table", "tracker", "schedule", "generator", "moodboard"];

/** Wait for the interface and the thread to settle before asking again. */
const SETTLE_MS = 1500;

/** Pictures as their name, so a canvas or generator doesn't send bytes. */
const snapshot = (data: unknown) =>
  JSON.parse(JSON.stringify(data, (_key, value: unknown) => (typeof value === "string" && value.startsWith("data:") ? "[image]" : value)));

/**
 * Suggestions for an interface from the model, read off the interface and the
 * thread around it (`context`: the Notes and the latest messages), so they fit
 * this person's plan rather than stock examples. Asked once things settle;
 * a newer change replaces the call. Null until the first answer (or when off).
 */
export function useContextSuggestions({
  kind,
  label,
  data,
  context,
  on,
  dismissed,
}: {
  kind: ShellKind;
  label: string;
  data: unknown;
  context?: string;
  on: boolean;
  dismissed: Partial<Record<SuggestedGroup, string[]>>;
}): SuggestedValues | null {
  const [answer, setAnswer] = useState<{ for: string; suggested: SuggestedValues } | null>(null);
  const active = on && SUGGESTABLE.includes(kind);
  const key = active ? `${kind}|${JSON.stringify(snapshot(data)).length}|${context?.length ?? 0}|${(context ?? "").slice(-200)}` : "";

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch("/api/interface-suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, label, data: snapshot(data), context }),
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { suggested?: SuggestedValues } | null) => {
          if (body?.suggested) setAnswer({ for: key, suggested: body.suggested });
        })
        .catch(() => {});
    }, SETTLE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
    // The key stands for the data and context: a call per settled change, not per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key]);

  if (!active || !answer) return null;
  // One at most, and not what they've dismissed.
  const [first] = Object.entries(answer.suggested).flatMap(([group, list]) =>
    (list ?? []).filter((value) => !dismissed[group as SuggestedGroup]?.includes(typeof value === "string" ? value : value.value)).map((value) => [group, value] as const),
  );
  return first ? ({ [first[0]]: [first[1]] } as SuggestedValues) : {};
}
