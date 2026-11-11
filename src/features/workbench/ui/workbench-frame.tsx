import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronDown, Clock, Plus, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { SHELL_META, ShellGlyph } from "@/features/interface-shells";
import { HighlightIcon } from "@/shared/assets/icons/general/Highlight";
import { cn } from "@/shared/lib/css";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/kit/tooltip";
import type { Rect, WorkspaceGeometry } from "../model/workbench-geometry";
import {
  describePlacement,
  type InstanceId,
  type LayoutChange,
  type LayoutEntry,
  type LayoutResult,
  type WorkspaceLayout,
} from "../model/workbench-layout";
import { canGoBack, canGoForward, type NavView } from "../model/workbench-navigation";
import { useWorkbenchHost, type WorkbenchInstance } from "../model/workbench-host";
import { HighlightLayer } from "./highlight-layer";
import { LayoutGlyph } from "./layout-glyph";
import { OrdinalBadge } from "./ordinal-badge";
import { LayoutMenu, MenuCard, MenuRow } from "./workbench-menus";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 38, mass: 0.9 };
const POPOVER = "w-auto border-0 bg-transparent p-0 shadow-none";
const ICON_STROKE = 1.75;

/** The element that scrolls inside a shell, to keep its place across back and forward. */
function findScroller(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null;
  const queue: Element[] = [root];
  while (queue.length) {
    const node = queue.shift()!;
    if (node instanceof HTMLElement && node !== root) {
      const { overflowY } = getComputedStyle(node);
      if (overflowY === "auto" || overflowY === "scroll") return node;
    }
    queue.push(...Array.from(node.children));
  }
  return null;
}

