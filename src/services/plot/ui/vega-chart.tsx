import { cn } from "@/shared/lib/css";
import {
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, parse } from "vega";
import { expressionInterpreter } from "vega-interpreter";
import { compile, type TopLevelSpec } from "vega-lite";
import { numiVegaConfig } from "../lib/numi-vega-config";
import { scopePatterns } from "../lib/numi-vega-patterns";
import { describeTarget, targetKey, type PlotTarget } from "../lib/plot-target";
import { createNumiTooltip } from "../lib/vega-tooltip";
import { VegaPatternDefs } from "./vega-pattern-defs";

type VegaChartProps = {
  spec: TopLevelSpec;
  datasets?: Record<string, readonly unknown[]>;
  className?: string;
  /** Turns highlight mode on. Called with `null` when the click hit no target. */
  onSelect?: (target: PlotTarget | null) => void;
  /** The element highlight mode currently holds — drawn as a persistent box. */
  selection?: PlotTarget | null;
  /** Rendered in the chart's own coordinate space, beside `selection`. */
  selectionSlot?: React.ReactNode;
  /** Names the resolved role and pointer on hover — a contract debugging aid. */
  showPointerChip?: boolean;
};

const NO_DATASETS: Record<string, readonly unknown[]> = {};

/**
 * Vega stamps every row it ingests with a `Symbol(vega_id)`, so the rows have to
 * be its own to write on. Callers hand over rows straight from an API payload,
 * and a payload that has been through an immer store comes back frozen — which
 * makes the stamp throw. Only the row itself is stamped, so a shallow copy is
 * all the isolation the view needs.
 */
const writableRows = (rows: readonly unknown[]) =>
  rows.map((row) =>
    row !== null && typeof row === "object" ? { ...row } : row,
  ) as object[];

const HITTABLE_CHROME =
  "[&_[class*='role-axis']]:pointer-events-auto [&_[class*='role-legend']]:pointer-events-auto";

/**
 * Re-reads the host for a spec sized `"container"`.
 *
 * Vega measures the container once, then only again on `window:resize`, so a
 * container that changes on its own — a sidebar, a panel, a scrollbar — leaves
 * the size signal behind. `view.resize()` relays out the old size rather than
 * measuring a new one, which makes this the only way to follow the host.
 */
const syncContainerSize = (
  view: View,
  host: HTMLElement,
  spec: TopLevelSpec,
) => {
  const sized = spec as { width?: unknown; height?: unknown };
  if (sized.width === "container") view.width(host.clientWidth);
  if (sized.height === "container") view.height(host.clientHeight);
};

/**
 * Mounts a Vega-Lite spec as SVG.
 *
 * The View is created by hand instead of through `vega-embed` because we need
 * two non-default options: `ast: true` on the parser and `expr:
 * expressionInterpreter` on the view, which together replace Vega's
 * `new Function` codegen with an AST walker and let the chart run under a CSP
 * without `unsafe-eval`.
 */
