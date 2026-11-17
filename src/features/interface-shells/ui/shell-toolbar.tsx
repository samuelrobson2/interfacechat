import { Check, ChevronDown, Redo2, Undo2 } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/css";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { fieldEvents, stopFieldEvent } from "./shell-surface";

/**
 * Undo and redo for the interface the toolbar belongs to. `InterfaceShell`
 * keeps the history and provides it, so every large interface gets the same
 * two buttons first, the way Docs, Sheets and FigJam all lead with them.
 */
export type ShellHistory = {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export const ShellHistoryContext = createContext<ShellHistory | null>(null);

/** How close to an end of the toolbar the pointer has to be to scroll it, and how fast it goes there. */
const EDGE = 48;
const MAX_SPEED = 9;

/**
 * One row of tools that scrolls when it's longer than the toolbar: moving the
 * pointer towards either end scrolls that way (faster the closer it gets), a
 * fade shows there's more, and a trackpad, wheel or Tab works as usual.
 */
function ToolRow({ children }: { children: React.ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });
  const speed = useRef(0);
  const frame = useRef(0);

  const measure = () => {
    const el = row.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setMore((m) => (m.left === left && m.right === right ? m : { left, right }));
  };
  // Measure on mount, when the row resizes and when its tools change; stop any glide when it goes.
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    measure();
    const resized = new ResizeObserver(measure);
    resized.observe(el);
    const changed = new MutationObserver(measure);
    changed.observe(el, { childList: true, subtree: true });
    return () => {
      resized.disconnect();
      changed.disconnect();
      cancelAnimationFrame(frame.current);
    };
    // measure only reads the row and sets state; it needn't re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glide = () => {
    const el = row.current;
    if (!el || !speed.current) return;
    el.scrollLeft += speed.current;
    frame.current = requestAnimationFrame(glide);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const el = row.current;
    if (!el || event.pointerType === "touch") return;
    const box = el.getBoundingClientRect();
    const fromRight = box.right - event.clientX;
    const fromLeft = event.clientX - box.left;
    const next =
      fromRight < EDGE && more.right ? Math.ceil(((EDGE - fromRight) / EDGE) * MAX_SPEED) : fromLeft < EDGE && more.left ? -Math.ceil(((EDGE - fromLeft) / EDGE) * MAX_SPEED) : 0;
    const was = speed.current;
    speed.current = next;
    if (next && !was) frame.current = requestAnimationFrame(glide);
  };
  const stop = () => {
    speed.current = 0;
    cancelAnimationFrame(frame.current);
  };

  const fade = `linear-gradient(to right, ${more.left ? "transparent, black 32px" : "black"}, ${more.right ? "black calc(100% - 32px), transparent" : "black"})`;
  return (
    <div
      ref={row}
      data-tool-row
      onScroll={measure}
      onPointerMove={onPointerMove}
      onPointerLeave={stop}
      className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      {children}
    </div>
  );
}

/**
 * The toolbar every interface has at medium plus and large, under its title:
 * undo and redo (large), the interface's own standard tools, then the tools
 * generated for what's in it now (drawn by the host, so they can change with
 * the content), all in one row; then host actions. When the row is longer
 * than the toolbar it scrolls (ToolRow), so suggested tools are always there
 * to reach, never folded away in a group.
 */
export function ShellToolbar({
  tools,
  actions,
  className,
  children,
}: {
  /** Generated for this content; the host draws them. */
  tools?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  /** The interface's standard tools. */
  children?: React.ReactNode;
}) {
  const history = useContext(ShellHistoryContext);
  return (
    <div
      role="toolbar"
      data-shell-part="tools"
      className={cn(
        "flex h-[var(--shell-tools-height,48px)] shrink-0 items-center gap-[var(--shell-tools-gap,2px)] border-b border-shell-line px-[var(--shell-tools-padding-x,16px)]",
        className,
      )}
    >
      <ToolRow>
        {history && (
          <>
            <ShellToolButton label="Undo" disabled={!history.canUndo} onPress={history.undo}>
              <Undo2 />
            </ShellToolButton>
            <ShellToolButton label="Redo" disabled={!history.canRedo} onPress={history.redo}>
              <Redo2 />
            </ShellToolButton>
            {children && <ShellToolDivider />}
          </>
        )}
        {children}
        {tools && (
          <>
            {(children || history) && <ShellToolDivider />}
            <div className="flex shrink-0 items-center">{tools}</div>
          </>
        )}
      </ToolRow>
      {actions && <div className="ml-auto flex shrink-0 items-center gap-1 pl-2">{actions}</div>}
    </div>
  );
}

