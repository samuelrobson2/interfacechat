import { useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { SHELL_META, ShellAppIcon, type ShellKind } from "@/features/interface-shells";
import { cn } from "@/shared/lib/css";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { Text } from "@/shared/ui/kit/text";
import { dropChange, layoutGeometry, type Rect } from "../model/workbench-geometry";
import { WorkbenchHostContext, type WorkbenchHost, type WorkbenchInstance } from "../model/workbench-host";
import {
  DIVIDER_RANGE,
  type InstanceId,
  type LayoutChange,
  type LayoutEntry,
  type LayoutResult,
  type WorkspaceLayout,
} from "../model/workbench-layout";
import {
  COMPOSER_ROOM,
  COMPOSER_WIDTH,
  DOTS,
  isEditable,
  OPENABLE_KINDS,
  ordinalsOf,
  useElementSize,
} from "../model/workbench-view";
import { usePointerDrag, type DragPoint } from "./use-pointer-drag";
import { WorkbenchFrame, type LayoutControls } from "./workbench-frame";
import { MenuCard, MenuRow } from "./workbench-menus";
import { DragGhost, DropPreview, MainDivider, StripIcon } from "./workspace-parts";

type DragState = { id: InstanceId; point: DragPoint | null };

/** One frame, with its header as the drag handle. */
function FrameSlot({
  dragHandlers,
  ...props
}: Omit<React.ComponentProps<typeof WorkbenchFrame>, "dragHandle"> & {
  dragHandlers: Parameters<typeof usePointerDrag>[0];
}) {
  const dragHandle = usePointerDrag(dragHandlers);
  return <WorkbenchFrame dragHandle={dragHandle} {...props} />;
}

function AddInterfaceMenu({ onAdd }: { onAdd: (kind: ShellKind) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open an interface"
          title="Open an interface"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-icon-primary transition-colors hover:bg-gray-6"
        >
          <Plus className="size-4" strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-auto border-0 bg-transparent p-0 shadow-none">
        <MenuCard title="Open an interface" className="max-h-[70vh] overflow-y-auto">
          {OPENABLE_KINDS.map((kind) => (
            <MenuRow
              key={kind}
              leading={<ShellAppIcon kind={kind} className="size-6 shrink-0 rounded-[7px]" />}
              label={SHELL_META[kind].label}
              onSelect={() => {
                onAdd(kind);
                setOpen(false);
              }}
            />
          ))}
        </MenuCard>
      </PopoverContent>
    </Popover>
  );
}

export type WorkbenchSurfaceProps = {
  /** Chat and every interface that has a window or an icon, in the order they were opened. */
  instances: WorkbenchInstance[];
  layout: WorkspaceLayout;
  /** The instance that is Chat: it can't be deleted, and its input floats while it's minimized. */
  chatId: InstanceId;
  host: WorkbenchHost;
  transact: (change: LayoutChange) => void;
  preview: (change: LayoutChange) => LayoutResult;
  undo: () => void;
  redo: () => void;
  /** The workspace's width, for the controller's capacity rules. */
  onWidth: (width: number) => void;
  /** Centred in the top bar. */
  title: React.ReactNode;
  onAdd: (kind: ShellKind) => void;
  onRemove: (id: InstanceId) => void;
  renderBody: (instance: WorkbenchInstance, entry: LayoutEntry, rect: Rect | undefined) => React.ReactNode;
  insetFor: (instance: WorkbenchInstance, entry: LayoutEntry, rect: Rect | undefined) => number;
  onHighlightEdit: (instance: WorkbenchInstance, quote: string, instruction: string) => void;
  /** The window to ring for a moment. */
  flashId?: InstanceId | null;
  /** Chat's input (and anything above it), kept on the page while Chat is minimized. */
  floating?: React.ReactNode;
  /** Room kept clear on the left for the app's menu. */
  insetLeft?: number;
  className?: string;
};

/**
 * The flexible workspace: Chat as the page, interfaces in windows beside it,
 * minimized ones in the strip at the top right. It draws a layout and reports
 * changes; whoever hosts it (Chat, or the Workbench sandbox) owns the state.
 */
export function WorkbenchSurface({
  instances,
  layout,
  chatId,
  host,
  transact,
  preview,
  undo,
  redo,
  onWidth,
  title,
  onAdd,
  onRemove,
  renderBody,
  insetFor,
  onHighlightEdit,
  flashId,
  floating,
  insetLeft = 72,
  className,
}: WorkbenchSurfaceProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [workspaceRef, size] = useElementSize<HTMLDivElement>();
  const [toolsRef, toolsSize] = useElementSize<HTMLDivElement>();
  const [liveDivider, setLiveDivider] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const chatOpen = layout.entries[chatId]?.presentation !== "minimized";
  // Interfaces on screen at load don't fade in; ones opened later do.
  const [initialIds] = useState(() => new Set(instances.map((instance) => instance.id)));

  const width = size?.width;
  useEffect(() => {
    if (width !== undefined) onWidth(width);
  }, [width, onWidth]);

  // The app's menu floats over the panel's left edge.
  // Chat minimized, its input stays on the page: interfaces leave room for it.
  const geometryOptions = {
    reserveRight: (toolsSize?.width ?? 0) + 12,
    insetLeft,
    reserveBottom: chatOpen ? 0 : COMPOSER_ROOM,
  };
  const geometryOf = (next: WorkspaceLayout) => layoutGeometry(next, size ?? { width: 0, height: 0 }, geometryOptions);
  const shownLayout = liveDivider === null ? layout : { ...layout, divider: liveDivider };
  const geometry = size ? geometryOf(shownLayout) : null;

  const dropTarget = drag?.point && geometry ? dropChange(layout, geometry, drag.id, drag.point) : null;
  const dropResult = dropTarget ? preview(dropTarget) : null;
  const previewGeometry = dropResult?.changed ? geometryOf(dropResult.layout) : null;
  const previewRect = drag && previewGeometry && (previewGeometry.frames[drag.id] ?? previewGeometry.icons[drag.id]);
  const fading = new Set(dropResult?.changed ? dropResult.evicted : []);

  // Layout undo, unless a field has focus: there ⌘Z is the field's own.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z" || isEditable(event.target)) return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const toLocal = (point: DragPoint): DragPoint => {
    const box = workspaceRef.current?.getBoundingClientRect();
    return box ? { x: point.x - box.left, y: point.y - box.top } : point;
  };

  const dragFor = (id: InstanceId) => ({
    onStart: () => setDrag({ id, point: null }),
    onMove: (point: DragPoint) => setDrag({ id, point: toLocal(point) }),
    onEnd: (point: DragPoint) => {
      setDrag(null);
      if (geometry) transact(dropChange(layout, geometry, id, toLocal(point)));
    },
    onCancel: () => setDrag(null),
  });

  const dividerRatio = (point: DragPoint) => {
    if (!geometry) return layout.divider;
    const { main } = geometry;
    const local = toLocal(point);
    const ratio = layout.stacked
      ? (local.y - main.y - 6) / (main.height - 12)
      : (local.x - main.x - 6) / (main.width - 12);
    return Math.min(DIVIDER_RANGE[1], Math.max(DIVIDER_RANGE[0], ratio));
  };

  const byId = new Map(instances.map((instance) => [instance.id, instance]));
  const dragged = drag && byId.get(drag.id);
  const ordinals = ordinalsOf(instances);
  // Something always grows into the main area; only an empty workbench shows the hint.
  const mainIsEmpty = geometry && Object.keys(geometry.frames).length === 0;

  return (
    <WorkbenchHostContext.Provider value={host}>
      <div className={cn("relative overflow-hidden bg-background-primary font-bureau", className)} style={DOTS}>
        {/* The top bar is see-through, like Chat's: frosted white over the dots. */}
        <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-[68px] bg-gray-1/35 backdrop-blur-sm" />
        <div ref={workspaceRef} className="absolute inset-y-3 right-3 left-0">
          <div className="absolute top-0 left-1/2 z-30 flex h-14 max-w-[40%] -translate-x-1/2 items-center gap-2.5">
            {title}
          </div>

          {/* The strip of minimized interfaces runs up to this. */}
          <div ref={toolsRef} className="absolute top-0 right-0 z-30 flex h-14 items-center">
            <AddInterfaceMenu onAdd={onAdd} />
          </div>

          {geometry && (
            <>
              {mainIsEmpty && geometry.main.width > 0 && (
                <div
                  className="absolute flex items-center justify-center rounded-[18px] border border-dashed border-gray-3/30"
                  style={{
                    left: geometry.main.x,
                    top: geometry.main.y,
                    width: geometry.main.width,
                    height: geometry.main.height,
                  }}
                >
                  <Text variant="body" color="secondary" className="max-w-[280px] text-center">
                    Everything is in the top bar. Click an icon to bring it back.
                  </Text>
                </div>
              )}

              {instances.map((instance) => {
                const entry = layout.entries[instance.id];
                if (!entry) return null;
                const controls: LayoutControls = {
                  layout: shownLayout,
                  geometry,
                  preview,
                  geometryOf,
                  onChange: (change) => transact(change),
                };
                return (
                  <FrameSlot
                    key={instance.id}
                    instance={instance}
                    entry={entry}
                    controls={controls}
                    onClose={() => transact({ type: "present", id: instance.id, presentation: "minimized" })}
                    onHighlightEdit={(quote, instruction) => onHighlightEdit(instance, quote, instruction)}
                    ordinal={ordinals[instance.id]}
                    inset={insetFor(instance, entry, geometry.frames[instance.id])}
                    flash={flashId === instance.id}
                    dragHandlers={dragFor(instance.id)}
                    motion={{
                      rect: geometry.frames[instance.id],
                      icon: geometry.icons[instance.id],
                      instant: liveDivider !== null,
                      reducedMotion,
                      appear: !initialIds.has(instance.id),
                      fading: fading.has(instance.id),
                    }}
                  >
                    {renderBody(instance, entry, geometry.frames[instance.id])}
                  </FrameSlot>
                );
              })}

              {Object.entries(geometry.icons).map(([id, rect]) => {
                const instance = byId.get(id);
                if (!instance) return null;
                return (
                  <StripIcon
                    key={id}
                    kind={instance.kind}
                    title={host.titleOf(id)}
                    ordinal={ordinals[id]}
                    rect={rect}
                    reducedMotion={reducedMotion}
                    onOpen={() => transact({ type: "support", id })}
                    onRemove={id === chatId ? undefined : () => onRemove(id)}
                    drag={dragFor(id)}
                  />
                );
              })}

              {(geometry.dividerX ?? geometry.dividerY) !== undefined && (
                <MainDivider
                  x={geometry.dividerX}
                  y={geometry.dividerY}
                  main={geometry.main}
                  onMove={(point) => setLiveDivider(dividerRatio(point))}
                  onEnd={(point) => {
                    setLiveDivider(null);
                    transact({ type: "divider", ratio: dividerRatio(point) });
                  }}
                  onCancel={() => setLiveDivider(null)}
                  onReset={() => transact({ type: "divider", ratio: 0.5 })}
                />
              )}

              {previewRect && <DropPreview rect={previewRect} minimize={!previewGeometry?.frames[drag.id]} />}
              {dragged && drag.point && (
                <DragGhost kind={dragged.kind} title={host.titleOf(drag.id)} point={drag.point} />
              )}

              {/* Chat minimized: its input stays, centred under the interfaces. */}
              {!chatOpen && floating && (
                <div
                  className="absolute z-30 flex flex-col items-stretch gap-2"
                  style={{
                    left: geometry.content.x + geometry.content.width / 2,
                    bottom: 12,
                    width: Math.min(COMPOSER_WIDTH, geometry.content.width),
                    transform: "translateX(-50%)",
                  }}
                >
                  {floating}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </WorkbenchHostContext.Provider>
  );
}

/** A reply shown above the input while Chat is minimized. Click it to open Chat. */
export function ReplyPeek({ text, onOpen }: { text: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex cursor-pointer items-start gap-2 self-start rounded-[16px] bg-background-primary px-3.5 py-2.5 text-left shadow-[0_4px_16px_rgba(26,23,24,0.1)] hairline [--hairline-radius:16px] [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.25]"
    >
      <span className="line-clamp-2 font-bureau text-[14px] leading-[1.45] text-typography-primary">{text}</span>
      <span className="shrink-0 pt-0.5 font-bureau text-[12px] text-typography-secondary">Open chat</span>
    </button>
  );
}
