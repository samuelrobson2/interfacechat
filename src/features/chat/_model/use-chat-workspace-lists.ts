import {
  chatQueryOptions,
  getChatCategoryColor,
  getChatCategoryIcon,
  isChatCategory,
  type ChatCategoryColor,
} from "@/services/chat";
import { DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { ROUTES } from "@/shared/model/routes";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { href } from "react-router-dom";
import { MOCK_CHAT_HISTORY, MOCK_CHAT_PROJECTS } from "./chat-workspace-mock";

/** A folder/project grouping multiple chat threads. */
export interface ChatProject {
  id: string;
  title: string;
  count: number;
  to: string;
  /** Category art (PNG src) reused from the chat-history folders, if resolvable. */
  icon?: string;
  /** Category color tint for the icon background. */
  color?: ChatCategoryColor;
}

/** A single chat thread in the raw history list. */
export interface ChatThread {
  id: string;
  title: string;
  date: string;
  to: string;
}

const PROJECT_LIMIT = 20;
const HISTORY_LIMIT = 20;

/**
 * Loads chat projects (directories) and the raw chat history (sessions) for the
 * new-chat workspace rail. Mirrors the History tab: non-suspense queries that
 * never throw (so a missing backend degrades in place rather than tripping the
 * route error boundary), with a DEV_AUTH_BYPASS-only mock fallback.
 */
export function useChatWorkspaceLists() {
  const directoriesQuery = useQuery({
    ...chatQueryOptions.directories({ limit: PROJECT_LIMIT }),
    throwOnError: false,
    retry: false,
  });
  const sessionsQuery = useQuery({
    ...chatQueryOptions.sessions({ limit: HISTORY_LIMIT }),
    throwOnError: false,
    retry: false,
  });

  const projects = useMemo<ChatProject[]>(() => {
    const directories = directoriesQuery.data?.directories ?? [];
    return directories
      .filter((directory) => directory.session_count > 0)
      .map((directory) => {
        const slug = directory.slug ?? directory.id;
        const category = isChatCategory(slug) ? slug : null;
        return {
          id: directory.id,
          title: directory.title,
          count: directory.session_count,
          to: href(ROUTES.CHAT_FOLDER, { folder_id: slug }),
          icon: category ? getChatCategoryIcon(category) : undefined,
          color: category ? getChatCategoryColor(category) : undefined,
        };
      });
  }, [directoriesQuery.data]);

  const history = useMemo<ChatThread[]>(() => {
    const sessions = sessionsQuery.data?.sessions ?? [];
    return sessions.map((session) => ({
      id: session.session_id,
      title: session.title || "Untitled chat",
      date: session.updated_at ?? session.created_at,
      to: href(ROUTES.CHAT, { chat_id: session.session_id }),
    }));
  }, [sessionsQuery.data]);

  const useMockFallback =
    DEV_AUTH_BYPASS && projects.length === 0 && history.length === 0;

  if (useMockFallback) {
    return {
      projects: MOCK_CHAT_PROJECTS,
      history: MOCK_CHAT_HISTORY,
      isLoading: false,
      isMock: true,
    };
  }

  return {
    projects,
    history,
    isLoading: directoriesQuery.isLoading || sessionsQuery.isLoading,
    isMock: false,
  };
}
