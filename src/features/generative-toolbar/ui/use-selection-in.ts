import { useEffect, useState } from "react";
import { TOOLS_ATTRIBUTE } from "./generative-toolbar";

/** Text selected inside `root`, in a field or in rendered content. */
export function useSelectionIn(root: React.RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      const container = root.current;
      if (!container) return;
      const active = document.activeElement;
      // Using a tool (a slider, the 2×2) isn't leaving the selection.
      if (active?.closest(`[${TOOLS_ATTRIBUTE}]`)) return;
      let text = "";
      if (
        (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) &&
        container.contains(active)
      ) {
        const { selectionStart: start, selectionEnd: end } = active;
        if (start != null && end != null && end > start) text = active.value.slice(start, end);
      } else {
        const range = window.getSelection();
        if (range && !range.isCollapsed && range.anchorNode && container.contains(range.anchorNode)) {
          text = range.toString();
        }
      }
      const next = text.trim().length > 1 ? text.trim() : null;
      setSelection((current) => (current === next ? current : next));
    };
    document.addEventListener("selectionchange", read);
    // Field selections don't fire selectionchange everywhere; these catch the rest.
    document.addEventListener("mouseup", read);
    document.addEventListener("keyup", read);
    return () => {
      document.removeEventListener("selectionchange", read);
      document.removeEventListener("mouseup", read);
      document.removeEventListener("keyup", read);
    };
  }, [root]);

  return selection;
}
