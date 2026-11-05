import { useState } from "react";
import { motion } from "motion/react";

import {
  InterfaceShell,
  isChatShellKind,
  serializeMarkdownTable,
  ShellAppIcon,
  type SearchShellData,
  type TableShellData,
} from "@/features/interface-shells";
import { cn } from "@/shared/lib/css";
import { useChatLabSession } from "../model/chat-lab-session";
import {
  getActiveArtefact,
  useChatLabStore,
  type ChatLabArtefact,
  type ChatLabArtefactKind,
} from "../model/chat-lab-store";
import {
  artefactDocument,
  artefactSearch,
  artefactTable,
} from "../model/shell-adapters";
import { MiniMoodboard } from "./mini-interfaces";

const EASE = [0.23, 1, 0.32, 1] as const;
const SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

const PURPLE = "#7c6fda";
const BLUE = "#1a84ae";
const ROSE = "#c87b9a";
const GREEN = "#64b48f";

/** Compact artefact mark for the chat header. Click jumps to its source turn. */
export function ChatLabArtefactBadge({
  kind: storedKind,
  shell,
  title,
  className,
  active = false,
  onClick,
}: {
  kind: ChatLabArtefactKind;
  /** A library interface's own kind, so the badge shows its icon. */
  shell?: ChatLabArtefact["shell"];
  title: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const kind = storedKind === "shell" && shell ? shell.kind : storedKind;
  const shellClass = cn(
    "size-9 shrink-0 rounded-[10px] transition-[box-shadow,opacity]",
    active ? "ring-2 ring-black/15 ring-offset-1" : "opacity-80 hover:opacity-100",
    onClick && "cursor-pointer",
    !isChatShellKind(kind) && "overflow-hidden",
    className,
  );
  const preview = isChatShellKind(kind) ? (
    <ShellAppIcon kind={kind} />
  ) : (
    <div className="size-[148px] origin-top-left scale-[0.243]">
      <MiniMoodboard topic={title} active />
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={shellClass}
        title={title}
        aria-label={`Open ${title}`}
        aria-pressed={active}
        onClick={onClick}
      >
        {preview}
      </button>
    );
  }

  return (
    <div className={shellClass} title={title} aria-hidden>
      {preview}
    </div>
  );
}

function PinIcon({ pinned }: { pinned: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill={pinned ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 1.75c1.1 0 2 .9 2 2v1.2l2.1.7c.4.14.65.55.55.96l-.55 2.2-1.85.7V13.5L8 12.25 5.75 13.5V9.5l-1.85-.7-.55-2.2a.75.75 0 0 1 .55-.96L6 4.95V3.75c0-1.1.9-2 2-2Z"
      />
    </svg>
  );
}

function PinButton({
  pinned,
  onToggle,
  className,
}: {
  pinned: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pinned}
      aria-label={pinned ? "Unpin interface" : "Pin interface"}
      title={pinned ? "Unpin — hide when the chat moves on" : "Pin — keep this open"}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[10px]",
        "text-typography-secondary transition-colors",
        "hover:bg-gray-6 hover:text-typography-primary",
        "active:scale-[0.97]",
        pinned && "bg-gray-6 text-typography-primary",
        className,
      )}
    >
      <PinIcon pinned={pinned} />
    </button>
  );
}

