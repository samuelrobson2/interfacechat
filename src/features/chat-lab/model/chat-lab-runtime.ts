import { assistantInstruction, formatInstruction, SHELL_META } from "@/features/interface-shells";
import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport, type ChatStatus } from "ai";
import { create } from "zustand";
import { isArtefactRelated } from "./artefact-relatedness";
import { CHAT_LAB_API } from "./chat-lab-api";
import { agentActivity, type AgentActivity } from "./agent-activity";
import {
  getActiveArtefact,
  getMessageText,
  useChatLabStore,
  type ChatLabArtefactKind,
  type ChatLabMessage,
} from "./chat-lab-store";
import {
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

function latestUserMessageId(messages: ChatLabMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.id;
}

/** Open interfaces the model chose from retrieved candidates. */
function syncOpenInterface(id: string, messages: ChatLabMessage[]) {
  const session = useChatLabStore.getState().sessions[id];
  if (!session) return;

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== "assistant") continue;
    for (const part of message.parts) {
      const input = readOpenInterfaceToolInput(part);
      if (!input?.id) continue;

      const libraryKind = input.id as VisualInterfaceKind;
      const kind =
        input.opensAs ?? resolveImplementableKind(libraryKind);
      const sourceUserMessageId = latestUserMessageId(messages) ?? null;
      const title = input.title?.trim() || libraryKind;

      // Avoid opening duplicates for the same source turn + kind.
      const fresh = useChatLabStore.getState().sessions[id];
      const already = Object.values(fresh?.artefacts ?? {}).some(
        (artefact) =>
          artefact.sourceUserMessageId === sourceUserMessageId &&
          (artefact.libraryKind === libraryKind || artefact.kind === kind),
      );
      if (already) return;

      useChatLabStore.getState().createArtefact(id, {
        kind,
        title,
        sourceUserMessageId,
        libraryKind,
      });
      return;
    }
  }
}

/** Pull write_interface tool args into the active artefact. */
function syncArtefact(id: string, messages: ChatLabMessage[]) {
  syncOpenInterface(id, messages);

  const session = useChatLabStore.getState().sessions[id];
  const artefact = getActiveArtefact(session);
  if (!artefact) return;

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== "assistant") continue;
    for (const part of message.parts) {
      const input = readInterfaceToolInput(part);
      if (!input) continue;
      const current = getActiveArtefact(useChatLabStore.getState().sessions[id]);
      if (
        current &&
        (input.content === undefined || current.content === input.content) &&
        (!input.title || current.title === input.title) &&
        (input.filters === undefined ||
          sameFilters(current.filters, input.filters))
      ) {
        return;
      }
      useChatLabStore.getState().updateArtefact(id, {
        title: input.title,
        content: input.content,
        filters: input.filters,
      });
      return;
    }
  }
}

/** Only expose write_interface when the latest user turn is about the interface. */
function artefactContextForRequest(sessionId: string, messages: ChatLabMessage[]) {
  const session = useChatLabStore.getState().sessions[sessionId];
  const active = getActiveArtefact(session);
  if (!active) return undefined;

  // A library interface: tell the model what's open and what's in it, briefly.
  if (active.kind === "shell" && active.shell) {
    return {
      kind: "shell" as const,
      title: active.title,
      label: SHELL_META[active.shell.kind].label,
      snapshot: JSON.stringify(active.shell.data).slice(0, 2000),
    };
  }

  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUser) {
    return {
      kind: active.kind,
      title: active.title,
      filters: active.filters ?? [],
    };
  }
  if (!isArtefactRelated(getMessageText(lastUser), active)) {
    return undefined;
  }
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
    }) => ({
      body: {
        ...body,
        id: chatId,
        messages,
        trigger,
        messageId,
        system: useChatLabStore.getState().systemPrompt ?? undefined,
        artefact: artefactContextForRequest(id, messages),
        interfaceCandidates: interfaceCandidatesForRequest(id, messages),
        chatModes: chatModesForRequest(id, messages),
      },
    }),
  });

  const chat: Chat<ChatLabMessage> = new Chat<ChatLabMessage>({
    id,
    messages: useChatLabStore.getState().sessions[id]?.messages ?? [],
    transport,
    onFinish: ({ messages, isAbort }) => {
      useChatLabStore.getState().saveMessages(id, messages);
      syncArtefact(id, messages);
      const activity = useChatLabActivity.getState();
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
