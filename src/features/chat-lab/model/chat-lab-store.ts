import type { UIMessage } from "ai";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatShellKind, ShellDataByKind } from "@/features/interface-shells";
import { isArtefactRelated } from "./artefact-relatedness";
import {
  createDemoThreads,
  DEMO_THREAD_SINCE,
  DEMO_THREADS_VERSION,
} from "./demo-threads";

export type ChatLabMessageMetadata = { model?: string; createdAt?: number };
export type ChatLabMessage = UIMessage<ChatLabMessageMetadata>;

/** Open visual interface attached to a specific query/turn. */
/**
 * document, search and table are written into by the model as markdown.
 * "shell" is any other library interface, holding its own structured data and
 * shown as that interface's large size.
 */
export type ChatLabArtefactKind = "document" | "search" | "table" | "moodboard" | "shell";

/** A library interface opened beside a thread with its own data. */
export type ArtefactShell = { [K in ChatShellKind]: { kind: K; data: ShellDataByKind[K] } }[ChatShellKind];

export type ChatLabArtefact = {
  id: string;
  kind: ChatLabArtefactKind;
  title: string;
  content: string;
  /**
   * Active filter chips on search interfaces (e.g. "North Beach"), set by the
   * user or by the model when they say "filter those to…".
   */
  filters: string[];
  /** Original library id when the model opened a mapped kind (e.g. blog → document). */
  libraryKind?: string;
  /** User message that opened this interface; bound once messages land. */
  sourceUserMessageId: string | null;
  /** Pinned interfaces stay docked even when later turns aren't related. */
  pinned: boolean;
  /** kind "shell": which interface it is, and its data. */
  shell?: ArtefactShell;
};

export type CreateSessionOptions = {
  /** `content` seeds the interface before the model writes (e.g. table columns). */
  artefact?: Pick<ChatLabArtefact, "kind" | "title"> & { content?: string; shell?: ArtefactShell };
  /** Chat from the home: nothing opens on the first turn. */
  fromChatCard?: boolean;
  /** Chat from the home: how the first reply is laid out, in the person's words. */
  replyFormat?: string;
  /** Chat from the home: who replies or what it uses, for the whole thread. */
  persona?: string;
};

const ARTEFACT_FALLBACK_TITLE: Record<ChatLabArtefactKind, string> = {
  document: "Untitled document",
  search: "Search",
  table: "Table",
  moodboard: "Moodboard",
  shell: "Untitled",
};

export type ChatLabSession = {
  id: string;
  title: string;
  messages: ChatLabMessage[];
  /** Interfaces owned by turns in this thread. */
  artefacts: Record<string, ChatLabArtefact>;
  /** Docked interface; null means normal full-chat layout. */
  activeArtefactId: string | null;
  /** The first message, sent once the session page mounts. */
  pendingMessage?: string;
  /** True until the generated short title arrives (or fails). */
  isTitlePending?: boolean;
  /** Set when the thread started from a Chat card: how the first reply is laid out. */
  replyFormat?: string;
  /** Set when the thread started from a Chat card. */
  fromChatCard?: boolean;
  /** Who replies in this thread, or what it uses. */
  persona?: string;
  createdAt: number;
  updatedAt: number;
};

type ChatLabState = {
  sessions: Record<string, ChatLabSession>;
  /** Overrides the server's default system prompt when set. */
  systemPrompt: string | null;
  hasSeededDemoThreads: boolean;
  demoThreadsVersion: number;
  createSession: (firstMessage: string, options?: CreateSessionOptions) => string;
  takePendingMessage: (id: string) => string | undefined;
  /** Send a message into an existing thread when it next opens (continuing past work). */
  queueMessage: (id: string, text: string) => void;
  saveMessages: (id: string, messages: ChatLabMessage[]) => void;
  renameSession: (id: string, title: string) => void;
  /** Applies a generated title, unless the chat was renamed meanwhile. */
  resolveTitle: (id: string, title: string | null) => void;
  updateArtefact: (
    sessionId: string,
    patch: Partial<Pick<ChatLabArtefact, "title" | "content" | "filters" | "shell">>,
    artefactId?: string,
  ) => void;
  /** Open a new interface mid-thread (e.g. model chose one from retrieval). */
  createArtefact: (
    sessionId: string,
    input: {
      kind: ChatLabArtefactKind;
      title: string;
      sourceUserMessageId?: string | null;
      libraryKind?: string;
    },
  ) => string;
  setArtefactPinned: (
    sessionId: string,
    artefactId: string,
    pinned: boolean,
  ) => void;
  focusArtefact: (sessionId: string, artefactId: string) => void;
  dismissArtefact: (sessionId: string) => void;
  /**
   * Before sending a turn: keep, keep-docked-only, or dismiss the active
   * interface depending on relatedness + pin.
   */
  evaluateArtefactForTurn: (sessionId: string, text: string) => void;
  deleteSession: (id: string) => void;
  setSystemPrompt: (systemPrompt: string | null) => void;
};

