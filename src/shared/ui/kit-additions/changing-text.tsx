import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/shared/lib/css";
import { GradientText } from "@/shared/ui/gradient-text";

/**
 * Text that flashes the AI gradient when it changes.
 *
 * The new value is simply there — no reveal, no reflow. It arrives lit in the
 * purple gradient and fades back to its own colour, which is enough to catch the
 * eye somewhere the change didn't happen: a breadcrumb re-pointing itself because
 * the dataset was switched down in the composer. Anything louder reads as an
 * event of its own rather than an echo of the one the user just caused.
 *
 * The lit copy is an overlay rather than a colour swap on the text itself — a
 * gradient is `background-clip: text`, which can't be cross-faded to a solid
 * colour, so the two are stacked and the top one fades out.
 */
export function ChangingText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  // Seeded during render rather than in an effect, so the flash lands on the same
  // commit that delivers the new value — and it's cleared by the fade's own
  // completion rather than by a timer racing it.
  const [state, setState] = useState({ text, lit: false });

  if (state.text !== text) {
    setState({ text, lit: !reduce });
  }

  // `state.text !== text` covers the render that seeds the change: the state
  // update hasn't been applied yet, so there's nothing lit to draw.
  if (!state.lit || state.text !== text) {
    return <span className={className}>{text}</span>;
  }

  return (
    // Both layers truncate themselves rather than leaning on the caller's
    // `truncate`, which can't reach inside a positioned box: without this, a
    // label long enough to clip loses its "…" for the length of the flash and
    // pops it back at the end.
    <span className={cn("relative block max-w-full truncate", className)}>
      {text}
      <motion.span
        aria-hidden
        className="absolute inset-0 truncate"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        // Held lit for a beat before it hands the text back — a fade that starts
        // immediately is over before it's been registered.
        transition={{ duration: FADE_MS / 1000, delay: HOLD_MS / 1000 }}
        onAnimationComplete={() =>
          setState((current) => ({ ...current, lit: false }))
        }
      >
        <GradientText variant="purple">
          {text}
        </GradientText>
      </motion.span>
    </span>
  );
}

const HOLD_MS = 400;
const FADE_MS = 700;
