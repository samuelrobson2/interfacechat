import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

import {
  EMPTY_SHELL_DATA,
  InterfaceShell,
  SHELL_DIMENSIONS,
  type ShellSuggestions,
  type SuggestedGroup,
  type SuggestedValues,
} from "@/features/interface-shells";
import { useInterfaceGenerative } from "@/features/generative-toolbar";
import { PromptChoices } from "./prompt-choices";
import { cn } from "@/shared/lib/css";
import "./home-field.css";
import { HOME_POSITIONS, panTo } from "../model/home-layout";
import type { HomeTile, KindData } from "../model/home-tiles";
import { nextPeek, PEEK_FIRST_MS, PEEK_GAP_MS, PEEK_SHOW_MS, peekValue, type HomePeek } from "../model/home-peeks";
import type { HomeField as HomeFieldState } from "../model/use-home-field";

/** Panning: unhurried, so the page glides to a tile rather than jumping. */
const PAN = { type: "spring" as const, stiffness: 110, damping: 22, mass: 1 };
/** A tile opening in place: a little lift, settling softly. */
const GROW = { type: "spring" as const, stiffness: 300, damping: 26, mass: 0.9 };
const EASE = [0.23, 1, 0.32, 1] as const;
/** Arriving: once the headline has faded in, each tile spins out of the centre to its place, overshooting a touch. */
const SPIN_OUT = { type: "spring" as const, stiffness: 95, damping: 14, mass: 1 };
/** One tile leaves the title after another, this far apart. */
const LAUNCH_STEP = 0.075;
/**
 * The order tiles leave the title in: the ring round the headline first, then the outer one,
 * each going clockwise from the top left, so they come out one by one rather than as a burst.
 */
const LAUNCH_ORDER = (Object.keys(HOME_POSITIONS) as (keyof typeof HOME_POSITIONS)[])
  .map((kind) => {
    const { x, y } = HOME_POSITIONS[kind];
    // Clockwise from the top left: angle measured from up-and-left.
    const angle = (Math.atan2(y, x) + Math.PI * 2 + Math.PI * 0.9) % (Math.PI * 2);
    return { kind, ring: Math.hypot(x, y) > 500 ? 1 : 0, angle };
  })
  .sort((a, b) => a.ring - b.ring || a.angle - b.angle)
  .map(({ kind }) => kind);
/** When a tile sets off after the release: its place in the launch order. */
const introDelay = (kind: keyof typeof HOME_POSITIONS) => Math.max(0, LAUNCH_ORDER.indexOf(kind)) * LAUNCH_STEP;
/** How long after the release a tile that mounts still spins out, rather than just being there. */
const INTRO_WINDOW_MS = 1500;
/** About when a spun-out tile reaches its place, for the shapes in its interaction area to draw in. */
const LAND_AFTER = 0.55;
/** How long the drawing-in runs, after which the shapes only answer hover. */
const LANDING_MS = 1400;

const MEDIUM = SHELL_DIMENSIONS.medium;
const MEDIUM_PLUS = SHELL_DIMENSIONS["medium-plus"];
/** Every tile waits here, in the centre, small, turned and unseen, until the headline has faded in. */
const HELD = { x: -MEDIUM.width / 2, y: -MEDIUM.height / 2, width: MEDIUM.width, height: MEDIUM.height, opacity: 0, scale: 0.3, rotate: -50 };

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
  suggestions,
  suggested,
  onDismissSuggestion,
}: {
  value: KindData;
  size: "medium" | "medium-plus";
  onChange?: (next: KindData) => void;
  onSubmit?: () => void;
  suggestions?: ShellSuggestions;
  suggested?: SuggestedValues;
  onDismissSuggestion?: (group: SuggestedGroup, value: string) => void;
}) {
  // The open card gets generated tools too: in its toolbar, and beside the parts they act on.
  const root = useRef<HTMLDivElement>(null);
  const generative = useInterfaceGenerative({
    root,
    kind: value.kind,
    size,
    data: value.data as unknown,
    onChange: (data: unknown) => onChange?.({ kind: value.kind, data } as KindData),
    enabled: Boolean(onChange),
    // The card changes with every keystroke: ask once they've paused, so the name and fills aren't held up.
    settleMs: 1400,
  });
  const own = generative.props;
  // The home's own suggestions (read off the request) come first; the system's fill groups it has none for.
  const mergedSuggested: SuggestedValues | undefined =
    suggested || own.suggested ? { ...(own.suggested ?? {}), ...Object.fromEntries(Object.entries(suggested ?? {}).filter(([, list]) => list?.length)) } : undefined;
  return (
    <div ref={root} data-home-card="" className="relative size-full rounded-[18px]">
      <InterfaceShell
        {...({
          kind: value.kind,
          size,
          data: value.data,
          onChange: onChange && own.onChange,
          onSubmit,
          tools: own.tools,
          suggestions: { ...(own.suggestions ?? {}), ...(suggestions ?? {}) },
          suggested: mergedSuggested,
          onDismissSuggestion: (group: SuggestedGroup, dismissed: string) => {
            onDismissSuggestion?.(group, dismissed);
            own.onDismissSuggestion?.(group, dismissed);
          },
        } as Parameters<typeof InterfaceShell>[0])}
      />
      {generative.note}
    </div>
  );
}

