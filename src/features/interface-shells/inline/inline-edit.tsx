import { Check, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";

/**
 * Text in an inline design that can be edited where it stands. It's the same
 * element with the same classes either way, so editing never moves or
 * resizes anything: it just takes a caret. `display` is what shows while not
 * being edited (plain text for markdown), `value` what's edited.
 */
export function InlineText({
  value,
  display,
  onChange,
  placeholder,
  multiline = false,
  className,
}: {
  value: string;
  display?: string;
  /** Omit for plain, read-only text. */
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Enter adds a line instead of finishing. */
  multiline?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);
  const shown = focused ? value : (display ?? value);

  // Uncontrolled while focused, so typing never loses the caret; brought up
  // to date whenever the value changes from elsewhere.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !onChange) return;
    if (node.textContent !== shown) node.textContent = shown;
  }, [shown, onChange]);

  if (!onChange) return <span className={className}>{display ?? value}</span>;

  return (
    <span
      ref={ref}
      role="textbox"
      aria-multiline={multiline || undefined}
      aria-label={placeholder}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={focused}
      data-placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onInput={(event) => onChange(event.currentTarget.textContent ?? "")}
      onKeyDown={(event) => {
        if (event.key === "Escape" || (event.key === "Enter" && !multiline)) {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      className={cn(
        "cursor-text rounded-[3px] outline-none focus:bg-blue-1/40",
        "empty:before:text-typography-secondary empty:before:content-[attr(data-placeholder)]",
        className,
      )}
    />
  );
}

/** A round tick that can be pressed. */
export function InlineToggle({
  done,
  label,
  onToggle,
  className,
  children,
}: {
  done: boolean;
  label: string;
  onToggle?: () => void;
  className?: string;
  /** Shown inside while not done, such as a step's number. */
  children?: React.ReactNode;
}) {
  const classes = cn(
    "grid size-4 shrink-0 place-items-center rounded-full",
    done ? "bg-green-5 text-white" : "border border-gray-3/50",
    className,
  );
  if (!onToggle) {
    return (
      <span aria-hidden className={classes}>
        {done ? <Check className="size-2.5" strokeWidth={3} /> : children}
      </span>
    );
  }
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={label}
      onClick={onToggle}
      className={cn(classes, "cursor-pointer transition-transform active:scale-90", !done && "hover:border-gray-3")}
    >
      {done ? <Check className="size-2.5" strokeWidth={3} /> : children}
    </button>
  );
}

/** The × on a chip that can be removed. Only there while the interface is selected. */
export function InlineRemove({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Remove ${label}`}
      onClick={(event) => {
        event.stopPropagation();
        onRemove();
      }}
      className="-mr-0.5 ml-1 grid size-3.5 cursor-pointer place-items-center rounded-full text-typography-secondary hover:bg-gray-3/20 hover:text-typography-primary"
    >
      <X className="size-2.5" />
    </button>
  );
}
