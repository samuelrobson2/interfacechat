import { create } from "zustand";
import {
  EMPTY_SHELL_DATA,
  SHELL_META,
  type ChatShellKind,
  type ShellData,
  type ShellKind,
} from "@/features/interface-shells";
import {
  addEntry,
  applyLayoutChange,
  fitsWidth,
  ordinalsOf,
  previewLayoutChange,
  restoreArrangement,
  touchEntry,
  type LayoutChange,
  type LayoutResult,
  type WorkbenchInstance,
  type WorkspaceLayout,
} from "@/features/workbench";
import {
  CHAT_WINDOW,
  listSessionArtefacts,
  seedLayout,
  useChatLabStore,
  type ArtefactShell,
  type ChatLabArtefact,
  type ChatLabArtefactKind,
  type ChatLabSession,
} from "./chat-lab-store";
import { artefactDocument } from "./shell-adapters";

/**
 * A thread as a workbench. Chat is the page; each interface is an artefact,
 * shown inline in the reply that made it until it has a window. A window is a
 * layout entry keyed by the artefact's id, kept with the thread. What's here
 * that isn't kept (undo history, what's selected, what's ringing) is the view.
 */

const HISTORY_LIMIT = 50;
const TOUCH_INTERVAL = 800;
const FLASH_MS = 900;
const PEEK_MS = 6000;

type History = { past: WorkspaceLayout[]; future: WorkspaceLayout[] };

type WorkbenchView = {
  width: number | null;
  history: Record<string, History>;
  /** The inline interface the person clicked into since their last turn. */
  inlineEditing: string | null;
  /** The window ringing for a moment. */
  flashId: string | null;
  /** The latest reply, shown above the input while Chat is minimized. */
  peek: { id: number; sessionId: string; text: string } | null;
};

export const useChatWorkbenchView = create<WorkbenchView>()(() => ({
  width: null,
  history: {},
  inlineEditing: null,
  flashId: null,
  peek: null,
}));

const view = useChatWorkbenchView;
const store = useChatLabStore;

/** The interface an artefact is drawn as. */
export function artefactShellKind(artefact: ChatLabArtefact): ChatShellKind {
  if (artefact.kind === "shell" && artefact.shell) return artefact.shell.kind;
  if (artefact.kind === "shell") return "document";
  return artefact.kind;
}

export function artefactLabel(artefact: ChatLabArtefact) {
  return SHELL_META[artefactShellKind(artefact)].label;
}

export function artefactWindowTitle(artefact: ChatLabArtefact) {
  if (artefact.kind === "document") return artefactDocument(artefact).title || artefact.title;
  return artefact.title;
}

/** Chat, then every interface that has a window or an icon, in the order they were opened. */
export function workbenchInstances(session: ChatLabSession, layout: WorkspaceLayout): WorkbenchInstance[] {
  return [
    { id: CHAT_WINDOW, kind: "chat" as ShellKind },
    ...listSessionArtefacts(session)
      .filter((artefact) => layout.entries[artefact.id])
      .map((artefact) => ({ id: artefact.id, kind: artefactShellKind(artefact) as ShellKind })),
  ];
}

/** Which reply shows which interfaces inline: the last reply of the turn that made them. */
export function inlineArtefactsByMessage(
  session: ChatLabSession | undefined,
  messages: { id: string; role: string }[],
): Record<string, ChatLabArtefact[]> {
  const byMessage: Record<string, ChatLabArtefact[]> = {};
  if (!session) return byMessage;
  for (const artefact of listSessionArtefacts(session)) {
    if (artefact.added || !artefact.sourceUserMessageId) continue;
    const start = messages.findIndex((message) => message.id === artefact.sourceUserMessageId);
    if (start < 0) continue;
    let reply: string | undefined;
    for (let i = start + 1; i < messages.length && messages[i]?.role !== "user"; i++) {
      if (messages[i]?.role === "assistant") reply = messages[i]?.id;
    }
    if (reply) (byMessage[reply] ??= []).push(artefact);
  }
  return byMessage;
}

/** Which one it is, when the thread has several of its kind. */
export function artefactOrdinal(session: ChatLabSession | undefined, artefactId: string) {
  if (!session?.layout) return undefined;
  return ordinalsOf(workbenchInstances(session, session.layout))[artefactId];
}