/** Keeps focus, and any text selection, where it was when a tool is pressed. */
const keepFocus = {
  onMouseDown: (event: React.MouseEvent) => {
    event.preventDefault();
    stopFieldEvent(event);
  },
  onPointerDown: stopFieldEvent,
};

const TOOL = cn(
  // Sized from the tokens: the icon plus room around it (32px at large, 30px on a medium plus card).
  "flex h-[calc(var(--shell-tools-icon,16px)+16px)] shrink-0 items-center justify-center rounded-[8px] font-bureau text-[length:var(--shell-tools-font-size,13px)] text-typography-secondary transition-colors [&_svg]:size-[var(--shell-tools-icon,16px)] [&_svg]:shrink-0",
  "enabled:hover:bg-shell-fill enabled:hover:text-typography-primary enabled:active:scale-[0.97]",
  // Disabled tools still take the pointer, so their tooltips show.
  "disabled:cursor-default disabled:opacity-40",
  // Keyboard focus is always visible (WCAG 2.4.7).
  "outline-none focus-visible:ring-2 focus-visible:ring-blue-4/50",
);

/** One standard tool: an icon with its name as the tooltip, as Document's formatting buttons. */
export function ShellToolButton({
  label,
  active,
  disabled,
  onPress,
  children,
}: {
  label: string;
  /** Set for a tool that stays on, such as Bold or Hide done. */
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      {...keepFocus}
      onClick={(event) => {
        stopFieldEvent(event);
        onPress();
      }}
      className={cn(TOOL, "w-[calc(var(--shell-tools-icon,16px)+16px)]", active && "bg-shell-fill text-typography-primary")}
    >
      {children}
    </button>
  );
}

/** A tool named in words, where an app uses words: Calendar's "Today". */
export function ShellToolText({
  label,
  title,
  icon,
  active,
  disabled,
  onPress,
}: {
  label: string;
  /** The tooltip, when it says more than the label. */
  title?: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-pressed={active}
      disabled={disabled}
      {...keepFocus}
      onClick={(event) => {
        stopFieldEvent(event);
        onPress();
      }}
      className={cn(TOOL, "gap-1.5 px-2.5", active && "bg-shell-fill text-typography-primary")}
    >
      {icon}
      {label}
    </button>
  );
}

export type ShellMenuItem =
  | {
      id: string;
      label: string;
      icon?: React.ReactNode;
      /** Shown on the right, such as a shortcut or a count. */
      hint?: string;
      /** For options: a tick marks the current one. */
      checked?: boolean;
      disabled?: boolean;
      onSelect: () => void;
    }
  | { divider: true; id: string }
  | { heading: string; id: string };

const MENU_PANEL =
  "flex min-w-[200px] flex-col rounded-[14px] border-[0.5px] border-shell-line-strong bg-gray-1 p-1.5 shadow-[0_4px_14px_rgba(26,23,24,0.14)]";

/** The trigger for a menu or popover tool: an icon, words or both, then a chevron. */
function TriggerFace({ icon, text, open }: { icon?: React.ReactNode; text?: string; open: boolean }) {
  return (
    <>
      {icon}
      {text && <span className="max-w-[140px] truncate">{text}</span>}
      <ChevronDown className={cn("!size-3 opacity-70 transition-transform", open && "rotate-180")} />
    </>
  );
}

/**
 * A tool that opens a short menu: Docs' style picker, Sheets' sort, Maps'
 * filters. Options with `checked` show a tick; the menu closes on a choice.
 */