export function VegaChart({
  spec,
  datasets = NO_DATASETS,
  className,
  onSelect,
  selection,
  selectionSlot,
  showPointerChip = false,
}: VegaChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<PlotTarget | null>(null);
  const [failure, setFailure] = useState<{
    spec: object;
    message: string;
  } | null>(null);

  const scope = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { spec: scopedSpec, patterns } = useMemo(
    () => scopePatterns(spec, scope),
    [spec, scope],
  );

  const dropSelection = useEffectEvent(() => {
    if (selection) onSelect?.(null);
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let view: View | null = null;
    let observer: ResizeObserver | null = null;
    let cancelled = false;
    const tooltip = createNumiTooltip(host);

    const fail = (cause: unknown) => {
      if (cancelled) return;
      setFailure({
        spec: scopedSpec as object,
        message: cause instanceof Error ? cause.message : String(cause),
      });
    };

    try {
      const { spec: vegaSpec } = compile(scopedSpec, {
        config: numiVegaConfig,
      });
      const runtime = parse(vegaSpec, undefined, { ast: true });

      view = new View(runtime, {
        renderer: "svg",
        container: host,
        hover: true,
        expr: expressionInterpreter,
        tooltip: tooltip.handler,
      });

      for (const [name, rows] of Object.entries(datasets)) {
        view.data(name, writableRows(rows));
      }

      void view.runAsync().catch(fail);

      observer = new ResizeObserver(() => {
        if (!view) return;
        // A resize relays out the plot, so a selection box measured before it
        // would point at nothing. There is no cheap way to re-measure.
        dropSelection();
        syncContainerSize(view, host, scopedSpec);
        void view.resize().runAsync().catch(fail);
      });
      observer.observe(host);
    } catch (cause) {
      fail(cause);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      tooltip.destroy();
      view?.finalize();
      host.replaceChildren();
    };
  }, [scopedSpec, datasets]);

  const clearHighlight = () => {
    targetRef.current = null;
    if (outlineRef.current) outlineRef.current.style.opacity = "0";
    if (chipRef.current) chipRef.current.style.opacity = "0";
    if (hostRef.current) hostRef.current.style.cursor = "";
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const host = hostRef.current;
    const outline = outlineRef.current;
    if (!host || !outline) return;

    const target = describeTarget(
      event.target,
      host.getBoundingClientRect(),
      spec,
    );
    targetRef.current = target;

    if (!target) {
      clearHighlight();
      return;
    }

    const { x, y, width, height } = target.bbox;
    outline.style.opacity = "1";
    outline.style.transform = `translate(${x}px, ${y}px)`;
    outline.style.width = `${width}px`;
    outline.style.height = `${height}px`;

    const chip = chipRef.current;
    if (chip) {
      chip.textContent = `${target.label} · ${target.pointer}`;
      chip.style.opacity = "1";
      const chipY = y > 22 ? y - 22 : y + height + 6;
      chip.style.transform = `translate(${x}px, ${chipY}px)`;
    }

    host.style.cursor = "pointer";
  };

  // Clicking the element that is already selected drops the selection, which is
  // how a user closes the suggestions without leaving highlight mode.
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // `selectionSlot` lives inside this handler's element, so a click on the
    // suggestions must not read the chart target left behind by the last hover.
    if (!hostRef.current?.contains(event.target as Node)) return;

    const target = targetRef.current;
    const isSelected =
      target && selection && targetKey(target) === targetKey(selection);
    onSelect?.(isSelected ? null : target);
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div
        className="relative w-full min-w-0"
        onPointerMove={onSelect ? handlePointerMove : undefined}
        onPointerLeave={onSelect ? clearHighlight : undefined}
        onClick={onSelect ? handleClick : undefined}
      >
        <VegaPatternDefs refs={patterns} />

        {/* The host stays mounted after a failure, so a later spec can recover. */}
        <div
          ref={hostRef}
          className={cn(
            "w-full min-w-0",
            onSelect && HITTABLE_CHROME,
            className,
          )}
        />

        {onSelect ? (
          <>
            <div
              ref={outlineRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 border border-dashed border-blue-4/50 bg-blue-2/15 opacity-0"
            />
            {showPointerChip ? (
              <div
                ref={chipRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 whitespace-nowrap border border-gray-2 bg-background-primary px-1.5 py-0.5 font-bureau text-[10px] font-light text-typography-secondary opacity-0"
              />
            ) : null}

            {selection ? (
              <div
                aria-hidden="true"
                style={{
                  left: selection.bbox.x,
                  top: selection.bbox.y,
                  width: selection.bbox.width,
                  height: selection.bbox.height,
                }}
                className="pointer-events-none absolute border border-dashed border-blue-4 bg-blue-2/35"
              />
            ) : null}

            {selectionSlot}
          </>
        ) : null}
      </div>

      {failure?.spec === scopedSpec ? (
        <div className="border border-red-5/40 bg-red-1/40 p-3 font-bureau text-[12px] font-light text-red-5">
          {failure.message}
        </div>
      ) : null}
    </div>
  );
}
