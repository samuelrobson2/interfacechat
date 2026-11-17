import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

/** A soft fade with a small rise, a touch of blur clearing as it settles. */
const FADE = { duration: 0.8, ease: [0.23, 1, 0.32, 1] as const, delay: 0.15 };
/** How far through the fade it reads as there: the ease is front-loaded, so by now it nearly is. */
const READ_AT = 0.55;

/**
 * A headline that fades in, then calls `onDone` (the interfaces wait for it).
 * With reduced motion it's there at once.
 */
export function FadeText({ children, onDone }: { children: React.ReactNode; onDone?: () => void }) {
  const reduce = Boolean(useReducedMotion());
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  // Done once it reads, a little before the fade has fully settled, so what follows comes straight after.
  // On a timer, so it never waits on an animation event.
  useEffect(() => {
    const timer = window.setTimeout(() => done.current?.(), reduce ? 0 : (FADE.delay + FADE.duration * READ_AT) * 1000);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  return (
    <motion.span
      className="inline-block"
      initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduce ? { duration: 0 } : FADE}
    >
      {children}
    </motion.span>
  );
}
