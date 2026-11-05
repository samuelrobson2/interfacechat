import { create } from "zustand";

import type { ApiSchemas } from "@/shared/api/schema";

type ChartSession = ApiSchemas["ChartSessionDto"];
type ChatMessage = ApiSchemas["ChatMessageDto"];

export type LocalVisualizeSession = {
  session: ChartSession;
  messages: ChatMessage[];
};

const STORAGE_KEY = "adaption.visualize.sessions.v1";

const loadSessions = (): Record<string, LocalVisualizeSession> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LocalVisualizeSession>;
  } catch {
    return {};
  }
};

const persistSessions = (sessions: Record<string, LocalVisualizeSession>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

type VisualizeStore = {
  sessions: Record<string, LocalVisualizeSession>;
  put: (record: LocalVisualizeSession) => void;
  patchSession: (sessionId: string, patch: Partial<ChartSession>) => void;
  appendMessage: (sessionId: string, message: ChatMessage) => void;
};

export const useVisualizeStore = create<VisualizeStore>((set) => ({
  sessions: loadSessions(),
  put: (record) =>
    set((state) => {
      const sessions = {
        ...state.sessions,
        [record.session.session_id]: record,
      };
      persistSessions(sessions);
      return { sessions };
    }),
  patchSession: (sessionId, patch) =>
    set((state) => {
      const current = state.sessions[sessionId];
      if (!current) return state;
      const sessions = {
        ...state.sessions,
        [sessionId]: {
          ...current,
          session: {
            ...current.session,
            ...patch,
            updated_at: new Date().toISOString(),
          },
        },
      };
      persistSessions(sessions);
      return { sessions };
    }),
  appendMessage: (sessionId, message) =>
    set((state) => {
      const current = state.sessions[sessionId];
      if (!current) return state;
      const sessions = {
        ...state.sessions,
        [sessionId]: {
          ...current,
          session: { ...current.session, updated_at: new Date().toISOString() },
          messages: [...current.messages, message],
        },
      };
      persistSessions(sessions);
      return { sessions };
    }),
}));

export function createVisualizeSession(input?: {
  sessionId?: string;
  title?: string;
  dataset?: ChartSession["dataset"];
}): LocalVisualizeSession {
  const now = new Date().toISOString();
  const record: LocalVisualizeSession = {
    session: {
      session_id: input?.sessionId ?? crypto.randomUUID(),
      title: input?.title ?? "Untitled chart",
      dataset: input?.dataset ?? null,
      generation_status: "idle",
      generation_kind: null,
      active_job: null,
      created_at: now,
      updated_at: now,
    },
    messages: [],
  };
  useVisualizeStore.getState().put(record);
  return record;
}

export function ensureVisualizeSession(sessionId: string) {
  const existing = useVisualizeStore.getState().sessions[sessionId];
  if (existing) return existing;
  return createVisualizeSession({ sessionId });
}