/** Morphing frame only — the shell inside draws the interface. */
function ArtefactShell({
  kind,
  children,
}: {
  /** Matches the home card's layoutId so the card morphs into the panel. */
  kind: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layoutId={`chat-lab-artefact-${kind}`}
      className={cn(
        "relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[20px] bg-background-primary shadow-elevated",
        "hairline [--hairline-radius:20px] [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.35]",
      )}
      transition={SPRING}
    >
      <motion.div
        className="flex min-h-0 flex-1 flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, ease: EASE, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

type PanelProps = {
  sessionId: string;
  artefact: ChatLabArtefact;
  actions: React.ReactNode;
};

/** Any other library interface, at its large size, with edits kept on the artefact. */
function LibraryPanel({ sessionId, artefact, actions }: PanelProps) {
  const updateArtefact = useChatLabStore((state) => state.updateArtefact);
  if (!artefact.shell) return null;
  const shell = artefact.shell;
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="absolute top-3 right-3 z-10">{actions}</div>
      <InterfaceShell
        {...({
          kind: shell.kind,
          size: "large",
          surface: false,
          data: shell.data,
          onChange: (data: unknown) =>
            updateArtefact(sessionId, { shell: { kind: shell.kind, data } as ChatLabArtefact["shell"] }, artefact.id),
        } as Parameters<typeof InterfaceShell>[0])}
      />
    </div>
  );
}

function DocumentPanel({ sessionId, artefact, actions }: PanelProps) {
  const updateArtefact = useChatLabStore((state) => state.updateArtefact);
  const { isGenerating } = useChatLabSession();
  return (
    <InterfaceShell
      kind="document"
      size="large"
      surface={false}
      data={artefactDocument(artefact)}
      status={isGenerating ? "loading" : "idle"}
      actions={actions}
      onChange={(next) =>
        updateArtefact(sessionId, { title: next.title, content: next.body }, artefact.id)
      }
    />
  );
}

function SearchPanel({ sessionId, artefact, actions }: PanelProps) {
  const { sendText, isGenerating } = useChatLabSession();
  const updateArtefact = useChatLabStore((state) => state.updateArtefact);
  // Fields typed into the shell before the next search; the model's writes
  // (a new query or filters) replace them.
  const fromArtefact = () => ({
    query: artefact.title,
    filters: artefact.filters ?? [],
    queries: [] as string[],
    sources: [] as string[],
    project: undefined as string | undefined,
  });
  const [draft, setDraft] = useState(fromArtefact);
  const syncKey = `${artefact.title}|${(artefact.filters ?? []).join(",")}`;
  const [syncedKey, setSyncedKey] = useState(syncKey);
  if (syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setDraft((current) => ({ ...current, query: artefact.title, filters: artefact.filters ?? [] }));
  }

  const data: SearchShellData = { ...artefactSearch(artefact, draft.query), ...draft };

  const runSearch = (next: SearchShellData) => {
    const q = next.query.trim();
    if (!q || isGenerating) return;
    updateArtefact(
      sessionId,
      { title: q, content: "", filters: next.filters },
      artefact.id,
    );
    const lines = [
      next.filters.length > 0 && `Active filters: ${next.filters.join(", ")}`,
      next.queries.length > 0 &&
        `Also search:\n${next.queries.map((item) => `- ${item}`).join("\n")}`,
      next.sources?.length && `Look at these sites first: ${next.sources.join(", ")}`,
    ].filter(Boolean);
    void sendText(`Search the web for: ${q}${lines.length ? `\n\n${lines.join("\n\n")}` : ""}`);
  };

  return (
    <InterfaceShell
      kind="search"
      size="large"
      surface={false}
      data={data}
      status={isGenerating ? "loading" : "idle"}
      actions={actions}
      onChange={(next) =>
        setDraft({
          query: next.query,
          filters: next.filters,
          queries: next.queries,
          sources: next.sources ?? [],
          project: next.project,
        })
      }
      onSearch={runSearch}
    />
  );
}

function TablePanel({ sessionId, artefact, actions }: PanelProps) {
  const updateArtefact = useChatLabStore((state) => state.updateArtefact);
  const { isGenerating } = useChatLabSession();
  // Local copy keeps row and column ids stable while editing; the model's
  // writes replace it.
  const [table, setTable] = useState<TableShellData>(() => artefactTable(artefact));
  const [syncedContent, setSyncedContent] = useState(artefact.content);
  if (artefact.content !== syncedContent) {
    setSyncedContent(artefact.content);
    setTable(artefactTable(artefact));
  }

  return (
    <InterfaceShell
      kind="table"
      size="large"
      surface={false}
      data={{ ...table, title: table.title || artefact.title }}
      status={isGenerating ? "loading" : "idle"}
      actions={actions}
      onChange={(next) => {
        const content = serializeMarkdownTable(next.columns, next.rows);
        setSyncedContent(content);
        setTable(next);
        updateArtefact(sessionId, { title: next.title, content }, artefact.id);
      }}
    />
  );
}

function MoodboardBody({ title }: { title: string }) {
  const palette = [PURPLE, BLUE, ROSE, GREEN, BLUE, PURPLE];

  return (
    <div className="relative min-h-0 flex-1 p-4 md:p-5">
      <div className="grid h-full min-h-[220px] grid-cols-3 grid-rows-3 gap-2 md:gap-3">
        {palette.map((color, i) => (
          <div
            key={i}
            className={cn("rounded-[14px]", i === 0 && "col-span-2 row-span-2")}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      {title.trim() ? (
        <div className="absolute bottom-6 left-6 max-w-[70%] truncate rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-medium shadow-sm">
          {title}
        </div>
      ) : null}
    </div>
  );
}

/** Expanded artefact panel — morphs from the matching shell on the home screen. */
export function ChatLabArtefactPanel({ sessionId }: { sessionId: string }) {
  const artefact = useChatLabStore((state) =>
    getActiveArtefact(state.sessions[sessionId]),
  );
  const setArtefactPinned = useChatLabStore((state) => state.setArtefactPinned);

  if (!artefact) return null;

  const pin = (
    <PinButton
      pinned={artefact.pinned}
      onToggle={() => setArtefactPinned(sessionId, artefact.id, !artefact.pinned)}
    />
  );
  const panel = { sessionId, artefact, actions: pin };

  return (
    <ArtefactShell kind={artefact.kind === "shell" && artefact.shell ? artefact.shell.kind : artefact.kind}>
      {artefact.kind === "shell" && <LibraryPanel key={artefact.id} {...panel} />}
      {artefact.kind === "document" && <DocumentPanel key={artefact.id} {...panel} />}
      {artefact.kind === "search" && <SearchPanel key={artefact.id} {...panel} />}
      {artefact.kind === "table" && <TablePanel key={artefact.id} {...panel} />}
      {artefact.kind === "moodboard" && (
        <>
          <PinButton
            pinned={artefact.pinned}
            onToggle={() => setArtefactPinned(sessionId, artefact.id, !artefact.pinned)}
            className="absolute top-2.5 right-2.5 z-10"
          />
          <MoodboardBody title={artefact.title} />
        </>
      )}
    </ArtefactShell>
  );
}
