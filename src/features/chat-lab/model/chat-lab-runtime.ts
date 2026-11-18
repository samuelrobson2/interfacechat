import {
  CATALOGUE,
  FILL_TOOL_KIND,
  applyCatalogueOperations,
  assistantInstruction,
  formatInstruction,
  readCatalogueValue,
  applyRoleTool,
  isCatalogueKind,
  PROGRESS_START,
  ROLE_TOOL_OWNER,
  SHELL_META,
  type CatalogueKind,
  type CatalogueOperation,
  type CatalogueValue,
} from "@/features/interface-shells";
import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport, type ChatStatus } from "ai";
import { create } from "zustand";
import {
  artefactCatalogueKind,
  artefactCatalogueValue,
  catalogueArtefactPatch,
  newCatalogueArtefact,
} from "./catalogue-adapters";
import { CHAT_LAB_API } from "./chat-lab-api";
import { agentActivity, type AgentActivity } from "./agent-activity";
import {
  getActiveArtefact,
  findLatestMessage,
  getMessageText,
  roleOf,
  useChatLabStore,
  type ChatLabArtefactKind,
  type ChatLabMessage,
} from "./chat-lab-store";
import { flash, hasWindow, isChatMinimized, isWindowOpen, layoutOf, openWindow, peekReply, settleActive } from "./chat-lab-workbench";
import {
  matchVisualInterface,
  opensAsOf,
  resolveImplementableKind,
  retrieveInterfaces,
  type VisualInterfaceKind,
} from "./visual-interfaces";

type ChatLabActivityState = {
  status: Record<string, ChatStatus>;
  /** Live activity for a thread, so Recents can preview the same island. */
  activity: Record<string, AgentActivity | undefined>;
  /** Threads that finished a reply while you were looking at another one. */
  unread: Record<string, true>;
  viewingId: string | null;
  setViewing: (id: string | null) => void;
};

/** What every thread is doing, so the threads bubble can show it. */
export const useChatLabActivity = create<ChatLabActivityState>()((set) => ({
  status: {},
  activity: {},
  unread: {},
  viewingId: null,
  setViewing: (id) =>
    set((state) => {
      if (!id || !state.unread[id]) return { viewingId: id };
      const unread = { ...state.unread };
      delete unread[id];
      return { viewingId: id, unread };
    }),
}));

// Chats live outside React so a reply keeps streaming after you switch threads.
const chats = new Map<string, Chat<ChatLabMessage>>();

type InterfaceToolInput = {
  title?: string;
  content?: string;
  filters?: string[];
};

