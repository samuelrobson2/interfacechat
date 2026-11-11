/**
 * Back, forward and history for one interface. Each non-chat interface has its
 * own stack. Only opening a different artifact records an entry: edits,
 * streaming, focus and layout changes never do.
 *
 * This is separate from a document's edit undo, its version history and the
 * workspace's layout undo.
 */

/** Where to put the view back when returning to an entry. */
export type NavView = { scrollTop?: number };

export type NavEntry = {
  /** The artifact's id, as the rest of the app knows it. */
  artifactId: string;
  /** The title when it was visited; the live title wins when the artifact still exists. */
  title: string;
  view?: NavView;
};

export type NavStack = { entries: NavEntry[]; index: number };

export function createNavStack(entry: NavEntry): NavStack {
  return { entries: [entry], index: 0 };
}

export function currentEntry(stack: NavStack): NavEntry | undefined {
  return stack.entries[stack.index];
}

export const canGoBack = (stack: NavStack) => stack.index > 0;
export const canGoForward = (stack: NavStack) => stack.index < stack.entries.length - 1;

/** Visit somewhere new: drops the forward branch, and skips a repeat of where you are. */
export function navPush(stack: NavStack, entry: NavEntry): NavStack {
  if (currentEntry(stack)?.artifactId === entry.artifactId) return stack;
  const entries = [...stack.entries.slice(0, stack.index + 1), entry];
  return { entries, index: entries.length - 1 };
}

export function navGo(stack: NavStack, index: number): NavStack {
  if (index < 0 || index >= stack.entries.length || index === stack.index) return stack;
  return { ...stack, index };
}

export const navBack = (stack: NavStack) => navGo(stack, stack.index - 1);
export const navForward = (stack: NavStack) => navGo(stack, stack.index + 1);

/** Remember the current entry's scroll before leaving it. Not a new entry. */
export function navSaveView(stack: NavStack, view: NavView): NavStack {
  const current = currentEntry(stack);
  if (!current) return stack;
  const entries = [...stack.entries];
  entries[stack.index] = { ...current, view };
  return { ...stack, entries };
}