type TileState = "rest" | "dim" | "hint" | "open";

/** How a peek builds: a beat for the card to grow, the request typed into it, then its sections. */
const PEEK_TYPE_AFTER_MS = 320;
const PEEK_KEY_MS = 14;
const PEEK_KEY_JITTER_MS = 12;
const PEEK_SECTION_STEP_MS = 120;
const PEEK_SECTION_MS = 460;
/** A group with more parts than this (a table's cells) comes in as one section. */
const SECTION_MAX_PARTS = 8;
/** Typed nothing yet, the title holds an empty character, so it never shows its grey placeholder first. */
const BLANK = "\u200b";

/** A part's sections: what's inside it, past any single wrapper; a group of too many small parts is one section. */
function sectionsOf(part: Element): Element[] {
  let at = part;
  for (let depth = 0; depth < 3 && at.children.length === 1; depth++) at = at.children[0]!;
  const children = Array.from(at.children);
  if (children.length === 0 || children.length > SECTION_MAX_PARTS) return [at];
  return children;
}

/**
 * A peek's card: its request types itself into the title (Search's query,
 * Chat's message), then its sections (the toolbar, then what the content area
 * holds) come in one after another, top to bottom.
 */
function PeekShell({ peek }: { peek: HomePeek }) {
  const reduce = Boolean(useReducedMotion());
  const chars = Array.from(peek.prompt);
  const [typed, setTyped] = useState(reduce ? chars.length : 0);
  const [built, setBuilt] = useState(reduce);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    let count = 0;
    let timer = 0;
    const key = () => {
      count += 1;
      setTyped(count);
      if (count >= chars.length) {
        timer = window.setTimeout(() => setBuilt(true), 160);
        return;
      }
      timer = window.setTimeout(key, PEEK_KEY_MS + Math.random() * PEEK_KEY_JITTER_MS);
    };
    timer = window.setTimeout(key, PEEK_TYPE_AFTER_MS);
    return () => window.clearTimeout(timer);
    // Typed once, when the peek starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typed: the parts come in, one after another, each only once (a piece inside another comes with it).
  useLayoutEffect(() => {
    const node = root.current;
    if (!built || reduce || !node) return;
    // The toolbar comes in as one section; the content area's and detail line's are what they hold. Top to bottom.
    // The toolbar's contents, not the bar: its panel top stays put while it fills.
    const tools = Array.from(node.querySelectorAll('[data-shell-part="tools"]')).flatMap((bar) => Array.from(bar.children));
    const rest = Array.from(node.querySelectorAll('[data-shell-part="body"], [data-shell-part="meta"]')).flatMap(sectionsOf);
    const sections = [...tools, ...rest]
      .map((element) => ({ element, box: element.getBoundingClientRect() }))
      // Nothing to see (a detail line with nothing in it): nothing to bring in.
      .filter(({ box }) => box.height > 0)
      .map(({ element, box }) => ({ element, top: box.top }))
      .sort((a, b) => a.top - b.top)
      .map(({ element }) => element);
    // One keyframe, as the start (offset 0): each comes from hidden to whatever it already is, so a faint tool
    // stays faint and no colour shifts. (Without the offset a lone keyframe is the end, and it would fade out.)
    const animations = sections.map((section, i) =>
      section.animate([{ opacity: 0, transform: "translateY(5px)", offset: 0 }], {
        duration: PEEK_SECTION_MS,
        delay: i * PEEK_SECTION_STEP_MS,
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        fill: "backwards",
      }),
    );
    return () => animations.forEach((animation) => animation.cancel());
  }, [built, reduce]);

  return (
    <div ref={root} data-peek-stage={built ? "built" : "typing"} className="size-full">
      <Shell value={peekValue({ kind: peek.kind, prompt: chars.slice(0, typed).join("") || BLANK })} size="medium-plus" />
    </div>
  );
}

/**
 * One interface in its fixed place. It never moves: recognised, it gets a ring;
 * opened, it grows to medium plus where it stands and becomes the card. While
 * the page is idle it can peek: grow to medium plus filled with an example,
 * offering the request that would make it.
 */
