import {
  ChatInteractiveFrame,
  useInterfaceSkeleton,
} from "@/services/chat";
import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Text } from "@/shared/ui/kit/text";
import { useEffect, useState } from "react";

type SkeletonRect = {
  left: string;
  top: string;
  width: string;
  height: string;
  radius: string;
  rotate?: string;
};

type ChartStep = {
  layout: SkeletonRect[];
  fillUnderLine: boolean;
  heights?: number[];
};

const MARKS = 8;
const BAR_HEIGHTS = [36, 50, 44, 62, 54, 68, 52, 58];
const AREA_HEIGHTS = [32, 40, 55, 76, 58, 38, 46, 52];
const BAR_WIDTH = 5;
const BAR_START = 8;
const BAR_STEP = 10.7;
const BASELINE = 88;
const DOT_W = 2.4;
const DOT_H = 5.4;
const LINE_THICKNESS_PX = 6;
const AXIS_THICKNESS_PX = 4;
const MORPH_MS = 900;
const UNROTATE_MS = 500;
const UNROTATE_THEN_MOVE_MS = 800;
const STAGGER_MS = 60;

const pct = (value: number) => `${value}%`;

const AXIS_X: SkeletonRect = {
  left: pct(6),
  top: pct(88),
  width: pct(88),
  height: `${AXIS_THICKNESS_PX}px`,
  radius: "2px",
};
const AXIS_Y: SkeletonRect = {
  left: pct(6),
  top: pct(10),
  width: `${AXIS_THICKNESS_PX}px`,
  height: pct(78),
  radius: "2px",
};
const AXIS_Y_CENTER: SkeletonRect = {
  left: `calc(50% - ${AXIS_THICKNESS_PX / 2}px)`,
  top: pct(10),
  width: `${AXIS_THICKNESS_PX}px`,
  height: pct(78),
  radius: "2px",
};

function barPoint(index: number, heights: number[] = BAR_HEIGHTS) {
  return {
    x: BAR_START + index * BAR_STEP + BAR_WIDTH / 2,
    y: BASELINE - (heights[index] ?? 0),
  };
}

function verticalBars(): SkeletonRect[] {
  const marks = BAR_HEIGHTS.map((height, i) => ({
    left: pct(BAR_START + i * BAR_STEP),
    top: pct(BASELINE - height),
    width: pct(BAR_WIDTH),
    height: pct(height),
    radius: "4px",
  }));
  return [...marks, AXIS_X, AXIS_Y];
}

function lineChart(heights: number[] = BAR_HEIGHTS): SkeletonRect[] {
  const half = LINE_THICKNESS_PX / 2;
  const marks = Array.from({ length: MARKS }, (_, i) => {
    const from = barPoint(i, heights);
    const to = barPoint(Math.min(i + 1, MARKS - 1), heights);
    const isCap = i === MARKS - 1;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = `hypot(${dx}cqw, ${dy}cqh)`;

    if (isCap) {
      return {
        left: `calc(${pct(from.x)} - ${half}px)`,
        top: `calc(${pct(from.y)} - ${half}px)`,
        width: `${LINE_THICKNESS_PX}px`,
        height: `${LINE_THICKNESS_PX}px`,
        radius: "999px",
      };
    }

    // Anchor at the segment center so unrotate doesn't swing from the left edge.
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    return {
      left: `calc(${pct(midX)} - ${length} / 2)`,
      top: `calc(${pct(midY)} - ${half}px)`,
      width: length,
      height: `${LINE_THICKNESS_PX}px`,
      radius: "999px",
      rotate: `atan2(${dy}cqh, ${dx}cqw)`,
    };
  });
  return [...marks, AXIS_X, AXIS_Y];
}

