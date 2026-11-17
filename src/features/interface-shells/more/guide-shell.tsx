import { Check, ChefHat, ListPlus, Minus, Pause, Play, Plus, RotateCcw, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, type GuideFact, type GuideNeed, type GuideShellData, type GuideStep, type ShellProps, type ShellSize } from "../model/shell-types";
import { ghostLabels, ghostsAfter } from "../ui/shell-accents";
import { InlineInput, PreviewBody, PreviewHead, ShellBody, ShellTitle, SHELL_BODY_PAD, SHELL_EDGE_X } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { SuggestedBox, SuggestedText, placedSuggestions, suggestionsAfter, type PlacedSuggestion } from "../ui/suggested-chip";
import { Bar, AutoTextarea, fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";
import { ShellToolbar, ShellToolButton, ShellToolDivider, ShellToolField, ShellToolPopover } from "../ui/shell-toolbar";

/** Facts a guide often has, offered when adding one from the toolbar. */
const FACT_SUGGESTIONS = ["Serves", "Time", "Difficulty", "People", "Cost", "Distance", "Equipment"];

const TERRACOTTA = "#c2563a";

/* ── Scaling a recipe ────────────────────────────────────────────────── */

const VULGAR: Record<string, number> = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125 };
/** A leading amount: "2", "1.5", "1/2", "1 1/2", "½", "1½". */
const AMOUNT = /^(\d+(?:[.,]\d+)?)?(?:\s*(\d+)\/(\d+)|\s*([½¼¾⅓⅔⅛]))?(?=\s|[a-zA-Z]|$)/;

function readAmount(text: string): { value: number; length: number } | null {
  const match = text.match(AMOUNT);
  if (!match || !match[0].trim()) return null;
  const whole = match[1] ? Number(match[1].replace(",", ".")) : 0;
  const fraction = match[2] ? Number(match[2]) / Number(match[3]) : match[4] ? VULGAR[match[4]]! : 0;
  return { value: whole + fraction, length: match[0].length };
}

/** An amount the way a recipe writes it: whole numbers with ¼, ⅓, ½, ⅔ and ¾ where they fit. */
function writeAmount(value: number) {
  if (value >= 10) return String(Math.round(value));
  const whole = Math.floor(value);
  const rest = value - whole;
  const parts: [number, string][] = [[0, ""], [0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"], [1, ""]];
  const [amount, glyph] = parts.reduce((best, part) => (Math.abs(part[0] - rest) < Math.abs(best[0] - rest) ? part : best));
  if (Math.abs(amount - rest) > 0.07) return String(Math.round(value * 10) / 10);
  const total = whole + (amount === 1 ? 1 : 0);
  return total ? `${total}${glyph}` : glyph || "0";
}

/** "200g flour" for 4 becomes "300g flour" for 6. Lines without an amount ("Salt") stay as they are. */
export function scaleNeed(text: string, factor: number) {
  const amount = readAmount(text);
  if (!amount) return text;
  return writeAmount(amount.value * factor) + text.slice(amount.length);
}

const SERVES = /^(serves|servings|makes|people|portions|yield)$/i;
const servesOf = (facts: GuideFact[]) => {
  const index = facts.findIndex((fact) => SERVES.test(fact.label.trim()) && readAmount(fact.value.trim()));
  return index < 0 ? null : { index, value: readAmount(facts[index]!.value.trim())!.value };
};


/** Keeps the screen on while cooking, where the browser allows it. */
function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on || !("wakeLock" in navigator)) return;
    let lock: { release: () => Promise<void> } | null = null;
    let cancelled = false;
    void (navigator as Navigator & { wakeLock: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock
      .request("screen")
      .then((sentinel) => {
        if (cancelled) void sentinel.release();
        else lock = sentinel;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      void lock?.release();
    };
  }, [on]);
}

function Tick({ done, size, onToggle, label }: { done: boolean; size: "xs" | "sm" | "md"; onToggle?: () => void; label: string }) {
  const box = cn(
    "grid shrink-0 place-items-center rounded-full border transition-colors",
    size === "md" ? "size-[18px]" : size === "sm" ? "size-3.5" : "size-2.5",
    done ? "border-transparent text-white" : "border-shell-control bg-shell-panel",
  );
  const style = done ? { backgroundColor: TERRACOTTA } : undefined;
  const mark = size !== "xs" && done && <Check className={size === "md" ? "size-3" : "size-2.5"} strokeWidth={3} />;
  if (!onToggle) return <span className={box} style={style}>{mark}</span>;
  // The circle stays small; the button around it is 24px to hit (WCAG 2.5.8), with negative margin so the row doesn't grow.
  const pull = size === "md" ? "-m-[3px]" : size === "sm" ? "-m-[5px]" : "-m-[7px]";
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={done}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onToggle();
      }}
      className={cn("grid size-6 shrink-0 cursor-pointer place-items-center rounded-full active:scale-[0.9]", pull)}
    >
      <span className={box} style={style}>
        {mark}
      </span>
    </button>
  );
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** A real countdown for a step that involves waiting. */
function Timer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);
  const finished = left === 0;
  const button = (label: string, icon: React.ReactNode, onPress: () => void) => (
    <button
      type="button"
      aria-label={label}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onPress();
      }}
      className="grid size-6 place-items-center rounded-full text-typography-secondary hover:bg-shell-panel hover:text-typography-primary"
    >
      {icon}
    </button>
  );
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full py-0.5 pr-0.5 pl-2.5 font-bureau text-[12px] tabular-nums",
        finished ? "text-white" : running ? "bg-shell-panel text-typography-primary ring-1 ring-[#c2563a]/40" : "bg-shell-fill text-typography-secondary",
      )}
      style={finished ? { backgroundColor: TERRACOTTA } : undefined}
    >
      {finished ? "Done" : clock(left)}
      {!finished && button(running ? "Pause timer" : "Start timer", running ? <Pause className="size-3" /> : <Play className="size-3" />, () => setRunning((r) => !r))}
      {(running || left !== minutes * 60) &&
        button("Reset timer", <RotateCcw className="size-3" />, () => {
          setRunning(false);
          setLeft(minutes * 60);
        })}
    </span>
  );
}

