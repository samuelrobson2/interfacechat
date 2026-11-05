import { motion, useReducedMotion } from "motion/react";
import { Plus, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/css";
import { fieldEvents, stopFieldEvent } from "./shell-surface";

const SETTLE = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.8 };

/** Fields arrive one after another; `layout="position"` keeps text from stretching mid-morph. */
export function ShellField({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      layout="position"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduce ? { duration: 0.15 } : { ...SETTLE, delay: 0.04 + index * 0.03 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type ChipSize = "sm" | "md";

const CHIP_SIZE: Record<ChipSize, string> = {
  sm: "h-6 gap-1 px-2 text-[11px] [&_svg]:size-3",
  md: "h-7 gap-1.5 px-2.5 text-[13px] [&_svg]:size-3.5",
};

/** A filled field: soft, quiet, with an optional icon and a remove control. */
export function SoftChip({
  icon: Icon,
  leading,
  size = "md",
  onRemove,
  removeLabel,
  className,
  children,
}: {
  icon?: LucideIcon;
  leading?: React.ReactNode;
  size?: ChipSize;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-gray-6 font-bureau font-normal whitespace-nowrap text-typography-primary",
        CHIP_SIZE[size],
        onRemove && (size === "sm" ? "pr-1" : "pr-1.5"),
        className,
      )}
    >
      {leading}
      {Icon && <Icon className="shrink-0 text-typography-secondary" aria-hidden />}
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel ?? "Remove"}
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            onRemove();
          }}
          className="ml-0.5 grid size-4 place-items-center rounded-full text-typography-secondary transition-colors hover:bg-gray-3/20 hover:text-typography-primary"
        >
          <X className="!size-2.5" />
        </button>
      )}
    </span>
  );
}

const addChipClass = (size: ChipSize) =>
  cn(
    "inline-flex shrink-0 items-center rounded-full border border-dashed border-gray-3/40 font-bureau font-normal whitespace-nowrap text-typography-secondary",
    CHIP_SIZE[size],
  );

/**
 * A missing field that's always actionable: a dashed chip that either adds a
 * value outright (`onAdd`) or opens an inline field to type one (`onSubmitValue`).
 */
export function AddChip({
  size = "md",
  onAdd,
  onSubmitValue,
  placeholder,
  className,
  children,
}: {
  size?: ChipSize;
  onAdd?: () => void;
  onSubmitValue?: (value: string) => void;
  placeholder?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  if (editing && onSubmitValue) {
    const commit = () => {
      if (value.trim()) onSubmitValue(value.trim());
      setValue("");
      setEditing(false);
    };
    return (
      <span className={cn(addChipClass(size), "border-solid border-blue-4/60 bg-background-primary", className)}>
        <Plus className="shrink-0" aria-hidden />
        <input
          autoFocus
          value={value}
          placeholder={placeholder}
          size={Math.max(8, value.length + 1, placeholder?.length ?? 0)}
          {...fieldEvents}
          onChange={(event) => setValue(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            stopFieldEvent(event);
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              setValue("");
              setEditing(false);
            }
          }}
          className="min-w-0 bg-transparent font-bureau text-typography-primary outline-none placeholder:text-typography-secondary/70"
        />
      </span>
    );
  }

  const interactive = Boolean(onAdd || onSubmitValue);
  if (!interactive) {
    return (
      <span className={cn(addChipClass(size), className)}>
        <Plus className="shrink-0" aria-hidden />
        {children}
      </span>
    );
  }
  return (
    <button
      type="button"
      {...fieldEvents}
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => {
        stopFieldEvent(event);
        if (onAdd) onAdd();
        else setEditing(true);
      }}
      className={cn(
        addChipClass(size),
        "transition-[border-color,color,scale] duration-150 ease-out hover:border-gray-3/70 hover:text-typography-primary active:scale-[0.96]",
        className,
      )}
    >
      <Plus className="shrink-0" aria-hidden />
      {children}
    </button>
  );
}

/** One field on its own line: a quiet icon, then the value. */
export function FieldRow({
  icon: Icon,
  label,
  nowrap,
  className,
  children,
}: {
  icon: LucideIcon;
  label: string;
  /** Keep chips on one line and scroll sideways instead of wrapping. */
  nowrap?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 items-start gap-2.5", className)}>
      <span title={label} className="mt-[5px] shrink-0 text-typography-secondary">
        <Icon className="size-4" aria-label={label} />
      </span>
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1.5",
          nowrap
            ? "no-scrollbar -mr-4 overflow-x-auto pr-4 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)]"
            : "flex-wrap",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-grid h-5 min-w-5 place-items-center rounded-[6px] bg-gray-6 px-1.5 font-bureau text-[11px] font-normal text-typography-secondary">
      {children}
    </kbd>
  );
}

/** The shell's one primary action, with its key. */
export function ActionPill({
  label,
  shortcut,
  disabled,
  onPress,
  size = "md",
}: {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onPress: () => void;
  size?: ChipSize;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onPress();
      }}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-background-primary-inverse font-bureau font-normal text-typography-inverse",
        "transition-[opacity,scale] duration-150 ease-out active:scale-[0.96] disabled:opacity-40",
        size === "sm" ? "h-7 px-3 text-[12px]" : "h-8 px-3.5 text-[13px]",
      )}
    >
      {label}
      {shortcut && <span className="text-typography-inverse/60">{shortcut}</span>}
    </button>
  );
}
