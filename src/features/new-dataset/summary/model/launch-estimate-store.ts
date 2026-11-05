import { create } from "zustand";

/** Last launch response `estimatedMinutes` — in memory only, for the summary success line. */
type LaunchEstimateState = {
  estimatedMinutes: number | null;
  setEstimatedMinutes: (minutes: number) => void;
};

export const useLaunchEstimateStore = create<LaunchEstimateState>()((set) => ({
  estimatedMinutes: null,
  setEstimatedMinutes: (minutes) => set({ estimatedMinutes: minutes }),
}));