/** A chat title: one line, without a trailing full stop. */
export const cleanTitle = (text: string) =>
  (text.trim().split("\n")[0] ?? "").replace(/\.+$/, "").trimEnd();

export const getActiveArtefact = (
  session: ChatLabSession | undefined,
): ChatLabArtefact | undefined => {
  if (!session?.activeArtefactId) return undefined;
  return session.artefacts[session.activeArtefactId];
};

/** Interfaces used in this thread, ordered by the user turn that opened them. */
export const listSessionArtefacts = (
  session: ChatLabSession | undefined,
): ChatLabArtefact[] => {
  if (!session) return [];
  const artefacts = Object.values(session.artefacts);
  if (artefacts.length <= 1) return artefacts;

  const messageIndex = new Map(
    session.messages.map((message, index) => [message.id, index]),
  );
  return [...artefacts].sort((a, b) => {
    const ai = a.sourceUserMessageId
      ? (messageIndex.get(a.sourceUserMessageId) ?? Number.MAX_SAFE_INTEGER)
      : Number.MAX_SAFE_INTEGER;
    const bi = b.sourceUserMessageId
      ? (messageIndex.get(b.sourceUserMessageId) ?? Number.MAX_SAFE_INTEGER)
      : Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return a.id.localeCompare(b.id);
  });
};

function bindArtefactSources(
  session: ChatLabSession,
  messages: ChatLabMessage[],
): Record<string, ChatLabArtefact> {
  let artefacts = session.artefacts;
  let changed = false;
  for (const artefact of Object.values(artefacts)) {
    if (artefact.sourceUserMessageId) continue;
    const firstUser = messages.find((message) => message.role === "user");
    if (!firstUser) continue;
    if (!changed) artefacts = { ...artefacts };
    artefacts[artefact.id] = {
      ...artefact,
      sourceUserMessageId: firstUser.id,
    };
    changed = true;
  }
  return artefacts;
}

type LegacyArtefact = {
  kind: ChatLabArtefactKind;
  title: string;
  content: string;
};

type LegacySession = Omit<
  ChatLabSession,
  "artefacts" | "activeArtefactId"
> & {
  artefacts?: Record<string, ChatLabArtefact>;
  activeArtefactId?: string | null;
  artefact?: LegacyArtefact;
};

function migrateSession(raw: LegacySession): ChatLabSession {
  if (raw.artefacts && "activeArtefactId" in raw) {
    const artefacts = Object.fromEntries(
      Object.entries(raw.artefacts).map(([id, artefact]) => [
        id,
        {
          ...artefact,
          filters: artefact.filters ?? [],
        },
      ]),
    );
    return {
      ...raw,
      artefacts,
      activeArtefactId: raw.activeArtefactId ?? null,
    };
  }
  if (raw.artefact) {
    const id = `legacy-${raw.id}`;
    return {
      id: raw.id,
      title: raw.title,
      messages: raw.messages,
      pendingMessage: raw.pendingMessage,
      isTitlePending: raw.isTitlePending,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      artefacts: {
        [id]: {
          id,
          kind: raw.artefact.kind,
          title: raw.artefact.title,
          content: raw.artefact.content,
          filters: [],
          sourceUserMessageId: null,
          pinned: false,
        },
      },
      activeArtefactId: id,
    };
  }
  return {
    id: raw.id,
    title: raw.title,
    messages: raw.messages,
    pendingMessage: raw.pendingMessage,
    isTitlePending: raw.isTitlePending,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    artefacts: {},
    activeArtefactId: null,
  };
}

