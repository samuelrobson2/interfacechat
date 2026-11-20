import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { href, Link, useNavigate } from "react-router-dom";

import { MENTIONABLE, SHELL_META, ShellAppIcon, type ShellKind } from "@/features/interface-shells";
import { SearchIcon } from "@/shared/assets/icons/general/Search";
import { cn } from "@/shared/lib/css";
import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";

import { useChatLabStore } from "./model/chat-lab-store";
import { artefactShellKind } from "./model/chat-lab-workbench";
import { chatsPerKind, searchHistory, whenLabel } from "./model/history-search";
import { useInputStore } from "./pharos/chat";

type Mentionable = (typeof MENTIONABLE)[number];

/**
 * New: a request typed, or an interface picked from the list (or both: the
 * request goes with it), and the chat home opens with it in the box, its card
 * open, ready to send.
 */
function NewChat({ onStart }: { onStart: (text: string, kind?: Mentionable) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="black" size="40" radius="rounded" className="gap-1.5 px-4">
          <Plus className="size-4" />
          New
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="flex w-[300px] flex-col gap-2 rounded-[16px] p-2">
        <Input
          variant="plain"
          fill="outlined"
          shape="rounded"
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && text.trim()) onStart(text.trim());
          }}
          placeholder="What do you want to do?"
          aria-label="What do you want to do?"
          wrapperClassName="w-full"
          className="h-10 border-none bg-background-primary [--hairline-color:var(--color-gray-2)] [--hairline-scale:0.5]"
        />
        <p className="px-2 pt-1 font-bureau text-[11px] text-typography-secondary">Or start with</p>
        <ul aria-label="Interfaces" className="flex flex-col">
          {MENTIONABLE.map((kind) => (
            <li key={kind}>
              <button
                type="button"
                onClick={() => onStart(text.trim(), kind)}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left font-bureau text-[13px] text-typography-primary hover:bg-shell-fill focus-visible:bg-shell-fill focus-visible:outline-none"
              >
                <span className="size-6 shrink-0">
                  <ShellAppIcon kind={kind} />
                </span>
                {SHELL_META[kind].label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The Workspace's History, in two even halves. On the left, recent chats,
 * newest first: a search that narrows them as you type, and below it the
 * interfaces they made, as filters. On the right, the interfaces as apps, on
 * their own: open one to start a chat with it. New starts one from either.
 */
function ChatLabHistoryPage() {
  const sessions = useChatLabStore((state) => state.sessions);
  const setMessage = useInputStore((state) => state.setMessage);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ShellKind | null>(null);
  const all = useMemo(() => Object.values(sessions), [sessions]);
  const entries = useMemo(() => searchHistory(all, { query, kind: filter }, artefactShellKind), [all, query, filter]);
  // Filters: only the interfaces some chat made, most used first.
  const filters = useMemo(
    () => (Object.entries(chatsPerKind(all, artefactShellKind)) as [ShellKind, number][]).sort((a, b) => b[1] - a[1]).map(([kind]) => kind),
    [all],
  );

  // The chat home, with the request (and the interface asked for) in its box, its card open.
  const start = (text: string, kind?: Mentionable) => {
    setMessage([kind ? `@ ${SHELL_META[kind].label}` : "", text].filter(Boolean).join(" ") + " ");
    navigate(ROUTES.CHAT_LAB);
  };

  return (
    <main aria-label="History" className="flex h-dvh w-full min-h-0 gap-6 bg-background-primary px-6.5 pt-24 pb-6 max-md:flex-col md:grid md:h-screen md:grid-cols-2 md:px-[var(--sidebar-gutter)] md:pt-[46px]">
      {/* Recent chats: the search, the interface filters, then the list. */}
      <section aria-label="Recent chats" className="flex min-h-0 min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <h1 className="font-bureau text-[20px] text-typography-primary">History</h1>
          <NewChat onStart={start} />
        </div>
        <Input
          variant="plain"
          fill="outlined"
          shape="rounded"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
          wrapperClassName="w-full"
          className="h-10 border-none bg-background-primary [--hairline-color:var(--color-gray-2)] [--hairline-scale:0.5]"
          rightElement={<SearchIcon svgClasses="size-4 shrink-0" pathClasses="stroke-icon-secondary" />}
        />
        {filters.length > 0 && (
          <div role="group" aria-label="Filter by interface" className="flex flex-wrap gap-1.5">
            {filters.map((kind) => {
              const on = filter === kind;
              return (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(on ? null : kind)}
                  className={cn(
                    "flex h-8 cursor-pointer items-center gap-1.5 rounded-full border py-1 pr-3 pl-1.5 font-bureau text-[12px] transition-colors",
                    on ? "border-transparent bg-gray-5 text-white" : "border-shell-line-strong bg-background-primary text-typography-primary hover:bg-shell-fill",
                  )}
                >
                  <span className="size-5">
                    <ShellAppIcon kind={kind} />
                  </span>
                  {SHELL_META[kind].label}
                </button>
              );
            })}
          </div>
        )}
        <ul className="no-scrollbar -mx-1 flex min-h-0 flex-1 flex-col overflow-y-auto">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                to={href(ROUTES.CHAT_LAB_SESSION, { chat_id: entry.id })}
                className="flex flex-col gap-1 rounded-[12px] px-3 py-2.5 transition-colors hover:bg-shell-fill focus-visible:bg-shell-fill focus-visible:outline-none"
              >
                <span className="flex items-baseline gap-3">
                  <span className="min-w-0 flex-1 truncate font-bureau text-[14px] font-semibold text-typography-primary">{entry.title || "Untitled chat"}</span>
                  <span className="shrink-0 font-bureau text-[12px] text-typography-secondary tabular-nums">{whenLabel(entry.updatedAt)}</span>
                </span>
                {entry.match && <span className="line-clamp-2 font-bureau text-[12px] leading-[1.4] text-typography-secondary">{entry.match}</span>}
              </Link>
            </li>
          ))}
          {entries.length === 0 && (
            <li className="px-3 py-6 font-bureau text-[13px] text-typography-secondary">{query || filter ? "No chats match." : "No chats yet."}</li>
          )}
        </ul>
      </section>

      {/* The interfaces, as apps: each starts a chat with it. */}
      <section aria-label="Start with an interface" className="min-h-0 min-w-0 overflow-y-auto rounded-[20px] bg-shell-fill/60 p-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-x-4 gap-y-6">
          {MENTIONABLE.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => start("", kind)}
              aria-label={`Start a chat with ${SHELL_META[kind].label}`}
              className="group flex cursor-pointer flex-col items-center gap-2 rounded-[16px] p-2 outline-none focus-visible:ring-2 focus-visible:ring-shell-suggest/40"
            >
              <span className="size-16 transition-transform group-hover:scale-[1.04] group-active:scale-[0.97]">
                <ShellAppIcon kind={kind} />
              </span>
              <span className="font-bureau text-[13px] text-typography-primary">{SHELL_META[kind].label}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export const Component = ChatLabHistoryPage;
