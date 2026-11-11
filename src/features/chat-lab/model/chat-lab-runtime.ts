import {
  CATALOGUE,
  FILL_TOOL_KIND,
  applyCatalogueOperations,
  assistantInstruction,
  formatInstruction,
  readCatalogueValue,
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
  useChatLabStore,
  type ChatLabArtefactKind,
  type ChatLabMessage,
} from "./chat-lab-store";
import { flash, hasWindow, isChatMinimized, layoutOf, openWindow, peekReply, settleActive } from "./chat-lab-workbench";
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
      // A tracker is a library interface holding its own data.
      const tracker = opensAs === "tracker" ? newCatalogueArtefact("tracker", title) : null;
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

        const target = catalogueTarget(id, userMessageId, kind, value.title);
        if (!target) continue;
        lastStreamedAt.set(id, now);
        appliedCalls.set(callId, signature);
        applyCatalogueValue(id, target.id, value);
        continue;
      }

      if (name !== "update_interface" || part.state !== "output-available") continue;
      appliedCalls.set(callId, "done");
      if (!(part.output as { ok?: boolean } | undefined)?.ok) continue;
      const target = turnTarget(id, userMessageId);
      const targetKind = target && artefactCatalogueKind(target);
      const current = target && artefactCatalogueValue(target);
      const operations = (part.input as { operations?: CatalogueOperation[] } | undefined)?.operations;
      if (!target || !targetKind || !current || !operations) continue;
      const result = applyCatalogueOperations(targetKind, current, operations);
      if (result.ok) applyCatalogueValue(id, target.id, result.value);
    }
  }
}

/** Pull this turn's tool calls into the interface it's working on. */
function syncArtefact(id: string, messages: ChatLabMessage[]) {
  syncOpenInterface(id, messages);

  const { userMessageId, replies } = currentTurn(messages);
  if (!userMessageId) return;

  syncCatalogue(id, userMessageId, replies);

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
  if (!active) return undefined;

  const users = messages.filter((message) => message.role === "user");
  const lastUser = users.at(-1);
  if (lastUser && users.length > 1) {
    const asked = matchVisualInterface(getMessageText(lastUser));
    const showing = active.libraryKind ?? active.shell?.kind ?? active.kind;
    const sameKind = resolveImplementableKind(asked ?? "document") === active.kind || (asked && opensAsOf(asked) === artefactCatalogueKind(active));
    if (asked && asked !== showing && !sameKind) return undefined;
  }

  // A catalogue interface: the model fills it, and reads what's in it to change part of it.
  const catalogueKind = artefactCatalogueKind(active);
  if (catalogueKind) {
    const value = JSON.stringify(artefactCatalogueValue(active));
    return {
      kind: catalogueKind,
      title: active.title,
      ...(value.length <= CATALOGUE_SNAPSHOT_CHARS ? { value } : {}),
    };
  }

  // A library interface: tell the model what's open and what's in it, briefly.
  if (active.kind === "shell" && active.shell) {
    return {
      kind: "shell" as const,
      title: active.title,
      label: SHELL_META[active.shell.kind].label,
      snapshot: JSON.stringify(active.shell.data).slice(0, 2000),
    };
  }
  if (active.kind === "shell") return undefined;

  return {
    kind: active.kind,
    title: active.title,
    filters: active.filters ?? [],
  };
}

function interfaceCandidatesForRequest(
  sessionId: string,
  messages: ChatLabMessage[],
) {
  // When an artefact is already in play for this turn, skip retrieval.
  if (artefactContextForRequest(sessionId, messages)) return undefined;
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
  const format = firstTurn && session.replyFormat ? formatInstruction(session.replyFormat) : undefined;
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
