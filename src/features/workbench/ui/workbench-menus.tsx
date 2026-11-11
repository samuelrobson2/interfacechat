import { Check } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import type { WorkspaceGeometry } from "../model/workbench-geometry";
import {
  PRESENTATION_LABEL,
  presentationsFor,
  type InstanceId,
  type LayoutChange,
  type LayoutEntry,
  type LayoutResult,
  type Side,
  type WorkspaceLayout,
} from "../model/workbench-layout";
import { LayoutGlyph } from "./layout-glyph";

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

const MenuDivider = () => <div aria-hidden className="mx-2 my-1.5 h-px bg-gray-2/50" />;

/**
 * Sizes for one interface, each with a glyph of where it would land and what
 * it would minimize. Choosing one runs the layout controller.
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
  onChange: (change: LayoutChange) => void;
}) {
  const sideOf = (): Side | null => {
    if (entry.region === "left" || entry.region === "right") return entry.region;
    return null;
  };
  const side = sideOf();
  const mainCount = Object.values(layout.entries).filter((item) => item.region === "main").length;
  const mainSide: Side | null = entry.region === "main" && mainCount > 1 ? (entry.order === 0 ? "left" : "right") : null;
  const currentSide = side ?? mainSide;

  const evictionNote = (evicted: InstanceId[]) =>
    evicted.length ? `Minimizes ${evicted.map(labelOf).join(" and ")}` : undefined;

  return (
    <MenuCard title="Layout">
      <div role="menu" aria-label="Size">
        {presentationsFor(entry).map((presentation) => {
          const change: LayoutChange = { type: "present", id: entry.id, presentation };
          const selected = entry.presentation === presentation;
          const result = selected ? { layout, evicted: [] } : preview(change);
          return (
            <MenuRow
              key={presentation}
              selected={selected}
              leading={<LayoutGlyph geometry={geometryOf(result.layout)} id={entry.id} />}
              label={PRESENTATION_LABEL[presentation]}
              detail={evictionNote(result.evicted)}
              onSelect={() => onChange(change)}
            />
          );
        })}
      </div>
      {(side || mainSide) && (
        <>
          <MenuDivider />
          <div role="menu" aria-label="Side" className="flex gap-1 px-1 pb-0.5">
            {(["left", "right"] as const).map((target) => {
              const change: LayoutChange = { type: "side", id: entry.id, side: target };
              const result = preview(change);
              const selected = currentSide === target;
              return (
                <button
                  key={target}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  disabled={!selected && !result.changed}
                  title={evictionNote(result.evicted)}
                  onClick={() => !selected && onChange(change)}
                  className={cn(
                    "flex h-8 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] transition-colors",
                    "hover:bg-gray-6 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent",
                    selected && "bg-gray-6",
                  )}
                >
                  <LayoutGlyph geometry={geometryOf(result.layout)} id={entry.id} />
                  <Text variant="label">{target === "left" ? "Left" : "Right"}</Text>
                </button>
              );
            })}
          </div>
        </>
      )}
    </MenuCard>
  );
}
