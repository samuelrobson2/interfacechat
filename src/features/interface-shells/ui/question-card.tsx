import { CalendarDays, Check, Clock, Minus, Plus, Users } from "lucide-react";
import { createContext, useContext, useId, useState } from "react";
import { cn } from "@/shared/lib/css";
import { answerText, type AnswerValue, type Question } from "../model/questions";
import type { ShellKind } from "../model/shell-types";
import { SHELL_ACCENT, SHELL_META } from "../model/shell-meta";
import { ShellGlyph } from "./shell-icons";

/**
 * Questions as tiny interfaces: the smallest size in the system, drawn in a
 * reply. As little text as works: the interface's glyph and a short question
 * on one line, then the control, with an icon for a unit rather than its word
 * (a person and 9, not "9 people"). Nothing is picked for them: no guess is
 * suggested. One Send answers whichever they've answered, and the model chooses
 * for the rest; Skip leaves it all to the model; a lone yes-or-no sends on the
 * tap. Answered, it folds to a line of chips ("Guests 9").
 */

/** A unit drawn as an icon instead of its word. */
function UnitIcon({ unit, className }: { unit?: string; className?: string }) {
  if (!unit) return null;
  if (/^(people|persons?|guests?|servings?|adults?|kids?)$/i.test(unit)) return <Users aria-hidden className={className} />;
  if (/^(days?|nights?|weeks?)$/i.test(unit)) return <CalendarDays aria-hidden className={className} />;
  if (/^(hours?|minutes?|mins?)$/i.test(unit)) return <Clock aria-hidden className={className} />;
  return null;
}

/** A value as the card shows it: short. A number without its unit word (the icon carries it), a time as 7pm. */
function shortValue(question: Question, value: AnswerValue) {
  if (question.control === "number") return String(value);
  return answerText(question, value).replace(/:00 /, "").replace(/ (am|pm)$/, "$1");
}

/** Fields being asked about in chat, by interface id, so the interface can light up the control they fill. */
export const AskedFieldsContext = createContext<Set<string>>(new Set());
export const useAskedField = (field: string) => useContext(AskedFieldsContext).has(field);

const CHIP = "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 font-bureau text-[13px] transition-colors focus-visible:ring-2 focus-visible:ring-shell-suggest/40 focus-visible:outline-none";
/**
 * A chip picked: in its interface's colour (--q-accent, --q-text) when the
 * question is for one, so the choices read as part of it (orange for Notes);
 * neutral for a plain chat question.
 */
const chip = (on: boolean) =>
  cn(
    CHIP,
    on
      ? "border-[color:var(--q-accent,#6a4cc9)] bg-[color-mix(in_srgb,var(--q-accent,#6a4cc9)_12%,transparent)] text-[color:var(--q-text,#1a1718)]"
      : "border-shell-line-strong bg-shell-panel text-typography-primary hover:bg-shell-fill",
  );

const HOURS = ["17:00", "18:00", "19:00", "19:30", "20:00"];
const DURATIONS = ["30 min", "1 hour", "2 hours", "Half day", "Full day"];

const isoDay = (offset: number) => {
  const day = new Date();
  day.setDate(day.getDate() + offset);
  return day.toISOString().slice(0, 10);
};

function SomethingElse({ onAnswer, label = "Something else…" }: { onAnswer: (value: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className={chip(false)}>
        {label}
      </button>
    );
  return (
    <input
      autoFocus
      value={draft}
      aria-label="Your answer"
      placeholder="Your answer"
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && draft.trim()) onAnswer(draft.trim());
        if (event.key === "Escape") setOpen(false);
      }}
      onBlur={() => draft.trim() && onAnswer(draft.trim())}
      className="h-8 min-w-40 rounded-full border border-shell-line-strong bg-shell-panel px-3 font-bureau text-[13px] outline-none focus:ring-2 focus:ring-shell-suggest/40"
    />
  );
}

