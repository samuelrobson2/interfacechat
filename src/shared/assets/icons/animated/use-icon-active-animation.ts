import { useEffect, useRef, useState } from "react";

/**
 * Bumps a counter when `active` transitions from false → true so motion
 * components can key off it and replay their entrance animation.
 */
export function useIconActiveAnimation(active?: boolean) {
  const [tick, setTick] = useState(0);
  const wasActive = useRef(false);

  useEffect(() => {
    if (active && !wasActive.current) {
      setTick((value) => value + 1);
    }
    wasActive.current = !!active;
  }, [active]);

  return tick;
}