export function ShellToolMenu({
  label,
  icon,
  text,
  items,
  disabled,
  active,
  align = "start",
}: {
  label: string;
  icon?: React.ReactNode;
  /** Words on the trigger: the current choice, as "Normal text". */
  text?: string;
  items: ShellMenuItem[];
  disabled?: boolean;
  active?: boolean;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={text ? `${label}: ${text}` : label}
          title={label}
          disabled={disabled}
          {...keepFocus}
          onClick={(event) => {
            stopFieldEvent(event);
            setOpen((value) => !value);
          }}
          className={cn(TOOL, "gap-1 px-2", (open || active) && "bg-shell-fill text-typography-primary")}
        >
          <TriggerFace icon={icon} text={text} open={open} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={6}
        className="w-auto min-w-0 border-0 bg-transparent p-0 shadow-none"
        onOpenAutoFocus={(event) => event.preventDefault()}
        {...fieldEvents}
      >
        <div role="menu" aria-label={label} className={MENU_PANEL}>
          {items.map((item) => {
            if ("divider" in item) return <span key={item.id} aria-hidden className="mx-2 my-1 h-px bg-shell-ink-faint" />;
            if ("heading" in item)
              return (
                <span key={item.id} className="px-2 pt-1.5 pb-1 font-bureau text-[11px] text-typography-secondary">
                  {item.heading}
                </span>
              );
            return (
              <button
                key={item.id}
                type="button"
                role={item.checked === undefined ? "menuitem" : "menuitemradio"}
                aria-checked={item.checked}
                disabled={item.disabled}
                {...keepFocus}
                onClick={(event) => {
                  stopFieldEvent(event);
                  item.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-left font-bureau text-[13px] text-typography-primary transition-colors hover:bg-shell-fill",
                  "disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-typography-secondary",
                )}
              >
                {item.icon}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.hint && <span className="shrink-0 text-[12px] text-typography-secondary">{item.hint}</span>}
                {item.checked !== undefined && <Check className={cn("!text-typography-primary", !item.checked && "invisible")} />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** A tool that opens a small panel of its own: a link field, a colour picker. */
export function ShellToolPopover({
  label,
  icon,
  text,
  disabled,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  text?: string;
  disabled?: boolean;
  /** The panel; `close` shuts it once the tool has done its job. */
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          disabled={disabled}
          {...keepFocus}
          onClick={(event) => {
            stopFieldEvent(event);
            setOpen((value) => !value);
          }}
          className={cn(TOOL, text ? "gap-1 px-2" : "w-[calc(var(--shell-tools-icon,16px)+16px)]", open && "bg-shell-fill text-typography-primary")}
        >
          {text ? <TriggerFace icon={icon} text={text} open={open} /> : icon}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto min-w-0 border-0 bg-transparent p-0 shadow-none"
        {...fieldEvents}
        onKeyDown={stopFieldEvent}
      >
        <div className={cn(MENU_PANEL, "gap-2 p-3")}>{children(() => setOpen(false))}</div>
      </PopoverContent>
    </Popover>
  );
}

/** A tool that asks for files: Upload images, Open a PDF. */
export function ShellToolFile({
  label,
  accept,
  multiple,
  disabled,
  onFiles,
  children,
}: {
  label: string;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <ShellToolButton label={label} disabled={disabled} onPress={() => input.current?.click()}>
        {children}
      </ShellToolButton>
      <input
        ref={input}
        type="file"
        aria-label={label}
        accept={accept}
        multiple={multiple}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </>
  );
}

/** A text field inside a tool's panel, with Enter to apply. */
export function ShellToolField({
  label,
  placeholder,
  initial = "",
  onApply,
  apply = "Apply",
  suggestions,
}: {
  label: string;
  placeholder?: string;
  initial?: string;
  onApply: (value: string) => void;
  apply?: string;
  /** Ready-made values under the field, narrowed as they type: one click applies one. */
  suggestions?: string[];
}) {
  const [value, setValue] = useState(initial);
  const query = value.trim().toLowerCase();
  const offered = (suggestions ?? []).filter((item) => !query || item.toLowerCase().includes(query)).slice(0, 8);
  return (
    <div className="flex flex-col gap-2">
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onApply(value.trim());
      }}
    >
      <input
        autoFocus
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        className="h-8 w-56 min-w-0 rounded-[8px] bg-shell-fill px-2.5 font-bureau text-[13px] text-typography-primary outline-none placeholder:text-typography-secondary"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="h-8 shrink-0 rounded-full bg-gray-5 px-3 font-bureau text-[13px] text-typography-inverse disabled:opacity-40"
      >
        {apply}
      </button>
    </form>
    {offered.length > 0 && (
      <div className="flex max-w-72 flex-wrap gap-1">
        {offered.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onApply(item)}
            className="h-6 cursor-pointer rounded-full bg-shell-fill px-2.5 font-bureau text-[12px] text-typography-primary hover:bg-shell-ink-faint"
          >
            {item}
          </button>
        ))}
      </div>
    )}
    </div>
  );
}

export function ShellToolDivider() {
  return <span aria-hidden className="mx-1.5 h-4 w-px shrink-0 bg-shell-ink-faint" />;
}

/** Save text as a file, the way Download works in Docs or Sheets. */
export function downloadText(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A file name from a title: "The Last Ferry: look" → "the-last-ferry-look". */
export function fileNameOf(title: string, fallback: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return slug || fallback;
}

export const copyText = (text: string) => void navigator.clipboard?.writeText(text);