/** One question's control, by kind. Empty until they answer it. */
function Control({ question, value, onChange }: { question: Question; value: AnswerValue | undefined; onChange: (value: AnswerValue) => void }) {
  const id = useId();
  switch (question.control) {
    case "confirm":
      return (
        <div role="radiogroup" aria-label={question.ask} className="flex flex-wrap items-center gap-1.5">
          {["Yes", "No"].map((option) => (
            <button key={option} type="button" role="radio" aria-checked={value === option} onClick={() => onChange(option)} className={chip(value === option)}>
              {option}
            </button>
          ))}
          <SomethingElse onAnswer={onChange} />
        </div>
      );
    case "choose":
    case "duration": {
      const options = question.options?.length ? question.options : question.control === "duration" ? DURATIONS : [];
      const picked = Array.isArray(value) ? value : value !== undefined ? [String(value)] : [];
      const extra = picked.filter((item) => !options.includes(item));
      return (
        <div role={question.multi ? "group" : "radiogroup"} aria-label={question.ask} className="flex flex-wrap items-center gap-1.5">
          {[...options, ...extra].map((option) => {
            const on = picked.includes(option);
            return (
              <button
                key={option}
                type="button"
                role={question.multi ? undefined : "radio"}
                aria-checked={question.multi ? undefined : on}
                aria-pressed={question.multi ? on : undefined}
                onClick={() => onChange(question.multi ? (on ? picked.filter((item) => item !== option) : [...picked, option]) : option)}
                className={chip(on)}
              >
                {question.multi && on && <Check className="size-3" />}
                {option}
              </button>
            );
          })}
          <SomethingElse onAnswer={(own) => onChange(question.multi ? [...picked, own] : own)} />
        </div>
      );
    }
    case "number": {
      // Blank until they set it: the first tap starts from the bottom of its range.
      const number = typeof value === "number" ? value : undefined;
      const from = number ?? (question.min ?? 1) - 1;
      const set = (next: number) => onChange(Math.max(question.min ?? 0, Math.min(question.max ?? 999, next)));
      return (
        <div className="flex items-center gap-1" role="group" aria-label={question.ask}>
          <button type="button" aria-label={`Fewer ${question.unit ?? ""}`.trim()} onClick={() => set(from - 1)} className="grid size-8 cursor-pointer place-items-center rounded-full border border-shell-line-strong bg-shell-panel hover:bg-shell-fill">
            <Minus className="size-3.5" />
          </button>
          <span aria-live="polite" aria-label={number === undefined ? "Not set" : answerText(question, number)} className="flex min-w-12 items-center justify-center gap-1.5 font-bureau text-[15px] tabular-nums">
            <UnitIcon unit={question.unit} className="size-4 text-typography-secondary" />
            <span className={cn(number === undefined ? "text-typography-secondary" : "text-[color:var(--q-text,inherit)]")}>{number ?? "–"}</span>
          </span>
          <button type="button" aria-label={`More ${question.unit ?? ""}`.trim()} onClick={() => set(from + 1)} className="grid size-8 cursor-pointer place-items-center rounded-full border border-shell-line-strong bg-shell-panel hover:bg-shell-fill">
            <Plus className="size-3.5" />
          </button>
        </div>
      );
    }
    case "time": {
      const current = typeof value === "string" ? value : "";
      const times = [...new Set([...(current && !HOURS.includes(current) ? [current] : []), ...HOURS])].sort();
      return (
        <div role="radiogroup" aria-label={question.ask} className="flex flex-wrap items-center gap-1.5">
          {times.map((time) => (
            <button key={time} type="button" role="radio" aria-checked={current === time} onClick={() => onChange(time)} className={chip(current === time)}>
              {shortValue(question, time)}
            </button>
          ))}
          <label htmlFor={id} className="sr-only">Another time</label>
          <input id={id} type="time" value={HOURS.includes(current) ? "" : current} onChange={(event) => event.target.value && onChange(event.target.value)} className="h-8 rounded-full border border-shell-line-strong bg-shell-panel px-2 font-bureau text-[13px]" />
        </div>
      );
    }
    case "date": {
      const current = typeof value === "string" ? value : "";
      const days = [...new Set([...(current ? [current] : []), ...[0, 1, 2, 3, 4, 5, 6].map(isoDay)])].sort().slice(0, 6);
      return (
        <div role="radiogroup" aria-label={question.ask} className="flex flex-wrap items-center gap-1.5">
          {days.map((day) => (
            <button key={day} type="button" role="radio" aria-checked={current === day} onClick={() => onChange(day)} className={chip(current === day)}>
              {day === isoDay(0) ? "Today" : day === isoDay(1) ? "Tomorrow" : answerText(question, day)}
            </button>
          ))}
          <label htmlFor={id} className="sr-only">Another date</label>
          <input id={id} type="date" value={days.includes(current) ? "" : current} onChange={(event) => event.target.value && onChange(event.target.value)} className="h-8 rounded-full border border-shell-line-strong bg-shell-panel px-2 font-bureau text-[13px]" />
        </div>
      );
    }
    default:
      return (
        <input
          value={typeof value === "string" ? value : ""}
          aria-label={question.ask}
          placeholder="Your answer"
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-full max-w-80 rounded-full border border-shell-line-strong bg-shell-panel px-3 font-bureau text-[13px] outline-none focus:ring-2 focus:ring-shell-suggest/40"
        />
      );
  }
}

