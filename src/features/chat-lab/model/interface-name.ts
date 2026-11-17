import { useEffect, useState } from "react";
import type { ChatShellKind } from "@/features/interface-shells";

/**
 * The card names itself from the request at once, without the model
 * (`parsePrompt`). One small call (`/api/interface-title`) runs only when it's
 * needed: to condense a name that came out very long, and for the interfaces
 * made of steps (Guide, Schedule) to write their first few steps, which the
 * card adds one at a time as suggestions. Waits for a pause in typing; a newer
 * request replaces it.
 */
const SETTLE_MS = 900;
const MIN_WORDS = 3;
/** How far apart the steps arrive. */
const STEP_MS = 260;
/** Past this, the rules' name is too long for a title, and the model condenses it. */
const LONG_CHARS = 42;
const LONG_WORDS = 7;
export const tooLongForTitle = (title: string) => title.length > LONG_CHARS || title.trim().split(/\s+/).length > LONG_WORDS;
/** Interfaces that start with steps the model writes. */
const STEPPED: ChatShellKind[] = ["guide", "schedule"];
/** Interfaces whose title is their name (Search's is its query, Chat's the message). */
const NAMED: ChatShellKind[] = ["notes", "document", "table", "schedule", "tracker", "reader", "guide", "generator", "dashboard", "calendar", "moodboard", "chart"];

export function useInterfaceName(kind: ChatShellKind | null, label: string, draft: string, ruleTitle: string) {
  const [named, setNamed] = useState<{ for: string; title?: string; steps: string[] } | null>(null);
  const [shown, setShown] = useState(0);
  const request = draft.trim();
  const long = Boolean(kind && NAMED.includes(kind) && tooLongForTitle(ruleTitle));
  const stepped = Boolean(kind && STEPPED.includes(kind));
  const active = Boolean(kind && (long || stepped) && request.split(/\s+/).length >= MIN_WORDS);

  useEffect(() => {
    if (!active || !kind) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch("/api/interface-title", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, label, prompt: request, want: { title: long, steps: stepped } }),
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { title?: string; steps?: string[] } | null) => {
          if (!body || (!body.title && !body.steps?.length)) return;
          setNamed({ for: `${kind}:${request}`, title: body.title, steps: body.steps ?? [] });
          setShown(0);
        })
        .catch(() => {});
    }, SETTLE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [active, long, stepped, kind, label, request]);

  // The steps arrive one by one.
  const total = named?.steps.length ?? 0;
  useEffect(() => {
    if (shown >= total) return;
    const timer = window.setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [shown, total]);

  // Kept until a new name lands, so the title doesn't flicker back while they type on; dropped with the interface.
  const current = active && named?.for.startsWith(`${kind}:`) ? named : null;
  // The condensed name only stands while the rules' one is still too long.
  return { title: long ? current?.title : undefined, steps: current ? current.steps.slice(0, shown) : [] };
}
