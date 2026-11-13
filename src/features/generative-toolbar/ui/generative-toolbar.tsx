import {
  Archive,
  ArrowUp,
  ArrowUpDown,
  Bell,
  CalendarDays,
  ChartColumn,
  Check,
  Clock,
  Grid2x2,
  Image,
  List,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Type,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

import { cn } from "@/shared/lib/css";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { SurfaceFrame } from "@/shared/ui/surface-frame";
import {
  quadrantOf,
  type GeneratedTool,
  type GridPoint,
  type ToolIcon,
  type ToolValue,
} from "../model/tool-spec";
import type { ToolbarStatus } from "../model/use-generated-tools";
import "./magic-surface.css";

const ICONS: Record<ToolIcon, LucideIcon> = {
  sparkles: Sparkles,
  list: List,
  sort: ArrowUpDown,
  plus: Plus,
  user: UserRound,
  users: UsersRound,
  calendar: CalendarDays,
  text: Type,
  table: Table2,
  check: Check,
  image: Image,
  chart: ChartColumn,
  archive: Archive,
  scissors: Scissors,
  search: Search,
  bell: Bell,
  clock: Clock,
  sliders: SlidersHorizontal,
  grid: Grid2x2,
};

/** Chips are one line; cards carry the detail, like the suggestions beside the chat input. */
export type ToolStyle = "chip" | "card";
export type ToolDirection = "row" | "column";
/** Chips come in two heights: the header row is tighter than a band. */
export type ToolSize = "sm" | "md";

/** Marks everything the toolbar draws, popovers included, so focus there doesn't count as leaving the content. */
export const TOOLS_ATTRIBUTE = "data-generative-tools";

const CARD_WIDTH = 188;
const CARD_HEIGHT = 92;
const CHIP_HEIGHT: Record<ToolSize, number> = { sm: 30, md: 36 };
const EASE = [0.23, 1, 0.32, 1] as const;
/** The violet that marks a tool's live value. */
const VALUE_TEXT = "text-[#6a4cc9]";
const VALUE_FILL = "bg-[linear-gradient(135deg,rgb(215_169_224/0.4),rgb(138_107_230/0.3))]";

type Run<D> = (tool: GeneratedTool<D>, value: ToolValue) => void;
type Of<D, T extends GeneratedTool<D>["type"]> = Extract<GeneratedTool<D>, { type: T }>;

/** The lavender wash behind floating tools and their popovers, with the AI stroke on its edge. */
export function MagicSurface({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div {...props} className={cn("magic-surface rounded-[22px]", className)}>
      <span
        aria-hidden
        className="gradient-ring bg-gradient-ai-stroke pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-90"
      />
      {children}
    </div>
  );
}

/** The frame every tool shares: white, pill-shaped, with the gradient stroke. */
function ChipFrame({
  size,
  button = false,
  className,
  children,
  ...props
}: { size: ToolSize; button?: boolean } & React.HTMLAttributes<HTMLElement>) {
  const classes = cn(
    "flex items-center gap-1.5 font-bureau whitespace-nowrap text-typography-primary",
    size === "sm" ? "px-3 text-[12px]" : "px-3.5 text-[13px]",
    className,
  );
  const style = { height: CHIP_HEIGHT[size] };
  return (
    <SurfaceFrame
      asChild
      gradientStroke="always"
      className="shrink-0 rounded-full [--hairline-radius:999px] hover:shadow-elevated-hover"
    >
      {button ? (
        <button type="button" {...props} className={classes} style={style}>
          {children}
        </button>
      ) : (
        <div {...props} className={classes} style={style}>
          {children}
        </div>
      )}
    </SurfaceFrame>
  );
}

function ToolGlyph({ icon }: { icon: ToolIcon }) {
  const Icon = ICONS[icon];
  return <Icon className="size-3.5 shrink-0 text-icon-primary" strokeWidth={1.75} />;
}

/* ── Action ───────────────────────────────────────────────────────────── */

function ActionChip<D>({ tool, size, onRun }: { tool: Of<D, "action">; size: ToolSize; onRun: Run<D> }) {
  return (
    <ChipFrame
      button
      size={size}
      title={tool.detail}
      onClick={() => onRun(tool, undefined)}
      className="cursor-pointer transition-transform active:scale-[0.97]"
    >
      <ToolGlyph icon={tool.icon} />
      {tool.label}
    </ChipFrame>
  );
}

function ActionCard<D>({ tool, onRun }: { tool: Of<D, "action">; onRun: Run<D> }) {
  return (
    <SurfaceFrame asChild gradientStroke="always" className="shrink-0 hover:shadow-elevated-hover">
      <button
        type="button"
        title={tool.detail}
        onClick={() => onRun(tool, undefined)}
        className="flex cursor-pointer flex-col gap-1 px-3 py-2.5 text-left font-bureau transition-transform active:scale-[0.98]"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-typography-primary">
          <ToolGlyph icon={tool.icon} />
          <span className="truncate">{tool.label}</span>
        </span>
        <span className="line-clamp-2 min-h-0 flex-1 text-[12px] leading-[1.35] text-typography-secondary">
          {tool.detail}
        </span>
        <ArrowUp className="size-3.5 shrink-0 self-end text-icon-primary" strokeWidth={1.75} />
      </button>
    </SurfaceFrame>
  );
}

/* ── Slider ───────────────────────────────────────────────────────────── */

function SliderChip<D>({ tool, size, onRun }: { tool: Of<D, "slider">; size: ToolSize; onRun: Run<D> }) {
  const [value, setValue] = useState(tool.value);
  const last = tool.steps.length - 1;
  // Only a released value counts; dragging through steps changes nothing yet.
  const commit = () => {
    if (value !== tool.value) onRun(tool, value);
  };
  return (
    <ChipFrame size={size} title={`${tool.detail} · ${tool.min.label} to ${tool.max.label}`}>
      <ToolGlyph icon={tool.icon} />
      <span>{tool.label}</span>
      <input
        type="range"
        min={0}
        max={last}
        step={1}
        value={value}
        aria-label={tool.label}
        aria-valuetext={tool.steps[value]}
        onChange={(event) => setValue(Number(event.target.value))}
        onPointerUp={commit}
        onKeyUp={(event) => {
          if (event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End") commit();
        }}
        className={cn("magic-range mx-1", size === "sm" ? "w-20" : "w-24")}
        style={{ "--fill": `${(value / last) * 100}%` } as React.CSSProperties}
      />
      <span className={cn("min-w-[4.5ch] tabular-nums", VALUE_TEXT)}>{tool.steps[value]}</span>
    </ChipFrame>
  );
}

/* ── 2×2 ──────────────────────────────────────────────────────────────── */

const PAD = 216;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** The four quadrants in a tiny square, the one the content is in filled. */
function QuadrantGlyph({ active }: { active: number }) {
  return (
    <span aria-hidden className="grid size-3.5 shrink-0 grid-cols-2 gap-[1.5px]">
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={cn(
            "rounded-[1.5px]",
            index === active ? "bg-gradient-to-br from-[#d7a9e0] to-[#8a6be6]" : "bg-gray-3/30",
          )}
        />
      ))}
    </span>
  );
}

