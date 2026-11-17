import { useEffect, useState } from "react";
import type { ChatShellKind } from "@/features/interface-shells";

/**
 * One small call once a request is typed on the chat home (`/api/interface-title`):
 * a short name for the interface it opened, since a request is often a long
 * sentence, and for the interfaces made of steps (Guide, Schedule) their first
 * few steps, which the card adds one at a time as suggestions, so it fills in
 * as you watch. Waits for a pause in typing; a newer request replaces it.
 */
const SETTLE_MS = 900;
const MIN_WORDS = 3;
/** How far apart the steps arrive. */
const STEP_MS = 260;
/** Interfaces whose title is their name (Search's is its query, Chat's the message). */
const NAMED: ChatShellKind[] = ["document", "table", "schedule", "tracker", "reader", "guide", "generator", "dashboard", "calendar", "moodboard", "chart"];

export function useInterfaceName(kind: ChatShellKind | null, label: string, draft: string) {
  const [named, setNamed] = useState<{ for: string; title: string; steps: string[] } | null>(null);
  const [shown, setShown] = useState(0);
  const request = draft.trim();
  const active = Boolean(kind && NAMED.includes(kind) && request.split(/\s+/).length >= MIN_WORDS);

  useEffect(() => {
    if (!active || !kind) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch("/api/interface-title", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, label, prompt: request }),
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { title?: string; steps?: string[] } | null) => {
          if (!body?.title) return;
          setNamed({ for: `${kind}:${request}`, title: body.title, steps: body.steps ?? [] });
          setShown(0);
        })
        .catch(() => {});
    }, SETTLE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [active, kind, label, request]);

  // The steps arrive one by one.
  const total = named?.steps.length ?? 0;
  useEffect(() => {
    if (shown >= total) return;
    const timer = window.setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [shown, total]);

  // Kept until a new name lands, so the title doesn't flicker back while they type on; dropped with the interface.
  const current = active && named?.for.startsWith(`${kind}:`) ? named : null;
  return { title: current?.title, steps: current ? current.steps.slice(0, shown) : [] };
}
