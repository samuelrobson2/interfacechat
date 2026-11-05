import { useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

interface Shape {
  width: number;
  height: number;
  radius: number;
  iconY: number;
}

const keys: (keyof Shape)[] = ["width", "height", "radius", "iconY"];

/** Retargets from the current size and keeps its velocity if the target changes. */
export function useMorphSpring(
  surface: RefObject<HTMLDivElement | null>,
  icon: RefObject<HTMLSpanElement | null>,
  layout: RefObject<HTMLDivElement | null>,
  target: Shape,
) {
  const reduced = useRef(false);
  const position = useRef({ ...target });
  const destination = useRef({ ...target });
  const velocity = useRef<Shape>({ width: 0, height: 0, radius: 0, iconY: 0 });
  const frame = useRef(0);
  const previousTime = useRef(0);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useLayoutEffect(() => {
    destination.current = { ...target };
    const paint = () => {
      const current = position.current;
      const scaleX = current.width / 328;
      const scaleY = current.height / 236;
      if (surface.current) {
        surface.current.style.transform = `scale(${scaleX}, ${scaleY})`;
        surface.current.style.borderRadius = `${current.radius / scaleX}px / ${current.radius / scaleY}px`;
      }
      if (icon.current) {
        icon.current.style.transform = `translate(14px, ${current.iconY}px)`;
      }
      if (layout.current) {
        layout.current.style.height = `${current.height}px`;
      }
    };
    const tick = (time: number) => {
      const elapsed = Math.min((time - (previousTime.current || time)) / 1000, 0.032);
      previousTime.current = time;
      let moving = false;
      for (const key of keys) {
        for (let step = 0; step < 4; step++) {
          const dt = elapsed / 4;
          const acceleration =
            480 * (destination.current[key] - position.current[key]) -
            44 * velocity.current[key];
          velocity.current[key] += acceleration * dt;
          position.current[key] += velocity.current[key] * dt;
        }
        if (
          Math.abs(destination.current[key] - position.current[key]) > 0.04 ||
          Math.abs(velocity.current[key]) > 0.08
        ) {
          moving = true;
        } else {
          position.current[key] = destination.current[key];
          velocity.current[key] = 0;
        }
      }
      paint();
      frame.current = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) previousTime.current = 0;
    };
    if (!mounted.current || reduced.current) {
      mounted.current = true;
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
      previousTime.current = 0;
      position.current = { ...target };
      velocity.current = { width: 0, height: 0, radius: 0, iconY: 0 };
      paint();
    } else if (!frame.current) {
      frame.current = requestAnimationFrame(tick);
    }
  }, [target.width, target.height, target.radius, target.iconY, surface, icon, layout]);

  // React style updates drop imperative motion. Put the current pose back
  // after every render so the icon stays shifted and the slot keeps its height.
  useLayoutEffect(() => {
    const current = position.current;
    const scaleX = current.width / 328;
    const scaleY = current.height / 236;
    if (surface.current) {
      surface.current.style.transform = `scale(${scaleX}, ${scaleY})`;
      surface.current.style.borderRadius = `${current.radius / scaleX}px / ${current.radius / scaleY}px`;
    }
    if (icon.current) {
      icon.current.style.transform = `translate(14px, ${current.iconY}px)`;
    }
    if (layout.current) {
      layout.current.style.height = `${current.height}px`;
    }
  });

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );
}