function sameFilters(a: string[] | undefined, b: string[] | undefined) {
  const left = a ?? [];
  const right = b ?? [];
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function readInterfaceToolInput(
  part: ChatLabMessage["parts"][number],
): InterfaceToolInput | null {
  const typed = part as {
    type?: string;
    toolName?: string;
    state?: string;
    input?: InterfaceToolInput;
  };
  const isWrite =
    typed.type === "tool-write_interface" ||
    typed.type === "tool-write_document" ||
    (typed.type === "dynamic-tool" &&
      (typed.toolName === "write_interface" ||
        typed.toolName === "write_document"));
  if (!isWrite) return null;
  if (
    typed.state !== "input-available" &&
    typed.state !== "output-available" &&
    typed.state !== "output-error"
  ) {
    return null;
  }
  if (!typed.input?.content && !typed.input?.filters) return null;
  return typed.input ?? null;
}

type OpenInterfaceToolInput = {
  id?: string;
  title?: string;
  opensAs?: ChatLabArtefactKind;
};

function readOpenInterfaceToolInput(
  part: ChatLabMessage["parts"][number],
): OpenInterfaceToolInput | null {
  const typed = part as {
    type?: string;
    toolName?: string;
    state?: string;
    input?: OpenInterfaceToolInput;
    output?: { opensAs?: ChatLabArtefactKind; id?: string; title?: string };
  };
  const isOpen =
    typed.type === "tool-open_interface" ||
    (typed.type === "dynamic-tool" && typed.toolName === "open_interface");
  if (!isOpen) return null;
  if (
    typed.state !== "input-available" &&
    typed.state !== "output-available" &&
    typed.state !== "output-error"
  ) {
    return null;
  }
  return {
    id: typed.input?.id ?? typed.output?.id,
    title: typed.input?.title ?? typed.output?.title,
    opensAs: typed.output?.opensAs,
  };
}

/** The turn in flight: the latest user message and the assistant messages after it. */
function currentTurn(messages: ChatLabMessage[]) {
  const index = messages.map((message) => message.role).lastIndexOf("user");
  return {
    userMessageId: index >= 0 ? messages[index]?.id : undefined,
    replies: messages.slice(index + 1).filter((message) => message.role === "assistant"),
  };
}

/**
 * Open the interface the model chose from retrieved candidates. It shows inline
 * in the reply; with Chat minimized nobody would see it there, so it opens
 * beside the work.
 */
function syncOpenInterface(id: string, messages: ChatLabMessage[]) {
  const { userMessageId, replies } = currentTurn(messages);
  if (!userMessageId) return;

  for (const message of replies) {
    for (const part of message.parts) {
      const input = readOpenInterfaceToolInput(part);
      if (!input?.id) continue;

      const libraryKind = input.id as VisualInterfaceKind;
      const opensAs = opensAsOf(libraryKind);
      const title = input.title?.trim() || libraryKind;
      // A tracker, dashboard, guide, schedule or generator is a library interface holding its own data.
      const tracker = opensAs !== "document" && opensAs !== "table" && isCatalogueKind(opensAs) ? newCatalogueArtefact(opensAs, title) : null;
      const kind = tracker?.kind ?? input.opensAs ?? resolveImplementableKind(libraryKind);

      // One per turn and kind.
      const session = useChatLabStore.getState().sessions[id];
      const already = Object.values(session?.artefacts ?? {}).some(
        (artefact) =>
          artefact.sourceUserMessageId === userMessageId &&
          (artefact.libraryKind === libraryKind || artefact.kind === kind),
      );
      if (already) continue;

      const artefactId = useChatLabStore.getState().createArtefact(id, {
        kind,
        title,
        sourceUserMessageId: userMessageId,
        libraryKind,
        ...(tracker?.shell ? { shell: tracker.shell } : {}),
      });
      if (!artefactId) continue;
      useChatLabStore.getState().setTurnTarget(id, userMessageId, artefactId);
      if (isChatMinimized(id)) flash(openWindow(id, artefactId, "support"));
    }
  }
}

/** Past this length, a document being written gets a window of its own. */
const DOCUMENT_WINDOW_CHARS = 900;

// The last write applied per thread, so a later edit by hand isn't written over.
const applied = new Map<string, string>();

/** The interface this turn writes to: the one opened in it, or the one in use when it began. */
function turnTarget(id: string, userMessageId: string) {
  const session = useChatLabStore.getState().sessions[id];
  if (!session) return undefined;
  const locked = session.turnTarget;
  if (locked?.userMessageId === userMessageId && session.artefacts[locked.artefactId]) {
    return session.artefacts[locked.artefactId];
  }
  const active = getActiveArtefact(session);
  if (active) useChatLabStore.getState().setTurnTarget(id, userMessageId, active.id);
  return active ?? undefined;
}

type ToolPart = {
  type?: string;
  toolName?: string;
  toolCallId?: string;
  state?: string;
  input?: unknown;
  output?: unknown;
};

function toolNameOf(part: ToolPart) {
  if (part.type === "dynamic-tool") return part.toolName ?? null;
  return part.type?.startsWith("tool-") ? part.type.slice(5) : null;
}

/** How often a fill that's still streaming is drawn. The finished one always is. */
const STREAM_FILL_MS = 60;

// What's been applied of each tool call, so nothing is applied twice.
const appliedCalls = new Map<string, string>();
const lastStreamedAt = new Map<string, number>();

/**
 * The interface a fill goes into: the one this turn is working on if it is that
 * kind, or a new one. So the model can fill an interface without opening it first.
 */
function catalogueTarget(id: string, userMessageId: string, kind: CatalogueKind, title: string) {
  const store = useChatLabStore.getState();
  const session = store.sessions[id];
  if (!session) return undefined;
  const locked = session.turnTarget?.userMessageId === userMessageId ? session.artefacts[session.turnTarget.artefactId] : undefined;
  if (locked && artefactCatalogueKind(locked) === kind) return locked;

  const made = Object.values(session.artefacts).find(
    (artefact) => artefact.sourceUserMessageId === userMessageId && artefactCatalogueKind(artefact) === kind,
  );
  const artefactId =
    made?.id ??
    store.createArtefact(id, {
      ...newCatalogueArtefact(kind, title),
      title: title || CATALOGUE[kind].label,
      sourceUserMessageId: userMessageId,
    });
  if (!artefactId) return undefined;
  store.setTurnTarget(id, userMessageId, artefactId);
  if (!made && isChatMinimized(id)) flash(openWindow(id, artefactId, "support"));
  return useChatLabStore.getState().sessions[id]?.artefacts[artefactId];
}

/** Write a catalogue value into its interface, and give it a window when it wants one. */
function applyCatalogueValue(id: string, artefactId: string, value: CatalogueValue) {
  const artefact = useChatLabStore.getState().sessions[id]?.artefacts[artefactId];
  const patch = artefact && catalogueArtefactPatch(artefact, value);
  if (!artefact || !patch) return;
  useChatLabStore.getState().updateArtefact(id, patch, artefactId);

  // Short results stay in the reply. A full document, or one asked for as a window, opens.
  const long = "body" in value && value.body.trim().length >= DOCUMENT_WINDOW_CHARS;
  if ((long || value.placement === "window") && !hasWindow(layoutOf(id), artefactId)) {
    flash(openWindow(id, artefactId, "open"));
  }
}

/**
 * This turn's catalogue tool calls, in order. A fill is drawn as it streams:
 * the tool's input arrives as partial JSON, and whatever is usable so far goes
 * into the interface. update_interface applies once the server has checked it.
 */
function syncCatalogue(id: string, userMessageId: string, replies: ChatLabMessage[]) {
  for (const message of replies) {
    for (const part of message.parts as ToolPart[]) {
      const name = toolNameOf(part);
      const callId = part.toolCallId;
      if (!name || !callId || appliedCalls.get(callId) === "done") continue;

      const kind = FILL_TOOL_KIND[name];
      if (kind) {
        const value = readCatalogueValue(kind, part.input);
        if (!value) continue;
        const streaming = part.state === "input-streaming";
        const signature = streaming ? `partial:${JSON.stringify(value).length}` : "done";
        if (appliedCalls.get(callId) === signature) continue;
        const now = Date.now();
        if (streaming && now - (lastStreamedAt.get(id) ?? 0) < STREAM_FILL_MS) continue;

        // A fill that names an open interface writes over it; otherwise the turn's, or a new one.
        const named = (part.input as { id?: unknown } | undefined)?.id;
        const byId = typeof named === "string" ? useChatLabStore.getState().sessions[id]?.artefacts[named] : undefined;
        const target = byId && artefactCatalogueKind(byId) === kind ? byId : catalogueTarget(id, userMessageId, kind, value.title);
        if (!target) continue;
        lastStreamedAt.set(id, now);
        appliedCalls.set(callId, signature);
        applyCatalogueValue(id, target.id, value);
        continue;
      }

      if (name !== "update_interface" || part.state !== "output-available") continue;
      appliedCalls.set(callId, "done");
      if (!(part.output as { ok?: boolean } | undefined)?.ok) continue;
      // The interface it names, or the one the turn is working on.
      const named = (part.input as { id?: unknown } | undefined)?.id;
      const target = (typeof named === "string" ? useChatLabStore.getState().sessions[id]?.artefacts[named] : undefined) ?? turnTarget(id, userMessageId);
      const targetKind = target && artefactCatalogueKind(target);
      const current = target && artefactCatalogueValue(target);
      const operations = (part.input as { operations?: CatalogueOperation[] } | undefined)?.operations;
      if (!target || !targetKind || !current || !operations) continue;
      const result = applyCatalogueOperations(targetKind, current, operations);
      if (result.ok) applyCatalogueValue(id, target.id, result.value);
    }
  }
}

/** How many recent turns an interface still in its reply (no window) counts as in use. */
const RECENT_TURNS = 4;

/**
 * Whether an interface is in use, and so in the model's context: not closed,
 * and either in a window (showing or minimized) or in one of the last few
 * replies. Closing is the only thing that takes one out, until it's opened again.
 */
function inUse(sessionId: string, artefactId: string) {
  const session = useChatLabStore.getState().sessions[sessionId];
  const artefact = session?.artefacts[artefactId];
  if (!session || !artefact || session.closed?.includes(artefactId)) return false;
  if (session.layout?.entries[artefactId]) return true;
  const recent = session.messages.filter((message) => message.role === "user").slice(-RECENT_TURNS).map((message) => message.id);
  // Made this turn (not yet bound to a message) or in one of the last few.
  return !artefact.sourceUserMessageId || recent.includes(artefact.sourceUserMessageId) || artefact.id === session.activeArtefactId;
}

/** The thread's tracked interfaces (Notes, a progress tracker): what the model keeps current every turn, unless closed. */
function trackedArtefacts(sessionId: string) {
  const session = useChatLabStore.getState().sessions[sessionId];
  return Object.values(session?.artefacts ?? {}).filter(
    (artefact) => artefact.kind === "shell" && artefact.shell && roleOf(artefact) === "track" && !session?.closed?.includes(artefact.id),
  );
}

function trackedForRequest(sessionId: string) {
  const tracked = trackedArtefacts(sessionId);
  if (!tracked.length) return undefined;
  return tracked.map((artefact) => ({
    id: artefact.id,
    kind: artefact.shell!.kind,
    role: "track" as const,
    label: SHELL_META[artefact.shell!.kind].label,
    title: artefact.title,
    data: artefact.shell!.data,
  }));
}

/**
 * This turn's calls to tracked interfaces' tools, applied once the server has
 * run them: the same `apply` it ran, on the interface as it is here. A
 * progress tracker the model starts is made here, docked beside the chat.
 */
function syncTracked(id: string, userMessageId: string, replies: ChatLabMessage[]) {
  for (const message of replies) {
    for (const part of message.parts as ToolPart[]) {
      const name = toolNameOf(part);
      const callId = part.toolCallId;
      if (!name || !callId || part.state !== "output-available" || appliedCalls.get(callId) === "done") continue;
      if (name !== PROGRESS_START.name && !ROLE_TOOL_OWNER[name]) continue;
      appliedCalls.set(callId, "done");
      if (!(part.output as { ok?: boolean } | undefined)?.ok) continue;
      const store = useChatLabStore.getState();

      if (name === PROGRESS_START.name) {
        if (trackedArtefacts(id).some((artefact) => artefact.shell?.kind === "tracker")) continue;
        const input = part.input as { title?: string; stages?: string[] };
        const title = input.title?.trim() || "Progress";
        const items = (input.stages ?? []).map((label, i) => ({ id: `stage-${i}`, label, done: false }));
        const artefactId = store.createArtefact(id, {
          kind: "shell",
          title,
          role: "track",
          sourceUserMessageId: userMessageId,
          shell: { kind: "tracker", data: { title, groups: [], items } },
        });
        if (artefactId) flash(openWindow(id, artefactId, "support"));
        continue;
      }

      const owner = ROLE_TOOL_OWNER[name]!;
      const target = trackedArtefacts(id).find((artefact) => artefact.shell?.kind === owner.kind);
      if (!target?.shell) continue;
      const result = applyRoleTool(name, target.shell.data, part.input);
      if (!result.ok) continue;
      store.updateArtefact(id, { shell: { kind: owner.kind, data: result.data } as typeof target.shell }, target.id);
      flash(target.id);
    }
  }
}

/**
 * Status is the system's to keep, not the model's to remember: once a turn
 * finishes, everything it made is ticked off in the thread's Notes, as
 * "[x] Dinner party menu (Document)", unless the notes already say so.
 */
function noteWhatWasMade(id: string, messages: ChatLabMessage[]) {
  const { userMessageId } = currentTurn(messages);
  const session = useChatLabStore.getState().sessions[id];
  const notes = trackedArtefacts(id).find((artefact) => artefact.shell?.kind === "notes");
  if (!userMessageId || !session || !notes?.shell) return;
  const made = Object.values(session.artefacts).filter((artefact) => artefact.sourceUserMessageId === userMessageId && roleOf(artefact) === "make");
  const lines = made.map((artefact) => {
    const label = artefact.shell ? SHELL_META[artefact.shell.kind].label : SHELL_META[artefact.kind === "shell" ? "document" : artefact.kind].label;
    return `[x] ${artefact.title} (${label})`;
  });
  const body = (notes.shell.data as { body: string }).body;
  const missing = lines.filter((line) => !body.toLowerCase().includes(line.slice(4, line.lastIndexOf(" (")).toLowerCase()));
  if (!missing.length) return;
  const result = applyRoleTool("notes_add", notes.shell.data, { lines: missing });
  if (!result.ok) return;
  useChatLabStore.getState().updateArtefact(id, { shell: { kind: "notes", data: result.data } as typeof notes.shell }, notes.id);
}

/** Pull this turn's tool calls into the interface it's working on. */
function syncArtefact(id: string, messages: ChatLabMessage[]) {
  syncOpenInterface(id, messages);

  const { userMessageId, replies } = currentTurn(messages);
  if (!userMessageId) return;

  syncCatalogue(id, userMessageId, replies);
  syncTracked(id, userMessageId, replies);

  let input: InterfaceToolInput | null = null;
  for (const message of replies) {
    for (const part of message.parts) input = readInterfaceToolInput(part) ?? input;
  }
  if (!input) return;

  const target = turnTarget(id, userMessageId);
  // A library interface keeps its own data; the model doesn't write to it.
  if (!target || target.kind === "shell") return;

  const key = `${userMessageId}|${target.id}|${input.title ?? ""}|${(input.filters ?? []).join(",")}|${input.content ?? ""}`;
  if (applied.get(id) === key) return;
  applied.set(id, key);

  const same =
    (input.content === undefined || target.content === input.content) &&
    (!input.title || target.title === input.title) &&
    (input.filters === undefined || sameFilters(target.filters, input.filters));
  if (!same) {
    useChatLabStore.getState().updateArtefact(
      id,
      { title: input.title, content: input.content, filters: input.filters },
      target.id,
    );
  }

  // Short results stay in the reply. A full document opens as a window.
  const layout = layoutOf(id);
  if (
    target.kind === "document" &&
    !hasWindow(layout, target.id) &&
    (input.content ?? "").trim().length >= DOCUMENT_WINDOW_CHARS
  ) {
    flash(openWindow(id, target.id, "open"));
  }
}

/** Past this, the model isn't sent an interface's contents, and rewrites rather than patches. */
const CATALOGUE_SNAPSHOT_CHARS = 200_000;

/**
 * What the model is told is open. It works on the interface used last, unless
 * the person is plainly asking for a different kind: then it picks a new one.
 */
function artefactContextForRequest(sessionId: string, messages: ChatLabMessage[]) {
  const session = useChatLabStore.getState().sessions[sessionId];
  const active = getActiveArtefact(session);
  // A tracked interface isn't what's being made: it goes with every turn on its own (trackedForRequest).
  // A closed one is out of context altogether.
  if (!active || roleOf(active) === "track" || !inUse(sessionId, active.id)) return undefined;

  const users = messages.filter((message) => message.role === "user");
  const lastUser = users.at(-1);
  if (lastUser && users.length > 1) {
    const asked = matchVisualInterface(getMessageText(lastUser));
    const showing = active.libraryKind ?? active.shell?.kind ?? active.kind;
    // What it would open as, against what's open: a recipe asked for while a menu (a document) is open is a different kind.
    const opens = asked ? opensAsOf(asked) : null;
    const sameKind = opens === (artefactCatalogueKind(active) ?? active.shell?.kind ?? active.kind);
    if (asked && asked !== showing && !sameKind) return undefined;
  }

  // A catalogue interface: the model fills it, and reads what's in it to change part of it.
  const catalogueKind = artefactCatalogueKind(active);
  if (catalogueKind) {
    const value = JSON.stringify(artefactCatalogueValue(active));
    return {
      id: active.id,
      kind: catalogueKind,
      title: active.title,
      ...(value.length <= CATALOGUE_SNAPSHOT_CHARS ? { value } : {}),
    };
  }

  // A library interface: tell the model what's open and what's in it, briefly.
  if (active.kind === "shell" && active.shell) {
    return {
      id: active.id,
      kind: "shell" as const,
      title: active.title,
      label: SHELL_META[active.shell.kind].label,
      // Embedded pictures (a Generator's references and variations) are bytes, not words: name them instead.
      snapshot: JSON.stringify(active.shell.data, (_key, value: unknown) =>
        typeof value === "string" && value.startsWith("data:") ? "[image]" : value,
      ).slice(0, 2000),
    };
  }
  if (active.kind === "shell") return undefined;

  return {
    id: active.id,
    kind: active.kind,
    title: active.title,
    filters: active.filters ?? [],
    // Search results and canvas notes, as they are now: the history keeps no versions.
    ...(active.content ? { content: active.content.slice(0, 20_000) } : {}),
  };
}

/** How many other interfaces the model sees at once: the newest, windows first. */
const IN_VIEW = 6;

/**
 * Every other interface in use, so the model sees them all, not just the one
 * used last: each with its id and what it holds now (its latest version
 * only), whether it's in a window or in a recent reply. Windows come first,
 * then the newest. Closed ones are left out; tracked ones go on
 * their own (trackedForRequest).
 */
function openForRequest(sessionId: string, focusedId: string | undefined) {
  const session = useChatLabStore.getState().sessions[sessionId];
  if (!session) return undefined;
  const order = Object.keys(session.artefacts);
  const open = Object.values(session.artefacts)
    .filter((artefact) => artefact.id !== focusedId && roleOf(artefact) !== "track" && inUse(sessionId, artefact.id))
    .sort((a, b) => Number(isWindowOpen(session.layout, b.id)) - Number(isWindowOpen(session.layout, a.id)) || order.indexOf(b.id) - order.indexOf(a.id))
    .slice(0, IN_VIEW);
  if (!open.length) return undefined;
  return open.map((artefact) => {
    const kind = artefactCatalogueKind(artefact);
    const label = artefact.shell ? SHELL_META[artefact.shell.kind].label : SHELL_META[artefact.kind === "moodboard" ? "moodboard" : artefact.kind === "shell" ? "document" : artefact.kind].label;
    if (kind) {
      const value = JSON.stringify(artefactCatalogueValue(artefact));
      return { id: artefact.id, kind, label, title: artefact.title, ...(value.length <= CATALOGUE_SNAPSHOT_CHARS / 10 ? { value } : {}) };
    }
    const snapshot = artefact.shell
      ? JSON.stringify(artefact.shell.data, (_key, value: unknown) => (typeof value === "string" && value.startsWith("data:") ? "[image]" : value)).slice(0, 2000)
      : artefact.content.slice(0, 2000);
    return { id: artefact.id, kind: artefact.shell ? ("shell" as const) : artefact.kind, label, title: artefact.title, snapshot };
  });
}

function interfaceCandidatesForRequest(
  sessionId: string,
  messages: ChatLabMessage[],
) {
  // Retrieved whatever is open, so a new interface can be made beside it (a recipe while the menu is open).
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUser) return undefined;
  // A thread started from a Chat card: its first reply takes the format chosen
  // there, and nothing opens. "plain" means an ordinary answer.
  const session = useChatLabStore.getState().sessions[sessionId];
  const firstTurn = messages.filter((message) => message.role === "user").length === 1;
  if (session?.fromChatCard && firstTurn) return [];
  return retrieveInterfaces(getMessageText(lastUser), 5);
}