function Add({ label, size, onAdd }: { label: string; size: ShellSize; onAdd: () => void }) {
  return (
    <button
      type="button"
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onAdd();
      }}
      className={cn("flex items-center gap-1.5 self-start font-bureau text-typography-secondary hover:text-typography-primary", size === "large" ? "text-[13px]" : "text-[11px]")}
    >
      <Plus className="size-3.5" />
      {label}
    </button>
  );
}

function Remove({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      {...fieldEvents}
      onClick={(event) => {
        stopFieldEvent(event);
        onRemove();
      }}
      className="grid size-6 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-shell-fill focus-visible:opacity-100"
    >
      <X className="size-3.5" />
    </button>
  );
}

export function GuideShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  tools,
  actions,
  className,
  suggestions,
  suggested,
}: ShellProps<GuideShellData>) {
  const [cooking, setCooking] = useState(false);
  // What the recipe said before scaling, so each step scales from it and rounding never adds up.
  const [scaleBase, setScaleBase] = useState<{ serves: number; texts: Record<string, string>; written: Record<string, string> } | null>(null);
  useWakeLock(cooking && size === "large");
  if (size === "small") return <ShellAppIcon kind="guide" className={className} />;

  const current = data.steps.findIndex((s) => !s.done);
  const ghostSteps = data.steps.length === 0;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="guide" title={data.title} />
        {/* Shapes, not words: facts as pills, then numbered steps of a line or two. */}
        <PreviewBody>
          <span className="flex shrink-0 gap-1">
            {[30, 24].map((width) => (
              <span key={width} className="h-3 rounded-full bg-shell-fill" style={{ width }} />
            ))}
          </span>
          <ol className="relative flex flex-col gap-1.5">
            <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-shell-ink-faint" />
            {(ghostSteps ? [false, false, false] : data.steps.slice(0, 3).map((step) => step.done)).map((done, i) => (
              <li key={i} className="relative flex gap-1.5">
                <span
                  className={cn(
                    "size-[11px] shrink-0 rounded-full ring-2 ring-white",
                    done ? "bg-shell-ink-soft" : "bg-shell-ink-faint",
                  )}
                />
                <span className="flex flex-1 flex-col gap-[3px] pt-[3px]">
                  <Bar width="94%" className="h-1" />
                  <Bar width={`${[58, 70, 46][i]}%`} className="h-1" />
                </span>
              </li>
            ))}
          </ol>
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<GuideShellData>) => onChange({ ...data, ...patch }) : undefined;
  const setStep = (next: GuideStep) => update?.({ steps: data.steps.map((s) => (s.id === next.id ? next : s)) });
  const setNeed = (next: GuideNeed) => update?.({ needs: data.needs.map((n) => (n.id === next.id ? next : n)) });
  const progress = data.steps.length ? (current === -1 ? "All done" : `Step ${current + 1} of ${data.steps.length}`) : null;

  // Whatever facts this kind of guide calls for: Serves and Time, or Difficulty and People.
  const setFact = (index: number, patch: Partial<GuideFact>) =>
    update?.({ facts: data.facts.map((fact, i) => (i === index ? { ...fact, ...patch } : fact)) });
  const text = large ? "text-[13px]" : "text-[11px]";
  // Serves and Time are the guide's standard controls: what the request said shows as written; what it
  // didn't is guessed in the suggestion colour, in the control, until they set it. Time is always there;
  // Serves when there's a number for it.
  const factIndex = (label: string) => data.facts.findIndex((fact) => fact.label.trim().toLowerCase() === label.toLowerCase());
  const guessOf = (group: "serves" | "time") => {
    const first = suggested?.[group]?.[0];
    return first === undefined ? undefined : typeof first === "string" ? first : first.value;
  };
  const standard = (["Serves", "Time"] as const).filter((label) => factIndex(label) < 0 && (label === "Time" || guessOf("serves")));
  const setStandard = (label: string, value: string) => update?.({ facts: [...data.facts, { label, value }] });
  const facts = (
    <div className="flex flex-wrap items-center gap-1.5">
      {standard.map((label) => {
        const guess = guessOf(label === "Serves" ? "serves" : "time");
        return (
          <span key={label} className={cn("inline-flex items-center gap-1 rounded-full bg-shell-fill font-bureau", large ? "h-8 px-3" : "h-6 px-2")}>
            <span className={cn(text, "text-typography-secondary")}>{label}</span>
            {guess ? (
              <SuggestedText text={guess} onAccept={update && (() => setStandard(label, guess))} className={cn(text, "px-0.5")} />
            ) : (
              <InlineInput value="" placeholder="Add" label={label} onChange={update && ((value) => setStandard(label, value))} className={cn(text, "field-sizing-content min-w-6")} />
            )}
          </span>
        );
      })}
      {data.facts.map((fact, i) => (
        <span
          key={i}
          className={cn("group inline-flex items-center gap-1 rounded-full bg-shell-fill font-bureau", large ? "h-8 px-3" : "h-6 px-2")}
        >
          <InlineInput value={fact.label} placeholder="Label" label="Fact" onChange={update && ((label) => setFact(i, { label }))} className={cn(text, "field-sizing-content min-w-6 text-typography-secondary")} />
          <InlineInput value={fact.value} placeholder="Add" label={fact.label || "Value"} onChange={update && ((value) => setFact(i, { value }))} className={cn(text, "field-sizing-content min-w-6")} />
          {update && large && (
            <button
              type="button"
              aria-label={`Remove ${fact.label}`}
              {...fieldEvents}
              onClick={(event) => {
                stopFieldEvent(event);
                update({ facts: data.facts.filter((_, j) => j !== i) });
              }}
              className="hidden size-4 place-items-center rounded-full text-typography-secondary group-hover:grid hover:text-typography-primary"
            >
              <X className="size-2.5" />
            </button>
          )}
        </span>
      ))}
    </div>
  );

  // Suggested steps go after the step they follow (or after the last), numbered in place.
  // With no steps yet, the suggested ones are the method as it's written (all of them); otherwise two at most.
  const stepsWhere = suggestionsAfter(
    placedSuggestions(suggested?.steps, data.steps.map((step) => step.text)).slice(0, data.steps.length ? 2 : 6),
    data.steps.map((step) => step.text),
  );
  // Real steps keep their numbers; a suggestion between them has none, one after the last takes the next.
  const suggestedStep = (placed: PlacedSuggestion, at: number, number?: number) => (
    <li key={placed.value} data-shell-part="suggest" className={cn("flex min-w-0 items-start gap-2.5", large && "rounded-[14px] px-4 py-3")}>
      <span className={cn("shrink-0 pt-0.5 font-bureau text-shell-suggest tabular-nums", large ? "w-5 text-[15px]" : "w-3 text-[11px]")}>{number}</span>
      <SuggestedText
        text={placed.value}
        onAccept={update && (() => update({ steps: [...data.steps.slice(0, at), { id: shellId("step"), text: placed.value, done: false }, ...data.steps.slice(at)] }))}
        className={cn("min-w-0 flex-1 font-bureau leading-[1.5]", large ? "text-[14px]" : "h-6 truncate text-[12px] leading-6")}
      />
      {/* Its tick, empty, outlined in violet: what it gets once added. */}
      <SuggestedBox shape="round" className={large ? "mt-0.5 size-[18px]" : "size-3.5 self-center"} />
    </li>
  );
  const steps = (
    <ol className={cn("flex flex-col", large ? "gap-2" : "gap-1")}>
      {/* No steps yet: suggested steps fill the placeholders, numbered as they would be; what's left stays a placeholder. */}
      {ghostSteps && stepsWhere.atEnd.map((placed, k) => suggestedStep(placed, k, k + 1))}
      {ghostSteps &&
        ghostsAfter("Step", stepsWhere.atEnd.length).map((label) => (
          <li key={label} className={cn("flex items-center gap-2.5", large && "rounded-[14px] bg-shell-fill px-4 py-3")}>
            <span className={cn("font-bureau text-typography-secondary tabular-nums", large ? "w-5 text-[15px]" : "w-3 text-[11px]")}>{label.split(" ").pop()}</span>
            <span className={cn("font-bureau font-light text-typography-secondary", large ? "text-[14px]" : "text-[12px]")}>{label}</span>
          </li>
        ))}
      {data.steps.map((step, i) => {
        const isCurrent = i === current;
        return [
          <li
            key={step.id}
            className={cn(
              "group flex min-w-0 items-start gap-2.5",
              large && "rounded-[14px] px-4 py-3 transition-colors",
              large && (isCurrent ? "bg-shell-panel ring-1 ring-[#c2563a]/40 ring-inset" : "bg-shell-fill"),
            )}
          >
            <span className={cn("shrink-0 pt-0.5 font-bureau tabular-nums", large ? "w-5 text-[15px]" : "w-3 text-[11px]", isCurrent ? "text-[#c2563a]" : "text-typography-secondary")}>
              {i + 1}
            </span>
            {large ? (
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <AutoTextarea
                value={step.text}
                placeholder={`Step ${i + 1}`}
                aria-label={`Step ${i + 1}`}
                readOnly={!update}
                {...fieldEvents}
                onKeyDown={stopFieldEvent}
                onChange={(event) => setStep({ ...step, text: event.target.value })}
                className={cn("min-w-0 font-bureau leading-[1.5] placeholder:font-light", cooking ? "text-[18px]" : "text-[14px]", step.done ? "text-typography-secondary line-through" : "text-typography-primary")}
              />
              {(step.note || (update && isCurrent)) && (
                <InlineInput
                  value={step.note ?? ""}
                  placeholder="Add a tip or warning"
                  label="Tip"
                  onChange={update && ((note) => setStep({ ...step, note: note || undefined }))}
                  className={cn("px-0 text-[12px]", step.note ? "text-[#c2563a]" : "text-typography-secondary")}
                />
              )}
              </div>
            ) : (
              <InlineInput
                value={step.text}
                placeholder={`Step ${i + 1}`}
                label={`Step ${i + 1}`}
                onChange={update && ((text) => setStep({ ...step, text }))}
                className={cn("h-6 flex-1 px-1 text-[12px]", step.done && "text-typography-secondary line-through")}
              />
            )}
            {large && step.minutes ? <Timer key={`${step.id}-${step.minutes}`} minutes={step.minutes} /> : null}
            <Tick done={step.done} size={large ? "md" : "sm"} label={step.done ? "Mark step as not done" : "Mark step as done"} onToggle={update && (() => setStep({ ...step, done: !step.done }))} />
            {large && update && <Remove label={`Remove step ${i + 1}`} onRemove={() => update({ steps: data.steps.filter((s) => s.id !== step.id) })} />}
          </li>,
          ...stepsWhere.after(i).map((placed) => suggestedStep(placed, i + 1, i === data.steps.length - 1 ? data.steps.length + 1 : undefined)),
        ];
      })}
      {!ghostSteps && stepsWhere.atEnd.map((placed, k) => suggestedStep(placed, data.steps.length, data.steps.length + k + 1))}
    </ol>
  );

  // A recipe app's tools: scale the servings, cook hands-free, tick off the shop, start over, share.
  const serves = servesOf(data.facts);
  const rescale = (next: number) => {
    if (!serves || !update || next < 1) return;
    // A line edited since the last scaling becomes its own new starting point.
    const base = scaleBase ?? { serves: serves.value, texts: {}, written: {} };
    const texts: Record<string, string> = {};
    const written: Record<string, string> = {};
    const needs = data.needs.map((need) => {
      const fromBase = base.written[need.id] === need.text ? base.texts[need.id] : undefined;
      const original = fromBase ?? scaleNeed(need.text, base.serves / serves.value);
      texts[need.id] = original;
      const text = scaleNeed(original, next / base.serves);
      written[need.id] = text;
      return { ...need, text };
    });
    setScaleBase({ serves: base.serves, texts, written });
    update({
      facts: data.facts.map((fact, i) => (i === serves.index ? { ...fact, value: fact.value.replace(/^[\d.,½¼¾⅓⅔⅛\s/]+/, `${next} `).trim() } : fact)),
      needs,
    });
  };
  const standardTools = (
    <>
      <span
        role="group"
        aria-label="Servings"
        aria-disabled={!serves || undefined}
        title={serves ? "Scale the recipe" : "Add a Serves fact to scale the recipe"}
        // Sized from the toolbar's tokens like every other tool: the same icon and type, no bigger.
        // The people icon and how many, with − and +: no word, no fill, like the tools beside it.
        className={cn(
          "flex h-[calc(var(--shell-tools-icon,16px)+16px)] shrink-0 items-center gap-0.5 pl-2 font-bureau text-[length:var(--shell-tools-font-size,13px)] tabular-nums",
          !serves && "opacity-40",
        )}
      >
        <Users aria-hidden className="mr-1 size-[var(--shell-tools-icon,16px)] shrink-0 text-typography-secondary" />
        <span className="min-w-[2ch] text-typography-primary">{serves ? writeAmount(serves.value) : "–"}</span>
        <ShellToolButton label="Fewer servings" disabled={!serves || !update || serves.value <= 1} onPress={() => serves && rescale(Math.round(serves.value) - 1)}>
          <Minus />
        </ShellToolButton>
        <ShellToolButton label="More servings" disabled={!serves || !update} onPress={() => serves && rescale(Math.round(serves.value) + 1)}>
          <Plus />
        </ShellToolButton>
      </span>
      {/* The facts show under the toolbar; this is where one is added. */}
      <ShellToolPopover label="Add a fact" icon={<ListPlus />} disabled={!update}>
        {(close) => (
          <ShellToolField
            label="Fact"
            placeholder="e.g. Difficulty"
            apply="Add"
            suggestions={FACT_SUGGESTIONS.filter((label) => !data.facts.some((fact) => fact.label.toLowerCase() === label.toLowerCase()))}
            onApply={(label) => {
              update?.({ facts: [...data.facts, { label, value: "" }] });
              close();
            }}
          />
        )}
      </ShellToolPopover>
      {/* Cook mode keeps the screen on and enlarges the large layout's steps, so the medium plus card leaves it out. */}
      {large && (
        <ShellToolButton label={cooking ? "Leave cook mode" : "Cook mode: keep the screen on, bigger steps"} active={cooking} disabled={data.steps.length === 0} onPress={() => setCooking((value) => !value)}>
          <ChefHat />
        </ShellToolButton>
      )}
      <ShellToolDivider />
      <ShellToolButton
        label="Start over"
        disabled={!update || (data.steps.every((step) => !step.done) && data.needs.every((need) => !need.have))}
        onPress={() =>
          update?.({ steps: data.steps.map((step) => ({ ...step, done: false })), needs: data.needs.map((need) => ({ ...need, have: false })) })
        }
      >
        <RotateCcw />
      </ShellToolButton>
    </>
  );

  if (!large) {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <ShellTitle kind="guide" size={size} value={data.title} onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} />
        <ShellToolbar tools={tools} actions={actions}>
          {standardTools}
        </ShellToolbar>
        <ShellBody size={size}>
          {/* On the chat home: what the request leaves open. */}
          {suggestions?.brief}
          {facts}
          {steps}
          {update && <Add label="Add a step" size={size} onAdd={() => update({ steps: [...data.steps, { id: shellId("step"), text: "", done: false }] })} />}
        </ShellBody>
      </ShellSurface>
    );
  }

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle
        kind="guide"
        size={size}
        value={data.title}
        onChange={update && ((title) => update({ title }))}
        onSubmit={onSubmit}
        aside={progress && <span className="font-bureau text-[13px] text-typography-secondary tabular-nums">{progress}</span>}
      />
      <ShellToolbar tools={tools} actions={actions}>
        {standardTools}
      </ShellToolbar>
      <div className={cn("pt-3", SHELL_EDGE_X)}>{facts}</div>
      <div data-shell-part="body" className={cn("flex min-h-0 flex-1", SHELL_BODY_PAD)}>
        <aside aria-label="What you need" className="no-scrollbar flex w-56 shrink-0 flex-col gap-1.5 overflow-y-auto">
          <h3 className="font-bureau text-[12px] text-typography-secondary">
            You need{data.needs.length ? ` · ${data.needs.filter((n) => n.have).length} of ${data.needs.length}` : ""}
          </h3>
          <ul className="flex flex-col">
            {data.needs.length === 0 &&
              ghostLabels("Item").map((label) => (
                <li key={label} className="flex items-center gap-2 py-1">
                  <Tick done={false} size="sm" label="" />
                  <span className="font-bureau text-[13px] font-light text-typography-secondary">{label}</span>
                </li>
              ))}
            {data.needs.map((need, i) => (
              <li key={need.id} className={cn("group flex min-w-0 flex-col", need.group && need.group !== data.needs[i - 1]?.group && i > 0 && "mt-2.5")}>
                {need.group && need.group !== data.needs[i - 1]?.group && (
                  <span className="pb-0.5 font-bureau text-[11px] text-typography-secondary">{need.group}</span>
                )}
                <span className="flex min-w-0 items-start gap-2 py-0.5 [&>button:first-child]:mt-[3px]">
                <Tick done={need.have} size="sm" label={need.have ? "Mark as not got" : "Mark as got"} onToggle={update && (() => setNeed({ ...need, have: !need.have }))} />
                <AutoTextarea
                  value={need.text}
                  placeholder={`Item ${i + 1}`}
                  aria-label="Item"
                  readOnly={!update}
                  {...fieldEvents}
                  onKeyDown={stopFieldEvent}
                  onChange={(event) => setNeed({ ...need, text: event.target.value })}
                  className={cn(
                    "min-w-0 flex-1 rounded-[6px] px-1 py-0.5 font-bureau text-[13px] leading-[1.35] text-typography-primary placeholder:font-light placeholder:text-typography-secondary focus:bg-shell-fill",
                    need.have && "text-typography-secondary line-through",
                  )}
                />
                {update && <Remove label={`Remove ${need.text || "item"}`} onRemove={() => update({ needs: data.needs.filter((n) => n.id !== need.id) })} />}
                </span>
              </li>
            ))}
          </ul>
          {update && (
            <Add
              label="Add an item"
              size={size}
              onAdd={() => update({ needs: [...data.needs, { id: shellId("need"), text: "", have: false, group: data.needs.at(-1)?.group }] })}
            />
          )}
        </aside>
        {/* The steps scroll on the keylines; the current step's ring is drawn inside its own edge, so the scroller never cuts it. */}
        <div className="no-scrollbar flex min-w-0 flex-1 flex-col gap-2 overflow-y-auto pb-3">
          {steps}
          {update && <Add label="Add a step" size={size} onAdd={() => update({ steps: [...data.steps, { id: shellId("step"), text: "", done: false }] })} />}
        </div>
      </div>
    </ShellSurface>
  );
}
