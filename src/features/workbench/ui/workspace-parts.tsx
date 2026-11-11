import { Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  SHELL_META,
  ShellAppIcon,
  type ShellKind,
} from "@/features/interface-shells";
import { cn } from "@/shared/lib/css";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/shared/ui/kit/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import type { Rect } from "../model/workbench-geometry";
import { OrdinalBadge } from "./ordinal-badge";
import { MenuCard, MenuRow } from "./workbench-menus";
import { usePointerDrag, type DragPoint } from "./use-pointer-drag";

const SPRING = { type: "spring" as const, stiffness: 420, damping: 36 };

type DragCallbacks = {
  onStart: () => void;
  onMove: (point: DragPoint) => void;
  onEnd: (point: DragPoint) => void;
  onCancel: () => void;
};

/**
 * A minimized interface. Click opens it as a medium in the supporting column;
 * drag places it anywhere; right-click offers to delete it from the session.
 */
export function StripIcon({
  kind,
  title,
  ordinal,
  rect,
  reducedMotion,
  onOpen,
  onRemove,
  drag,
}: {
  kind: ShellKind;
  title: string;
  ordinal?: number;
  /** Delete it from this session. Absent for Chat, which can't be. */
  onRemove?: () => void;
  rect: Rect;
  reducedMotion: boolean;
  onOpen: () => void;
  drag: DragCallbacks;
}) {
  const handle = usePointerDrag(drag);
  const [menuOpen, setMenuOpen] = useState(false);
  const label = `${SHELL_META[kind].label}${ordinal ? ` ${ordinal}` : ""}`;
  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverAnchor asChild>
            <motion.button
              type="button"
              aria-label={`${label}: ${title}, minimized. Open`}
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, scale: 0.6, left: rect.x, top: rect.y }
              }
              animate={{ opacity: 1, scale: 1, left: rect.x, top: rect.y }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { ...SPRING, opacity: { duration: 0.2, delay: 0.12 } }
              }
              style={{
                position: "absolute",
                width: rect.width,
                height: rect.height,
              }}
              className="z-20 cursor-pointer touch-none rounded-[9px] transition-[filter] hover:brightness-95 active:scale-[0.96]"
              onClick={onOpen}
              onContextMenu={(event) => {
                if (!onRemove) return;
                event.preventDefault();
                setMenuOpen(true);
              }}
              {...handle}
            >
              <ShellAppIcon kind={kind} className="size-full rounded-[9px]" />
              {ordinal && <OrdinalBadge value={ordinal} />}
            </motion.button>
          </PopoverAnchor>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {label}: {title}
        </TooltipContent>
      </Tooltip>
      {onRemove && (
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-auto border-0 bg-transparent p-0 shadow-none"
        >
          <MenuCard title={`${label}: ${title}`} className="w-[240px]">
            <MenuRow
              leading={<Trash2 className="size-4 shrink-0 text-red-5" />}
              label="Delete from this session"
              onSelect={() => {
                setMenuOpen(false);
                onRemove();
              }}
            />
          </MenuCard>
        </PopoverContent>
      )}
    </Popover>
  );
}

/** The bar between two large interfaces. Drag to share the main area; double-click to even it out. */
export function MainDivider({
  x,
  y,
  main,
  onMove,
  onEnd,
  onCancel,
  onReset,
}: {
  /** Between two side by side. */
  x?: number;
  /** Between two stacked. */
  y?: number;
  main: Rect;
  onMove: (point: DragPoint) => void;
  onEnd: (point: DragPoint) => void;
  onCancel: () => void;
  onReset: () => void;
}) {
  const handle = usePointerDrag({ onMove, onEnd, onCancel });
  const rows = y !== undefined;
  return (
    <div
      role="separator"
      aria-orientation={rows ? "horizontal" : "vertical"}
      aria-label="Resize large interfaces"
      className={cn(
        "group absolute z-10 flex touch-none items-center justify-center",
        rows ? "h-3 -translate-y-1/2 cursor-row-resize" : "w-3 -translate-x-1/2 cursor-col-resize",
      )}
      style={rows ? { top: y, left: main.x, width: main.width } : { left: x, top: main.y, height: main.height }}
      onDoubleClick={onReset}
      {...handle}
    >
      <span
        className={cn(
          "rounded-full bg-gray-3/30 transition-colors group-hover:bg-gray-3/70",
          rows ? "h-1 w-12" : "h-12 w-1",
        )}
      />
    </div>
  );
}

/** Where a drag would land, drawn from the controller's own preview. */
export function DropPreview({
  rect,
  minimize,
}: {
  rect: Rect;
  minimize: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-40 rounded-[18px] border-2 border-blue-4 bg-blue-1/50",
        minimize && "rounded-[9px]",
      )}
      initial={false}
      animate={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
      transition={{ type: "spring", stiffness: 520, damping: 40 }}
    />
  );
}

/** What follows the pointer while dragging. */
export function DragGhost({
  kind,
  title,
  point,
}: {
  kind: ShellKind;
  title: string;
  point: DragPoint;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-50 flex items-center gap-2 rounded-[12px] bg-background-primary py-1.5 pr-3 pl-1.5 shadow-[0_8px_28px_rgba(26,23,24,0.18)]"
      style={{ left: point.x + 12, top: point.y + 12 }}
    >
      <ShellAppIcon kind={kind} className="size-6 rounded-[7px]" />
      <span className="max-w-[200px] truncate font-bureau text-[13px] text-typography-primary">
        {title}
      </span>
    </div>
  );
}