/**
 * The Chat card's two modes, as instructions: who replies (every turn), and
 * how the first reply is laid out. Both are free text; known ones get a fuller
 * instruction.
 */
function chatModesForRequest(sessionId: string, messages: ChatLabMessage[]) {
  const session = useChatLabStore.getState().sessions[sessionId];
  if (!session) return undefined;
  const firstTurn = messages.filter((message) => message.role === "user").length === 1;
  const persona = session.persona ? { label: session.persona, instruction: assistantInstruction(session.persona) } : undefined;
  const layout = firstTurn && session.replyFormat ? formatInstruction(session.replyFormat) : undefined;
  // Choices picked on the home card: context for the first reply, not words in their message.
  const chose = firstTurn && session.brief ? `On the interface's card they also chose: ${session.brief} Take it into account; don't repeat it back.` : undefined;
  const format = [layout, chose].filter(Boolean).join("\n\n") || undefined;
  return persona || format ? { persona, format } : undefined;
}

export function getChatLabChat(id: string) {
  const existing = chats.get(id);
  if (existing) return existing;

  const transport = new DefaultChatTransport<ChatLabMessage>({
    api: CHAT_LAB_API,
    prepareSendMessagesRequest: ({
      messages,
      id: chatId,
      body,
      trigger,
      messageId,
    }) => {
      // An open window is always in reach: the model reads the one used last.
      settleActive(id);
      const artefact = artefactContextForRequest(id, messages);
      // The interface in use when the turn begins is the one it writes to.
      const active = getActiveArtefact(useChatLabStore.getState().sessions[id]);
      const userMessageId = currentTurn(messages).userMessageId;
      if (artefact && active && userMessageId) {
        useChatLabStore.getState().setTurnTarget(id, userMessageId, active.id);
      }
      return {
      body: {
        ...body,
        id: chatId,
        messages,
        trigger,
        messageId,
        system: useChatLabStore.getState().systemPrompt ?? undefined,
        artefact,
        interfaceCandidates: interfaceCandidatesForRequest(id, messages),
        chatModes: chatModesForRequest(id, messages),
        tracked: trackedForRequest(id),
        open: openForRequest(id, artefact?.id),
      },
      };
    },
  });

  const chat: Chat<ChatLabMessage> = new Chat<ChatLabMessage>({
    id,
    messages: useChatLabStore.getState().sessions[id]?.messages ?? [],
    transport,
    onFinish: ({ messages, isAbort }) => {
      useChatLabStore.getState().saveMessages(id, messages);
      syncArtefact(id, messages);
      if (!isAbort) noteWhatWasMade(id, messages);
      const activity = useChatLabActivity.getState();
      // Chat is minimized: the reply shows above the input for a moment.
      if (!isAbort && activity.viewingId === id && isChatMinimized(id)) {
        const reply = findLatestMessage(messages, "assistant");
        if (reply) peekReply(id, getMessageText(reply));
      }
      if (!isAbort && activity.viewingId !== id) {
        useChatLabActivity.setState({
          unread: { ...activity.unread, [id]: true },
        });
      }
    },
  });

  const publish = () => {
    syncArtefact(id, chat.messages);
    const activity = agentActivity(chat.messages, chat.status);
    useChatLabActivity.setState((state) => ({
      status: { ...state.status, [id]: chat.status },
      activity: { ...state.activity, [id]: activity ?? undefined },
    }));
  };

  chat["~registerStatusCallback"](publish);
  chat["~registerMessagesCallback"](publish);

  chats.set(id, chat);
  return chat;
}

export function disposeChatLabChat(id: string) {
  const chat = chats.get(id);
  if (!chat) return;
  void chat.stop();
  chats.delete(id);
  applied.delete(id);
  lastStreamedAt.delete(id);
  useChatLabActivity.setState((state) => {
    const status = { ...state.status };
    const activity = { ...state.activity };
    const unread = { ...state.unread };
    delete status[id];
    delete activity[id];
    delete unread[id];
    return { status, activity, unread };
  });
}
