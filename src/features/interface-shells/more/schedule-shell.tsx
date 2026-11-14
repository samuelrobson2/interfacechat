import { ArrowDownWideNarrow, CalendarMinus, CalendarPlus, ChevronsLeft, ChevronsRight, Copy, Download, FoldHorizontal, Plus, UnfoldHorizontal, X } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/shared/lib/css";
import {
  shellId,
  type ScheduleShellData,
  type ScheduleTask,
  type ScheduleTaskType,
  type ShellProps,
  type ShellSize,
} from "../model/shell-types";
import {
  ChipList,
  FieldPill,
  PreviewBody,
  PreviewHead,
  ShellBody,
  ShellDetail,
  ShellTitle,
  Stepper,
} from "../ui/shell-kit";
import { ghostLabels } from "../ui/shell-accents";
import { ShellAppIcon } from "../ui/shell-icons";
import { SuggestedChip, unusedSuggestions } from "../ui/suggested-chip";
import { fieldEvents, ShellSurface, stopFieldEvent, Bar } from "../ui/shell-surface";
import { copyText, downloadText, fileNameOf, ShellToolbar, ShellToolButton, ShellToolDivider } from "../ui/shell-toolbar";

const TYPES: ScheduleTaskType[] = ["setup", "shoot", "travel", "break"];

const clockText = (hour: number) => `${String(Math.floor(hour)).padStart(2, "0")}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}`;

/** In order: by day, then start. */
const byStart = (tasks: ScheduleTask[]) => [...tasks].sort((a, b) => a.day - b.day || a.start - b.start);

/** Move every task by `delta` hours, keeping each inside the working day. */
function shiftTasks(data: ScheduleShellData, delta: number): ScheduleTask[] {
  const [open, close] = data.hours;
  return data.tasks.map((task) => {
    const length = task.end - task.start;
    const start = Math.min(close - length, Math.max(open, task.start + delta));
    return { ...task, start, end: start + length };
  });
}

/** The plan as rows a spreadsheet or project tool can import. */
function scheduleCsv(data: ScheduleShellData) {
  const cell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  return [
    "Day,Start,End,Task,Type",
    ...byStart(data.tasks).map((task) =>
      [dayLabel(data, task.day), clockText(task.start), clockText(task.end), cell(task.label), TYPE_STYLE[task.type].label].join(","),
    ),
  ].join("\n");
}

const scheduleText = (data: ScheduleShellData) =>
  [
    data.title,
    ...Array.from({ length: data.dayCount }, (_, day) => [
      `\n${dayLabel(data, day)}`,
      ...byStart(data.tasks)
        .filter((task) => task.day === day)
        .map((task) => `${clockText(task.start)}–${clockText(task.end)}  ${task.label}`),
    ]).flat(),
  ]
    .filter(Boolean)
    .join("\n");

/** Each task type's bar colour and name. Inline reuses them. */
export const TYPE_STYLE: Record<ScheduleTaskType, { bar: string; label: string }> = {
  setup: { bar: "bg-[#9fd3d0] text-[#0d4f4c]", label: "Setup" },
  shoot: { bar: "bg-[#1fa5a0] text-white", label: "Shooting" },
  travel: { bar: "bg-orange-5/80 text-white", label: "Travel" },
  break: {
    bar: "bg-gray-3/20 text-typography-secondary [background-image:repeating-linear-gradient(135deg,transparent_0_4px,rgba(26,23,24,0.08)_4px_8px)]",
    label: "Break",
  },
};

const hourText = (hour: number) =>
  `${String(Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`;

function dayLabel(data: ScheduleShellData, index: number, short = false) {
  if (!data.start) return short ? `D${index + 1}` : `Day ${index + 1}`;
  const date = new Date(`${data.start}T12:00:00`);
  date.setDate(date.getDate() + index);
  return date.toLocaleDateString("en-GB", short ? { weekday: "short" } : { weekday: "short", day: "numeric", month: "short" });
}

const ordered = (tasks: ScheduleTask[]) =>
  [...tasks].sort((a, b) => a.day - b.day || a.start - b.start);

type Window = { from: number; total: number };

