export type SuggestionsVariant = "row" | "column";
export type SuggestionItem = { id: string; text: string };

export const MAX_VISIBLE_SUGGESTIONS = 3;

// Cap visible items so the layout stays stable regardless of how many
// suggestions the model returns.
export const takeVisible = (
  suggestions: SuggestionItem[] | null | undefined,
): SuggestionItem[] => (suggestions ?? []).slice(0, MAX_VISIBLE_SUGGESTIONS);

/**
 * Raised when a turn produced no follow-ups. An empty set is not a rail, so it
 * is raised rather than returned: the suggestions boundary then treats it as a
 * failure and the composer falls back to the inert pill.
 */
export class FollowupsEmptyError extends Error {
  constructor() {
    super("The turn produced no follow-ups");
    this.name = "FollowupsEmptyError";
  }
}
