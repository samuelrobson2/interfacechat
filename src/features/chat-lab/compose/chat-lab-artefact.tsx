import { useState } from "react";
import {
  EMPTY_SHELL_DATA,
  InlineShell,
  InlineSmall,
  InterfaceShell,
  serializeMarkdownTable,
  type InterfaceShellProps,
  type SearchShellData,
  type ShellData,
  type ShellKind,
  type TableShellData,
} from "@/features/interface-shells";
import { useChatLabSession } from "../model/chat-lab-session";
import { useChatLabStore, type ChatLabArtefact } from "../model/chat-lab-store";
import {
  artefactLabel,
  artefactOrdinal,
  artefactShellKind,
  flash,
  isWindowOpen,
  markInlineEdited,
  openWindow,
  useChatWorkbenchView,
} from "../model/chat-lab-workbench";
import { artefactDocument, artefactSearch, artefactTable } from "../model/shell-adapters";

type ArtefactView = {
  kind: ShellKind;
  data: ShellData;
  /** The model is writing to it. */
  status?: "loading" | "idle";
  onChange: (data: ShellData) => void;
  onSearch?: (data: ShellData) => void;
  onAsk: (text: string) => void;
};

/**
 * An interface as its shell sees it: the data to draw, and where edits go.
 * A document, search and table are kept as text the model writes; every other
 * kind keeps its shell's own data.
 */
function useArtefactView(sessionId: string, artefact: ChatLabArtefact): ArtefactView {
  const updateArtefact = useChatLabStore((state) => state.updateArtefact);
  const isTarget = useChatLabStore(
    (state) => state.sessions[sessionId]?.turnTarget?.artefactId === artefact.id,
  );
  const { sendText, isGenerating } = useChatLabSession();
  const status = isGenerating && isTarget ? "loading" : "idle";

  // Search: fields typed before the next search; the model's writes (a new
  // query or filters) replace them.
  const [draft, setDraft] = useState(() => ({
    query: artefact.title,
    filters: artefact.filters ?? [],
    queries: [] as string[],
    sources: [] as string[],
    project: undefined as string | undefined,
  }));
  const syncKey = `${artefact.title}|${(artefact.filters ?? []).join(",")}`;
  const [syncedKey, setSyncedKey] = useState(syncKey);
  if (syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setDraft((current) => ({ ...current, query: artefact.title, filters: artefact.filters ?? [] }));
  }

  // Table: a local copy keeps row and column ids stable while editing; the
  // model's writes replace it.
  const [table, setTable] = useState<TableShellData | null>(() =>
    artefact.kind === "table" ? artefactTable(artefact) : null,
  );
  const [syncedContent, setSyncedContent] = useState(artefact.content);
  if (artefact.kind === "table" && artefact.content !== syncedContent) {
    setSyncedContent(artefact.content);
    setTable(artefactTable(artefact));
  }

  // Questions asked in an interface (Reader) are answered in the thread.
  const onAsk = (text: string) => {
    if (!isGenerating) void sendText(text);
  };

  if (artefact.kind === "document") {
    return {
      kind: "document",
      data: artefactDocument(artefact),
      status,
      onChange: (next) => {
        const doc = next as ReturnType<typeof artefactDocument>;
        updateArtefact(sessionId, { title: doc.title, content: doc.body }, artefact.id);
      },
      onAsk,
    };
  }

  if (artefact.kind === "search") {
    return {
      kind: "search",
      data: { ...artefactSearch(artefact, draft.query), ...draft },
      status,
      onChange: (data) => {
        const next = data as SearchShellData;
        setDraft({
          query: next.query,
          filters: next.filters,
          queries: next.queries,
          sources: next.sources ?? [],
          project: next.project,
        });
      },
      onSearch: (data) => {
        const next = data as SearchShellData;
        const q = next.query.trim();
        if (!q || isGenerating) return;
        updateArtefact(sessionId, { title: q, content: "", filters: next.filters }, artefact.id);
        useChatLabStore.getState().focusArtefact(sessionId, artefact.id);
        const lines = [
          next.filters.length > 0 && `Active filters: ${next.filters.join(", ")}`,
          next.queries.length > 0 && `Also search:\n${next.queries.map((item) => `- ${item}`).join("\n")}`,
          next.sources?.length && `Look at these sites first: ${next.sources.join(", ")}`,
        ].filter(Boolean);
        void sendText(`Search the web for: ${q}${lines.length ? `\n\n${lines.join("\n\n")}` : ""}`);
      },
      onAsk,
    };
  }

  if (artefact.kind === "table" && table) {
    return {
      kind: "table",
      data: { ...table, title: table.title || artefact.title },
      status,
      onChange: (data) => {
        const next = data as TableShellData;
        const content = serializeMarkdownTable(next.columns, next.rows);
        setSyncedContent(content);
        setTable(next);
        updateArtefact(sessionId, { title: next.title, content }, artefact.id);
      },
      onAsk,
    };
  }

  if (artefact.kind === "shell" && artefact.shell) {
    const shell = artefact.shell;
    return {
      kind: shell.kind,
      data: shell.data as ShellData,
      status,
      onChange: (data) =>
        updateArtefact(sessionId, { shell: { kind: shell.kind, data } as ChatLabArtefact["shell"] }, artefact.id),
      onAsk,
    };
  }

  // A moodboard from before the library had one: its title is all it kept.
  const kind = artefactShellKind(artefact);
  return {
    kind,
    data: { ...structuredClone(EMPTY_SHELL_DATA[kind]), title: artefact.title } as ShellData,
    onChange: () => {},
    onAsk,
  };
}

