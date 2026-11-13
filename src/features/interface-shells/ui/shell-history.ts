import { useRef, useState } from "react";
import type { ShellHistory } from "./shell-toolbar";

/** Edits closer together than this are one step to undo: a word typed, not each letter. */
const GROUP_MS = 700;
const LIMIT = 100;

/**
 * Undo and redo for an interface's data. Wrap its `onChange` with the one
 * this returns; every change through it is remembered, grouped by pauses.
 * A change from outside (the model writing) isn't a step, but undoing past
 * it goes back to what was there before.
 */
export function useShellHistory<D>(
  data: D,
  onChange: ((data: D) => void) | undefined,
): { onChange: ((data: D) => void) | undefined; history: ShellHistory | null } {
  const [stacks, setStacks] = useState<{ past: D[]; future: D[] }>({ past: [], future: [] });
  const lastEdit = useRef(0);

  if (!onChange) return { onChange, history: null };

  const change = (next: D) => {
    const now = Date.now();
    const sameStep = now - lastEdit.current <= GROUP_MS;
    lastEdit.current = now;
    setStacks((s) => ({ past: sameStep ? s.past : [...s.past.slice(1 - LIMIT), data], future: [] }));
    onChange(next);
  };

  const undo = () => {
    const target = stacks.past.at(-1);
    if (target === undefined) return;
    // The next edit after an undo starts a new step.
    lastEdit.current = 0;
    setStacks({ past: stacks.past.slice(0, -1), future: [...stacks.future, data] });
    onChange(target);
  };

  const redo = () => {
    const target = stacks.future.at(-1);
    if (target === undefined) return;
    lastEdit.current = 0;
    setStacks({ past: [...stacks.past, data], future: stacks.future.slice(0, -1) });
    onChange(target);
  };

  return {
    onChange: change,
    history: { undo, redo, canUndo: stacks.past.length > 0, canRedo: stacks.future.length > 0 },
  };
}
