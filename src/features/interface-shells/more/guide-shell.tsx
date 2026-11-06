import { Check, Pause, Play, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/css";
import { shellId, type GuideFact, type GuideNeed, type GuideShellData, type GuideStep, type ShellProps, type ShellSize } from "../model/shell-types";
import { AddChip } from "../ui/shell-fields";
import { ghostLabels } from "../ui/shell-accents";
import { InlineInput, PreviewBody, PreviewHead, ShellBody, ShellTitle } from "../ui/shell-kit";
import { ShellAppIcon } from "../ui/shell-icons";
import { Bar, AutoTextarea, fieldEvents, ShellSurface, stopFieldEvent } from "../ui/shell-surface";

const TERRACOTTA = "#c2563a";

function Tick({ done, size, onToggle, label }: { done: boolean; size: "xs" | "sm" | "md"; onToggle?: () => void; label: string }) {
  const box = cn(
    "grid shrink-0 place-items-center rounded-full border transition-colors",
    size === "md" ? "size-[18px]" : size === "sm" ? "size-3.5" : "size-2.5",
    done ? "border-transparent text-white" : "border-gray-3/50 bg-white",
  );
  const style = done ? { backgroundColor: TERRACOTTA } : undefined;
  const mark = size !== "xs" && done && <Check className={size === "md" ? "size-3" : "size-2.5"} strokeWidth={3} />;
  if (!onToggle) return <span className={box} style={style}>{mark}</span>;
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
      className={cn(box, "active:scale-[0.9]")}
      style={style}
    >
      {mark}
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
      className="grid size-6 place-items-center rounded-full text-typography-secondary hover:bg-white hover:text-typography-primary"
    >
      {icon}
    </button>
  );
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full py-0.5 pr-0.5 pl-2.5 font-bureau text-[12px] tabular-nums",
        finished ? "text-white" : running ? "bg-white text-typography-primary ring-1 ring-[#c2563a]/40" : "bg-gray-6 text-typography-secondary",
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
      className="grid size-6 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-gray-6 focus-visible:opacity-100"
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
  className,
}: ShellProps<GuideShellData>) {
  if (size === "small") return <ShellAppIcon kind="guide" className={className} />;

  const current = data.steps.findIndex((s) => !s.done);
  const ghostSteps = data.steps.length === 0;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="guide" title={data.title} />
        <PreviewBody className="gap-1.5 pt-1">
          {/* Medium shows shapes, not words: a bar per step. */}
          {(ghostSteps ? ghostLabels("Step") : data.steps.slice(0, 4)).map((step, i) => {
            const s = typeof step === "string" ? null : step;
            return (
              <span key={s?.id ?? (step as string)} className="flex min-w-0 items-center gap-1.5">
                <Tick done={s?.done ?? false} size="xs" label="" />
                <Bar width={`${[78, 64, 70, 56][i % 4]}%`} className={cn("h-1.5", s?.done ? "bg-gray-3/15" : "bg-gray-3/25")} />
              </span>
            );
          })}
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
  const facts = (
    <div className="flex flex-wrap items-center gap-1.5">
      {(data.facts.length ? data.facts : [{ label: "Time", value: "" }]).map((fact, i) => (
        <span
          key={i}
          className={cn("group inline-flex items-center gap-1 rounded-full bg-gray-6 font-bureau", large ? "h-8 px-3" : "h-6 px-2")}
        >
          <InlineInput value={fact.label} placeholder="Label" label="Fact" onChange={update && ((label) => (data.facts.length ? setFact(i, { label }) : update?.({ facts: [{ label, value: "" }] })))} className={cn(text, "field-sizing-content min-w-6 text-typography-secondary")} />
          <InlineInput value={fact.value} placeholder="Add" label={fact.label || "Value"} onChange={update && ((value) => (data.facts.length ? setFact(i, { value }) : update?.({ facts: [{ label: fact.label, value }] })))} className={cn(text, "field-sizing-content min-w-6")} />
          {update && large && data.facts.length > 0 && (
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
      {update && large && (
        <AddChip size="md" placeholder="e.g. Difficulty" onSubmitValue={(label) => update({ facts: [...data.facts, { label, value: "" }] })}>
          Add a fact
        </AddChip>
      )}
    </div>
  );

  const steps = (
    <ol className={cn("flex flex-col", large ? "gap-2" : "gap-1")}>
      {ghostSteps &&
        ghostLabels("Step").map((label, i) => (
          <li key={label} className={cn("flex items-center gap-2.5", large && "rounded-[14px] bg-gray-6 px-4 py-3")}>
            <span className={cn("font-bureau text-typography-secondary tabular-nums", large ? "w-5 text-[15px]" : "w-3 text-[11px]")}>{i + 1}</span>
            <span className={cn("font-bureau font-light text-typography-secondary", large ? "text-[14px]" : "text-[12px]")}>{label}</span>
          </li>
        ))}
      {data.steps.map((step, i) => {
        const isCurrent = i === current;
        return (
          <li
            key={step.id}
            className={cn(
              "group flex min-w-0 items-start gap-2.5",
              large && "rounded-[14px] px-4 py-3 transition-colors",
              large && (isCurrent ? "bg-white shadow-[0_1px_4px_rgba(26,23,24,0.1)] ring-1 ring-[#c2563a]/30" : "bg-gray-6"),
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
                className={cn("min-w-0 font-bureau text-[14px] leading-[1.5] placeholder:font-light", step.done ? "text-typography-secondary line-through" : "text-typography-primary")}
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
                className={cn("flex-1 px-1 text-[12px]", step.done && "text-typography-secondary line-through")}
              />
            )}
            {large && step.minutes ? <Timer key={`${step.id}-${step.minutes}`} minutes={step.minutes} /> : null}
            <Tick done={step.done} size={large ? "md" : "sm"} label={step.done ? "Mark step as not done" : "Mark step as done"} onToggle={update && (() => setStep({ ...step, done: !step.done }))} />
            {large && update && <Remove label={`Remove step ${i + 1}`} onRemove={() => update({ steps: data.steps.filter((s) => s.id !== step.id) })} />}
          </li>
        );
      })}
    </ol>
  );

  if (!large) {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <ShellTitle kind="guide" size={size} value={data.title} onChange={update && ((title) => update({ title }))} onSubmit={onSubmit} />
        <ShellBody size={size} className="gap-2">
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
      <div className="px-6 pt-3">{facts}</div>
      <div className="flex min-h-0 flex-1 gap-6 px-6 pt-4 pb-6">
        <aside className="no-scrollbar flex w-56 shrink-0 flex-col gap-1.5 overflow-y-auto">
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
                    "min-w-0 flex-1 rounded-[6px] px-1 py-0.5 font-bureau text-[13px] leading-[1.35] text-typography-primary placeholder:font-light placeholder:text-typography-secondary focus:bg-gray-6",
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
        <div className="no-scrollbar flex min-w-0 flex-1 flex-col gap-2 overflow-y-auto">
          {steps}
          {update && <Add label="Add a step" size={size} onAdd={() => update({ steps: [...data.steps, { id: shellId("step"), text: "", done: false }] })} />}
        </div>
      </div>
    </ShellSurface>
  );
}
