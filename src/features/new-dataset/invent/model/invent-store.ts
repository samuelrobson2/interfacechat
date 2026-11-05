import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface InventState {
  domains: Set<string>;
  languages: Set<string>;
  size: string | null;
  files: Map<string, File>;
}

interface InventActions {
  addDomain: (domain: string) => void;
  removeDomain: (domain: string) => void;
  addLanguage: (language: string) => void;
  removeLanguage: (language: string) => void;
  setSize: (size: string | null) => void;
  setFiles: (files: Map<string, File>) => void;
}

type InventStore = InventState & InventActions;

export const useInventStore = create<InventStore>()(
  immer((set) => ({
    // State
    domains: new Set<string>(),
    languages: new Set<string>(),
    size: null,
    files: new Map<string, File>(),
    // Actions
    addDomain: (domain) =>
      set((state) => {
        state.domains.add(domain);
      }),

    removeDomain: (domain) =>
      set((state) => {
        state.domains.delete(domain);
      }),

    addLanguage: (language) =>
      set((state) => {
        state.languages.add(language);
      }),

    removeLanguage: (language) =>
      set((state) => {
        state.languages.delete(language);
      }),

    setSize: (size) =>
      set((state) => {
        state.size = size;
      }),

    setFiles: (files) =>
      set((state) => {
        state.files = files;
      }),
  })),
);

