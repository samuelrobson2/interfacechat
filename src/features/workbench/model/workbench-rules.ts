/**
 * Which arrangements the workbench allows. The layout controller and the
 * geometry read these, so they decide what Move to offers, where drops land,
 * and how windows are drawn. They're settled: fixed at the defaults below.
 * Tests can work under others with `withLayoutRules`.
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

/** Rules to use instead of the defaults, for the length of `withLayoutRules`. */
let override: LayoutRules | null = null;

/** The rules in force. */
export function layoutRules(): LayoutRules {
  return override ?? DEFAULT_LAYOUT_RULES;
}

/** Work something out under other rules (tests). */
export function withLayoutRules<T>(rules: LayoutRules, work: () => T): T {
  const before = override;
  override = rules;
  try {
    return work();
  } finally {
    override = before;
  }
}
