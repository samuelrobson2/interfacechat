import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

import { EMPTY_SHELL_DATA, InterfaceShell, SHELL_DIMENSIONS } from "@/features/interface-shells";
import { cn } from "@/shared/lib/css";
import { HOME_POSITIONS, panTo } from "../model/home-layout";
import type { HomeTile, KindData } from "../model/home-tiles";
import type { HomeField as HomeFieldState } from "../model/use-home-field";

/** Panning: unhurried, so the page glides to a tile rather than jumping. */
const PAN = { type: "spring" as const, stiffness: 110, damping: 22, mass: 1 };
/** A tile opening in place: a little lift, settling softly. */
const GROW = { type: "spring" as const, stiffness: 300, damping: 26, mass: 0.9 };
const EASE = [0.23, 1, 0.32, 1] as const;

const MEDIUM = SHELL_DIMENSIONS.medium.width;
const MEDIUM_PLUS = SHELL_DIMENSIONS["medium-plus"].width;

/** The field is laid out for this width and scaled down below it. */
const DESIGN_WIDTH = 1180;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function Shell({
  value,
  size,
  onChange,
  onSubmit,
}: {
  value: KindData;
  size: "medium" | "medium-plus";
  onChange?: (next: KindData) => void;
  onSubmit?: () => void;
}) {
  return (
    <InterfaceShell
      {...({
        kind: value.kind,
        size,
        data: value.data,
        onChange: onChange && ((data: unknown) => onChange({ kind: value.kind, data } as KindData)),
        onSubmit,
      } as Parameters<typeof InterfaceShell>[0])}
    />
  );
}

type TileState = "rest" | "dim" | "hint" | "open";

/**
 * One interface in its fixed place. It never moves: recognised, it gets a ring;
 * opened, it grows to medium plus where it stands and becomes the card.
 */
