import { create } from "zustand";

import type { PlotTarget } from "@/services/plot";

type SuggestionsSide = "left" | "right";

type VisualizeHighlightState = {
  chartId: string | null;
  target: PlotTarget | null;
  suggestionsSide: SuggestionsSide;
};

type VisualizeHighlightActions = {
  toggleChart: (chartId: string) => void;
  selectTarget: (target: PlotTarget | null, plotWidth?: number) => void;
  reset: () => void;
};

const INITIAL_STATE: VisualizeHighlightState = {
  chartId: null,
  target: null,
  suggestionsSide: "right",
};

const sideForTarget = (
  target: PlotTarget,
  plotWidth: number,
): SuggestionsSide =>
  target.bbox.x + target.bbox.width / 2 < plotWidth / 2 ? "left" : "right";

export const useVisualizeHighlightStore = create<
  VisualizeHighlightState & VisualizeHighlightActions
>()((set) => ({
  ...INITIAL_STATE,

  toggleChart: (chartId) =>
    set((state) => ({
      chartId: state.chartId === chartId ? null : chartId,
      target: null,
      suggestionsSide: "right",
    })),

  selectTarget: (target, plotWidth) =>
    set({
      target,
      suggestionsSide:
        target && plotWidth
          ? sideForTarget(target, plotWidth)
          : "right",
    }),

  reset: () => set(INITIAL_STATE),
}));
