import { queryClient } from "@/shared/api/query-client";
import { isApiError } from "@/shared/api/api-error";

export type SuggestionsVariant = "row" | "column";
export type SuggestionItem = { id: string; text: string };

export const MAX_VISIBLE_SUGGESTIONS = 3;

export const suggestionQueryKey = ["chat", "followups"];

export const starterSuggestionsQueryKey = ["chat", "starter-suggestions"];

export const imageSuggestionQueryKey = ["chat", "image-suggestions"];

export const getSuggestionQueryKey = (
  chatId: string | undefined,
  selectedText: string | undefined,
  anchorMessageId: string | undefined,
  mode: "context" | "edits" = "context",
) => [...suggestionQueryKey, chatId, selectedText, anchorMessageId, mode];

export const removeSuggestionCache = (chatId: string | undefined) => {
  if (!chatId) return;
  queryClient.removeQueries({
    queryKey: [...suggestionQueryKey, chatId],
    exact: false,
  });
};

// Cap visible items so the layout stays stable regardless of how many
// suggestions the backend returns.
export const takeVisible = (
  suggestions: SuggestionItem[] | null | undefined,
): SuggestionItem[] => (suggestions ?? []).slice(0, MAX_VISIBLE_SUGGESTIONS);

// The followups endpoint 400s while the assistant reply for the latest turn
// is not yet persisted. This is a transient race when the user stops
// generation: the request to fetch suggestions can land before the backend
// has saved the (partial) assistant message. Retry it so the suggestions
// still appear, exactly like a turn that finished on its own.
const FOLLOWUP_NOT_READY_PATTERN = /completed assistant reply/i;

export const isFollowupNotReadyError = (error: unknown): boolean =>
  isApiError(error) &&
  error.statusCode === 400 &&
  FOLLOWUP_NOT_READY_PATTERN.test(error.responseMessage ?? error.message);

export const FOLLOWUP_NOT_READY_RETRY_LIMIT = 6;

export const followupNotReadyRetryDelay = (attemptIndex: number): number =>
  Math.min(500 * 2 ** attemptIndex, 2000);