/** The thread's layout. One from before windows gets its first here. */
export function layoutOf(sessionId: string): WorkspaceLayout | undefined {
  const session = store.getState().sessions[sessionId];
  if (!session) return undefined;
  if (session.layout) return session.layout;
  const layout = seedLayout(session);
  store.getState().setLayout(sessionId, layout);
  return layout;
}

export const isChatMinimized = (sessionId: string) =>
  layoutOf(sessionId)?.entries[CHAT_WINDOW]?.presentation === "minimized";

export const hasWindow = (layout: WorkspaceLayout | undefined, artefactId: string) =>
  !!layout?.entries[artefactId];

export const isWindowOpen = (layout: WorkspaceLayout | undefined, artefactId: string) => {
  const entry = layout?.entries[artefactId];
  return !!entry && entry.presentation !== "minimized";
};

const options = () => {
  const { width } = view.getState();
  return width ? { fits: (layout: WorkspaceLayout) => fitsWidth(layout, width) } : {};
};

/**
 * The model works on the window used last. When that one is put away or
 * deleted, it moves to the open window used most recently; an interface still
 * inline keeps it.
 */
export function settleActive(sessionId: string) {
  const session = store.getState().sessions[sessionId];
  const layout = session?.layout;
  if (!session || !layout) return;
  const active = session.activeArtefactId;
  const entry = active ? layout.entries[active] : undefined;
  if (active && session.artefacts[active] && (!entry || entry.presentation !== "minimized")) return;
  const next = Object.values(layout.entries)
    .filter((item) => item.id !== CHAT_WINDOW && item.presentation !== "minimized" && session.artefacts[item.id])
    .sort((a, b) => b.lastInteraction - a.lastInteraction)[0];
  store.getState().focusArtefact(sessionId, next?.id ?? null);
}

function commit(sessionId: string, before: WorkspaceLayout, result: LayoutResult) {
  if (!result.changed) return;
  view.setState((state) => {
    const history = state.history[sessionId] ?? { past: [], future: [] };
    return {
      history: {
        ...state.history,
        [sessionId]: { past: [...history.past, before].slice(-HISTORY_LIMIT), future: [] },
      },
    };
  });
  store.getState().setLayout(sessionId, result.layout);
  settleActive(sessionId);
}

const UNCHANGED = (layout: WorkspaceLayout): LayoutResult => ({ layout, evicted: [], changed: false });
const EMPTY: WorkspaceLayout = { entries: {}, divider: 0.5 };

export function transact(sessionId: string, change: LayoutChange): LayoutResult {
  const layout = layoutOf(sessionId);
  if (!layout) return UNCHANGED(EMPTY);
  const result = applyLayoutChange(layout, change, Date.now(), options());
  commit(sessionId, layout, result);
  // Bringing an interface back is choosing to work on it.
  if (result.changed && "id" in change && change.id !== CHAT_WINDOW && isWindowOpen(result.layout, change.id)) {
    store.getState().focusArtefact(sessionId, change.id);
  }
  return result;
}

export function preview(sessionId: string, change: LayoutChange): LayoutResult {
  const layout = layoutOf(sessionId);
  return layout ? previewLayoutChange(layout, change, options()) : UNCHANGED(EMPTY);
}

/** Entries deleted since a snapshot stay deleted. */
const withoutDeleted = (snapshot: WorkspaceLayout, current: WorkspaceLayout): WorkspaceLayout => ({
  ...snapshot,
  entries: Object.fromEntries(Object.entries(snapshot.entries).filter(([id]) => current.entries[id])),
});

function step(sessionId: string, direction: "undo" | "redo") {
  const layout = layoutOf(sessionId);
  const history = view.getState().history[sessionId];
  if (!layout || !history) return;
  const target = direction === "undo" ? history.past.at(-1) : history.future[0];
  if (!target) return;
  view.setState((state) => ({
    history: {
      ...state.history,
      [sessionId]:
        direction === "undo"
          ? { past: history.past.slice(0, -1), future: [layout, ...history.future] }
          : { past: [...history.past, layout], future: history.future.slice(1) },
    },
  }));
  store.getState().setLayout(sessionId, restoreArrangement(withoutDeleted(target, layout), layout));
  settleActive(sessionId);
}

export const undo = (sessionId: string) => step(sessionId, "undo");
export const redo = (sessionId: string) => step(sessionId, "redo");

