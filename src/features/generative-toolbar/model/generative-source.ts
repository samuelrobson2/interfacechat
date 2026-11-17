import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ToolSource } from "./use-generated-tools";

/**
 * Where every interface's generated tools come from, app-wide: the model, the
 * hand-written rules that stand in for it, or off. Kept per browser so a
 * tester's choice holds across pages and reloads.
 */
export type GenerativeSource = ToolSource | "off";
export const GENERATIVE_SOURCES: readonly GenerativeSource[] = ["model", "rules", "off"];

export const useGenerativeSource = create<{ source: GenerativeSource; setSource: (source: GenerativeSource) => void }>()(
  persist((set) => ({ source: "model", setSource: (source) => set({ source }) }), { name: "generative-source" }),
);