function layoutHasRotation(layout: SkeletonRect[]) {
  return layout.some((rect) => rect.rotate);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function lerpHeights(from: number[], to: number[], t: number) {
  return from.map((height, index) => height + ((to[index] ?? height) - height) * t);
}

function useInterpolatedHeights(target: number[] | undefined, durationMs: number) {
  const [prevTarget, setPrevTarget] = useState(target);
  const [anim, setAnim] = useState<{ from: number[]; to: number[] } | null>(
    null,
  );
  const [elapsed, setElapsed] = useState(0);

  if (target !== prevTarget) {
    setPrevTarget(target);
    setElapsed(0);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnim(
      !reduceMotion && target && prevTarget
        ? { from: prevTarget, to: target }
        : null,
    );
  }

  const progress = anim ? Math.min(1, elapsed / durationMs) : 1;
  const heights = anim
    ? progress >= 1
      ? anim.to
      : lerpHeights(anim.from, anim.to, easeInOut(progress))
    : target;

  useEffect(() => {
    if (!anim) return;

    let frame = 0;
    let startTime = 0;
    const tick = (time: number) => {
      if (!startTime) startTime = time;
      const elapsedMs = time - startTime;
      setElapsed(elapsedMs);
      if (elapsedMs < durationMs) {
        frame = window.requestAnimationFrame(tick);
      }
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [anim, durationMs]);

  return { heights, isMorphing: Boolean(anim && progress < 1) };
}

function markTransition(index: number, unrotateFirst: boolean) {
  const staggerMs = index * STAGGER_MS;
  const boxMs = unrotateFirst ? UNROTATE_THEN_MOVE_MS : MORPH_MS;
  const boxDelayMs = unrotateFirst ? UNROTATE_MS + staggerMs : staggerMs;
  const rotateMs = unrotateFirst ? UNROTATE_MS : MORPH_MS;

  return [
    `left ${boxMs}ms ease-in-out ${boxDelayMs}ms`,
    `top ${boxMs}ms ease-in-out ${boxDelayMs}ms`,
    `width ${boxMs}ms ease-in-out ${boxDelayMs}ms`,
    `height ${boxMs}ms ease-in-out ${boxDelayMs}ms`,
    `border-radius ${boxMs}ms ease-in-out ${boxDelayMs}ms`,
    `rotate ${rotateMs}ms ease-in-out ${staggerMs}ms`,
  ].join(", ");
}

function horizontalBars(): SkeletonRect[] {
  const widths = [70, 52, 78, 40, 64, 34, 58, 46];
  const marks = widths.map((width, i) => ({
    left: pct(12),
    top: pct(12 + i * 9.5),
    width: pct(width),
    height: pct(7),
    radius: "4px",
  }));
  return [...marks, AXIS_X, AXIS_Y];
}

function butterflyChart(): SkeletonRect[] {
  const leftWidths = [22, 34, 28, 18];
  const rightWidths = [24, 38, 26, 20];
  const rowHeight = 11;
  const rowStart = 18;
  const rowStep = 16;
  const center = 50;
  const gap = 1.2;

  const marks = Array.from({ length: MARKS }, (_, i) => {
    const row = Math.floor(i / 2);
    const isLeft = i % 2 === 0;
    const top = rowStart + row * rowStep;
    const width = (isLeft ? leftWidths[row] : rightWidths[row]) ?? 20;

    return {
      left: pct(isLeft ? center - gap - width : center + gap),
      top: pct(top),
      width: pct(width),
      height: pct(rowHeight),
      radius: "4px",
    };
  });
  return [...marks, AXIS_X, AXIS_Y_CENTER];
}

function scatterDots(): SkeletonRect[] {
  const points: Array<[number, number]> = [
    [16, 38],
    [28, 18],
    [40, 52],
    [52, 26],
    [64, 44],
    [76, 14],
    [22, 68],
    [70, 62],
  ];
  const marks = points.map(([left, top]) => ({
    left: pct(left),
    top: pct(top),
    width: pct(DOT_W),
    height: pct(DOT_H),
    radius: "999px",
  }));
  return [...marks, AXIS_X, AXIS_Y];
}

const CHART_STEPS: ChartStep[] = [
  { layout: verticalBars(), fillUnderLine: false },
  { layout: lineChart(BAR_HEIGHTS), fillUnderLine: false, heights: BAR_HEIGHTS },
  { layout: lineChart(AREA_HEIGHTS), fillUnderLine: true, heights: AREA_HEIGHTS },
  { layout: horizontalBars(), fillUnderLine: false },
  { layout: butterflyChart(), fillUnderLine: false },
  { layout: scatterDots(), fillUnderLine: false },
];

function AreaFill({
  visible,
  heights,
}: {
  visible: boolean;
  heights: number[];
}) {
  const points = Array.from({ length: MARKS }, (_, i) => barPoint(i, heights));
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return null;

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <path
        d={`${line} L ${last.x} ${BASELINE} L ${first.x} ${BASELINE} Z`}
        className={cn(
          "fill-skeleton-primary transition-opacity duration-500 ease-in-out motion-reduce:transition-none",
          visible ? "opacity-50" : "opacity-0",
        )}
      />
    </svg>
  );
}

function ChartMorphSkeleton() {
  const stepIndex = useInterfaceSkeleton(CHART_STEPS.length);
  const step = CHART_STEPS[stepIndex];
  const { heights: lineHeights, isMorphing: isPolylineMorph } =
    useInterpolatedHeights(step?.heights, MORPH_MS);
  if (!step) return null;

  const prevStep =
    CHART_STEPS[(stepIndex + CHART_STEPS.length - 1) % CHART_STEPS.length];
  // Line segments must flatten before they grow, or the morph becomes thick diagonal sticks.
  const unrotateFirst =
    layoutHasRotation(prevStep?.layout ?? []) &&
    !layoutHasRotation(step.layout);
  const layout = step.heights
    ? lineChart(lineHeights ?? step.heights)
    : step.layout;

  return (
    <div className="relative size-full @container-[size]">
      <AreaFill
        visible={step.fillUnderLine}
        heights={lineHeights ?? step.heights ?? AREA_HEIGHTS}
      />
      {layout.map((rect, index) => (
        <Skeleton
          key={index}
          className="absolute z-10 motion-reduce:transition-none!"
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            borderRadius: rect.radius,
            rotate: rect.rotate ?? "0deg",
            transition: isPolylineMorph
              ? "none"
              : markTransition(index, unrotateFirst),
          }}
        />
      ))}
    </div>
  );
}

export function VisualizeChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex w-full min-w-0 flex-col gap-3", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Visualizing chart"
    >
      <Text variant="label" color="secondary">
        Visualizing your chart...
      </Text>
      <ChatInteractiveFrame status="saving">
        <div className="relative h-[318px] w-full p-6">
          <ChartMorphSkeleton />
        </div>
      </ChatInteractiveFrame>
      <span className="sr-only">Visualizing your chart…</span>
    </div>
  );
}
