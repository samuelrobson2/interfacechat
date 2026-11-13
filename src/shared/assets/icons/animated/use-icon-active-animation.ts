import { useState } from "react";

/**
 * Bumps a counter when `active` transitions from false → true so motion
 * components can key off it and replay their entrance animation.
 */
export function useIconActiveAnimation(active?: boolean) {
  const [tick, setTick] = useState(0);
  const [wasActive, setWasActive] = useState(false);

  // Track the previous `active` during render rather than in an effect.
  if (!!active !== wasActive) {
    setWasActive(!!active);
    if (active) setTick((value) => value + 1);
  }

  return tick;
}
