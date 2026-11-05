import { useEffect, useRef, useState, type RefObject } from "react";

type UseInViewOptions = {
  /** Once visible, stay visible forever (no unobserve toggle) */
  once?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
  rootRef?: RefObject<Element | null>;
};

export const useInView = <T extends HTMLElement = HTMLElement>(
  options: UseInViewOptions = {},
) => {
  const {
    once = false,
    rootMargin = "200px 0px",
    threshold = 0,
    enabled = true,
    rootRef,
  } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsInView(false);
        }
      },
      { root: rootRef?.current ?? null, rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold, enabled, rootRef]);

  return { ref, isInView };
};