/**
 * A 2×2 over two axes. Drag the dot, or tap a quadrant; the dashed ring is
 * where the content is now.
 */
function GridPad<D>({ tool, onCommit }: { tool: Of<D, "grid">; onCommit: (point: GridPoint) => void }) {
  const [point, setPoint] = useState<GridPoint>(tool.value);
  const pad = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pointAt = (event: React.PointerEvent) => {
    const rect = pad.current!.getBoundingClientRect();
    return {
      x: clamp01((event.clientX - rect.left) / rect.width),
      y: clamp01(1 - (event.clientY - rect.top) / rect.height),
    };
  };
  const at = (p: GridPoint) => ({ left: `${p.x * 100}%`, top: `${(1 - p.y) * 100}%` });
  const active = quadrantOf(point);
  const axis = "font-bureau text-[11px] text-[#5a4a86]";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={axis}>{tool.y.high}</span>
      <div className="flex items-center gap-2">
        <span className={cn(axis, "w-14 text-right")}>{tool.x.low}</span>
        <div
          ref={pad}
          role="slider"
          tabIndex={0}
          aria-label={tool.label}
          aria-valuetext={tool.quadrants[active]}
          onPointerDown={(event) => {
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            setPoint(pointAt(event));
          }}
          onPointerMove={(event) => {
            if (dragging.current) setPoint(pointAt(event));
          }}
          onPointerUp={(event) => {
            dragging.current = false;
            onCommit(pointAt(event));
          }}
          onKeyDown={(event) => {
            const step = 0.1;
            const move: Record<string, GridPoint> = {
              ArrowLeft: { x: point.x - step, y: point.y },
              ArrowRight: { x: point.x + step, y: point.y },
              ArrowUp: { x: point.x, y: point.y + step },
              ArrowDown: { x: point.x, y: point.y - step },
            };
            const next = move[event.key];
            if (next) {
              event.preventDefault();
              setPoint({ x: clamp01(next.x), y: clamp01(next.y) });
            }
            if (event.key === "Enter") onCommit(point);
          }}
          className="relative grid cursor-crosshair touch-none grid-cols-2 grid-rows-2 gap-1 rounded-[16px] bg-white/75 p-1 outline-none focus-visible:ring-2 focus-visible:ring-[#8a6be6]"
          style={{ width: PAD, height: PAD }}
        >
          {tool.quadrants.map((name, index) => (
            <span
              key={name}
              className={cn(
                "grid place-items-center rounded-[12px] px-2 text-center font-bureau text-[12px] transition-colors duration-150",
                index === active ? cn(VALUE_FILL, "text-[#4b2fa8]") : "bg-gray-6 text-typography-secondary",
              )}
            >
              {name}
            </span>
          ))}
          <span
            aria-hidden
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-[#8a6be6]/70"
            style={at(tool.value)}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_2px_#8a6be6,0_2px_8px_rgb(80_50_160/0.4)]"
            style={at(point)}
          />
        </div>
        <span className={cn(axis, "w-14")}>{tool.x.high}</span>
      </div>
      <span className={axis}>{tool.y.low}</span>
    </div>
  );
}

