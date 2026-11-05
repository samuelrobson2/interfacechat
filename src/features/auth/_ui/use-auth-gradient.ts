import { useCallback, useState } from "react";

export type AuthGradientPhase = "in" | "idle" | "out";

// Keep in sync with the exit animation duration in styles/auth-gradient.css.
const EXIT_DURATION_MS = 1300;

type UseAuthGradientOptions = {
  animateIn?: boolean;
};

export function useAuthGradient({
  animateIn = true,
}: UseAuthGradientOptions = {}) {
  const [phase, setPhase] = useState<AuthGradientPhase>(
    animateIn ? "in" : "idle",
  );

  // Starts the exit animation and resolves once it has finished, so callers
  // can await it before navigating away.
  const playExit = useCallback(
    () =>
      new Promise<void>((resolve) => {
        setPhase("out");
        window.setTimeout(resolve, EXIT_DURATION_MS);
      }),
    [],
  );

  return { phase, playExit };
}