export const useChatLabStore = create<ChatLabState>()(
  persist(
    (set, get) => ({
      sessions: {},
      systemPrompt: null,
      hasSeededDemoThreads: false,
      demoThreadsVersion: 0,

      createSession: (firstMessage, options) => {
        const id = nanoid(10);
        const now = Date.now();
        let artefacts: Record<string, ChatLabArtefact> = {};
        let activeArtefactId: string | null = null;
        if (options?.artefact) {
          const artefactId = nanoid(8);
          artefacts = {
            [artefactId]: {
              id: artefactId,
              kind: options.artefact.kind,
              title:
                options.artefact.title.trim() ||
                ARTEFACT_FALLBACK_TITLE[options.artefact.kind],
              content: options.artefact.content ?? "",
              filters: [],
              sourceUserMessageId: null,
              pinned: false,
              ...(options.artefact.shell ? { shell: options.artefact.shell } : {}),
            },
          };
          activeArtefactId = artefactId;
        }
        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: {
              id,
              title: cleanTitle(firstMessage),
              messages: [],
              artefacts,
              activeArtefactId,
              pendingMessage: firstMessage,
              isTitlePending: true,
              ...(options?.fromChatCard ? { fromChatCard: true } : {}),
              ...(options?.replyFormat?.trim() ? { replyFormat: options.replyFormat.trim() } : {}),
              ...(options?.persona?.trim() ? { persona: options.persona.trim() } : {}),
              createdAt: now,
              updatedAt: now,
            },
          },
        }));
        return id;
      },

      queueMessage: (id, text) =>
        set((state) => {
          const session = state.sessions[id];
          if (!session || !text.trim()) return state;
          return {
            sessions: {
              ...state.sessions,
              [id]: { ...session, pendingMessage: text, updatedAt: Date.now() },
            },
          };
        }),

      // Cleared synchronously so a remount (StrictMode) can't send it twice.
      takePendingMessage: (id) => {
        const session = get().sessions[id];
        const pending = session?.pendingMessage;
        if (!session || !pending) return undefined;
        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: { ...session, pendingMessage: undefined },
          },
        }));
        return pending;
      },

      saveMessages: (id, messages) =>
        set((state) => {
          const session = state.sessions[id];
          if (!session) return state;
          const artefacts = bindArtefactSources(session, messages);
          return {
            sessions: {
              ...state.sessions,
              [id]: {
                ...session,
                messages,
                artefacts,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      renameSession: (id, title) =>
        set((state) => {
          const session = state.sessions[id];
          if (!session || !title.trim()) return state;
          return {
            sessions: {
              ...state.sessions,
              [id]: { ...session, title: title.trim(), isTitlePending: false },
            },
          };
        }),

      resolveTitle: (id, title) =>
        set((state) => {
          const session = state.sessions[id];
          if (!session?.isTitlePending) return state;
          const next = title ? cleanTitle(title) : "";
          return {
            sessions: {
              ...state.sessions,
              [id]: {
                ...session,
                title: next || session.title,
                isTitlePending: false,
              },
            },
          };
        }),

      updateArtefact: (sessionId, patch, artefactId) =>
        set((state) => {
          const session = state.sessions[sessionId];
          const id = artefactId ?? session?.activeArtefactId;
          if (!session || !id) return state;
          const artefact = session.artefacts[id];
          if (!artefact) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                artefacts: {
                  ...session.artefacts,
                  [id]: {
                    ...artefact,
                    title: patch.title?.trim() || artefact.title,
                    content:
                      patch.content !== undefined
                        ? patch.content
                        : artefact.content,
                    filters:
                      patch.filters !== undefined
                        ? patch.filters
                            .map((filter) => filter.trim())
                            .filter(Boolean)
                        : (artefact.filters ?? []),
                    ...(patch.shell ? { shell: patch.shell } : {}),
                  },
                },
                updatedAt: Date.now(),
              },
            },
          };
        }),

      createArtefact: (sessionId, input) => {
        const session = get().sessions[sessionId];
        if (!session) return "";
        const artefactId = nanoid(8);
        const title =
          input.title.trim() || ARTEFACT_FALLBACK_TITLE[input.kind];
        set((state) => {
          const current = state.sessions[sessionId];
          if (!current) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...current,
                artefacts: {
                  ...current.artefacts,
                  [artefactId]: {
                    id: artefactId,
                    kind: input.kind,
                    title,
                    content: "",
                    filters: [],
                    libraryKind: input.libraryKind,
                    sourceUserMessageId: input.sourceUserMessageId ?? null,
                    pinned: false,
                  },
                },
                activeArtefactId: artefactId,
                updatedAt: Date.now(),
              },
            },
          };
        });
        return artefactId;
      },

      setArtefactPinned: (sessionId, artefactId, pinned) =>
        set((state) => {
          const session = state.sessions[sessionId];
          const artefact = session?.artefacts[artefactId];
          if (!session || !artefact) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                artefacts: {
                  ...session.artefacts,
                  [artefactId]: { ...artefact, pinned },
                },
                // Pinning also focuses so the dock stays visible.
                activeArtefactId: pinned
                  ? artefactId
                  : session.activeArtefactId,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      focusArtefact: (sessionId, artefactId) =>
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session?.artefacts[artefactId]) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                activeArtefactId: artefactId,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      dismissArtefact: (sessionId) =>
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session?.activeArtefactId) return state;
          const active = session.artefacts[session.activeArtefactId];
          if (active?.pinned) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                activeArtefactId: null,
                updatedAt: Date.now(),
              },
            },
          };
        }),

      evaluateArtefactForTurn: (sessionId, text) => {
        const session = get().sessions[sessionId];
        const active = getActiveArtefact(session);
        if (!session || !active) return;
        if (isArtefactRelated(text, active)) return;
        if (active.pinned) return;
        get().dismissArtefact(sessionId);
      },

      deleteSession: (id) =>
        set((state) => {
          const sessions = { ...state.sessions };
          delete sessions[id];
          return { sessions };
        }),

      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
    }),
    {
      name: "chat-lab",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as {
          sessions?: Record<string, LegacySession>;
          [key: string]: unknown;
        };
        if (!state?.sessions) return state as ChatLabState;
        return {
          ...state,
          sessions: Object.fromEntries(
            Object.entries(state.sessions).map(([id, session]) => [
              id,
              migrateSession(session),
            ]),
          ),
        } as ChatLabState;
      },
    },
  ),
);

