import { animate, type AnimationPlaybackControls } from "motion/react";
import { create } from "zustand";

import { clampProgress, COMPOSER_SPRING } from "./composer-motion";

let playback: AnimationPlaybackControls | null = null;

const SCRUBBER_KEY = "adaption.composer.scrubber";

const readScrubberOpen = () => {
  try {
    return sessionStorage.getItem(SCRUBBER_KEY) !== "0";
  } catch {
    return true;
  }
};

export const useComposerExpandStore = create<{
  progress: number;
  scrubberOpen: boolean;
  setProgress: (progress: number) => void;
  setScrubberOpen: (open: boolean) => void;
  playTo: (target: number) => AnimationPlaybackControls;
  reset: () => void;
}>((set, get) => ({
  progress: 0,
  scrubberOpen: readScrubberOpen(),
  setProgress: (progress) => {
    playback?.stop();
    playback = null;
    set({ progress: clampProgress(progress) });
  },
  setScrubberOpen: (open) => {
    try {
      sessionStorage.setItem(SCRUBBER_KEY, open ? "1" : "0");
    } catch {
      // Ignore private-mode storage failures.
    }
    if (!open) {
      const progress = get().progress;
      get().setProgress(progress >= 0.5 ? 1 : 0);
    }
    set({ scrubberOpen: open });
  },
  playTo: (target) => {
    playback?.stop();
    const next = clampProgress(target);
    playback = animate(get().progress, next, {
      ...COMPOSER_SPRING,
      onUpdate: (value) => set({ progress: value }),
    });
    return playback;
  },
  reset: () => {
    playback?.stop();
    playback = null;
    set({ progress: 0 });
  },
}));