function FieldTile({
  tile,
  state,
  field,
  hidden,
  disabled,
  held,
  intro,
  peek,
  onPeekHover,
  onPick,
  onSubmit,
}: {
  /** Showing an example of itself, with the request to try. */
  peek: HomePeek | null;
  /** The pointer is on it (true) or has left (false): a peek waits while it's being looked at. */
  onPeekHover: (over: boolean) => void;
  tile: Extract<HomeTile, { type: "blank" }>;
  /** Waiting in the centre for the headline to finish typing. */
  held: boolean;
  /** The page is arriving: a tile that mounts now spins out of the centre once released. */
  intro: boolean;
  state: TileState;
  field: HomeFieldState;
  hidden: boolean;
  disabled: boolean;
  onPick: () => void;
  onSubmit: () => void;
}) {
  const reduce = Boolean(useReducedMotion());
  const open = state === "open";
  const peeking = Boolean(peek) && !open;
  const side = open || peeking ? MEDIUM_PLUS : MEDIUM;
  const { x, y } = HOME_POSITIONS[tile.kind];
  const card = open || state === "hint" ? field.card : null;
  const value = card ? card.interface : ({ kind: tile.kind, data: EMPTY_SHELL_DATA[tile.kind] } as KindData);
  const tryIt = () => {
    if (peek) field.tryPrompt(tile, peek.prompt);
  };

  // Arriving, the tile waits in the centre, spins out to its place once released, and its glyph pops in as it lands.
  const [spin] = useState(() => intro && !reduce);
  const [delay] = useState(() => (spin ? introDelay(tile.kind) : 0));
  const [arriving, setArriving] = useState(spin);
  const [landed, setLanded] = useState(!spin);
  // Just landed: the shapes in the interaction area draw themselves in, once.
  const [landing, setLanding] = useState(false);
  const waiting = spin && held;
  useEffect(() => {
    if (!spin || held) return;
    const land = window.setTimeout(() => {
      setLanded(true);
      setLanding(true);
    }, (delay + LAND_AFTER) * 1000);
    const drawn = window.setTimeout(() => setLanding(false), (delay + LAND_AFTER) * 1000 + LANDING_MS);
    // Settled: later moves (opening, panning) start at once.
    const settle = window.setTimeout(() => setArriving(false), (delay + 2) * 1000);
    return () => {
      window.clearTimeout(land);
      window.clearTimeout(drawn);
      window.clearTimeout(settle);
    };
  }, [spin, held, delay]);

  return (
    <motion.div
      data-home-tile=""
      data-landed={landed ? "" : undefined}
      data-landing={landing ? "" : undefined}
      data-open={open ? "" : undefined}
      data-peek={peeking ? "" : undefined}
      onPointerEnter={() => onPeekHover(true)}
      onPointerLeave={() => onPeekHover(false)}
      className={cn("absolute top-0 left-0", open ? "z-20" : peeking ? "z-[15]" : "z-0")}
      initial={spin ? HELD : false}
      animate={
        waiting
          ? HELD
          : {
              x: x - side.width / 2,
              y: y - side.height / 2,
              width: side.width,
              height: side.height,
              scale: 1,
              rotate: 0,
              opacity: hidden ? 0 : state === "dim" ? 0.45 : 1,
            }
      }
      transition={
        reduce
          ? { duration: 0 }
          : arriving
            ? { ...SPIN_OUT, delay, opacity: { duration: 0.45, ease: EASE, delay } }
            : { ...GROW, opacity: { duration: 0.3, ease: EASE } }
      }
    >
      <motion.div
        layoutId={open ? `chat-lab-artefact-${tile.kind}` : undefined}
        className={cn(
          "relative size-full rounded-[20px] transition-shadow duration-300",
          state === "hint" && "ring-2 ring-[#8fb4f0]/70 ring-offset-2",
          !open && !disabled && "cursor-pointer",
        )}
        onClick={open || disabled || waiting ? undefined : peeking ? tryIt : onPick}
        role={open ? undefined : "button"}
        aria-label={open ? undefined : peeking && peek ? `Try: ${peek.prompt}` : `Open ${tile.kind}`}
      >
        {/* A peek's example fades in as the card grows, and out as it shrinks back. */}
        <motion.div
          key={peeking ? "peek" : "tile"}
          className="size-full"
          initial={peeking || (!open && !waiting && landed) ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: EASE, delay: peeking && !reduce ? 0.12 : 0 }}
        >
        {peeking && peek ? (
          <PeekShell peek={peek} />
        ) : (
        <Shell
          value={value}
          size={open ? "medium-plus" : "medium"}
          onChange={open && card?.editable ? field.edit : undefined}
          onSubmit={open ? onSubmit : undefined}
          suggestions={
            open && card?.editable
              ? {
                  // Inside the card: what the request leaves open, with the guesses it'll go with.
                  brief: <PromptChoices choices={field.choices} thinking={field.choicesThinking} onPick={field.pickChoice} />,
                }
              : undefined
          }
          // The card's own parts, filled in place: a table's columns, a search's filters, a checklist's first items.
          suggested={open && card?.editable ? field.suggested : undefined}
          onDismissSuggestion={open && card?.editable ? field.dismissSuggestion : undefined}
        />
        )}
        </motion.div>
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
  lift = 0,
  onRelease,
}: {
  /** Pixels the middle sits above the container's, to clear what floats over the bottom. */
  lift?: number;
  /** Called once the interfaces set off from the centre (at once with reduced motion or a plain headline). */
  onRelease?: () => void;
  field: HomeFieldState;
  /** Given a callback, the headline animates in (fades in) and calls it when done; the tiles wait for it. */
  headline: React.ReactNode | ((onShown: () => void) => React.ReactNode);
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
  // Recognised is enough: the card opens at medium plus at once, ready to work in, rather than waiting as a hint.
  const opened = Boolean(focusKind && leader);
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

  // Arriving, every tile waits in the centre until the headline has faded in, then they all spin
  // out of it together. Anything that opens a card first (typing into the composer) releases them at once.
  const animatedHeadline = typeof headline === "function";
  const [released, setReleased] = useState(!animatedHeadline || reduce);
  const [intro, setIntro] = useState(!reduce);
  const [onShown] = useState(() => () => setReleased(true));
  const out = released || Boolean(card);
  const release = useRef(onRelease);
  useEffect(() => {
    release.current = onRelease;
  });
  useEffect(() => {
    if (out) release.current?.();
  }, [out]);
  useEffect(() => {
    if (!out) return;
    // A tile that turns up a little after the release still spins out; after that, they just appear.
    const done = window.setTimeout(() => setIntro(false), INTRO_WINDOW_MS);
    return () => window.clearTimeout(done);
  }, [out]);

  const blanks = field.tiles.filter((tile): tile is Extract<HomeTile, { type: "blank" }> => tile.type === "blank");

  // While the page is idle (settled, nothing typed), one of the interfaces round the headline at a time
  // grows to show an example of itself and the request that would make it, then shrinks back for the next.
  // One being looked at stays until the pointer leaves.
  // Once they start typing, the examples stop for good: the page is theirs now.
  const [typedOnce, setTypedOnce] = useState(false);
  if (!typedOnce && field.draft.trim()) setTypedOnce(true);
  const idle = out && !intro && !card && !typedOnce && !disabled && !handingOff && !reduce;
  const [peek, setPeek] = useState<HomePeek | null>(null);
  const [peekSeen, setPeekSeen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const lastPeek = useRef<HomePeek["kind"] | null>(null);
  const kinds = blanks.map((tile) => tile.kind).join(",");
  useEffect(() => {
    if (!idle) return;
    if (peek && hover === peek.kind) return;
    const wait = peek ? PEEK_SHOW_MS : peekSeen ? PEEK_GAP_MS : PEEK_FIRST_MS;
    const timer = window.setTimeout(() => {
      if (peek) {
        lastPeek.current = peek.kind;
        setPeek(null);
        return;
      }
      setPeekSeen(true);
      setPeek(nextPeek(lastPeek.current, kinds.split(",") as HomePeek["kind"][]));
    }, wait);
    return () => window.clearTimeout(timer);
  }, [idle, peek, peekSeen, hover, kinds]);
  const shownPeek = idle ? peek : null;

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
      <motion.div className="absolute left-1/2 size-0" style={{ scale, top: `calc(50% - ${lift}px)` }}>
        <motion.div initial={false} animate={pan} transition={reduce ? { duration: 0 } : PAN} className="absolute top-0 left-0 size-0">
          <motion.div
            // Above the tiles, so they spin out from behind it.
            className="pointer-events-none absolute top-0 left-0 z-10 w-[640px] -translate-x-1/2 -translate-y-1/2 text-center"
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: focused || handingOff ? 0 : 1, scale: 1 }}
            transition={{ duration: reduce ? 0 : 0.24, ease: EASE, scale: { duration: reduce ? 0 : 0.5, ease: EASE } }}
          >
            {typeof headline === "function" ? headline(onShown) : headline}
          </motion.div>

          {blanks.map((tile) => {
            const isLeader = tile.id === leader?.tileId;
            const state: TileState = isLeader ? (opened ? "open" : "hint") : opened ? "dim" : "rest";
            return (
              <FieldTile
                key={tile.id}
                tile={tile}
                held={!out}
                intro={intro}
                peek={shownPeek?.kind === tile.kind ? shownPeek : null}
                onPeekHover={(over) => setHover((current) => (over ? tile.kind : current === tile.kind ? null : current))}
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
