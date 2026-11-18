import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Which arrangements the workbench allows. The layout controller and the
 * geometry read these, so switching one changes what the size menus offer,
 * where drops land, and how windows are drawn. Edited from the Layout rules
 * menu in the workbench's top bar; kept per browser.
 */
export type LayoutRules = {
  /** A lone medium fills its column. Off: it stays half the column, at the top. */
  mediumAloneFills: boolean;
  /** Two mediums one above the other in the right column. */
  rightStack: boolean;
  /** Two mediums one above the other in the left column. */
  leftStack: boolean;
  /** Extended medium (a medium the column's full height) is offered as a size. */
  extended: boolean;
  /** Two extended medium side by side in the supporting column, which grows to hold both. */
  extendedPair: boolean;
  /** Two large interfaces side by side. */
  largeSideBySide: boolean;
  /** Two large interfaces one above the other, beside Chat's sidebar (never across the full page). */
  largeStacked: boolean;
};

export const DEFAULT_LAYOUT_RULES: LayoutRules = {
  mediumAloneFills: false,
  rightStack: true,
  leftStack: false,
  extended: true,
  extendedPair: true,
  largeSideBySide: true,
  largeStacked: true,
};

export const LAYOUT_RULE_META: { key: keyof LayoutRules; label: string; description: string }[] = [
  { key: "rightStack", label: "Two medium, stacked on the right", description: "One above the other in the right column." },
  { key: "leftStack", label: "Two medium, stacked on the left", description: "Off: the left column holds one interface." },
  { key: "mediumAloneFills", label: "A medium alone fills its column", description: "Off: it stays half height, at the top." },
  { key: "extended", label: "Extended medium", description: "A medium the column's full height, offered as a size." },
  { key: "extendedPair", label: "Two extended medium, side by side", description: "Next to each other in the supporting column, which widens to hold both." },
  { key: "largeSideBySide", label: "Two large, side by side", description: "Sharing the main area left and right." },
  { key: "largeStacked", label: "Two large, stacked", description: "One above the other beside Chat's sidebar, half the page each way; the bar beside Chat sets the width." },
];

type RulesStore = {
  rules: LayoutRules;
  set: (key: keyof LayoutRules, value: boolean) => void;
  reset: () => void;
};

export const useLayoutRules = create<RulesStore>()(
  persist(
    (set) => ({
      rules: DEFAULT_LAYOUT_RULES,
      set: (key, value) => set((state) => ({ rules: { ...state.rules, [key]: value } })),
      reset: () => set({ rules: DEFAULT_LAYOUT_RULES }),
    }),
    {
      name: "workbench-layout-rules",
      // Rules added later start at their default.
      merge: (saved, current) => ({ ...current, rules: { ...DEFAULT_LAYOUT_RULES, ...((saved as Partial<RulesStore>)?.rules ?? {}) } }),
    },
  ),
);

/** Rules to use instead of the saved ones while drawing a preview of a case. */
let override: LayoutRules | null = null;

/** The rules in force: the saved ones, or a preview's. */
export function layoutRules(): LayoutRules {
  return override ?? useLayoutRules.getState().rules;
}

/** Work something out under other rules (a case's preview, drawn as if it were on). */
export function withLayoutRules<T>(rules: LayoutRules, work: () => T): T {
  const before = override;
  override = rules;
  try {
    return work();
  } finally {
    override = before;
  }
}