function FieldTile({
  tile,
  state,
  field,
  hidden,
  disabled,
  onPick,
  onSubmit,
}: {
  tile: Extract<HomeTile, { type: "blank" }>;
  state: TileState;
  field: HomeFieldState;
  hidden: boolean;
  disabled: boolean;
  onPick: () => void;
  onSubmit: () => void;
}) {
  const reduce = Boolean(useReducedMotion());
  const open = state === "open";
  const side = open ? MEDIUM_PLUS : MEDIUM;
  const { x, y } = HOME_POSITIONS[tile.kind];
  const card = open || state === "hint" ? field.card : null;
  const value = card ? card.interface : ({ kind: tile.kind, data: EMPTY_SHELL_DATA[tile.kind] } as KindData);

  return (
    <motion.div
      className={cn("absolute top-0 left-0", open ? "z-20" : "z-0")}
      initial={false}
      animate={{
        x: x - side / 2,
        y: y - side / 2,
        width: side,
        height: side,
        opacity: hidden ? 0 : state === "dim" ? 0.45 : 1,
      }}
      transition={reduce ? { duration: 0 } : { ...GROW, opacity: { duration: 0.3, ease: EASE } }}
    >
      <motion.div
        layoutId={open ? `chat-lab-artefact-${tile.kind}` : undefined}
        className={cn(
          "relative size-full rounded-[20px] transition-shadow duration-300",
          state === "hint" && "ring-2 ring-[#8fb4f0]/70 ring-offset-2",
          open && "drop-shadow-[0_18px_40px_rgba(26,23,24,0.12)]",
          !open && !disabled && "cursor-pointer",
        )}
        onClick={open || disabled ? undefined : onPick}
        role={open ? undefined : "button"}
        aria-label={open ? undefined : `Open ${tile.kind}`}
      >
        <Shell
          value={value}
          size={open ? "medium-plus" : "medium"}
          onChange={open && card?.editable ? field.edit : undefined}
          onSubmit={open ? onSubmit : undefined}
        />
        {open && (
          <button
            type="button"
            aria-label="Dismiss interface"
            onClick={field.dismiss}
            className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-background-primary text-typography-secondary shadow-[0_1px_4px_rgba(26,23,24,0.15)] transition-colors hover:text-typography-primary active:scale-[0.96]"
          >
            <X className="size-3.5" />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * The chat home: every interface in a fixed place around the headline. Typing
 * or clicking opens one where it stands, and the page pans to centre it.
 * Nothing else rearranges.
 */
export function HomeField({
  field,
  headline,
  disabled,
  handingOff,
  onSubmit,
}: {
  field: HomeFieldState;
  headline: React.ReactNode;
  disabled: boolean;
  /** Sending: everything but the open card fades while it morphs away. */
  handingOff: boolean;
  onSubmit: () => void;
  onReopen?: (sessionId: string) => void;
}) {
  const reduce = Boolean(useReducedMotion());
  const [ref, width] = useWidth<HTMLDivElement>();
  const scale = width ? Math.min(1, width / DESIGN_WIDTH) : 1;
  const { card } = field;
  const leader = card?.leader ?? null;
  const leaderTile = leader ? field.tiles.find((tile) => tile.id === leader.tileId) : undefined;
  // A dismissed card gives the middle back to the headline.
  const focusKind = leaderTile?.type === "blank" && !field.dismissed ? leaderTile.kind : null;
  const opened = Boolean(focusKind && leader && leader.phase !== "hinted");
  // Recognised at all, the card comes to the middle in the headline's place, so
  // it's clear the prompt is being captured into it.
  const focused = Boolean(focusKind);
  const pan = panTo(focusKind);

  // The page drags to explore. When a card takes the middle, any drag is undone
  // so the card really is centred.
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const dragged = useRef(false);
  useEffect(() => {
    if (!focusKind) return;
    const options = reduce ? { duration: 0 } : PAN;
    const x = animate(dragX, 0, options);
    const y = animate(dragY, 0, options);
    return () => {
      x.stop();
      y.stop();
    };
  }, [focusKind, reduce, dragX, dragY]);

  // Esc, wherever focus is, dismisses the open card and goes back to the middle,
  // undoing any drag.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (card) field.dismiss();
      const options = reduce ? { duration: 0 } : PAN;
      animate(dragX, 0, options);
      animate(dragY, 0, options);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, field, reduce, dragX, dragY]);

  const blanks = field.tiles.filter((tile): tile is Extract<HomeTile, { type: "blank" }> => tile.type === "blank");

  return (
    <div ref={ref} className="relative size-full overflow-hidden">
      {/* A full-size layer so the whole page grabs, not just the tiles. */}
      <motion.div
        drag={!disabled}
        dragElastic={0.15}
        dragMomentum
        dragConstraints={{ left: -820, right: 820, top: -560, bottom: 560 }}
        dragTransition={{ bounceStiffness: 220, bounceDamping: 26, power: 0.25 }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={() => {
          // Let the click that ends a drag through without opening a tile.
          window.setTimeout(() => {
            dragged.current = false;
          }, 0);
        }}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        style={{ x: dragX, y: dragY }}
      >
      <motion.div className="absolute top-1/2 left-1/2 size-0" style={{ scale }}>
        <motion.div initial={false} animate={pan} transition={reduce ? { duration: 0 } : PAN} className="absolute top-0 left-0 size-0">
          <motion.div
            className="pointer-events-none absolute top-0 left-0 w-[640px] -translate-x-1/2 -translate-y-1/2 text-center"
            animate={{ opacity: focused || handingOff ? 0 : 1 }}
            transition={{ duration: reduce ? 0 : 0.24, ease: EASE }}
          >
            {headline}
          </motion.div>

          {blanks.map((tile) => {
            const isLeader = tile.id === leader?.tileId;
            const state: TileState = isLeader ? (opened ? "open" : "hint") : opened ? "dim" : "rest";
            return (
              <FieldTile
                key={tile.id}
                tile={tile}
                state={state}
                field={field}
                hidden={handingOff && !isLeader}
                disabled={disabled}
                onPick={() => {
                  if (!dragged.current) field.pick(tile);
                }}
                onSubmit={onSubmit}
              />
            );
          })}
        </motion.div>
      </motion.div>
      </motion.div>
    </div>
  );
}
