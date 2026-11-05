import { useEffect, useState } from "react";

import { useVisualizeHighlightStore } from "./visualize-highlight-store";

/** Tailwind `lg`. Highlight chrome does not fit below this. */
export const HIGHLIGHT_MIN_WIDTH_PX = 1024;

const HIGHLIGHT_VIEWPORT_QUERY = `(min-width: ${HIGHLIGHT_MIN_WIDTH_PX}px)`;

export function useIsHighlightViewport() {
  const [isLgUp, setIsLgUp] = useState(
    () => window.matchMedia(HIGHLIGHT_VIEWPORT_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(HIGHLIGHT_VIEWPORT_QUERY);
    const handleChange = () => {
      setIsLgUp(mql.matches);
      if (!mql.matches) useVisualizeHighlightStore.getState().reset();
    };

    handleChange();
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isLgUp;
}
