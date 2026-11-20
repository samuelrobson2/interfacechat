import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { mentionMatches, mentionsIn, SHELL_ACCENT, SHELL_META, ShellGlyph, type ShellKind } from "@/features/interface-shells";
import { cn } from "@/shared/lib/css";

/**
 * Asking for an interface by name in a prompt box: typing "@" lists the
 * interfaces, filtered as you type; picking one puts "@Table" in the text,
 * drawn as the interface's icon and its name in its colour, the way offers are
 * drawn in chat. The chat makes exactly that interface (api/_ai-chat-lab.ts).
 *
 * A textarea can't hold an icon, so the text is drawn again on a layer behind
 * it with the same metrics, the textarea's own text made transparent (its caret
 * stays): the icon sits where the "@" is, so nothing shifts.
 */

/**
 * An "@Name" as it reads anywhere: the icon in place of the "@", then the gap
 * (the space picking one writes), then the name in the interface's colour.
 */
function MentionChip({ kind, gap }: { kind: ShellKind; gap: string }) {
  return (
    <span style={{ color: SHELL_ACCENT[kind].text }}>
      <span className="relative" style={{ color: "transparent" }}>
        @
        <ShellGlyph kind={kind} className="absolute top-1/2 left-1/2 inline-block size-[1em] -translate-x-1/2 -translate-y-1/2" />
      </span>
      {gap}
      {SHELL_META[kind].label}
    </span>
  );
}

/** Text with each "@Name" drawn as its interface: for a sent message, and the prompt box's layer. */
export function MentionText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let at = 0;
  for (const mention of mentionsIn(text)) {
    parts.push(text.slice(at, mention.start));
    parts.push(<MentionChip key={mention.start} kind={mention.kind} gap={text.slice(mention.start + 1, mention.nameAt)} />);
    at = mention.end;
  }
  parts.push(text.slice(at));
  return <>{parts}</>;
}

const MIRRORED = [
  "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontFeatureSettings", "lineHeight", "letterSpacing", "wordSpacing",
  "textTransform", "textIndent", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth",
  "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "boxSizing", "whiteSpace", "overflowWrap", "wordBreak", "tabSize",
] as const;

/** What "@" is being typed just before the caret, if any: its start and the letters after it. */
function typing(value: string, caret: number) {
  const match = /(^|\s)@([A-Za-z]*)$/.exec(value.slice(0, caret));
  return match ? { start: caret - match[2]!.length - 1, query: match[2]! } : null;
}

/**
 * A prompt box that takes "@" mentions. Wraps the box's textarea: give it the
 * text and how to change it, and it hands back the key handler the textarea
 * uses (the list's keys first, then the box's own).
 */
export function MentionField({
  value,
  onValueChange,
  onKeyDown,
  children,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  children: (field: {
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    /** On every change of text or caret: is "@" being typed? */
    onSelect: (event: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  }) => ReactNode;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const textarea = () => host.current?.querySelector("textarea") ?? null;
  const [open, setOpen] = useState<{ start: number; query: string } | null>(null);
  const [index, setIndex] = useState(0);
  const [mirror, setMirror] = useState<{ style: CSSProperties; color: string } | null>(null);
  const [scroll, setScroll] = useState(0);
  const options = open ? mentionMatches(open.query) : [];
  const hasMentions = mentionsIn(value).length > 0;

  // Reads where "@" is being typed, from the caret: on every change and caret move.
  const check = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const field = event.currentTarget;
    const next = typing(field.value, field.selectionStart ?? field.value.length);
    setOpen(next && mentionMatches(next.query).length ? next : null);
    if (!next) setIndex(0);
  };

  // The layer behind the text, measured off the textarea itself so every line wraps in the same place.
  useLayoutEffect(() => {
    const area = textarea();
    if (!area || !host.current) return;
    const measure = () => {
      // Its colour as drawn without the clear text a mention gives it (set below), or the layer would copy "transparent".
      const was = area.style.color;
      area.style.color = "";
      const color = getComputedStyle(area).color;
      area.style.color = was;
      const computed = getComputedStyle(area);
      const style: CSSProperties = Object.fromEntries(MIRRORED.map((key) => [key, computed[key]]));
      const hostBox = host.current!.getBoundingClientRect();
      const box = area.getBoundingClientRect();
      setMirror({
        color,
        style: { ...style, position: "absolute", left: box.left - hostBox.left, top: box.top - hostBox.top, width: box.width, height: box.height, whiteSpace: "pre-wrap", overflowWrap: "break-word", borderColor: "transparent", borderStyle: "solid" },
      });
    };
    // Measured once it's drawn, then whenever its size changes.
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [hasMentions]);

  // With a mention in it, the textarea's own text goes clear: the layer draws it, the caret stays.
  useEffect(() => {
    const field = textarea();
    if (!field || !mirror) return;
    field.style.color = hasMentions ? "transparent" : "";
    field.style.caretColor = hasMentions ? mirror.color : "";
    return () => {
      field.style.color = "";
      field.style.caretColor = "";
    };
  }, [mirror, hasMentions]);

  useEffect(() => {
    const area = textarea();
    if (!area) return;
    const onScroll = () => setScroll(area.scrollTop);
    area.addEventListener("scroll", onScroll);
    return () => area.removeEventListener("scroll", onScroll);
  }, []);

  const pick = (kind: ShellKind, area: HTMLTextAreaElement | null) => {
    if (!area || !open) return;
    const caret = area.selectionStart ?? value.length;
    const word = `@ ${SHELL_META[kind].label} `;
    const next = value.slice(0, open.start) + word + value.slice(caret).replace(/^\s+/, "");
    onValueChange(next);
    setOpen(null);
    setIndex(0);
    const at = open.start + word.length;
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(at, at);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (open && options.length) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setIndex((current) => (current + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        pick(options[Math.min(index, options.length - 1)]!, event.currentTarget);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(null);
        return;
      }
    }
    onKeyDown?.(event);
  };

  return (
    <div ref={host} className={cn("relative min-w-0", className)}>
      {hasMentions && mirror && (
        <div aria-hidden className="pointer-events-none overflow-hidden" style={{ ...mirror.style, color: mirror.color }}>
          <div style={{ transform: `translateY(${-scroll}px)` }}>
            <MentionText text={value} />
            {/* A trailing newline still takes a line, as it does in the textarea. */}
            {value.endsWith("\n") ? " " : null}
          </div>
        </div>
      )}
      {children({ onKeyDown: handleKeyDown, onSelect: check })}
      {open && options.length > 0 && (
        <div
          role="listbox"
          aria-label="Interfaces"
          className="absolute bottom-full left-0 z-50 mb-2 flex min-w-44 flex-col rounded-[12px] bg-background-primary p-1 shadow-[0_6px_20px_rgba(26,23,24,0.14)]"
        >
          {options.map((kind, i) => (
            <button
              key={kind}
              type="button"
              role="option"
              aria-selected={i === index}
              // The textarea keeps focus, so typing carries on.
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setIndex(i)}
              onClick={() => pick(kind, textarea())}
              className={cn("flex cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-left font-bureau text-[13px] text-typography-primary", i === index && "bg-shell-fill")}
            >
              <ShellGlyph kind={kind} className="size-4" />
              {SHELL_META[kind].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
