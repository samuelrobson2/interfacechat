import { useMemo, useRef, useState } from "react";
import {
  AskedFieldsContext,
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
import { useInterfaceGenerative } from "@/features/generative-toolbar";
import { useChatLabSession } from "../model/chat-lab-session";
import { getMessageText, roleOf, useChatLabStore, type ChatLabArtefact } from "../model/chat-lab-store";
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
        const pieces =
          doc.datasets || doc.variables || doc.blocks
            ? { datasets: doc.datasets ?? [], variables: doc.variables ?? [], blocks: doc.blocks ?? [] }
            : undefined;
        updateArtefact(sessionId, { title: doc.title, content: doc.body, ...(pieces ? { pieces } : {}) }, artefact.id);
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
  // The thread around it, for suggestions: the Notes as they are, and the latest messages.
  const threadContext = useChatLabStore((state) => {
    const session = state.sessions[sessionId];
    if (!session) return "";
    const notes = Object.values(session.artefacts).find((entry) => entry.id !== artefact.id && entry.shell?.kind === "notes" && roleOf(entry) === "track");
    const said = session.messages
      .slice(-6)
      .map((message) => `${message.role === "user" ? "They" : "You"}: ${getMessageText(message).slice(0, 500)}`)
      .join("\n");
    return [notes?.shell ? `Notes:\n${(notes.shell.data as { body: string }).body}` : "", said].filter(Boolean).join("\n\n");
  });
  // Fields the latest reply is asking about, unanswered: the interface lights up the controls they fill.
  const askedKey = useChatLabStore((state) => {
    const session = state.sessions[sessionId];
    const last = [...(session?.messages ?? [])].reverse().find((message) => message.role === "assistant");
    const fields = (last?.parts as { type?: string; toolCallId?: string; state?: string; output?: unknown }[] | undefined ?? []).flatMap((part) => {
      if (part.type !== "tool-ask" || part.state !== "output-available" || !part.toolCallId || session?.answers?.[part.toolCallId]) return [];
      const questions = (part.output as { questions?: { for: string; field?: string }[] } | undefined)?.questions ?? [];
      return questions.filter((question) => question.for === artefact.id && question.field).map((question) => question.field!);
    });
    return fields.sort().join("|");
  });
  const asked = useMemo(() => new Set(askedKey ? askedKey.split("|") : []), [askedKey]);
  // Generated tools in the toolbar and beside the parts they act on; not while the model is writing to it,
  // and not on a tracked interface (Notes, the goal's progress): the model keeps those itself.
  const root = useRef<HTMLDivElement>(null);
  const generative = useInterfaceGenerative({
    root,
    kind: view.kind,
    size: size as "medium" | "medium-plus" | "large" | "inline",
    data: view.data,
    onChange: view.onChange,
    enabled: view.status !== "loading" && roleOf(artefact) !== "track",
    // Suggestions in place on every interface, tracked ones too, from the thread around it.
    suggest: view.status !== "loading",
    context: threadContext,
  });
  return (
    <AskedFieldsContext.Provider value={asked}>
    <div ref={root} className="relative size-full">
      <InterfaceShell
        {...({
          kind: view.kind,
          size,
          data: view.data,
          surface: false,
          // The window bar carries the glyph, so the shell leaves its own out.
          mark: false,
          ...(view.status ? { status: view.status } : {}),
          ...(view.onSearch ? { onSearch: view.onSearch } : {}),
          onAsk: view.onAsk,
          ...generative.props,
        } as InterfaceShellProps)}
      />
      {generative.note}
    </div>
    </AskedFieldsContext.Provider>
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
    // Clicking into it is choosing to work on it: back in the model's context if it was closed.
    useChatLabStore.getState().setClosed(sessionId, artefact.id, false);
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
      onOpen={() => flash(openWindow(sessionId, artefact.id))}
      // Its content lines up with the reply's text.
      className="-mx-6"
    />
  );
}
