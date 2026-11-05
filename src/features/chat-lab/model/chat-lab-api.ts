import { queryOptions } from "@tanstack/react-query";
import {
  FollowupsEmptyError,
  takeVisible,
  type SuggestionItem,
} from "../pharos/chat";
import {
  getMessageText,
  useChatLabStore,
  type ChatLabMessage,
} from "./chat-lab-store";

export const CHAT_LAB_API = "/api/chat-lab";
const SUGGESTIONS_API = "/api/chat-lab-suggestions";
const TITLE_API = "/api/chat-lab-title";

/** Swaps a new chat's first-line title for a short generated one. */
export async function generateChatLabTitle(id: string, message: string) {
  const { resolveTitle } = useChatLabStore.getState();
  try {
    const response = await fetch(TITLE_API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error(`Title failed (${response.status})`);
    const { title }: { title?: string } = await response.json();
    resolveTitle(id, title ?? null);
  } catch {
    resolveTitle(id, null);
  }
}

export type ChatLabConfig = {
  model: string;
  systemPrompt: string;
  configured: boolean;
};

const postSuggestions = async (body: unknown): Promise<SuggestionItem[]> => {
  const response = await fetch(SUGGESTIONS_API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Suggestions failed (${response.status})`);
  const data: { suggestions?: SuggestionItem[] } = await response.json();
  return takeVisible(data.suggestions);
};

export const chatLabQueryOptions = {
  config: () =>
    queryOptions({
      queryKey: ["chat-lab", "config"],
      queryFn: async (): Promise<ChatLabConfig> => {
        const response = await fetch(CHAT_LAB_API);
        if (!response.ok) throw new Error(`Config failed (${response.status})`);
        return response.json();
      },
      staleTime: Infinity,
      retry: false,
    }),

  starterSuggestions: () =>
    queryOptions({
      queryKey: ["chat-lab", "starter-suggestions"],
      queryFn: () => postSuggestions({ kind: "starter" }),
      staleTime: Infinity,
      retry: false,
    }),

  // Anchored to an assistant message; the turns up to it are captured on the
  // first fetch, which is all a follow-up needs.
  followups: (
    sessionId: string,
    anchorMessageId: string | undefined,
    messages: ChatLabMessage[],
  ) =>
    queryOptions({
      queryKey: ["chat-lab", "followups", sessionId, anchorMessageId],
      queryFn: async () => {
        const anchorIndex = messages.findIndex(
          (message) => message.id === anchorMessageId,
        );
        const turns = messages.slice(0, anchorIndex + 1).map((message) => ({
          role: message.role,
          text: getMessageText(message),
        }));
        const suggestions = await postSuggestions({ kind: "followup", turns });
        if (!suggestions.length) throw new FollowupsEmptyError();
        return suggestions;
      },
      staleTime: Infinity,
      retry: false,
    }),
};
