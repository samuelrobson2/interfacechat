import { Check, ChevronDown, Redo2, Undo2 } from "lucide-react";
import { createContext, useContext, useRef, useState } from "react";
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

/**
 * The toolbar every large interface has, under its title: undo and redo, the
 * interface's own standard tools, then the tools generated for what's in it
 * now (drawn by the host, so they can change with the content), then host
 * actions. When the window is narrow the standard tools scroll sideways.
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
      className={cn(
        "flex h-12 shrink-0 items-center gap-0.5 border-b border-gray-3/15 px-4",
        className,
      )}
    >
      <div className="no-scrollbar flex min-w-0 shrink items-center gap-0.5 overflow-x-auto">
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
      </div>
      {tools && (
        <>
          {(children || history) && <ShellToolDivider />}
          <div className="flex min-w-0 flex-1 items-center">{tools}</div>
        </>
      )}
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
  "flex h-8 shrink-0 items-center justify-center rounded-[8px] font-bureau text-[13px] text-typography-secondary transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
  "hover:bg-gray-6 hover:text-typography-primary active:scale-[0.97]",
  "disabled:pointer-events-none disabled:opacity-40",
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
      className={cn(TOOL, "w-8", active && "bg-gray-6 text-typography-primary")}
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
      className={cn(TOOL, "gap-1.5 px-2.5", active && "bg-gray-6 text-typography-primary")}
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
  "flex min-w-[200px] flex-col rounded-[14px] border-[0.5px] border-gray-2 bg-gray-1 p-1.5 shadow-[0_4px_14px_rgba(26,23,24,0.14)]";

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
          className={cn(TOOL, "gap-1 px-2", (open || active) && "bg-gray-6 text-typography-primary")}
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
            if ("divider" in item) return <span key={item.id} aria-hidden className="mx-2 my-1 h-px bg-gray-3/20" />;
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
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-left font-bureau text-[13px] text-typography-primary transition-colors hover:bg-gray-6",
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
          className={cn(TOOL, text ? "gap-1 px-2" : "w-8", open && "bg-gray-6 text-typography-primary")}
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
}: {
  label: string;
  placeholder?: string;
  initial?: string;
  onApply: (value: string) => void;
  apply?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
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
        className="h-8 w-56 min-w-0 rounded-[8px] bg-gray-6 px-2.5 font-bureau text-[13px] text-typography-primary outline-none placeholder:text-typography-secondary"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="h-8 shrink-0 rounded-full bg-gray-5 px-3 font-bureau text-[13px] text-typography-inverse disabled:opacity-40"
      >
        {apply}
      </button>
    </form>
  );
}

export function ShellToolDivider() {
  return <span aria-hidden className="mx-1.5 h-4 w-px shrink-0 bg-gray-3/25" />;
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
