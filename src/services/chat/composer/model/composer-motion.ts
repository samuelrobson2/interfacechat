import type { Transition } from "motion/react";

export const COMPOSER_LAYOUT_ID = "chat-composer-surface";

export const COMPOSER_SPRING: Transition = {
  type: "spring",
  visualDuration: 0.32,
  bounce: 0.1,
};

export const COMPOSER_PRESS_SCALE = 0.97;

export const COMPOSER_BAR_WIDTH = 888;
export const COMPOSER_GAP = 16;
export const COMPOSER_COMPACT_INPUT_WIDTH = 204;
export const COMPOSER_COMPACT_HEIGHT = 100;
/** Pharos column-card height — used when suggestions lift above the input. */
export const COMPOSER_LIFTED_CARD_HEIGHT = 66;

export const COMPOSER_COMPACT_SUGGESTION_WIDTH =
  COMPOSER_BAR_WIDTH - COMPOSER_GAP - COMPOSER_COMPACT_INPUT_WIDTH;

export const COMPOSER_EXPANDED_INPUT_TOP =
  COMPOSER_LIFTED_CARD_HEIGHT + COMPOSER_GAP;

export const COMPOSER_SCRUB_FRAMES = 32;

export function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

export function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, progress));
}

export function composerLayout(progress: number) {
  const t = clampProgress(progress);

  return {
    barHeight: lerp(
      COMPOSER_COMPACT_HEIGHT,
      COMPOSER_LIFTED_CARD_HEIGHT + COMPOSER_GAP + COMPOSER_COMPACT_HEIGHT,
      t,
    ),
    suggestions: {
      width: lerp(COMPOSER_COMPACT_SUGGESTION_WIDTH, COMPOSER_BAR_WIDTH, t),
      height: lerp(COMPOSER_COMPACT_HEIGHT, COMPOSER_LIFTED_CARD_HEIGHT, t),
      left: 0,
      top: 0,
    },
    input: {
      width: lerp(COMPOSER_COMPACT_INPUT_WIDTH, COMPOSER_BAR_WIDTH, t),
      height: COMPOSER_COMPACT_HEIGHT,
      left: lerp(COMPOSER_COMPACT_SUGGESTION_WIDTH + COMPOSER_GAP, 0, t),
      top: lerp(0, COMPOSER_EXPANDED_INPUT_TOP, t),
    },
    cardHeight: lerp(COMPOSER_COMPACT_HEIGHT, COMPOSER_LIFTED_CARD_HEIGHT, t),
  };
}
