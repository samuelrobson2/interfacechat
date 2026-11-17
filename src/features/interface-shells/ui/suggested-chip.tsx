import { Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/css";
import type { Suggestion } from "../model/shell-types";
import { fieldEvents, stopFieldEvent } from "./shell-surface";

/** The AI stroke, as an even 1px ring that never shifts layout. */
export function SuggestedRing({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("gradient-ring bg-gradient-ai-stroke pointer-events-none absolute inset-0 rounded-[inherit] p-px", className)}
    />
  );
}

/**
 * A value the model suggests, sitting among the real ones: the same chip,
 * its words in the suggestion colour, with the AI outline and a plus. Click
 * to add it; × to dismiss it.
 */
export function SuggestedChip({
  label,
  size = "md",
  onAccept,
  onDismiss,
  className,
}: {
  label: string;
  size?: "sm" | "md";
  onAccept?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <span
      data-shell-part="suggest"
      className={cn(
        // The same chip as the real ones beside it (fill, size, shape); its words in violet and the AI outline say it's a suggestion.
        "group/suggested relative inline-flex shrink-0 items-center rounded-full bg-shell-fill font-bureau whitespace-nowrap text-shell-suggest",
        // Inside an interface, the design system's chip size for the size it's drawn at.
        size === "sm"
          ? "h-[var(--shell-suggest-chip-height,24px)] text-[length:var(--shell-suggest-chip-font-size,11px)]"
          : "h-[var(--shell-suggest-chip-height,28px)] text-[length:var(--shell-suggest-chip-font-size,13px)]",
        className,
      )}
    >
      <SuggestedRing />
      <button
        type="button"
        title={`Suggested: add ${label}`}
        aria-label={`Add suggested ${label}`}
        disabled={!onAccept}
        {...fieldEvents}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          stopFieldEvent(event);
          onAccept?.();
        }}
        className={cn("flex h-full items-center gap-1", size === "sm" ? "pl-1.5" : "pl-2", onDismiss ? "pr-0.5" : size === "sm" ? "pr-2" : "pr-2.5")}
      >
        <Plus className={size === "sm" ? "size-3" : "size-3.5"} />
        {label}
      </button>
      {onDismiss && (
        <button
          type="button"
          aria-label={`Dismiss suggested ${label}`}
          title="Dismiss"
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            onDismiss();
          }}
          className={cn(
            "grid place-items-center rounded-full text-typography-secondary opacity-0 transition-opacity group-hover/suggested:opacity-100 hover:text-typography-primary focus-visible:opacity-100",
            size === "sm" ? "mr-1 size-4" : "mr-1.5 size-4",
          )}
        >
          <X className="size-2.5" />
        </button>
      )}
    </span>
  );
}

/**
 * A suggestion inside text (a sentence in a document, a step in a guide): no
 * chip and no button chrome, just the words in the suggestion colour where
 * they'd go, in the type of the text around them. Click (or Enter) adds them.
 * It is a button underneath, so the keyboard and screen readers get it.
 */
export function SuggestedText({
  text,
  onAccept,
  className,
  children,
}: {
  text: string;
  onAccept?: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-shell-part="suggest"
      aria-label={`Suggested: ${text}. Add it`}
      title="Suggested · click to add"
      disabled={!onAccept}
      {...fieldEvents}
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => {
        stopFieldEvent(event);
        onAccept?.();
      }}
      className={cn(
        "-mx-1 block rounded-[6px] px-1 text-left text-shell-suggest transition-colors enabled:cursor-pointer enabled:hover:bg-shell-suggest/8 focus-visible:ring-2 focus-visible:ring-shell-suggest/40 focus-visible:outline-none",
        className,
      )}
    >
      {children ?? text}
    </button>
  );
}

/**
 * The control a suggestion would get once accepted (a checklist's box, a
 * guide's tick), drawn empty with its outline in the suggestion colour.
 */
export function SuggestedBox({ shape = "square", className }: { shape?: "square" | "round"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "shrink-0 border border-shell-suggest bg-shell-panel",
        shape === "round" ? "rounded-full" : "rounded-[4px]",
        className,
      )}
    />
  );
}

/** A dismiss button for a suggestion that's a row or a line: shown on hover or focus. */
export function DismissSuggestion({ label, onDismiss, className }: { label: string; onDismiss: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={`Dismiss suggested ${label}`}
      title="Dismiss"
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onDismiss();
      }}
      className={cn(
        "grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-typography-secondary opacity-0 transition-opacity group-hover/suggested:opacity-100 hover:bg-shell-fill hover:text-typography-primary focus-visible:opacity-100",
        className,
      )}
    >
      <X className="size-3" />
    </button>
  );
}

export type PlacedSuggestion = { value: string; after?: string; group?: string };

/** A suggestion's words. */
export const suggestionText = (suggestion: Suggestion) => (typeof suggestion === "string" ? suggestion : suggestion.value);

/** The suggested values not already present, ignoring case: just their words. */
export function unusedSuggestions(values: Suggestion[] | undefined, present: string[]) {
  return placedSuggestions(values, present).map((suggestion) => suggestion.value);
}

/** The suggestions not already present, with where each one goes. */
export function placedSuggestions(values: Suggestion[] | undefined, present: string[]): PlacedSuggestion[] {
  const have = new Set(present.map((value) => value.trim().toLowerCase()));
  return (values ?? [])
    .map((suggestion) => (typeof suggestion === "string" ? { value: suggestion } : suggestion))
    .filter((suggestion) => suggestion.value.trim() && !have.has(suggestion.value.trim().toLowerCase()));
}

const same = (a: string | undefined, b: string | undefined) => (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

/**
 * Where suggestions go in a list, the rule for every interface: each one after
 * the item it names, in order; one that names no item (or one that isn't
 * there) at the end of its group, or of the list. `anchors` are the list's
 * items' words, in order; `group` narrows it to one section.
 */
export function suggestionsAfter(placed: PlacedSuggestion[], anchors: string[], group?: string) {
  const inGroup = placed.filter((suggestion) => group === undefined || suggestion.group === undefined || same(suggestion.group, group));
  const after = new Map<number, PlacedSuggestion[]>();
  const atEnd: PlacedSuggestion[] = [];
  for (const suggestion of inGroup) {
    const index = suggestion.after === undefined ? -1 : anchors.findIndex((anchor) => same(anchor, suggestion.after) || anchor.trim().toLowerCase().startsWith((suggestion.after ?? "").trim().toLowerCase()));
    if (index >= 0) after.set(index, [...(after.get(index) ?? []), suggestion]);
    else atEnd.push(suggestion);
  }
  return { after: (index: number) => after.get(index) ?? [], atEnd };
}

/**
 * The rule for suggestions inside a field (a column name, a filter, an item):
 * nothing until the person starts typing there, then the suggestions that
 * match what they've typed, best first: a word that starts with it before
 * one that only contains it. An empty field, or one already holding a
 * suggestion exactly, offers nothing.
 */
export function typeahead(suggestions: string[] | undefined, typed: string, limit = 4): string[] {
  const query = typed.trim().toLowerCase();
  if (!query || !suggestions?.length) return [];
  const starts = (text: string) => text.toLowerCase().split(/\s+/).some((word) => word.startsWith(query)) || text.toLowerCase().startsWith(query);
  return suggestions
    .filter((text) => text.toLowerCase() !== query && text.toLowerCase().includes(query))
    .sort((a, b) => Number(starts(b)) - Number(starts(a)))
    .slice(0, limit);
}
