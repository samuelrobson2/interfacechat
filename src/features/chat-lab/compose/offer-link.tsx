import type { CSSProperties, ReactNode } from "react";
import { SHELL_ACCENT, ShellGlyph, type ShellKind } from "@/features/interface-shells";

/**
 * Something the assistant offered to make, in its own sentence: the
 * interface's icon beside the words, and a click makes it ("a shot list" →
 * "Make a shot list"). Quiet: the sentence reads the same; on hover the words
 * take the interface's colour (a Table's green) and an underline, so it reads
 * as something to click.
 */
export function OfferLink({ kind, onMake, children }: { kind: ShellKind; onMake: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onMake}
      title="Make this"
      // The accent's text shade: readable on the page (4.5:1, checked in the accessibility test).
      style={{ "--offer": SHELL_ACCENT[kind].text } as CSSProperties}
      className="inline cursor-pointer rounded-[4px] align-baseline text-inherit underline-offset-[3px] outline-none transition-colors hover:text-[color:var(--offer)] hover:underline hover:decoration-[color:var(--offer)]/50 focus-visible:text-[color:var(--offer)] focus-visible:ring-2 focus-visible:ring-shell-suggest/40"
    >
      <ShellGlyph kind={kind} className="mr-1 inline-block size-[1.05em] -translate-y-[0.1em] align-middle" />
      {children}
    </button>
  );
}
