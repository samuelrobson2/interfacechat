import { cn } from "@/shared/lib/css";

const BLUE = "#1a84ae";
const GREEN = "#64b48f";
const PURPLE = "#7c6fda";
const ROSE = "#c87b9a";

export type MiniInterfaceProps = {
  topic: string;
  /** Extra context typed in the shell (mood, materials, references…). */
  context?: string;
  active?: boolean;
  /** When true, fields are editable in place. */
  editable?: boolean;
  onTopicChange?: (topic: string) => void;
  onContextChange?: (context: string) => void;
  /** Explicit start (e.g. ⌘↵) — never plain Enter while drafting. */
  onSubmit?: () => void;
};

/** Shared shell chrome — no border stroke, just a soft surface. */
export function MiniInterfaceShell({
  active,
  className,
  children,
}: {
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-[18px] bg-background-primary",
        "shadow-[0_2px_10px_rgba(26,23,24,0.08)]",
        active && "shadow-[0_8px_28px_rgba(26,23,24,0.14)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function stopFieldEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

function fieldKeyDown(
  event: React.KeyboardEvent,
  onSubmit?: () => void,
  { allowNewline = false }: { allowNewline?: boolean } = {},
) {
  stopFieldEvent(event);
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    onSubmit?.();
    return;
  }
  if (event.key === "Enter" && !allowNewline) {
    // Stay in the field — don't start the chat on a single Enter.
    event.preventDefault();
  }
}

/** Miniature moodboard — tiles + editable topic / direction notes. */
export function MiniMoodboard({
  topic,
  context = "",
  active,
  editable,
  onTopicChange,
  onContextChange,
  onSubmit,
}: MiniInterfaceProps) {
  const filled = Boolean(topic.trim());
  const canEdit = Boolean(editable && active && onTopicChange);
  const tiles = [
    { className: "col-span-2 row-span-2", color: PURPLE },
    { className: "col-span-1 row-span-1", color: BLUE },
    { className: "col-span-1 row-span-1", color: ROSE },
    { className: "col-span-1 row-span-1", color: GREEN },
    { className: "col-span-2 row-span-1", color: BLUE },
  ];

  return (
    <MiniInterfaceShell active={active}>
      <div className="relative flex min-h-0 flex-1 flex-col gap-2 p-2.5">
        <div
          className={cn(
            "grid min-h-0 grid-cols-3 grid-rows-3 gap-1",
            canEdit ? "flex-[1.2]" : "flex-1",
          )}
        >
          {tiles.map((tile, i) => (
            <div
              key={i}
              className={cn(
                "rounded-[8px]",
                tile.className,
                filled || active ? "opacity-95" : "opacity-55",
              )}
              style={{ backgroundColor: tile.color }}
            />
          ))}
        </div>
        {canEdit ? (
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <input
              value={topic}
              onChange={(event) => onTopicChange?.(event.target.value)}
              onClick={stopFieldEvent}
              onPointerDown={stopFieldEvent}
              onKeyDown={(event) => fieldKeyDown(event, onSubmit)}
              placeholder="Board"
              className="w-full truncate rounded-full bg-gray-6 px-2.5 py-1 text-[11px] font-medium outline-none"
              aria-label="Canvas topic"
            />
            <textarea
              value={context}
              onChange={(event) => onContextChange?.(event.target.value)}
              onClick={stopFieldEvent}
              onPointerDown={stopFieldEvent}
              onKeyDown={(event) =>
                fieldKeyDown(event, onSubmit, { allowNewline: true })
              }
              placeholder="Mood, materials, references…"
              className="min-h-0 w-full flex-1 resize-none bg-transparent text-[11px] leading-4 text-typography-primary outline-none placeholder:text-typography-secondary"
              aria-label="Canvas context"
            />
          </div>
        ) : (
          <div
            className={cn(
              "absolute bottom-3.5 left-3.5 max-w-[80%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium shadow-sm",
              !filled && "text-typography-secondary",
            )}
          >
            {filled ? topic : "Board"}
          </div>
        )}
      </div>
    </MiniInterfaceShell>
  );
}
