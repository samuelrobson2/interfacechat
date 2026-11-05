/**
 * Geometry for the desktop composer bar, shared by the shell and the suggestion
 * cards. The two animate against each other — the bar grows into the space the
 * cards vacate — so both have to agree on the numbers.
 */

export const SUGGESTION_CARD_WIDTH = 212;
export const SUGGESTION_CARD_GAP = 16;
export const SUGGESTION_CARD_HEIGHT = 100;
export const VISIBLE_SUGGESTION_COUNT = 3;

/** Compact create-card the bar collapses into. */
export const CREATE_CARD_WIDTH = 204;

/** Cards plus the gap that separates them from the create card. */
export const SUGGESTIONS_COLUMN_WIDTH =
  SUGGESTION_CARD_WIDTH * VISIBLE_SUGGESTION_COUNT +
  SUGGESTION_CARD_GAP * VISIBLE_SUGGESTION_COUNT;

/**
 * Fixed in both states. Expanding only redistributes width between the
 * suggestion column and the bar, so the composer always spans exactly the card
 * row and its outer edges never move.
 */
export const TRACK_WIDTH = SUGGESTIONS_COLUMN_WIDTH + CREATE_CARD_WIDTH;

/** Mini card the suggestions fold into, in the expanded bar's action row. */
export const SUGGESTION_PILL_SIZE = 32;

/** `p-4` on PromptInput — the pill sits in that inset, bottom-left. */
export const COMPOSER_FRAME_PADDING = 16;

/** Pill center in the cards overlay, origin at the overlay's bottom-left. */
export const FOLD_TARGET_X = COMPOSER_FRAME_PADDING + SUGGESTION_PILL_SIZE / 2;
export const FOLD_TARGET_Y = -(
  COMPOSER_FRAME_PADDING +
  SUGGESTION_PILL_SIZE / 2
);

/** Resting and grown heights of the card-row composer. Grown is 2× resting. */
export const COMPOSER_MIN_HEIGHT = SUGGESTION_CARD_HEIGHT;
export const COMPOSER_MAX_HEIGHT = COMPOSER_MIN_HEIGHT * 2;
export const COMPOSER_MAX_ROWS = 7;

/** Expand and fold share this so they stay in lockstep. Under 200ms. */
export const COMPOSER_MOTION_MS = 180;