// A title request doesn't survive a reload, so keep the first-line title.
useChatLabStore.setState((state) => ({
  sessions: Object.fromEntries(
    Object.entries(state.sessions).map(([id, session]) => [
      id,
      session.isTitlePending ? { ...session, isTitlePending: false } : session,
    ]),
  ),
}));

// Seeded once, so deleting a demo thread keeps it gone. A version bump refreshes
// the demo threads that are still around and leaves your own threads alone.
{
  const { demoThreadsVersion, hasSeededDemoThreads } =
    useChatLabStore.getState();
  if (demoThreadsVersion < DEMO_THREADS_VERSION) {
    useChatLabStore.setState((state) => {
      const demos = createDemoThreads().filter(
        (session) =>
          !hasSeededDemoThreads ||
          session.id in state.sessions ||
          (DEMO_THREAD_SINCE[session.id] ?? 0) > demoThreadsVersion,
      );
      return {
        hasSeededDemoThreads: true,
        demoThreadsVersion: DEMO_THREADS_VERSION,
        sessions: {
          ...state.sessions,
          ...Object.fromEntries(demos.map((session) => [session.id, session])),
        },
      };
    });
  }
}

export const findLatestMessage = (
  messages: ChatLabMessage[],
  role: ChatLabMessage["role"],
) => messages.filter((message) => message.role === role).at(-1);

export const getMessageText = (message: ChatLabMessage) =>
  message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
