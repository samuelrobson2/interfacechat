import { cn } from "@/shared/lib/css";
import type { AuthGradientPhase } from "./use-auth-gradient";

export function AuthGradientBackground({
  phase = "in",
  className,
}: {
  phase?: AuthGradientPhase;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      data-phase={phase}
      className={cn(
        "auth-bg pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      {/* Fades in (white -> grey -> dark base), then the bottom gradient
          stretches up; fades back out to white on login. */}
      <div className="auth-bg__gradient absolute inset-0" />
    </div>
  );
}
