import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/shared/lib/css";
import type { ShellKind, ShellSize } from "../model/shell-types";
import { ShellMarkCrossfade } from "./shell-icons";

/** Critically damped so a size change can be retargeted without bouncing. */
export const SHELL_MORPH_SPRING = { type: "spring" as const, bounce: 0, duration: 0.32 };

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

const RADIUS: Record<ShellSize, number> = {
  small: 14,
  medium: 18,
  "medium-plus": 20,
  large: 20,
};

/** Flying mark is drawn at this size and scaled, so the motion stays on transform. */
const MARK_BASE = 64;

type Box = { x: number; y: number; s: number };

export type ShellMorphOrigin = {
  size: ShellSize;
  width: number;
  height: number;
};

function isSquare(width: number, height: number) {
  return Math.abs(width - height) <= 1;
}

/** Layout position of the mark inside `scope`, relative to `frame`. Ignores transforms. */
function measureMark(scope: HTMLElement, frame: HTMLElement): Box | null {
  const mark = scope.querySelector<HTMLElement>("[data-shell-mark]");
  if (!mark) return null;
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = mark;
  while (node && node !== frame) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  const size = mark.offsetWidth || mark.offsetHeight;
  if (!size) return null;
  return { x, y, s: size };
}

/** A static picture of the shell as it last looked, including typed field values. */
function cloneShell(layer: HTMLElement) {
  const copy = layer.cloneNode(true) as HTMLElement;
  copy.style.transform = "none";
  copy.style.filter = "none";
  copy.style.opacity = "1";
  copy.style.transition = "none";
  const liveFields = layer.querySelectorAll("input, textarea");
  const copyFields = copy.querySelectorAll("input, textarea");
  liveFields.forEach((field, index) => {
    const target = copyFields[index];
    if (target instanceof HTMLInputElement && field instanceof HTMLInputElement) {
      target.value = field.value;
    }
    if (target instanceof HTMLTextAreaElement && field instanceof HTMLTextAreaElement) {
      target.value = field.value;
    }
  });
  return copy;
}

function playGhost(
  frame: HTMLElement,
  ghost: HTMLElement,
  from: ShellMorphOrigin,
  to: { width: number; height: number },
  reduced: boolean,
  hideMark: boolean,
) {
  if (hideMark) {
    ghost.querySelectorAll<HTMLElement>("[data-shell-mark]").forEach((mark) => {
      mark.style.opacity = "0";
    });
  }
  const uniform = isSquare(from.width, from.height) && isSquare(to.width, to.height);
  const shrink = to.width < from.width;
  const scale = !reduced && uniform && shrink ? to.width / from.width : 1;
  ghost.style.position = "absolute";
  ghost.style.left = "50%";
  ghost.style.top = "50%";
  ghost.style.width = `${from.width}px`;
  ghost.style.height = `${from.height}px`;
  ghost.style.margin = "0";
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = "0";
  ghost.style.transformOrigin = "center center";
  frame.appendChild(ghost);
  // The fade is short and starts immediately. A shared ease-in-out held the
  // old name on screen long after the icon had already moved.
  const fade = ghost.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: reduced ? 80 : 120,
    easing: EASE_OUT,
    fill: "forwards",
  });
  if (scale !== 1) {
    ghost.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)" },
        { transform: `translate(-50%, -50%) scale(${scale})` },
      ],
      { duration: reduced ? 80 : 260, easing: EASE_OUT, fill: "forwards" },
    );
  }
  void fade.finished.then(() => ghost.remove()).catch(() => ghost.remove());
  return fade;
}

/**
 * The shell as one object. Square sizes grow out of the previous footprint,
 * or shrink back into it. Crossing the app icon, that tile shrinks onto the
 * title while the card grows out from behind it.
 */
