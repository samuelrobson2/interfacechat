import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { CONTENT_PANEL } from "../ui/shell-kit";
import { ASSISTANT_SUGGESTIONS, FORMAT_SUGGESTIONS } from "../model/chat-formats";
import { shellId, type ChatShellData, type ShellProps } from "../model/shell-types";
import { ShellAppIcon, ShellGlyph } from "../ui/shell-icons";
import { Bar, AutoTextarea, fieldEvents, isSubmitShortcut, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

function SendButton({ disabled, onPress, className }: { disabled?: boolean; onPress: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label="Send"
      disabled={disabled}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onPress();
      }}
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full bg-background-primary-inverse text-typography-inverse disabled:opacity-30",
        className,
      )}
    >
      <ArrowRight className="size-4" />
    </button>
  );
}

function Bubble({ role, children, className }: { role: "user" | "assistant"; children: React.ReactNode; className?: string }) {
  const user = role === "user";
  return (
    <div className={cn("flex", user ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-[16px] px-3.5 py-2 font-bureau text-[14px] leading-[1.45] text-typography-primary",
          user && "bg-gray-6",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A free-text field that suggests as you type: formats for how the reply is
 * laid out, personas and common tools for who replies. Anything typed stands.
 */
function SuggestField({
  label,
  value,
  placeholder,
  suggestions,
  large,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  suggestions: string[];
  large: boolean;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const typed = value.trim().toLowerCase();
  const matches = suggestions
    .filter((s) => s.toLowerCase() !== typed && (!typed || s.toLowerCase().includes(typed)))
    .slice(0, 4);
  return (
    <div className="relative min-w-0 flex-1">
      <label
        className={cn(
          "flex min-w-0 items-center gap-1.5 rounded-full bg-gray-6 font-bureau",
          large ? "h-8 px-3 text-[13px]" : "h-7 px-2.5 text-[11px]",
        )}
      >
        <span className="shrink-0 text-typography-secondary">{label}</span>
        <input
          value={value}
          placeholder={placeholder}
          aria-label={label}
          readOnly={!onChange}
          autoComplete="off"
          {...fieldEvents}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(event) => {
            stopFieldEvent(event);
            if (event.key === "Escape") setOpen(false);
          }}
          onChange={(event) => {
            onChange?.(event.target.value);
            setOpen(true);
          }}
          className="min-w-0 flex-1 bg-transparent text-typography-primary outline-none placeholder:font-light placeholder:text-typography-secondary"
        />
      </label>
      {open && onChange && matches.length > 0 && (
        <ul
          role="listbox"
          className="absolute top-full left-0 z-20 mt-1 flex min-w-full flex-col rounded-[12px] bg-background-primary p-1 shadow-[0_6px_20px_rgba(26,23,24,0.14)]"
        >
          {matches.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                {...fieldEvents}
                onClick={(event) => {
                  stopFieldEvent(event);
                  onChange(suggestion);
                  setOpen(false);
                }}
                className={cn(
                  "w-full rounded-[8px] px-2.5 py-1 text-left font-bureau text-typography-primary hover:bg-gray-6",
                  large ? "text-[13px]" : "text-[11px]",
                )}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** How the reply is laid out, and who replies (or what it uses). Free text, suggested. */
function Modes({ data, large, update }: { data: ChatShellData; large: boolean; update?: (patch: Partial<ChatShellData>) => void }) {
  return (
    <div className={cn("flex", large ? "gap-2" : "flex-col gap-1.5")}>
      <SuggestField
        label="Format"
        value={data.format ?? ""}
        placeholder="Any"
        suggestions={FORMAT_SUGGESTIONS}
        large={large}
        onChange={update && ((format) => update({ format }))}
      />
      <SuggestField
        label="Assistant"
        value={data.persona ?? ""}
        placeholder="Default"
        suggestions={ASSISTANT_SUGGESTIONS}
        large={large}
        onChange={update && ((persona) => update({ persona }))}
      />
    </div>
  );
}

/**
 * Chat is the conversation itself. On the home it's the card that says
 * "this is just a question"; sent, it becomes an ordinary thread with nothing
 * docked beside it.
 */
export function ChatShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  className,
}: ShellProps<ChatShellData>) {
  const [reply, setReply] = useState("");

  if (size === "small") return <ShellAppIcon kind="chat" className={className} />;

  if (size === "medium") {
    const text = data.messages[0]?.text ?? data.title;
    return (
      <ShellSurface size={size} surface={surface} className={cn("gap-2 p-2.5", className)}>
        <div className="flex items-center gap-1.5">
          <ShellGlyph kind="chat" className="size-3.5" />
          <span className="font-bureau text-[12px] text-typography-primary">Chat</span>
        </div>
        <div className={cn("flex min-h-0 flex-1 flex-col justify-center gap-1.5 p-2", CONTENT_PANEL)}>
          <div className="flex justify-end">
            {/* Medium shows shapes, not words: a message bubble of bars. */}
            <div aria-hidden className="flex w-[70%] flex-col gap-1 rounded-[14px] bg-gray-6 px-2.5 py-2">
              <Bar width="100%" className="h-1.5 bg-gray-3/30" />
              <Bar width="62%" className="h-1.5 bg-gray-3/30" />
            </div>
          </div>
          <div className="mt-auto flex justify-end">
            <SendButton disabled={!text.trim() || !onSubmit} onPress={() => onSubmit?.()} />
          </div>
        </div>
      </ShellSurface>
    );
  }

  const update = onChange ? (patch: Partial<ChatShellData>) => onChange({ ...data, ...patch }) : undefined;

  if (size === "medium-plus") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <div className="flex items-center gap-2 px-4 pt-3.5">
          <ShellGlyph kind="chat" className="size-4" />
          <span className="font-bureau text-[14px] text-typography-primary">Chat</span>
        </div>
        <div className="px-4 pt-2.5">
          <Modes data={data} large={false} update={update} />
        </div>
        <div className={cn("mx-2.5 mt-3 mb-2.5 flex min-h-0 flex-1 flex-col justify-end gap-2 p-3", CONTENT_PANEL)}>
          <div className="flex justify-end">
            <div className="max-w-[90%] rounded-[16px] bg-gray-6 px-3 py-2">
              <AutoTextarea
                value={data.title}
                placeholder="Ask anything"
                aria-label="Message"
                readOnly={!update}
                {...fieldEvents}
                onKeyDown={(event) => {
                  stopFieldEvent(event);
                  if (isSubmitShortcut(event)) onSubmit?.();
                }}
                onChange={(event) => update?.({ title: event.target.value })}
                className="font-bureau text-[13px] leading-[1.4] text-typography-primary placeholder:font-light placeholder:text-typography-secondary"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <SendButton disabled={!data.title.trim() || !onSubmit} onPress={() => onSubmit?.()} />
          </div>
        </div>
      </ShellSurface>
    );
  }

  const send = () => {
    const text = reply.trim();
    if (!text || !update) return;
    update({ messages: [...data.messages, { id: shellId("msg"), role: "user", text }] });
    setReply("");
  };

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 pt-6 pb-3">
        {data.messages.length === 0 ? (
          data.title ? (
            <Bubble role="user">{data.title}</Bubble>
          ) : (
            <p className="m-auto font-bureau text-[14px] font-light text-typography-secondary">Ask anything</p>
          )
        ) : (
          data.messages.map((message) => (
            <Bubble key={message.id} role={message.role}>
              <span className="whitespace-pre-line">{message.text}</span>
            </Bubble>
          ))
        )}
      </div>
      <div className="flex flex-col gap-2 px-6 pb-5">
        <Modes data={data} large update={update} />
        <div className="flex items-end gap-2 rounded-[18px] bg-gray-6 px-4 py-2.5">
          <AutoTextarea
            value={reply}
            placeholder="Reply"
            aria-label="Reply"
            readOnly={!update}
            {...fieldEvents}
            onKeyDown={(event) => {
              stopFieldEvent(event);
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            onChange={(event) => setReply(event.target.value)}
            className="max-h-24 flex-1 font-bureau text-[14px] leading-[1.45] text-typography-primary placeholder:font-light placeholder:text-typography-secondary"
          />
          <SendButton disabled={!reply.trim() || !update} onPress={send} />
        </div>
      </div>
    </ShellSurface>
  );
}