function HeaderButton({
  label,
  disabled,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-gray-3 transition-colors",
        "hover:bg-gray-6 hover:text-icon-primary disabled:cursor-default disabled:text-gray-2 disabled:hover:bg-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Back, forward and the history list for one interface. */
function NavControls({ id, saveView }: { id: InstanceId; saveView: () => NavView }) {
  const { navigation } = useWorkbenchHost();
  const stack = navigation?.stackOf(id);
  const [open, setOpen] = useState(false);
  if (!navigation || !stack) return null;
  const { back, forward, goTo } = navigation;

  return (
    <div className="flex items-center" data-no-drag>
      <HeaderButton label="Back" disabled={!canGoBack(stack)} onClick={() => back(id, saveView())}>
        <ArrowLeft className="size-4" strokeWidth={ICON_STROKE} />
      </HeaderButton>
      <HeaderButton label="Forward" disabled={!canGoForward(stack)} onClick={() => forward(id, saveView())}>
        <ArrowRight className="size-4" strokeWidth={ICON_STROKE} />
      </HeaderButton>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <HeaderButton label="History" className={cn(open && "bg-gray-6 text-icon-primary")}>
            <Clock className="size-4" strokeWidth={ICON_STROKE} />
          </HeaderButton>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={6} className={POPOVER}>
          <MenuCard title="Visited here">
            <div role="menu" aria-label="History">
              {stack.entries
                .map((entry, index) => ({ entry, index }))
                .reverse()
                .map(({ entry, index }) => (
                  <MenuRow
                    key={`${entry.artifactId}-${index}`}
                    selected={index === stack.index}
                    label={navigation.titleOf(entry.artifactId, entry.title)}
                    detail={index === stack.index ? "Current" : undefined}
                    onSelect={() => {
                      goTo(id, index, saveView());
                      setOpen(false);
                    }}
                  />
                ))}
            </div>
          </MenuCard>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * The interface's app icon. Clicking it lists the other artifacts of its
 * kind; picking one records a history entry.
 */
function ArtifactIcon({
  instance,
  artifactId,
  ordinal,
  saveView,
}: {
  instance: WorkbenchInstance;
  /** What it's showing, where the host keeps navigation. */
  artifactId?: string;
  /** Which one it is when there are several of its kind. */
  ordinal?: number;
  saveView: () => NavView;
}) {
  const host = useWorkbenchHost();
  const [open, setOpen] = useState(false);
  const label = SHELL_META[instance.kind].label;
  const title = host.titleOf(instance.id);
  const { navigation } = host;

  // No navigation: the icon only says what this is.
  if (!navigation || !artifactId) {
    return (
      <span
        role="img"
        aria-label={`${label}${ordinal ? ` ${ordinal}` : ""}: ${title}`}
        title={title}
        className="relative size-5 shrink-0"
      >
        <ShellGlyph kind={instance.kind} className="size-full" />
        {ordinal && <OrdinalBadge value={ordinal} />}
      </span>
    );
  }
  const { navigate, createArtifact } = navigation;
  const siblings = navigation.siblings(instance.kind);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${label}${ordinal ? ` ${ordinal}` : ""}: ${title}. Open another`}
          title={title}
          className="relative size-5 shrink-0 cursor-pointer transition-opacity hover:opacity-80"
        >
          <ShellGlyph kind={instance.kind} className="size-full" />
          {ordinal && <OrdinalBadge value={ordinal} />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className={POPOVER}>
        <MenuCard title={`Open a ${label.toLowerCase()}`}>
          <div role="menu">
            {siblings.map((artifact) => (
              <MenuRow
                key={artifact.id}
                selected={artifact.id === artifactId}
                label={artifact.title}
                onSelect={() => {
                  navigate(instance.id, artifact.id, saveView());
                  setOpen(false);
                }}
              />
            ))}
            <MenuRow
              leading={<Plus className="size-4 shrink-0 text-gray-3" />}
              label={`New ${label.toLowerCase()}`}
              onSelect={() => {
                navigate(instance.id, createArtifact(instance.kind), saveView());
                setOpen(false);
              }}
            />
          </div>
        </MenuCard>
      </PopoverContent>
    </Popover>
  );
}

export type LayoutControls = {
  layout: WorkspaceLayout;
  geometry: WorkspaceGeometry;
  preview: (change: LayoutChange) => LayoutResult;
  geometryOf: (layout: WorkspaceLayout) => WorkspaceGeometry;
  onChange: (change: LayoutChange) => void;
};

/** The glyph beside the navigation controls; opens the size and placement menu. */
function LayoutButton({ instance, entry, controls }: { instance: WorkbenchInstance; entry: LayoutEntry; controls: LayoutControls }) {
  const [open, setOpen] = useState(false);
  const host = useWorkbenchHost();
  const label = SHELL_META[instance.kind].label;
  const placement = describePlacement(controls.layout, entry);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`${label}: ${placement}. Change layout`}
              className={cn(
                "flex h-7 shrink-0 cursor-pointer items-center gap-0.5 rounded-[8px] pr-1 pl-1.5 text-gray-3 transition-colors hover:bg-gray-6",
                open && "bg-gray-6",
              )}
            >
              <LayoutGlyph geometry={controls.geometry} id={instance.id} />
              <ChevronDown className="size-3" strokeWidth={2} />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {label}: {placement}. Change layout
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        sideOffset={6}
        className={POPOVER}
        // The frame has usually moved: don't pull focus (and the tooltip) back to it.
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <LayoutMenu
          layout={controls.layout}
          entry={entry}
          labelOf={host.labelOf}
          preview={controls.preview}
          geometryOf={controls.geometryOf}
          onChange={(change) => {
            controls.onChange(change);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export type FrameMotion = {
  /** Where it's drawn; absent while minimized. */
  rect?: Rect;
  /** Its app icon in the strip while minimized. */
  icon?: Rect;
  /** Follow the pointer with no spring (dragging the divider). */
  instant: boolean;
  reducedMotion: boolean;
  /** Fade in on mount: it was opened after the page loaded. */
  appear: boolean;
  /** It would be minimized by the drop being previewed. */
  fading: boolean;
};

const sameRect = (a?: Rect, b?: Rect) =>
  !!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

/**
 * One interface on the workbench. Frames are siblings positioned from the
 * shared geometry, never nested in their regions, so moving, resizing and
 * minimizing only animate a rectangle: nothing inside remounts.
 *
 * Chat has no frame: it's the page itself, with only its layout glyph.
 */
export function WorkbenchFrame({
  instance,
  entry,
  controls,
  motion: frameMotion,
  dragHandle,
  onClose,
  onHighlightEdit,
  ordinal,
  inset,
  flash = false,
  children,
}: {
  instance: WorkbenchInstance;
  entry: LayoutEntry;
  controls: LayoutControls;
  motion: FrameMotion;
  dragHandle: { onPointerDown: (event: React.PointerEvent) => void; onClickCapture: (event: React.MouseEvent) => void };
  /** Close puts it away in the top bar; it's never removed. */
  onClose: () => void;
  /** A change asked for on something highlighted in this interface. */
  onHighlightEdit: (quote: string, instruction: string) => void;
  /** 1, 2… when more than one interface of this kind is open. */
  ordinal?: number;
  /** The content's side inset, so the bar's icon lines up with the title under it. */
  inset: number;
  /** Briefly ring it, to show where something went. */
  flash?: boolean;
  children: React.ReactNode;
}) {
  const { rect, icon, instant, reducedMotion, appear, fading } = frameMotion;
  const host = useWorkbenchHost();
  const stack = host.navigation?.stackOf(instance.id);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const isChat = instance.kind === "chat";
  const [highlighting, setHighlighting] = useState(false);
  // Minimized puts the tool away with it.
  if (highlighting && !rect) setHighlighting(false);

  // Minimizing shrinks from wherever it last was toward its icon.
  const [lastRect, setLastRect] = useState<Rect>(rect ?? controls.geometry.main);
  if (rect && !sameRect(rect, lastRect)) setLastRect(rect);

  const saveView = (): NavView => ({ scrollTop: findScroller(bodyRef.current)?.scrollTop ?? 0 });

  // Back where it was: the destination's scroll, once its content is in.
  const current = stack?.entries[stack.index];
  const restoreKey = `${current?.artifactId}-${stack?.index}`;
  useLayoutEffect(() => {
    if (isChat) return;
    const top = current?.view?.scrollTop ?? 0;
    const frame = requestAnimationFrame(() => {
      const scroller = findScroller(bodyRef.current);
      if (scroller) scroller.scrollTop = top;
    });
    return () => cancelAnimationFrame(frame);
    // Only on arriving at an entry, not when its saved view is written.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreKey]);

  const visible = !!rect;
  const base = rect ?? lastRect;
  const target = visible
    ? { left: base.x, top: base.y, width: base.width, height: base.height, x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: fading ? 0.4 : 1 }
    : {
        left: base.x,
        top: base.y,
        width: base.width,
        height: base.height,
        x: (icon?.x ?? base.x) - base.x,
        y: (icon?.y ?? 0) - base.y,
        scaleX: (icon?.width ?? 0) / base.width || 0.05,
        scaleY: (icon?.height ?? 0) / base.height || 0.05,
        opacity: 0,
      };
  const transition =
    reducedMotion || instant
      ? { duration: 0 }
      : { ...SPRING, opacity: visible ? { duration: 0.18 } : { duration: 0.2, delay: 0.14 } };

  const onActivity = () => host.touch(instance.id);

  return (
    <motion.section
      aria-label={SHELL_META[instance.kind].label}
      aria-hidden={!visible}
      inert={!visible}
      initial={appear ? { ...target, opacity: 0, scaleX: 0.97, scaleY: 0.97 } : false}
      animate={target}
      transition={transition}
      style={{ position: "absolute", transformOrigin: "0 0", zIndex: visible ? (isChat ? 0 : 1) : 30 }}
      className={cn(
        "flex flex-col overflow-hidden",
        !isChat && [
          "rounded-[18px] bg-background-primary shadow-[0_1px_3px_rgba(26,23,24,0.04),0_8px_24px_rgba(26,23,24,0.05)]",
          "hairline [--hairline-radius:18px] [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.3]",
        ],
        (highlighting || flash) && "rounded-[18px] ring-2 ring-blue-4/40",
        !visible && "pointer-events-none",
      )}
      onPointerDownCapture={onActivity}
      onKeyDownCapture={onActivity}
      onFocusCapture={onActivity}
    >
      <header
        className="flex h-12 shrink-0 cursor-grab touch-none items-center gap-0.5 select-none active:cursor-grabbing"
        // The right edge is pulled in by the controls' own padding.
        style={{ paddingLeft: inset, paddingRight: Math.max(4, inset - 6) }}
        {...dragHandle}
      >
        {isChat ? (
          // Large, Chat is the page itself and needs no icon.
          entry.presentation !== "large" && (
            <span className="relative size-5 shrink-0" title="Chat">
              <ShellGlyph kind="chat" className="size-full" />
            </span>
          )
        ) : (
          <ArtifactIcon instance={instance} artifactId={current?.artifactId} ordinal={ordinal} saveView={saveView} />
        )}
        <span className="flex-1" />
        <HeaderButton
          label={highlighting ? "Stop highlighting" : "Highlight something to change it"}
          aria-pressed={highlighting}
          onClick={() => setHighlighting((on) => !on)}
          className={cn("mr-1", highlighting && "bg-blue-1 hover:bg-blue-1")}
        >
          <HighlightIcon svgClasses="size-4" pathClasses={highlighting ? "fill-blue-5" : "fill-gray-3"} />
        </HeaderButton>
        {!isChat && <NavControls id={instance.id} saveView={saveView} />}
        <LayoutButton instance={instance} entry={entry} controls={controls} />
        <HeaderButton label={`Close ${SHELL_META[instance.kind].label.toLowerCase()} to the top bar`} onClick={onClose}>
          <X className="size-4" strokeWidth={ICON_STROKE} />
        </HeaderButton>
      </header>
      <div ref={bodyRef} className="relative min-h-0 flex-1 overflow-hidden">
        {children}
        {highlighting && (
          <HighlightLayer rootRef={bodyRef} onEdit={onHighlightEdit} onExit={() => setHighlighting(false)} />
        )}
      </div>
    </motion.section>
  );
}