export function setWorkspaceWidth(width: number) {
  if (view.getState().width !== width) view.setState({ width });
}

/** The person did something inside a window: it's the one used last. */
export function touch(sessionId: string, id: string) {
  const layout = layoutOf(sessionId);
  const entry = layout?.entries[id];
  if (!layout || !entry) return;
  if (id !== CHAT_WINDOW) store.getState().focusArtefact(sessionId, id);
  const now = Date.now();
  if (now - entry.lastInteraction < TOUCH_INTERVAL) return;
  store.getState().setLayout(sessionId, touchEntry(layout, id, now));
}

/** Ring a window for a moment, to show where something went. */
export function flash(id: string | undefined) {
  if (!id) return;
  view.setState({ flashId: id });
  window.setTimeout(() => {
    if (view.getState().flashId === id) view.setState({ flashId: null });
  }, FLASH_MS);
}

/**
 * Give an interface its own window, or bring its window back. "open" is large:
 * half the page beside Chat, which is the default. "support" is a medium
 * beside the work.
 */
export function openWindow(sessionId: string, artefactId: string, as: "support" | "open" = "open") {
  const session = store.getState().sessions[sessionId];
  const layout = layoutOf(sessionId);
  if (!session?.artefacts[artefactId] || !layout) return undefined;
  if (view.getState().inlineEditing === artefactId) view.setState({ inlineEditing: null });
  if (isWindowOpen(layout, artefactId)) return artefactId;
  if (!layout.entries[artefactId]) {
    // Created in the strip, then opened: undo puts it back there.
    store.getState().setLayout(sessionId, addEntry(layout, artefactId, false, Date.now()));
  }
  let change: LayoutChange = as === "open" ? { type: "open", id: artefactId } : { type: "support", id: artefactId };
  // Chat is never the one put away to make room for something the model opened.
  if (as === "open" && preview(sessionId, change).evicted.includes(CHAT_WINDOW)) {
    change = { type: "support", id: artefactId };
  }
  transact(sessionId, change);
  return artefactId;
}

/** Delete an interface from the thread: its window, its icon and what it held. */
export function removeWindow(sessionId: string, artefactId: string) {
  if (artefactId === CHAT_WINDOW) return;
  store.getState().deleteArtefact(sessionId, artefactId);
  settleActive(sessionId);
}

const NATIVE: Partial<Record<ShellKind, ChatLabArtefactKind>> = {
  document: "document",
  search: "search",
  table: "table",
};

/** A new, empty interface from the + menu, opened large. */
export function addInterface(sessionId: string, kind: ShellKind) {
  if (kind === "chat") return undefined;
  const native = NATIVE[kind];
  const artefactId = store.getState().createArtefact(sessionId, {
    kind: native ?? "shell",
    title: native ? "" : SHELL_META[kind].label,
    added: true,
    ...(native
      ? {}
      : { shell: { kind, data: structuredClone(EMPTY_SHELL_DATA[kind]) as ShellData } as ArtefactShell }),
  });
  if (!artefactId) return undefined;
  openWindow(sessionId, artefactId, "open");
  flash(artefactId);
  return artefactId;
}

export function markInlineEdited(artefactId: string) {
  if (view.getState().inlineEditing !== artefactId) view.setState({ inlineEditing: artefactId });
}

export function clearInlineEditing() {
  if (view.getState().inlineEditing) view.setState({ inlineEditing: null });
}

/**
 * Before a turn is sent: the inline interface the person has been changing
 * moves into its own window, since they're working on it.
 */
export function settleInlineForTurn(sessionId: string) {
  const edited = view.getState().inlineEditing;
  if (!edited) return;
  view.setState({ inlineEditing: null });
  if (!store.getState().sessions[sessionId]?.artefacts[edited]) return;
  flash(openWindow(sessionId, edited));
  store.getState().focusArtefact(sessionId, edited);
}

/** Show a reply above the input for a few seconds: Chat is minimized, so nobody would see it there. */
export function peekReply(sessionId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const id = Date.now();
  view.setState({ peek: { id, sessionId, text: trimmed } });
  window.setTimeout(() => {
    if (view.getState().peek?.id === id) view.setState({ peek: null });
  }, PEEK_MS);
}

export function clearPeek() {
  if (view.getState().peek) view.setState({ peek: null });
}