/** An interface in its window, at the size the window gives it. */
export function ChatLabArtefactWindow({
  sessionId,
  artefact,
  size,
}: {
  sessionId: string;
  artefact: ChatLabArtefact;
  size: InterfaceShellProps["size"];
}) {
  const view = useArtefactView(sessionId, artefact);
  return (
    <InterfaceShell
      {...({
        kind: view.kind,
        size,
        data: view.data,
        surface: false,
        // The window bar carries the glyph, so the shell leaves its own out.
        mark: false,
        ...(view.status ? { status: view.status } : {}),
        onChange: view.onChange,
        ...(view.onSearch ? { onSearch: view.onSearch } : {}),
        onAsk: view.onAsk,
      } as InterfaceShellProps)}
    />
  );
}

/**
 * An interface in the reply that made it: inline medium, or inline small
 * pointing at its window while that's open.
 */
export function ChatLabArtefactInline({
  sessionId,
  artefact,
}: {
  sessionId: string;
  artefact: ChatLabArtefact;
}) {
  const view = useArtefactView(sessionId, artefact);
  const ordinal = useChatLabStore((state) => artefactOrdinal(state.sessions[sessionId], artefact.id));
  const open = useChatLabStore((state) => isWindowOpen(state.sessions[sessionId]?.layout, artefact.id));
  const selected = useChatWorkbenchView((state) => state.inlineEditing === artefact.id);

  if (open) {
    return (
      <InlineSmall
        kind={view.kind}
        data={view.data}
        ordinal={ordinal}
        action={`Open in ${artefactLabel(artefact)}${ordinal ? ` ${ordinal}` : ""}`}
        onClick={() => {
          useChatLabStore.getState().focusArtefact(sessionId, artefact.id);
          flash(artefact.id);
        }}
      />
    );
  }

  const select = () => {
    markInlineEdited(artefact.id);
    // Clicking into it is choosing to work on it.
    useChatLabStore.getState().focusArtefact(sessionId, artefact.id);
  };

  return (
    <InlineShell
      kind={view.kind}
      data={view.data}
      selected={selected}
      onSelect={select}
      onChange={(data) => {
        view.onChange(data);
        select();
      }}
      onOpen={() => flash(openWindow(sessionId, artefact.id, "support"))}
      // Its content lines up with the reply's text.
      className="-mx-6"
    />
  );
}
