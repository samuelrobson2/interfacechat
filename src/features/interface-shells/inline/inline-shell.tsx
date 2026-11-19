import { ArrowUpRight } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { useHiddenParts, useShellVars } from "../design/shell-tokens";
import { SHELL_META } from "../model/shell-meta";
import type { ShellData, ShellKind } from "../model/shell-types";
import { InlineMedium } from "./inline-medium";
import { inlineTitle } from "./inline-summary";

function OpenButton({ label, onOpen, quiet }: { label: string; onOpen: () => void; quiet: boolean }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        // Opening isn't a click into the interface.
        event.stopPropagation();
        onOpen();
      }}
      aria-label={`Open this ${label.toLowerCase()} beside the chat`}
      title="Open beside the chat"
      className={cn(
        "flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 font-bureau text-[12px] text-typography-secondary transition-opacity hover:bg-shell-fill hover:text-typography-primary",
        quiet && "opacity-0 group-hover/inline:opacity-100 focus-visible:opacity-100",
      )}
    >
      Open
      <ArrowUpRight className="size-3.5" />
    </button>
  );
}

/**
 * An interface in a chat reply, as inline medium: its own preview, no box,
 * nothing that says "edit me". Clicking into it selects it: the same design
 * at the same size takes a white background and an outline, so it reads as
 * an interface. What's on screen can be edited where it stands (text takes a
 * caret, ticks and stars can be pressed), and doing so selects it too. Open
 * moves it into its own window, where large lives.
 */
export function InlineShell({
  kind,
  data,
  selected,
  onSelect,
  onChange,
  onOpen,
  className,
}: {
  kind: ShellKind;
  data: ShellData;
  /** Clicked into: drawn as an interface, with Open showing. */
  selected: boolean;
  onSelect?: () => void;
  /** Edits made in the reply. */
  onChange?: (data: ShellData) => void;
  /** Open it: move it into its own window. */
  onOpen?: () => void;
  className?: string;
}) {
  const label = SHELL_META[kind].label;
  const vars = useShellVars("inline");
  const hide = useHiddenParts("inline");
  return (
    <div
      style={vars}
      data-shell-size="inline"
      data-hide-parts={hide}
      role="group"
      aria-label={`${inlineTitle(kind, data)}, ${label}`}
      data-selected={selected || undefined}
      onClick={onSelect}
      // Typing in it, or tabbing to one of its controls, selects it as well.
      onFocusCapture={onSelect}
      className={cn(
        // Same padding either way, so selecting never changes its size.
        "group/inline rounded-[var(--shell-frame-radius,18px)] px-[var(--shell-layout-edge,24px)] py-3 outline-none",
        "transition-[background-color,box-shadow] duration-200 ease-out",
        "hairline [--hairline-radius:var(--shell-frame-radius,18px)] [--hairline-color:var(--color-gray-3)]",
        selected
          ? "bg-background-primary shadow-[0_1px_3px_rgba(26,23,24,0.04),0_8px_24px_rgba(26,23,24,0.05)] [--hairline-opacity:0.3]"
          : "[--hairline-opacity:0]",
        className,
      )}
    >
      <InlineMedium
        kind={kind}
        data={data}
        onChange={onChange}
        selected={selected}
        aside={onOpen && <OpenButton label={label} onOpen={onOpen} quiet={!selected} />}
      />
    </div>
  );
}