function GridChip<D>({
  tool,
  size,
  side,
  onRun,
}: {
  tool: Of<D, "grid">;
  size: ToolSize;
  side: "top" | "bottom";
  onRun: Run<D>;
}) {
  const [open, setOpen] = useState(false);
  const active = quadrantOf(tool.value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ChipFrame
          button
          size={size}
          title={tool.detail}
          className="cursor-pointer transition-transform active:scale-[0.97]"
        >
          <QuadrantGlyph active={active} />
          <span>{tool.label}</span>
          <span className={VALUE_TEXT}>{tool.quadrants[active]}</span>
        </ChipFrame>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        sideOffset={14}
        {...{ [TOOLS_ATTRIBUTE]: "" }}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onMouseDown={(event) => event.preventDefault()}
        className="magic-surface w-auto min-w-0 overflow-visible rounded-[24px] border-0 p-4"
      >
        <GridPad
          tool={tool}
          onCommit={(point) => {
            setOpen(false);
            const moved = Math.hypot(point.x - tool.value.x, point.y - tool.value.y) > 0.12;
            if (moved || quadrantOf(point) !== active) onRun(tool, point);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/* ── Choice and toggle ────────────────────────────────────────────────── */

function ChoiceChip<D>({ tool, size, onRun }: { tool: Of<D, "choice">; size: ToolSize; onRun: Run<D> }) {
  const [value, setValue] = useState(tool.value);
  return (
    <ChipFrame size={size} title={tool.detail} className="gap-1 pr-1">
      <ToolGlyph icon={tool.icon} />
      <span className="mr-1">{tool.label}</span>
      <span role="radiogroup" aria-label={tool.label} className="flex items-center gap-0.5">
        {tool.options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={option.id === value}
            onClick={() => {
              if (option.id === value) return;
              setValue(option.id);
              onRun(tool, option.id);
            }}
            className={cn(
              "cursor-pointer rounded-full px-2 transition-colors duration-150",
              size === "sm" ? "py-0.5 text-[11px]" : "py-1 text-[12px]",
              option.id === value ? cn(VALUE_FILL, VALUE_TEXT) : "text-typography-secondary hover:bg-gray-6",
            )}
          >
            {option.label}
          </button>
        ))}
      </span>
    </ChipFrame>
  );
}

function ToggleChip<D>({ tool, size, onRun }: { tool: Of<D, "toggle">; size: ToolSize; onRun: Run<D> }) {
  const [on, setOn] = useState(tool.value);
  return (
    <ChipFrame
      button
      size={size}
      title={tool.detail}
      role="switch"
      aria-checked={on}
      onClick={() => {
        setOn(!on);
        onRun(tool, !on);
      }}
      className="cursor-pointer"
    >
      <ToolGlyph icon={tool.icon} />
      {tool.label}
      <span
        aria-hidden
        className={cn(
          "ml-1 flex h-4 w-7 items-center rounded-full p-0.5 transition-colors duration-200",
          on ? "bg-gradient-to-r from-[#d7a9e0] to-[#8a6be6]" : "bg-gray-3/30",
        )}
      >
        <span
          className={cn(
            "size-3 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-out",
            on && "translate-x-3",
          )}
        />
      </span>
    </ChipFrame>
  );
}

/* ── The bar ──────────────────────────────────────────────────────────── */

function ToolControl<D>({
  tool,
  style,
  size,
  side,
  onRun,
}: {
  tool: GeneratedTool<D>;
  style: ToolStyle;
  size: ToolSize;
  side: "top" | "bottom";
  onRun: Run<D>;
}) {
  switch (tool.type) {
    case "action":
      return style === "card" ? (
        <ActionCard tool={tool} onRun={onRun} />
      ) : (
        <ActionChip tool={tool} size={size} onRun={onRun} />
      );
    case "slider":
      return <SliderChip tool={tool} size={size} onRun={onRun} />;
    case "grid":
      return <GridChip tool={tool} size={size} side={side} onRun={onRun} />;
    case "choice":
      return <ChoiceChip tool={tool} size={size} onRun={onRun} />;
    case "toggle":
      return <ToggleChip tool={tool} size={size} onRun={onRun} />;
  }
}

/** Stand-ins while the toolbar thinks: the same frames, with pulsing lines inside. */
function ToolSkeleton({ style, size, index }: { style: ToolStyle; size: ToolSize; index: number }) {
  const width = [96, 128, 84, 112, 104][index % 5] ?? 100;
  return (
    <SurfaceFrame
      gradientStroke="always"
      aria-hidden
      className={cn("shrink-0", style === "chip" && "rounded-full [--hairline-radius:999px]")}
      style={
        style === "chip"
          ? { width: width + 28, height: CHIP_HEIGHT[size] }
          : { width: CARD_WIDTH, height: CARD_HEIGHT }
      }
    >
      <div
        className={cn(
          "flex size-full animate-pulse flex-col gap-2",
          style === "chip" ? "justify-center px-3.5" : "px-3 py-3",
        )}
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <span
          className="h-2 rounded-full bg-[#8a6be6]/20"
          style={{ width: style === "chip" ? "100%" : width }}
        />
        {style === "card" && <span className="h-2 w-4/5 rounded-full bg-gray-3/15" />}
      </div>
    </SurfaceFrame>
  );
}

/**
 * The generated tools, laid out in a row or a column. Placement is the
 * caller's; this only draws the set and its thinking state. Pressing a tool
 * keeps focus where it was, so a text selection survives the click.
 */
export function GenerativeToolbar<D>({
  tools,
  status,
  style,
  direction,
  count,
  onRun,
  onRegenerate,
  size = "md",
  popoverSide = "top",
  wrap = false,
  ariaLabel = "Suggested tools",
  className,
}: {
  ariaLabel?: string;
  tools: GeneratedTool<D>[];
  status: ToolbarStatus;
  style: ToolStyle;
  direction: ToolDirection;
  count: number;
  onRun: Run<D>;
  /** Omit where the set is one of several, such as suggestions beside part of an interface. */
  onRegenerate?: () => void;
  size?: ToolSize;
  /** Which way a tool's popover (the 2×2) opens. */
  popoverSide?: "top" | "bottom";
  wrap?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const generating = status === "generating";
  const column = direction === "column";

  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      aria-busy={generating}
      {...{ [TOOLS_ATTRIBUTE]: "" }}
      // Keeps the caret and selection in the content; a slider still needs its own press.
      onMouseDown={(event) => {
        if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
      }}
      className={cn(
        "flex",
        column ? "flex-col items-stretch gap-2" : "flex-row items-center gap-2",
        wrap && !column && "flex-wrap",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {generating
          ? Array.from({ length: count }, (_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <ToolSkeleton style={style} size={size} index={index} />
              </motion.div>
            ))
          : tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                layout={!reduceMotion}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: column ? 0 : 4, x: column ? -4 : 0, filter: "blur(2px)" }
                }
                animate={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.28, ease: EASE, delay: index * 0.05 }}
                className="shrink-0"
              >
                {/* A regenerated tool with new values starts fresh, not where the old one was left. */}
                <ToolControl
                  key={JSON.stringify(tool)}
                  tool={tool}
                  style={style}
                  size={size}
                  side={popoverSide}
                  onRun={onRun}
                />
              </motion.div>
            ))}
      </AnimatePresence>
      {onRegenerate && <button
        type="button"
        aria-label="Regenerate tools"
        title="Regenerate tools"
        onClick={onRegenerate}
        disabled={generating}
        className={cn(
          "grid shrink-0 cursor-pointer place-items-center rounded-full text-[#6a4cc9] transition-colors hover:bg-white/60 disabled:opacity-40",
          column ? "size-8 self-center" : size === "sm" ? "size-7" : "size-8",
        )}
      >
        <RefreshCw className={cn("size-3.5", generating && "animate-spin")} strokeWidth={1.75} />
      </button>}
    </div>
  );
}

/**
 * The folded toolbar: one button that holds the set, the way the suggestion
 * cards fold into a pill in the expanded composer.
 */
export function ToolbarFoldButton({
  open,
  count,
  generating,
  onToggle,
}: {
  open: boolean;
  count: number;
  generating: boolean;
  onToggle: () => void;
}) {
  return (
    <MagicSurface className="rounded-full">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Hide tools" : "Show tools"}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onToggle}
        className="relative flex h-10 cursor-pointer items-center gap-1.5 px-3.5 font-bureau text-[13px] text-[#3f2a8c]"
      >
        <Sparkles className={cn("size-4", generating && "animate-pulse")} strokeWidth={1.75} />
        Tools
        {!generating && count > 0 && (
          <span className="grid size-4.5 place-items-center rounded-full bg-[#6a4cc9] text-[10px] leading-none text-white tabular-nums">
            {count}
          </span>
        )}
      </button>
    </MagicSurface>
  );
}
