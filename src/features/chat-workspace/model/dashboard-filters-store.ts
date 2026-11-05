import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { DateFilterPresetId } from "../lib/date-filter-presets";

export type ChatFolderFilters = {
  domainGroup?: string;
  datePreset?: DateFilterPresetId;
};

interface DashboardFiltersState {
  filters: ChatFolderFilters;
}

interface DashboardFiltersActions {
  toggleDomainGroup: (groupId: string) => void;
  toggleDatePreset: (presetId: DateFilterPresetId) => void;
  clear: () => void;
}

type DashboardFiltersStore = DashboardFiltersState & DashboardFiltersActions;

export const useDashboardFiltersStore = create<DashboardFiltersStore>()(
  immer((set) => ({
    filters: {},

    toggleDomainGroup: (groupId) =>
      set((state) => {
        state.filters.domainGroup =
          state.filters.domainGroup === groupId ? undefined : groupId;
      }),

    toggleDatePreset: (presetId) =>
      set((state) => {
        state.filters.datePreset =
          state.filters.datePreset === presetId ? undefined : presetId;
      }),

    clear: () =>
      set((state) => {
        state.filters = {};
      }),
  })),
);
