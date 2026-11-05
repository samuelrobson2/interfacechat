import { TrashIcon } from "@/shared/assets/icons/general/Trash";
import { ROUTES } from "@/shared/model/routes";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ChatItemCard } from "@/features/chat-workspace/ui/chat-item-card";
import type { MockDatasetInterface } from "../../datasets/model/datasets-mock-data";
import {
  PLACEHOLDER_INTERFACES,
  lookForIndex,
  type GalleryInterface,
} from "../model/interface-gallery-mock";
import { InterfacePreview } from "../ui/interface-preview-art";

/** Every tile is this tall; its aspect ratio decides how wide it gets. */
const TILE_HEIGHT = 104;

/**
 * Hover growth, matched to the reference clip: the thumbnail blows up to
 * roughly 3× while the rest of the grid clears out of the way.
 */
const HOVER_SCALE = 2;

const INTERFACE_CELL_CLASS = "w-[112px] md:w-[128px]";

export function DatasetInterfacesDemo({
  initialInterfaces,
}: {
  initialInterfaces: MockDatasetInterface[];
}) {
  const [interfaces, setInterfaces] = useState<GalleryInterface[]>(() => [
    ...initialInterfaces.map((item, i) => ({
      id: item.id,
      title: item.title,
      subtitle: `Generated from this dataset · ${item.category ?? "uncategorized"}`,
      ...lookForIndex(i),
    })),
    ...PLACEHOLDER_INTERFACES,
  ]);
  const [activeId, setActiveId] = useState<string | null>(null);
  // How far the blown-up tile must slide to stay inside the gallery bounds.
  const [activeShift, setActiveShift] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const active = interfaces.find((item) => item.id === activeId);

  const activate = (id: string, tile: HTMLElement) => {
    const bounds = galleryRef.current?.getBoundingClientRect();
    const rect = tile.getBoundingClientRect();

    if (bounds) {
      const grownHalf = (rect.width * HOVER_SCALE) / 2;
      const centre = rect.left + rect.width / 2;
      const overflowLeft = bounds.left - (centre - grownHalf);
      const overflowRight = centre + grownHalf - bounds.right;
      setActiveShift(
        overflowLeft > 0 ? overflowLeft : overflowRight > 0 ? -overflowRight : 0,
      );
    }

    setActiveId(id);
  };

  const deleteInterface = (id: string, title: string) => {
    setInterfaces((prev) => prev.filter((item) => item.id !== id));
    setActiveId((current) => (current === id ? null : current));
    toast.success(`Deleted “${title}”`);
  };

  return (
    <div
      className="flex w-full flex-col gap-8"
      onMouseLeave={() => setActiveId(null)}
    >
      {/* Header doubles as the hover readout — it swaps to whatever is hovered. */}
      <div className="min-h-[64px]">
        <Text
          key={active?.id ?? "default-title"}
          variant="h3"
          as="h2"
          className="animate-in fade-in duration-200"
        >
          {active?.title ?? "Interfaces"}
        </Text>
        <Text
          key={`${active?.id ?? "default"}-sub`}
          variant="body"
          color="secondary"
          className="mt-1 block animate-in fade-in duration-200"
        >
          {active?.subtitle ??
            `${interfaces.length} interfaces built on this dataset — hover to preview.`}
        </Text>
      </div>

      {/* Vertical padding gives the blown-up tile somewhere to go. */}
      <div
        ref={galleryRef}
        className="flex w-full flex-wrap items-center gap-x-14 gap-y-12 py-12"
      >
        {/* "New interface" tile — unchanged card design, first in the row. */}
        <div
          className={cn(
            INTERFACE_CELL_CLASS,
            "shrink-0 transition-opacity duration-[240ms]",
            activeId !== null && "opacity-30",
          )}
        >
          <ChatItemCard
            className="aspect-square w-full gap-0"
            to={ROUTES.CHAT_LAB}
            title="New interface"
          />
        </div>

        {interfaces.map((item) => (
          <GalleryTile
            key={item.id}
            item={item}
            active={activeId === item.id}
            receded={activeId !== null && activeId !== item.id}
            shift={activeId === item.id ? activeShift : 0}
            onActivate={activate}
            onDeactivate={() => setActiveId(null)}
            onDelete={() => deleteInterface(item.id, item.title)}
          />
        ))}
      </div>

      {interfaces.length === 0 && (
        <Text variant="label" color="secondary">
          No interfaces yet.
        </Text>
      )}
    </div>
  );
}