export function QuestionGroup({
  questions,
  kindOf,
  titleOf,
  headerless,
  answered,
  disabled,
  onAnswer,
  onSkip,
}: {
  questions: Question[];
  /** Which interface each question fills, for its glyph. */
  kindOf: (id: string) => ShellKind | null;
  /** The interface's name, shown once when every question is for it. */
  titleOf?: (id: string) => string | undefined;
  /** The reply already shows that interface right above: no header of its own. */
  headerless?: boolean;
  /** Answers already sent: the group folds to them. */
  answered?: (AnswerValue | null)[];
  /** An older reply's questions, never answered: shown, not answerable. */
  disabled?: boolean;
  /** What they answered, by question: one left blank is the model's to choose. */
  onAnswer: (values: (AnswerValue | undefined)[]) => void;
  /** Leave it to the model: it chooses. */
  onSkip?: () => void;
}) {
  const [values, setValues] = useState<(AnswerValue | undefined)[]>(() => questions.map(() => undefined));
  const single = questions.length === 1 && questions[0]!.control === "confirm";

  if (answered) {
    const skipped = answered.length === 0;
    return (
      <div className="flex flex-wrap items-center gap-1.5" aria-label={skipped ? "Skipped" : "Answered"}>
        {skipped ? (
          <span className="inline-flex h-7 items-center rounded-full bg-shell-fill px-2.5 font-bureau text-[12px] text-typography-secondary">Skipped</span>
        ) : (
          questions.map((question, i) => (
            <span key={i} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-shell-fill px-2.5 font-bureau text-[12px] text-typography-primary">
              <Check className="size-3 text-typography-secondary" />
              <span className="text-typography-secondary">{question.label}</span>
              {answered[i] != null ? shortValue(question, answered[i]!) : "you choose"}
            </span>
          ))
        )}
      </div>
    );
  }

  // All for the same interface: its name once, above, and the questions plain. Mixed: each shows its own.
  const shared = questions.every((question) => question.for === questions[0]!.for) ? questions[0]!.for : null;
  const sharedKind = shared && shared !== "chat" ? kindOf(shared) : null;
  // Sendable once anything is answered; the rest are left to the model.
  const given = (value: AnswerValue | undefined) => value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0);
  const ready = values.some(given);
  return (
    // In the reply like the other inline interfaces: no plate behind it.
    <div
      className={cn("flex flex-col gap-3", disabled && "pointer-events-none opacity-60")}
      aria-disabled={disabled || undefined}
      // The group's colour, for Send: the interface they're all for.
      style={sharedKind ? ({ "--q-accent": SHELL_ACCENT[sharedKind].solid, "--q-text": SHELL_ACCENT[sharedKind].text } as React.CSSProperties) : undefined}
    >
      {sharedKind && !headerless && (
        <div className="flex items-center gap-1.5 font-bureau text-[12px] text-typography-secondary">
          <ShellGlyph kind={sharedKind} className="size-4" />
          <span>{titleOf?.(shared!) || SHELL_META[sharedKind].label}</span>
        </div>
      )}
      {questions.map((question, i) => {
        const kind = !sharedKind && question.for !== "chat" ? kindOf(question.for) : null;
        const owner = question.for !== "chat" ? kindOf(question.for) : null;
        const accent = owner ? ({ "--q-accent": SHELL_ACCENT[owner].solid, "--q-text": SHELL_ACCENT[owner].text } as React.CSSProperties) : undefined;
        return (
          <div key={i} className="flex flex-col gap-2" style={accent}>
            <p className="flex items-center gap-1.5 font-bureau text-[14px] leading-[1.35] text-typography-primary">
              {kind && <ShellGlyph kind={kind} className="size-4" />}
              <span>{question.ask}</span>
              {kind && <span className="sr-only">{`(${SHELL_META[kind].label}, ${question.label})`}</span>}
            </p>
            <Control
              question={question}
              value={values[i]}
              onChange={(value) => {
                const next = values.map((entry, j) => (j === i ? value : entry));
                setValues(next);
                // A lone yes-or-no sends on the tap.
                if (single) onAnswer(next);
              }}
            />
          </div>
        );
      })}
      <div className="flex items-center gap-1">
        {!single && (
          <button
            type="button"
            disabled={!ready}
            onClick={() => onAnswer(values.map((value) => (given(value) ? value : undefined)))}
            className="rounded-full bg-gray-5 px-4 py-1.5 font-bureau text-[13px] text-white transition-[opacity,transform] enabled:cursor-pointer active:scale-[0.96] disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-shell-suggest/40 focus-visible:outline-none"
          >
            Send
          </button>
        )}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer rounded-full bg-transparent px-3 py-1.5 font-bureau text-[13px] text-typography-secondary transition-colors hover:bg-shell-fill hover:text-typography-primary focus-visible:ring-2 focus-visible:ring-shell-suggest/40 focus-visible:outline-none"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