export function ShellMorph({
  kind,
  size,
  width,
  height,
  origin,
  signal,
  className,
  title,
  onClick,
  children,
}: {
  kind: ShellKind;
  size: ShellSize;
  width: number;
  height: number;
  /** The footprint this size is arriving from. Null before the first change. */
  origin: ShellMorphOrigin | null;
  /** Crossfades when content changes without a resize, such as empty → suggestion. */
  signal?: string;
  className?: string;
  title?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion() === true;
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<HTMLElement | null>(null);
  const ghostRef = useRef<Animation | null>(null);
  const markRef = useRef<Box | null>(null);
  const seen = useRef(size);
  const flyingRef = useRef(false);
  const stops = useRef<Array<{ stop: () => void }>>([]);
  const flightGen = useRef(0);
  const signalRef = useRef(signal);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const markScale = useMotionValue(1);
  const tile = useMotionValue(size === "small" ? 1 : 0);
  const shown = useMotionValue(0);

  const arriving = origin !== null && origin.size !== size;
  const uniform = arriving && isSquare(origin.width, origin.height) && isSquare(width, height);
  const growing = arriving && width > origin.width;
  const fromIcon = arriving && origin.size === "small";
  const enterScale = !reduced && uniform && growing ? origin.width / width : 1;

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const layer = layerRef.current;
    if (!frame || !layer) return;
    const from = origin;
    const sizeChanged = seen.current !== size;
    const squareMove =
      sizeChanged &&
      !!from &&
      isSquare(from.width, from.height) &&
      isSquare(width, height);
    // Motion applies the new width on a later frame. Measure against the
    // footprint we're actually arriving at, or a full-bleed icon reads as the
    // whole previous card.
    if (squareMove) {
      frame.style.width = `${width}px`;
      frame.style.height = `${height}px`;
    }
    const measured =
      size === "small" ? { x: 0, y: 0, s: width } : measureMark(layer, frame);

    if (sizeChanged && from && from.size !== size) {
      const fly = !reduced && squareMove && (from.size === "small" || size === "small");
      for (const control of stops.current) control.stop();
      stops.current = [];
      ghostRef.current?.cancel();
      const previous = cacheRef.current;
      if (previous) {
        ghostRef.current = playGhost(frame, previous, from, { width, height }, reduced, fly);
      }

      if (fly && measured && markRef.current) {
        const originMark = markRef.current;
        const dx = (width - from.width) / 2;
        const dy = (height - from.height) / 2;
        x.jump(originMark.x + dx);
        y.jump(originMark.y + dy);
        markScale.jump(originMark.s / MARK_BASE);
        tile.jump(from.size === "small" ? 1 : 0);
        shown.set(1);
        frame.setAttribute("data-flying", "");
        const gen = ++flightGen.current;
        flyingRef.current = true;
        stops.current = [
          animate(x, measured.x, SHELL_MORPH_SPRING),
          animate(y, measured.y, SHELL_MORPH_SPRING),
          animate(markScale, measured.s / MARK_BASE, {
            ...SHELL_MORPH_SPRING,
            onComplete: () => {
              if (flightGen.current !== gen) return;
              flyingRef.current = false;
              shown.set(0);
              frame.removeAttribute("data-flying");
            },
          }),
          animate(tile, size === "small" ? 1 : 0, {
            duration: 0.24,
            ease: [0.23, 1, 0.32, 1],
            delay: 0.1,
          }),
        ];
      } else {
        flyingRef.current = false;
        shown.set(0);
        frame.removeAttribute("data-flying");
      }
      seen.current = size;
    } else if (measured && !flyingRef.current) {
      x.jump(measured.x);
      y.jump(measured.y);
      markScale.jump(measured.s / MARK_BASE);
      tile.jump(size === "small" ? 1 : 0);
    }

    markRef.current = measured;
    // Keep a picture of the settled shell. Mid-fade the layer is transparent,
    // and cloning that would make the next exit invisible.
    if (!sizeChanged && Number(getComputedStyle(layer).opacity) > 0.95) {
      cacheRef.current = cloneShell(layer);
    }

    if (signalRef.current !== signal && !sizeChanged && !reduced) {
      signalRef.current = signal;
      layer.animate(
        [
          { opacity: 0.55, filter: "blur(2px)" },
          { opacity: 1, filter: "blur(0px)" },
        ],
        { duration: 200, easing: EASE_OUT },
      );
    } else {
      signalRef.current = signal;
    }
  });

  return (
    <motion.div
      ref={frameRef}
      className={cn("relative [&[data-flying]_[data-shell-mark]]:opacity-0", className)}
      initial={false}
      animate={{ width, height, borderRadius: RADIUS[size] }}
      transition={arriving && !uniform && !reduced ? SHELL_MORPH_SPRING : { duration: 0 }}
      style={{ overflow: uniform ? "visible" : "hidden" }}
      title={title}
      onClick={onClick}
    >
      <motion.div
        key={size}
        ref={layerRef}
        className="relative z-10 size-full"
        style={{ transformOrigin: "center center" }}
        initial={
          arriving
            ? reduced
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  scale: enterScale,
                  filter: fromIcon ? "blur(4px)" : "blur(2px)",
                }
            : false
        }
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{
          scale: reduced ? { duration: 0 } : SHELL_MORPH_SPRING,
          opacity: {
            duration: reduced ? 0.1 : 0.16,
            ease: [0.23, 1, 0.32, 1],
          },
          filter: { duration: reduced ? 0 : 0.12, ease: [0.23, 1, 0.32, 1] },
        }}
        onAnimationComplete={() => {
          const layer = layerRef.current;
          if (layer && Number(getComputedStyle(layer).opacity) > 0.95) {
            cacheRef.current = cloneShell(layer);
          }
        }}
      >
        {children}
      </motion.div>

      <motion.div
        className="pointer-events-none absolute top-0 left-0 z-30"
        style={{
          width: MARK_BASE,
          height: MARK_BASE,
          x,
          y,
          scale: markScale,
          opacity: shown,
          originX: 0,
          originY: 0,
        }}
      >
        <ShellMarkCrossfade kind={kind} tile={tile} />
      </motion.div>
    </motion.div>
  );
}
