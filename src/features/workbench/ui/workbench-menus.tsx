import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import type { WorkspaceGeometry } from "../model/workbench-geometry";
import type { InstanceId, LayoutChange, LayoutEntry, LayoutResult, WorkspaceLayout } from "../model/workbench-layout";
import { placementOptions } from "../model/workbench-placements";

/** The popover card the chat toolbar's menus use. */
export function MenuCard({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-[260px] rounded-[16px] border-[0.5px] border-gray-2 bg-gray-1 p-1.5",
        "shadow-[0_4px_6px_rgba(26,23,24,0.15)]",
        className,
      )}
    >
      {title && (
        <Text variant="caption" color="secondary" className="px-2 pt-1 pb-1.5">
          {title}
        </Text>
      )}
      {children}
    </div>
  );
}

export function MenuRow({
  selected = false,
  disabled = false,
  leading,
  label,
  detail,
  onSelect,
}: {
  selected?: boolean;
  disabled?: boolean;
  leading?: React.ReactNode;
  label: string;
  detail?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left transition-colors",
        "hover:bg-gray-6 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent",
        selected && "bg-gray-6",
      )}
    >
      {leading}
      <span className="flex min-w-0 flex-1 flex-col">
        <Text variant="label" className="truncate">
          {label}
        </Text>
        {detail && (
          <Text variant="caption" color="secondary" className="truncate">
            {detail}
          </Text>
        )}
      </span>
      <Check className={cn("size-4 shrink-0 text-icon-primary", !selected && "invisible")} />
    </button>
  );
}

const DIAGRAM = { width: 72, height: 46 };
const OUTLINE = 1.25;
/** Space between the outline and the windows inside it. */
const INSET = 4;

/**
 * The whole workspace after a choice, drawn like macOS's window tiling: a grey
 * rounded outline, this interface filled grey, the others barely there. The
 * same look as the glyph in the header, larger.
 */
function PlacementDiagram({ geometry, id }: { geometry: WorkspaceGeometry; id: InstanceId }) {
  const { content } = geometry;
  if (!content.width || !content.height) return null;
  const sx = (DIAGRAM.width - INSET * 2) / content.width;
  const sy = (DIAGRAM.height - INSET * 2) / content.height;
  return (
    <svg width={DIAGRAM.width} height={DIAGRAM.height} viewBox={`0 0 ${DIAGRAM.width} ${DIAGRAM.height}`} aria-hidden className="shrink-0 text-gray-3">
      <rect
        x={OUTLINE / 2}
        y={OUTLINE / 2}
        width={DIAGRAM.width - OUTLINE}
        height={DIAGRAM.height - OUTLINE}
        rx={8}
        fill="none"
        stroke="currentColor"
        strokeWidth={OUTLINE}
      />
      {Object.entries(geometry.frames).map(([frameId, rect]) => (
        <rect
          key={frameId}
          // A hairline gap between neighbours.
          x={INSET + (rect.x - content.x) * sx + 0.75}
          y={INSET + (rect.y - content.y) * sy + 0.75}
          width={Math.max(1, rect.width * sx - 1.5)}
          height={Math.max(1, rect.height * sy - 1.5)}
          rx={3}
          fill="currentColor"
          fillOpacity={frameId === id ? 1 : 0.14}
        />
      ))}
    </svg>
  );
}

/**
 * Where one interface can go, drawn: pick one and it moves there. Each
 * drawing is the whole workspace after the move, so what makes room is
 * visible; anything it would minimize is named underneath. Minimize has its
 * own button in the header, so it isn't here.
 */
export function LayoutMenu({
  layout,
  entry,
  labelOf,
  preview,
  geometryOf,
  onChange,
}: {
  layout: WorkspaceLayout;
  entry: LayoutEntry;
  labelOf: (id: InstanceId) => string;
  /** The controller's answer to a change, without committing it. */
  preview: (change: LayoutChange) => LayoutResult;
  geometryOf: (layout: WorkspaceLayout) => WorkspaceGeometry;
  /** Null: where it already is, so nothing to change. */
  onChange: (change: LayoutChange | null) => void;
}) {
  const options = placementOptions(layout, entry, preview, geometryOf);
  const [hovered, setHovered] = useState<number | null>(null);
  const evictionNote = (evicted: InstanceId[]) =>
    evicted.length ? `Minimizes ${evicted.map(labelOf).join(" and ")}` : undefined;
  const note = hovered !== null ? evictionNote(options[hovered]?.result.evicted ?? []) : undefined;

  return (
    <MenuCard title="Move to" className="w-auto">
      <div role="menu" aria-label="Move to" className="grid grid-cols-3 items-start gap-1" onPointerLeave={() => setHovered(null)}>
        {options.map((option, index) => {
          const detail = evictionNote(option.result.evicted);
          return (
            <button
              key={option.label + index}
              type="button"
              role="menuitemradio"
              aria-checked={option.current}
              aria-label={detail ? `${option.label}. ${detail}` : option.label}
              title={detail}
              onPointerEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              onClick={() => onChange(option.change)}
              className={cn(
                "flex w-[96px] cursor-pointer flex-col items-center gap-1 rounded-[10px] px-1.5 pt-2 pb-1.5 transition-colors hover:bg-gray-6",
                option.current && "bg-gray-6",
              )}
            >
              <PlacementDiagram geometry={geometryOf(option.result.layout)} id={entry.id} />
              {/* Two lines at most, so "Extended medium, right" reads whole. */}
              <Text variant="caption" color={option.current ? "primary" : "secondary"} className="line-clamp-2 w-full text-center leading-tight text-balance">
                {option.label}
              </Text>
            </button>
          );
        })}
      </div>
      {/* Room for a note only where some choice minimizes something. */}
      {options.some((option) => option.result.evicted.length > 0) && (
        <Text variant="caption" color="secondary" className={cn("min-h-[18px] px-2 pt-1", !note && "invisible")} aria-live="polite">
          {note ?? "\u00a0"}
        </Text>
      )}
    </MenuCard>
  );
}
