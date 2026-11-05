import { useState } from "react";

/**
 * Returns `value`, except while `isHeld` is true — then it keeps returning the
 * last value seen before the hold started.
 */
export function useHeldValue<T>(value: T, isHeld: boolean): T {
  const [heldValue, setHeldValue] = useState(value);

  if (!isHeld && heldValue !== value) setHeldValue(value);

  return isHeld ? heldValue : value;
}