const absStart = (task: Pick<ScheduleTask, "day" | "start">, data: ScheduleShellData) =>
  task.day * (data.hours[1] - data.hours[0]) + (task.start - data.hours[0]);

/** Every day, end to end: the real scale, used on large where bars are dragged. */
function fullWindow(data: ScheduleShellData): Window {
  return { from: 0, total: (data.hours[1] - data.hours[0]) * Math.max(1, data.dayCount) };
}

/**
 * Just the stretch the tasks cover, so a small card shows readable bars instead
 * of slivers lost in three twelve-hour days.
 */
function fittedWindow(data: ScheduleShellData, tasks: ScheduleTask[]): Window {
  if (tasks.length === 0) return fullWindow(data);
  const starts = tasks.map((task) => absStart(task, data));
  const ends = tasks.map((task) => absStart(task, data) + (task.end - task.start));
  const from = Math.min(...starts);
  return { from, total: Math.max(1, Math.max(...ends) - from) };
}

/** Where a task sits on one track that runs across the window. */
function span(task: Pick<ScheduleTask, "day" | "start" | "end">, data: ScheduleShellData, view = fullWindow(data), minPct = 0) {
  const left = ((absStart(task, data) - view.from) / view.total) * 100;
  const width = Math.max(minPct, (Math.max(task.end - task.start, 0.25) / view.total) * 100);
  return { left: `${Math.min(left, 100 - width)}%`, width: `${width}%` };
}

