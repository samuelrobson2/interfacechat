import { useState } from "react";

// Shared, persisted design toggle for the Studio/Build workspaces: when on, the
// Build/Studio switcher floats above the content (in a glassy button) instead of
// living in the sidebar header. Studio and Build are never mounted at the same
// time, so each layout just reads the persisted value on mount.
const KEY = "workspace.floatingSwitcher";

const read = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export function useFloatingSwitcher(): [boolean, () => void] {
  const [floating, setFloating] = useState(read);

  const toggle = () =>
    setFloating((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });

  return [floating, toggle];
}
