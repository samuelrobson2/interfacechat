import { useEffect, useState } from "react";

const DEFAULT_SPEED_MS = 28;

/**
 * Reveals `text` one character at a time. Restarts whenever `text` changes, so
 * the caller can replay the animation by remounting or swapping the string.
 */
export function useTypewriter(text: string, speed = DEFAULT_SPEED_MS) {
  const [count, setCount] = useState(0);
  const [prevText, setPrevText] = useState(text);

  // Restart when the text changes (adjusting state during render, not in an effect).
  if (text !== prevText) {
    setPrevText(text);
    setCount(0);
  }

  useEffect(() => {
    if (count >= text.length) return;
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [count, text, speed]);

  return { typed: text.slice(0, count), done: count >= text.length };
}