/** Day columns behind the bars, so the stagger reads against days. */
function DayGrid({ data, labels }: { data: ScheduleShellData; labels: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex">
      {Array.from({ length: Math.max(1, data.dayCount) }, (_, i) => (
        <div key={i} className={cn("relative flex-1", i > 0 && "border-l border-dashed border-gray-3/25")}>
          {labels && (
            <span className="absolute -top-4 left-1 font-bureau text-[9px] text-typography-secondary">
              {dayLabel(data, i, true)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Medium: the classic Gantt shape, rows of offset bars against day columns. */
function GanttPreview({ data }: { data: ScheduleShellData }) {
  const tasks = ordered(data.tasks).slice(0, 5);
  const ghost = tasks.length === 0;
  const rows = ghost ? ghostLabels("Task") : tasks;
  const view = fittedWindow(data, tasks);
  return (
    <div className="flex flex-1 flex-col justify-center gap-[5px]">
      {rows.map((row, i) => {
        const task = typeof row === "string" ? null : row;
        return (
          <div key={task?.id ?? (row as string)} className="flex h-3 items-center gap-1.5">
            {/* Medium shows shapes, not words: a bar stands for the task's name. */}
            <span className="flex w-9 shrink-0 items-center">
              <Bar width={`${[80, 62, 72, 56, 68][i % 5]}%`} className="h-1" />
            </span>
            <div className="relative h-full flex-1 rounded-[3px] bg-gray-6/80">
              {task ? (
                <span className={cn("absolute inset-y-[2px] rounded-[2px]", TYPE_STYLE[task.type].bar)} style={span(task, data, view, 10)} />
              ) : (
                <span
                  className="absolute inset-y-[2px] rounded-[2px] border border-dashed border-gray-3/40"
                  style={{ left: `${i * 26}%`, width: "30%" }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SNAP = 0.5;

/** Medium plus and large: one row per task, editable, with draggable bars on large. */
function Gantt({
  data,
  size,
  onTasks,
}: {
  data: ScheduleShellData;
  size: ShellSize;
  onTasks?: (tasks: ScheduleTask[]) => void;
}) {
  const large = size === "large";
  const track = useRef<HTMLDivElement>(null);
  const [from, to] = data.hours;
  const perDay = to - from;
  const days = Math.max(1, data.dayCount);
  const tasks = ordered(data.tasks).filter((task) => task.day < days);
  const update = (next: ScheduleTask) =>
    onTasks?.(data.tasks.map((task) => (task.id === next.id ? next : task)));

  const drag = (task: ScheduleTask, mode: "move" | "resize") => (event: React.PointerEvent) => {
    if (!onTasks || !large || !track.current) return;
    stopFieldEvent(event);
    event.preventDefault();
    const width = track.current.getBoundingClientRect().width;
    const hoursPerPx = (perDay * days) / width;
    const x0 = event.clientX;
    const length = task.end - task.start;
    const absStart = task.day * perDay + (task.start - from);
    const onMove = (move: PointerEvent) => {
      const delta = Math.round(((move.clientX - x0) * hoursPerPx) / SNAP) * SNAP;
      if (mode === "resize") {
        const end = Math.min(to, Math.max(task.start + SNAP, task.end + delta));
        update({ ...task, end });
        return;
      }
      const abs = Math.min(perDay * days - length, Math.max(0, absStart + delta));
      let day = Math.floor(abs / perDay);
      let start = from + (abs - day * perDay);
      if (start + length > to) {
        // Keep a bar inside one day: snap it to whichever side it overlaps more.
        if (to - start > length / 2 || day === days - 1) start = to - length;
        else {
          day += 1;
          start = from;
        }
      }
      update({ ...task, day, start, end: start + length });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const addTask = () => {
    if (!onTasks) return;
    const last = ordered(data.tasks).at(-1);
    const day = last ? last.day : 0;
    const start = last ? Math.min(to - 1, last.end) : from;
    onTasks([...data.tasks, { id: shellId("task"), label: "", day, start, end: Math.min(to, start + 1), type: "shoot" }]);
  };

  const view = large ? fullWindow(data) : fittedWindow(data, tasks);
  const labelWidth = large ? "w-[190px]" : "w-[78px]";
  const ticks = large ? Array.from({ length: Math.floor(perDay / 3) + 1 }, (_, i) => from + i * 3) : [];

  return (
    <div className={cn("flex min-w-0 flex-col", large && "no-scrollbar overflow-x-auto")}>
      <div className="flex flex-col" style={large ? { minWidth: 190 + days * 300 } : undefined}>
      {/* Header: days, and on large the hours inside each day. */}
      {!large && tasks.length > 0 && (
        <div className="flex items-end gap-2 pb-1">
          <span className={cn("shrink-0", labelWidth)} />
          <div className="flex min-w-0 flex-1 justify-between font-bureau text-[9px] text-typography-secondary tabular-nums">
            {[view.from, view.from + view.total].map((abs) => {
              const perDay = data.hours[1] - data.hours[0];
              const day = Math.min(Math.floor(abs / perDay), Math.max(0, data.dayCount - 1));
              return (
                <span key={abs}>
                  {dayLabel(data, day, true)} {hourText(data.hours[0] + abs - day * perDay)}
                </span>
              );
            })}
          </div>
        </div>
      )}
      <div className={cn("items-end gap-2 pb-1", large ? "flex" : "hidden")}>
        <span className={cn("shrink-0", labelWidth)} />
        <div className="flex min-w-0 flex-1">
          {Array.from({ length: days }, (_, i) => (
            <div key={i} className={cn("relative flex-1", i > 0 && "border-l border-gray-3/25")}>
              <span className={cn("block truncate px-1 font-bureau text-typography-primary", large ? "text-[12px]" : "text-[9px]")}>
                {dayLabel(data, i, !large)}
              </span>
              {large && (
                <div className="relative h-3">
                  {ticks.map((hour) => (
                    <span
                      key={hour}
                      className="absolute font-bureau text-[9px] text-typography-secondary tabular-nums"
                      style={{ left: `${((hour - from) / perDay) * 100}%`, transform: hour === from ? undefined : "translateX(-50%)" }}
                    >
                      {hour === to ? "" : hourText(hour)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={cn("flex flex-col", large ? "gap-1" : "gap-[3px]")}>
        {(tasks.length ? tasks : ghostLabels("Task")).map((row, i) => {
          const task = typeof row === "string" ? null : row;
          return (
            <div key={task?.id ?? (row as string)} className="group flex min-w-0 items-center gap-2">
              <div className={cn("flex shrink-0 items-center gap-1", labelWidth, large && "sticky left-0 z-10 bg-background-primary")}>
                {task && large && (
                  <button
                    type="button"
                    title={`${TYPE_STYLE[task.type].label}. Click to change.`}
                    aria-label={`Type: ${TYPE_STYLE[task.type].label}`}
                    disabled={!onTasks}
                    {...fieldEvents}
                    onClick={(event) => {
                      stopFieldEvent(event);
                      update({ ...task, type: TYPES[(TYPES.indexOf(task.type) + 1) % TYPES.length]! });
                    }}
                    className={cn("size-3 shrink-0 rounded-[3px]", TYPE_STYLE[task.type].bar)}
                  />
                )}
                {task ? (
                  <input
                    value={task.label}
                    placeholder={`Task ${i + 1}`}
                    aria-label="Task"
                    readOnly={!onTasks}
                    {...fieldEvents}
                    onKeyDown={stopFieldEvent}
                    onChange={(event) => update({ ...task, label: event.target.value })}
                    className={cn(
                      "min-w-0 flex-1 truncate bg-transparent font-bureau text-typography-primary outline-none placeholder:text-typography-secondary",
                      large ? "text-[13px]" : "text-[10px]",
                    )}
                  />
                ) : (
                  <span className={cn("font-bureau font-light text-typography-secondary", large ? "text-[13px]" : "text-[10px]")}>
                    {row as string}
                  </span>
                )}
                {task && large && onTasks && (
                  <button
                    type="button"
                    aria-label={`Remove ${task.label || "task"}`}
                    {...fieldEvents}
                    onClick={(event) => {
                      stopFieldEvent(event);
                      onTasks(data.tasks.filter((other) => other.id !== task.id));
                    }}
                    className="grid size-5 shrink-0 place-items-center rounded-full text-typography-secondary opacity-0 group-hover:opacity-100 hover:bg-gray-6"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
              <div
                ref={i === 0 ? track : undefined}
                className={cn("relative min-w-0 flex-1 rounded-[5px] bg-gray-6/70", large ? "h-7" : "h-4")}
              >
                {large && <DayGrid data={data} labels={false} />}
                {task ? (
                  <span
                    title={`${task.label} · ${dayLabel(data, task.day)} ${hourText(task.start)}–${hourText(task.end)}`}
                    onPointerDown={drag(task, "move")}
                    className={cn(
                      "absolute inset-y-0.5 flex items-center overflow-hidden rounded-[4px] font-bureau whitespace-nowrap",
                      TYPE_STYLE[task.type].bar,
                      large ? "px-1.5 text-[10px]" : "text-[0px]",
                      large && onTasks && "cursor-grab touch-none active:cursor-grabbing",
                    )}
                    style={span(task, data, view, large ? 0 : 4)}
                  >
                    {large && hourText(task.start)}
                    {large && onTasks && (
                      <span
                        onPointerDown={drag(task, "resize")}
                        className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize"
                        aria-hidden
                      />
                    )}
                  </span>
                ) : (
                  <span
                    className="absolute inset-y-0.5 rounded-[4px] border border-dashed border-gray-3/40"
                    style={{ left: `${i * 26}%`, width: "30%" }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      </div>
      {onTasks && (
        <button
          type="button"
          {...fieldEvents}
          onClick={(event) => {
            stopFieldEvent(event);
            addTask();
          }}
          className={cn(
            "mt-1.5 flex items-center gap-1 self-start font-bureau text-typography-secondary hover:text-typography-primary",
            large ? "text-[13px]" : "text-[11px]",
          )}
        >
          <Plus className="size-3.5" />
          Add a task
        </button>
      )}

      {large && (
        <div className="mt-3 flex flex-wrap gap-3">
          {TYPES.map((type) => (
            <span key={type} className="flex items-center gap-1.5 font-bureau text-[11px] text-typography-secondary">
              <span className={cn("size-2.5 rounded-[3px]", TYPE_STYLE[type].bar)} />
              {TYPE_STYLE[type].label}
            </span>
          ))}
          {onTasks && (
            <span className="font-bureau text-[11px] text-typography-secondary">
              Drag a bar to move it, its right edge to change its length.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Days, first day and working hours: what someone says about a timeline. */
function TimelineFields({
  data,
  size,
  update,
}: {
  data: ScheduleShellData;
  size: ShellSize;
  update?: (patch: Partial<ScheduleShellData>) => void;
}) {
  const large = size === "large";
  const text = large ? "text-[13px]" : "text-[11px]";
  const hourSelect = (index: 0 | 1) => (
    <select
      value={data.hours[index]}
      disabled={!update}
      aria-label={index === 0 ? "Day starts" : "Day ends"}
      {...fieldEvents}
      onChange={(event) => {
        const next: [number, number] = [...data.hours];
        next[index] = Number(event.target.value);
        if (next[0] < next[1]) update?.({ hours: next });
      }}
      className={cn("appearance-none bg-transparent font-bureau text-typography-primary tabular-nums outline-none", text)}
    >
      {Array.from({ length: 25 }, (_, h) => (
        <option key={h} value={h}>
          {hourText(h)}
        </option>
      ))}
    </select>
  );
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Stepper
        value={data.dayCount}
        unit={["day", "days"]}
        label="Days"
        size={size}
        onChange={update && ((dayCount) => update({ dayCount }))}
      />
      <FieldPill label="Starts" size={size}>
        <span className="relative">
          <span className={cn("font-bureau", text, data.start ? "text-typography-primary" : "font-light text-typography-secondary")}>
            {data.start ? dayLabel(data, 0) : "Any day"}
          </span>
          {update && (
            <input
              type="date"
              value={data.start ?? ""}
              aria-label="First day"
              {...fieldEvents}
              onClick={(event) => {
                stopFieldEvent(event);
                event.currentTarget.showPicker?.();
              }}
              onKeyDown={stopFieldEvent}
              onChange={(event) => update({ start: event.target.value || undefined })}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          )}
        </span>
      </FieldPill>
      <FieldPill label="Hours" size={size}>
        {hourSelect(0)}
        <span className="text-typography-secondary">–</span>
        {hourSelect(1)}
      </FieldPill>
    </div>
  );
}

export function ScheduleShell({
  size,
  data,
  onChange,
  onSubmit,
  surface = true,
  tools,
  actions,
  suggestions,
  suggested,
  onDismissSuggestion,
  className,
}: ShellProps<ScheduleShellData>) {
  if (size === "small") return <ShellAppIcon kind="schedule" className={className} />;

  if (size === "medium") {
    return (
      <ShellSurface size={size} surface={surface} className={className}>
        <PreviewHead kind="schedule" title={data.title} />
        <PreviewBody>
          <GanttPreview data={data} />
        </PreviewBody>
      </ShellSurface>
    );
  }

  const large = size === "large";
  const update = onChange ? (patch: Partial<ScheduleShellData>) => onChange({ ...data, ...patch }) : undefined;
  const onTasks = update && ((tasks: ScheduleTask[]) => update({ tasks }));

  return (
    <ShellSurface size={size} surface={surface} className={className}>
      <ShellTitle
        kind="schedule"
        size={size}
        value={data.title}
        onChange={update && ((title) => update({ title }))}
        onSubmit={onSubmit}
      />
      {large && (
        <ShellToolbar tools={tools} actions={actions}>
          <ShellToolButton
            label="New task"
            disabled={!update}
            onPress={() => {
              const start = Math.min(data.hours[1] - 1, data.hours[0] + 1);
              update?.({
                tasks: [
                  ...data.tasks,
                  { id: shellId("task"), label: "New task", day: 0, start, end: start + 1, type: "setup" },
                ],
              });
            }}
          >
            <Plus />
          </ShellToolButton>
          <ShellToolButton label="Add a day" disabled={!update} onPress={() => update?.({ dayCount: data.dayCount + 1 })}>
            <CalendarPlus />
          </ShellToolButton>
          <ShellToolButton
            label="Remove the last day"
            disabled={!update || data.dayCount <= 1}
            onPress={() =>
              update?.({ dayCount: data.dayCount - 1, tasks: data.tasks.filter((task) => task.day < data.dayCount - 1) })
            }
          >
            <CalendarMinus />
          </ShellToolButton>
          <ShellToolDivider />
          <ShellToolButton
            label="Longer days"
            disabled={!update || (data.hours[0] <= 0 && data.hours[1] >= 24)}
            onPress={() => update?.({ hours: [Math.max(0, data.hours[0] - 1), Math.min(24, data.hours[1] + 1)] })}
          >
            <UnfoldHorizontal />
          </ShellToolButton>
          <ShellToolButton
            label="Shorter days"
            disabled={
              !update ||
              data.hours[1] - data.hours[0] <= 2 ||
              // Never cut into a task.
              data.tasks.some((task) => task.start < data.hours[0] + 1 || task.end > data.hours[1] - 1)
            }
            onPress={() => update?.({ hours: [data.hours[0] + 1, data.hours[1] - 1] })}
          >
            <FoldHorizontal />
          </ShellToolButton>
          <ShellToolDivider />
          <ShellToolButton
            label="Move everything 30 min earlier"
            disabled={!update || data.tasks.length === 0 || data.tasks.every((task) => task.start <= data.hours[0])}
            onPress={() => update?.({ tasks: shiftTasks(data, -0.5) })}
          >
            <ChevronsLeft />
          </ShellToolButton>
          <ShellToolButton
            label="Move everything 30 min later"
            disabled={!update || data.tasks.length === 0 || data.tasks.every((task) => task.end >= data.hours[1])}
            onPress={() => update?.({ tasks: shiftTasks(data, 0.5) })}
          >
            <ChevronsRight />
          </ShellToolButton>
          <ShellToolButton
            label="Sort tasks by start time"
            disabled={!update || data.tasks.length < 2}
            onPress={() => update?.({ tasks: byStart(data.tasks) })}
          >
            <ArrowDownWideNarrow />
          </ShellToolButton>
          <ShellToolDivider />
          <ShellToolButton label="Copy as text" disabled={data.tasks.length === 0} onPress={() => copyText(scheduleText(data))}>
            <Copy />
          </ShellToolButton>
          <ShellToolButton
            label="Download (.csv)"
            disabled={data.tasks.length === 0}
            onPress={() => downloadText(`${fileNameOf(data.title, "schedule")}.csv`, scheduleCsv(data), "text/csv")}
          >
            <Download />
          </ShellToolButton>
        </ShellToolbar>
      )}
      <ShellBody size={size}>
        {large && suggestions?.days ? (
          <div className="flex flex-wrap items-center gap-2">
            <TimelineFields data={data} size={size} update={update} />
            {suggestions.days}
          </div>
        ) : (
          <TimelineFields data={data} size={size} update={update} />
        )}
        {/* On the chat home: what the request leaves open, and constraints to plan around, outlined. */}
        {!large && suggestions?.brief}
        {!large && update && unusedSuggestions(suggested?.constraints, data.constraints).length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {unusedSuggestions(suggested?.constraints, data.constraints)
              .slice(0, 3)
              .map((constraint) => (
                <SuggestedChip
                  key={constraint}
                  label={constraint}
                  size="sm"
                  onAccept={() => update({ constraints: [...data.constraints, constraint] })}
                  onDismiss={onDismissSuggestion && (() => onDismissSuggestion("constraints", constraint))}
                />
              ))}
          </div>
        )}
        {large && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bureau text-[12px] text-typography-secondary">Plan around</span>
            <ChipList
              size={size}
              items={data.constraints}
              addLabel="Add a constraint"
              onChange={update && ((constraints) => update({ constraints }))}
            />
            {unusedSuggestions(suggested?.constraints, data.constraints).map((constraint) => (
              <SuggestedChip
                key={constraint}
                label={constraint}
                onAccept={update && (() => update({ constraints: [...data.constraints, constraint] }))}
                onDismiss={onDismissSuggestion && (() => onDismissSuggestion("constraints", constraint))}
              />
            ))}
          </div>
        )}
        <Gantt data={data} size={size} onTasks={onTasks} />
      </ShellBody>
      {!large && (
        <ShellDetail>
          {data.tasks.length ? `${data.tasks.length} tasks` : null}
        </ShellDetail>
      )}
    </ShellSurface>
  );
}

