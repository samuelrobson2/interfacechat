import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  EMPTY_SHELL_DATA,
  InterfaceShell,
  SHELL_DIMENSIONS,
  type ShellDataByKind,
} from "@/features/interface-shells";
import { cn } from "@/shared/lib/css";
import { useInputStore } from "../pharos/chat";
import {
  interfaceSeed,
  matchVisualInterface,
  orbitingInterfaces,
  promptForInterface,
  type VisualInterfaceKind,
} from "../model/visual-interfaces";
import {
  draftShellData,
  isExpandableInterface,
  promptFromShellData,
  type ExpandableInterfaceKind,
  type StarterData,
} from "../model/shell-adapters";
import { MiniMoodboard } from "./mini-interfaces";

const CARD = SHELL_DIMENSIONS.medium.width;
const CARD_ACTIVE = SHELL_DIMENSIONS["medium-plus"].width;
const EASE = [0.23, 1, 0.32, 1] as const;
const MORPH_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

export type StarterField = { kind: ExpandableInterfaceKind; data: StarterData };

function ringPoint(angleDeg: number, radius: number) {
  const theta = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(theta) * radius, y: Math.sin(theta) * radius };
}

/** The library shell at medium (idle) or medium plus (recognised, editable). */
function StarterShell({
  kind,
  active,
  data,
  editable,
  onChange,
  onSubmit,
}: {
  kind: ExpandableInterfaceKind;
  active: boolean;
  data: StarterData;
  editable: boolean;
  onChange: (data: StarterData) => void;
  onSubmit: () => void;
}) {
  const size = active ? "medium-plus" : "medium";
  const change = editable ? onChange : undefined;
  const submit = active ? onSubmit : undefined;

  switch (kind) {
    case "document":
      return (
        <InterfaceShell
          kind="document"
          size={size}
          data={data as ShellDataByKind["document"]}
          onChange={change}
          onSubmit={submit}
        />
      );
    case "search":
      return (
        <InterfaceShell
          kind="search"
          size={size}
          data={data as ShellDataByKind["search"]}
          onChange={change}
          onSubmit={submit}
        />
      );
    case "table":
      return (
        <InterfaceShell
          kind="table"
          size={size}
          data={data as ShellDataByKind["table"]}
          onChange={change}
          onSubmit={submit}
        />
      );
    case "moodboard": {
      const board = data as ShellDataByKind["document"];
      return (
        <MiniMoodboard
          topic={active ? board.title : ""}
          context={active ? board.body : ""}
          active={active}
          editable={editable}
          onTopicChange={editable ? (title) => onChange({ ...board, title }) : undefined}
          onContextChange={editable ? (body) => onChange({ ...board, body }) : undefined}
          onSubmit={submit}
        />
      );
    }
  }
}

function VisualShellCard({
  kind,
  active,
  data,
  angle,
  radius,
  disabled,
  expandingKind,
  isStarting,
  onSelect,
  onDataChange,
  onStart,
  reduceMotion,
}: {
  kind: ExpandableInterfaceKind;
  active: boolean;
  data: StarterData;
  angle: number;
  radius: number;
  disabled?: boolean;
  expandingKind?: ExpandableInterfaceKind | null;
  isStarting?: boolean;
  onSelect: () => void;
  onDataChange: (data: StarterData) => void;
  onStart: () => void;
  reduceMotion: boolean;
}) {
  const { x, y } = ringPoint(angle, radius);
  const growsOpen = expandingKind === kind;
  const fading =
    growsOpen ? false : Boolean(expandingKind) || Boolean(isStarting);
  const size = active || growsOpen ? CARD_ACTIVE : CARD;

  return (
    <motion.div
      layoutId={`chat-lab-artefact-${kind}`}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{
        opacity: fading ? 0 : 1,
        scale: fading ? 0.96 : 1,
        width: size,
        height: size,
      }}
      transition={
        growsOpen
          ? MORPH_SPRING
          : {
              duration: fading ? 0.22 : 0.45,
              ease: EASE,
              width: { type: "spring", stiffness: 280, damping: 28 },
              height: { type: "spring", stiffness: 280, damping: 28 },
            }
      }
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        zIndex: growsOpen ? 20 : active ? 8 : 2,
        pointerEvents: fading ? "none" : undefined,
      }}
    >
      <div
        role={active ? "group" : "button"}
        tabIndex={disabled || active ? -1 : 0}
        aria-label={kind}
        aria-pressed={active}
        title={active ? undefined : interfaceSeed(kind)}
        onClick={() => {
          if (disabled || active) return;
          onSelect();
        }}
        onKeyDown={(event) => {
          // Never treat Space/Enter as submit while the shell is the editor.
          if (disabled || active) return;
          if (event.key === "Enter") {
            event.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "size-full text-left outline-none",
          "transition-[box-shadow] duration-200",
          !disabled && !active && "cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
          active && "cursor-default",
        )}
      >
        <StarterShell
          kind={kind}
          active={active}
          data={data}
          editable={active && !disabled}
          onChange={onDataChange}
          onSubmit={onStart}
        />
      </div>
    </motion.div>
  );
}