function GalleryTile({
  item,
  active,
  receded,
  shift,
  onActivate,
  onDeactivate,
  onDelete,
}: {
  item: GalleryInterface;
  active: boolean;
  receded: boolean;
  shift: number;
  onActivate: (id: string, tile: HTMLElement) => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn("group relative", active && "z-20")}
      style={{
        height: TILE_HEIGHT,
        width: Math.round(item.ratio * TILE_HEIGHT),
      }}
      onMouseEnter={(event) => onActivate(item.id, event.currentTarget)}
      onFocus={(event) => onActivate(item.id, event.currentTarget)}
      onBlur={onDeactivate}
    >
      {/*
        Enter is a hard decelerate with a ~1% overshoot that settles — the swoop
        comes from the size change, not from bounce. Exit just drops back.
        Tailwind v4 emits `scale`/`translate` as standalone properties, so the
        transition has to name them; `transform` alone animates nothing.
      */}
      <div
        className={cn(
          "absolute inset-0 origin-center transform-gpu will-change-transform",
          "transition-[scale,translate,opacity]",
          active
            ? "scale-[var(--tile-scale)] duration-[340ms] ease-[cubic-bezier(0.24,1.2,0.36,1)]"
            : "scale-100 duration-[170ms] ease-[cubic-bezier(0.3,0.9,0.3,1)]",
          // Everything else hangs back so the preview reads on top, and stops
          // intercepting the pointer under the blown-up tile.
          receded && "pointer-events-none scale-[1.03] opacity-30",
          "motion-reduce:transition-none motion-reduce:scale-100",
        )}
        style={
          {
            "--tile-scale": HOVER_SCALE,
            translate: shift ? `${Math.round(shift)}px 0` : undefined,
          } as CSSProperties
        }
        // Sits on the grown bounds, so this fires when the preview is truly left.
        onMouseLeave={onDeactivate}
      >
        {/* Shadow lives on its own layer so depth fades in without repainting. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[8px] transition-opacity",
            "shadow-[0_20px_40px_-14px_rgba(0,0,0,0.42)] duration-[300ms]",
            active ? "opacity-100" : "opacity-0",
          )}
        />

        <Link
          to={ROUTES.CHAT_LAB}
          aria-label={item.title}
          className={cn(
            "relative block size-full overflow-hidden rounded-[8px] bg-gray-1",
            "border border-stroke-secondary/50 outline-none",
            "focus-visible:ring-2 focus-visible:ring-blue-4",
          )}
        >
          <InterfacePreview name={item.preview} />
        </Link>
      </div>

      {/* Rides out to the grown tile's corner instead of floating mid-image. */}
      <Button
        variant="icon-button"
        size="icon-sm"
        aria-label={`Delete ${item.title}`}
        onClick={onDelete}
        className={cn(
          "absolute -right-2 -top-2 size-6 rounded-full border border-stroke-secondary",
          "bg-background-primary shadow-sm transition-[translate,opacity]",
          "duration-[340ms] ease-[cubic-bezier(0.24,1.2,0.36,1)] hover:bg-red-1",
          active ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{
          translate: active
            ? `${Math.round(shift + (item.ratio * TILE_HEIGHT * (HOVER_SCALE - 1)) / 2)}px ${Math.round((-TILE_HEIGHT * (HOVER_SCALE - 1)) / 2)}px`
            : undefined,
        }}
      >
        <TrashIcon svgClasses="size-3.5" pathClasses="fill-red-5" />
      </Button>
    </div>
  );
}
