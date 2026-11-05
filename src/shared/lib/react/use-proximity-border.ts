import { useEffect, useRef } from "react";
import {
  attachProximityBorder,
  type ProximityBorderOptions,
} from "@/shared/lib/proximity-border";

/**
 * Attaches the iridescent proximity border to a single element for its lifetime.
 * Returns a ref to spread onto the target element.
 */
export function useProximityBorder<T extends HTMLElement>(
  options: ProximityBorderOptions = {},
) {
  const ref = useRef<T>(null);
  // Capture the initial options; callers pass static option literals.
  const optionsRef = useRef(options);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attachProximityBorder(el, optionsRef.current);
  }, []);

  return ref;
}
