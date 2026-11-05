import { useEffect, useState } from "react";

export function useInterfaceSkeleton(stepsCount: number, intervalMs = 2600) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepsCount <= 1) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % stepsCount);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [stepsCount, intervalMs]);

  return stepIndex;
}
