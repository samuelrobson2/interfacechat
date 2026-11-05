import { useState, useSyncExternalStore } from "react";

import aiPoster from "@/shared/assets/images/ai-avatar.png";
import { cn } from "@/shared/lib/css";
import { avatarAnimations, type AvatarPhase } from "../_lib/avatar-animations";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

// Subscribe to the OS motion preference without an effect.
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

export function ChatAiAvatar({
  active,
  preload = false,
  className,
}: {
  // Whether the avatar should "wake up": user typing / sending on home,
  // assistant answering in chat. Drives the idle -> transition -> thinking machine.
  active: boolean;
  preload?: boolean;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Finite state machine reconciled during render (no effects). Initialized from
  // `active` so an avatar that mounts already active (e.g. a chat message that
  // appears while the assistant is answering) animates instead of staying idle.
  const [phase, setPhase] = useState<AvatarPhase>(
    active ? "transition" : "idle",
  );
  const [wasActive, setWasActive] = useState(active);

  if (active !== wasActive) {
    setWasActive(active);
    setPhase(active ? "transition" : "idle");
  }

  if (prefersReducedMotion) {
    return <img src={aiPoster} alt="AI" className={className} />;
  }

  const isTransition = phase === "transition";
  const isThinking = phase === "thinking";

  const overlayClassName = "absolute inset-0 h-full w-full object-contain";

  return (
    <div className={cn("relative", className)}>
      <video
        src={avatarAnimations.idle}
        poster={aiPoster}
        className="block h-auto w-full"
        autoPlay
        loop
        muted
        playsInline
        aria-label="AI"
      />

      {(preload || isTransition) && (
        <video
          key={isTransition ? "transition-play" : "transition-idle"}
          src={avatarAnimations.transition}
          className={cn(
            overlayClassName,
            isTransition ? "opacity-100" : "opacity-0",
          )}
          preload="auto"
          autoPlay={isTransition}
          muted
          playsInline
          aria-hidden="true"
          onEnded={() => setPhase("thinking")}
        />
      )}

      {(preload || isThinking) && (
        <video
          key={isThinking ? "thinking-play" : "thinking-idle"}
          src={avatarAnimations.thinking}
          className={cn(
            overlayClassName,
            isThinking ? "opacity-100" : "opacity-0",
          )}
          preload="auto"
          autoPlay={isThinking}
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      )}
    </div>
  );
}