const emptyStarterData = (kind: ExpandableInterfaceKind): StarterData =>
  kind === "moodboard" ? { title: "", body: "" } : EMPTY_SHELL_DATA[kind];

/**
 * Three library shells around the orb. Typing recognises one — it grows into
 * an editor so you can add context there instead of in the home prompt.
 */
export function VisualStarterSuggestions({
  orb,
  onApply,
  disabled = false,
  expandingKind = null,
  isStarting = false,
  field = null,
  onFieldChange,
}: {
  orb: React.ReactNode;
  onApply: (
    text: string,
    kind: VisualInterfaceKind | null,
    field: StarterField | null,
  ) => void;
  disabled?: boolean;
  expandingKind?: ExpandableInterfaceKind | null;
  isStarting?: boolean;
  /** The shell's own fields once edited; null while it follows the composer. */
  field?: StarterField | null;
  onFieldChange?: (field: StarterField | null) => void;
}) {
  const draft = useInputStore((state) => state.message ?? "");
  const setMessage = useInputStore((state) => state.setMessage);
  const reduceMotion = Boolean(useReducedMotion());

  const matched = matchVisualInterface(draft);
  const active = isExpandableInterface(matched) ? matched : null;
  const activeData = useMemo(() => {
    if (!active) return null;
    if (field?.kind === active) return field.data;
    return draftShellData(active, draft);
  }, [active, field, draft]);

  // Freeze filled content for the morphing shell once handoff starts.
  const handingOff = Boolean(expandingKind) || isStarting;
  const [frozen, setFrozen] = useState({ active, data: activeData });
  if (!handingOff && (frozen.active !== active || frozen.data !== activeData)) {
    setFrozen({ active, data: activeData });
  }
  const showActive = handingOff ? frozen.active : active;
  const showData = handingOff ? frozen.data : activeData;
  const kinds = orbitingInterfaces(showActive).filter(isExpandableInterface);
  const hideOrb = handingOff || Boolean(showActive);

  const handleSelect = (kind: ExpandableInterfaceKind) => {
    // Clicking an idle shell only seeds recognition — never starts the chat.
    onFieldChange?.(null);
    setMessage(interfaceSeed(kind));
  };

  const handleStart = (kind: ExpandableInterfaceKind, data: StarterData) => {
    const prompt = field?.kind === kind
      ? promptFromShellData(kind, data, draft)
      : draft.trim() || promptForInterface(kind, "");
    if (!prompt.trim()) return;
    onApply(prompt, kind, field?.kind === kind ? field : null);
  };

  const baseRadius = showActive ? 118 : 158;

  return (
    <div
      className={cn(
        "relative mx-auto",
        showActive ? "size-[460px] md:size-[520px]" : "size-[400px] md:size-[460px]",
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-[3] grid place-items-center"
        animate={{
          opacity: hideOrb ? 0 : 1,
          scale: hideOrb ? 0.92 : 1,
        }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        {orb}
      </motion.div>

      <div className="absolute inset-0 z-[2]">
        <AnimatePresence initial={false}>
          {kinds.map((kind, index) => {
            const angle = (360 / kinds.length) * index - 90;
            const isActive = showActive === kind;
            const data = isActive && showData ? showData : emptyStarterData(kind);
            return (
              <VisualShellCard
                key={kind}
                kind={kind}
                active={isActive}
                data={data}
                angle={angle}
                radius={isActive ? baseRadius - 8 : baseRadius}
                disabled={disabled}
                expandingKind={expandingKind}
                isStarting={isStarting}
                reduceMotion={reduceMotion}
                onSelect={() => handleSelect(kind)}
                onDataChange={(next) => onFieldChange?.({ kind, data: next })}
                onStart={() => handleStart(kind, data)}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
