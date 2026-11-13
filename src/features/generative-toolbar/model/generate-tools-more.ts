import {
  shellId,
  type GeneratorShellData,
  type ScheduleShellData,
  type SearchShellData,
} from "@/features/interface-shells";
import { clip, mix, plural } from "./tool-helpers";
import type { GeneratedTool } from "./tool-spec";

/* ── Search ───────────────────────────────────────────────────────────── */

const RECENCY = [
  { id: "any", label: "Any time" },
  { id: "year", label: "Past year" },
  { id: "month", label: "Past month" },
];
const RECENCY_FILTERS = RECENCY.slice(1).map((option) => option.label);

export function searchTools(data: SearchShellData): GeneratedTool<SearchShellData>[] {
  if (!data.query.trim()) {
    return [
      {
        type: "action",
        id: "suggest-queries",
        label: "Suggest searches",
        detail: "From what you're working on",
        icon: "search",
      },
    ];
  }

  const recency = RECENCY.find((option) => data.filters.includes(option.label))?.id ?? "any";
  const domains = [...new Set(data.results.map((result) => result.url && new URL(result.url).hostname.replace(/^www\./, "")))].filter(
    Boolean,
  ) as string[];

  const controls: GeneratedTool<SearchShellData>[] = [
    {
      type: "choice",
      id: "recency",
      label: "When",
      detail: "How recent the results must be",
      icon: "calendar",
      options: RECENCY.map(({ id, label }) => ({ id, label: label.replace("Past ", "") })),
      value: recency,
      apply: (d, value) => {
        const filters = d.filters.filter((filter) => !RECENCY_FILTERS.includes(filter));
        const label = RECENCY.find((option) => option.id === value);
        return { ...d, filters: value === "any" || !label ? filters : [...filters, label.label] };
      },
    },
    {
      type: "slider",
      id: "depth",
      label: "Depth",
      detail: "How far to read before answering",
      icon: "sliders",
      min: { label: "Quick" },
      max: { label: "Deep" },
      steps: ["Quick", "Thorough", "Exhaustive"],
      value: 1,
    },
    {
      type: "toggle",
      id: "primary",
      label: "Primary sources",
      detail: "Only studies, filings and first-hand accounts",
      icon: "search",
      value: false,
    },
  ];
  const actions: GeneratedTool<SearchShellData>[] = [];
  if (data.results.length > 1) {
    actions.push(
      {
        type: "action",
        id: "compare",
        label: `Compare top ${Math.min(3, data.results.length)}`,
        detail: "Where the sources agree and differ",
        icon: "table",
      },
      {
        type: "action",
        id: "summarise",
        label: "Summarise",
        detail: `One answer from ${plural(data.results.length, "result")}`,
        icon: "text",
      },
    );
  }
  actions.push(
    {
      type: "action",
      id: "counterpoints",
      label: "Find counterpoints",
      detail: `What argues against “${clip(data.query, 24)}”`,
      icon: "search",
    },
    {
      type: "action",
      id: "broaden",
      label: "Broaden",
      detail: data.queries.length ? `Beyond the ${plural(data.queries.length, "search")} so far` : "Widen the question",
      icon: "plus",
    },
  );
  if (domains[0]) {
    actions.push({
      type: "action",
      id: "more-from",
      label: `More from ${clip(domains[0], 14)}`,
      detail: "Dig into the strongest source",
      icon: "search",
    });
  }
  return mix(controls, actions);
}

/* ── Schedule ─────────────────────────────────────────────────────────── */

const hourLabel = (hour: number) => {
  const h = Math.floor(hour) % 24;
  const suffix = h < 12 ? "am" : "pm";
  return `${h % 12 || 12}${suffix}`;
};

/** Tasks that overlap another on the same day. */
function clashes(tasks: ScheduleShellData["tasks"]) {
  return tasks.filter((task) =>
    tasks.some((other) => other !== task && other.day === task.day && other.start < task.end && task.start < other.end),
  ).length;
}

export function scheduleTools(data: ScheduleShellData): GeneratedTool<ScheduleShellData>[] {
  const [from, to] = data.hours;
  if (data.tasks.length === 0) {
    return [
      {
        type: "slider",
        id: "days",
        label: "Days",
        detail: "How long the plan runs",
        icon: "sliders",
        min: { label: "Fewer" },
        max: { label: "More" },
        steps: ["1", "2", "3", "4", "5"],
        value: Math.min(4, Math.max(0, data.dayCount - 1)),
        apply: (d, value) => ({ ...d, dayCount: value + 1 }),
      },
      {
        type: "action",
        id: "draft",
        label: "Draft the schedule",
        detail: data.constraints.length ? `Around ${clip(data.constraints[0] ?? "", 30)}` : "From the chat so far",
        icon: "sparkles",
      },
    ];
  }

  const starts = [6, 7, 8, 9];
  const span = to - from;
  const daysWithoutBreak = Array.from({ length: data.dayCount }, (_, day) => day).filter(
    (day) => data.tasks.some((task) => task.day === day) && !data.tasks.some((task) => task.day === day && task.type === "break"),
  );
  const clashing = clashes(data.tasks);

  const controls: GeneratedTool<ScheduleShellData>[] = [
    {
      type: "choice",
      id: "start",
      label: "Start",
      detail: `Days run ${hourLabel(from)} to ${hourLabel(to)}`,
      icon: "clock",
      options: starts.slice(0, 4).map((hour) => ({ id: String(hour), label: hourLabel(hour) })),
      value: String(from),
      apply: (d, value) => {
        const start = Number(value);
        return { ...d, hours: [start, Math.min(24, start + span)] };
      },
    },
    {
      type: "grid",
      id: "pace",
      label: "Pace",
      detail: "How packed each day is",
      icon: "grid",
      x: { low: "Relaxed", high: "Tight" },
      y: { low: "Few breaks", high: "Many breaks" },
      quadrants: ["Steady", "Sprint", "Easy", "Crunch"],
      value: { x: Math.min(0.9, data.tasks.length / (data.dayCount * 8)), y: daysWithoutBreak.length ? 0.3 : 0.7 },
    },
    {
      type: "toggle",
      id: "buffers",
      label: "Buffers",
      detail: "Leave 15 minutes between tasks",
      icon: "clock",
      value: false,
    },
  ];
  const actions: GeneratedTool<ScheduleShellData>[] = [];
  if (daysWithoutBreak.length) {
    actions.push({
      type: "action",
      id: "lunch",
      label: "Add lunch breaks",
      detail: `${plural(daysWithoutBreak.length, "day")} without one`,
      icon: "plus",
      apply: (d) => ({
        ...d,
        tasks: [
          ...d.tasks,
          ...daysWithoutBreak.map((day) => ({
            id: shellId("task"),
            label: "Lunch",
            day,
            start: 12,
            end: 13,
            type: "break" as const,
          })),
        ],
      }),
    });
  }
  if (clashing) {
    actions.push({
      type: "action",
      id: "clashes",
      label: `Fix ${plural(clashing, "clash")}`,
      detail: "Tasks overlap on the same day",
      icon: "calendar",
    });
  }
  actions.push({
    type: "action",
    id: "balance",
    label: "Balance the days",
    detail: `${plural(data.tasks.length, "task")} over ${plural(data.dayCount, "day")}`,
    icon: "sort",
  });
  if (data.constraints[0]) {
    actions.push({
      type: "action",
      id: "constraint",
      label: "Check constraints",
      detail: `Does it respect “${clip(data.constraints[0], 28)}”?`,
      icon: "check",
    });
  }
  actions.push({
    type: "action",
    id: "export",
    label: "Send to calendar",
    detail: "As events with the times set",
    icon: "calendar",
  });
  return mix(controls, actions);
}

/* ── Generator ────────────────────────────────────────────────────────── */

/**
 * Midjourney's ideas, in words. Its codes (--sref numbers, --stylize, --chaos,
 * --style raw, --niji) only mean something to Midjourney's own model; an
 * OpenAI image model reads them as noise. So each look and dial is written
 * into the style text the prompt carries.
 */
const LOOKS = [
  { id: "raw", label: "Raw", style: "unstyled photograph, natural light, true to life" },
  { id: "cinematic", label: "Cinematic", style: "cinematic film still, anamorphic lens, soft grain, moody light" },
  { id: "anime", label: "Anime", style: "anime illustration, clean line art, cel shading, vivid colour" },
  { id: "editorial", label: "Editorial", style: "editorial photography, studio lighting, magazine styling" },
];
/** Stylize: how far the model may stray from a literal picture into its own taste. */
const STYLIZE = [
  "literal, minimal styling",
  "lightly stylised",
  "",
  "strongly stylised",
  "highly stylised, artistic liberties",
];
/** The Generator card's own style presets, which a look replaces. */
const CARD_STYLES = ["Photo", "Illustration", "3D render", "Watercolour", "Line art", "Film still"];

function stylizeIndex(style: string) {
  const index = STYLIZE.findIndex((phrase) => phrase && style.includes(phrase));
  return index >= 0 ? index : 2;
}

/** Variety across the three variations (Midjourney's chaos), as the existing creativity control. */
const VARIETY = [10, 40, 70, 95];

/** The style text with one part swapped: any phrase from `family` comes out and `phrase` goes in. */
function withStylePart(style: string, family: string[], phrase: string) {
  const parts = style
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !family.some((known) => known.split(", ").includes(part)));
  return [...parts, ...(phrase ? phrase.split(", ") : [])].join(", ");
}

export function generatorTools(data: GeneratorShellData): GeneratedTool<GeneratorShellData>[] {
  const { controls } = data;
  const variety = VARIETY.reduce(
    (best, value, index) => (Math.abs(value - controls.creativity) < Math.abs((VARIETY[best] ?? 0) - controls.creativity) ? index : best),
    0,
  );
  const setControls = (d: GeneratorShellData, patch: Partial<GeneratorShellData["controls"]>) => ({
    ...d,
    controls: { ...d.controls, ...patch },
  });

  const varietyTool: GeneratedTool<GeneratorShellData> = {
    type: "slider",
    id: "variety",
    label: "Variety",
    detail: "How different the three variations are from each other",
    icon: "sliders",
    min: { label: "Similar" },
    max: { label: "Wild" },
    steps: ["Similar", "Some", "Varied", "Wild"],
    value: variety,
    apply: (d, value) => setControls(d, { creativity: VARIETY[value] ?? d.controls.creativity }),
  };

  const controlTools: GeneratedTool<GeneratorShellData>[] =
    data.mode === "image"
      ? [
          {
            type: "choice",
            id: "look",
            label: "Look",
            detail: "A starting style, written into the prompt",
            icon: "image",
            options: LOOKS.map(({ id, label }) => ({ id, label })),
            value: LOOKS.find((look) => controls.style.includes(look.style))?.id ?? "",
            apply: (d, value) => {
              const look = LOOKS.find((option) => option.id === value);
              // A look replaces the base style (the card's own presets, or another look); stylize and mood stay.
              const bases = [...LOOKS.map((l) => l.style), ...CARD_STYLES];
              return look ? setControls(d, { style: withStylePart(d.controls.style, bases, look.style) }) : d;
            },
          },
          {
            type: "slider",
            id: "stylize",
            label: "Stylize",
            detail: "From a literal picture to the model's own taste",
            icon: "sliders",
            min: { label: "Literal" },
            max: { label: "Artistic" },
            steps: ["Literal", "Light", "Balanced", "Strong", "Max"],
            value: stylizeIndex(controls.style),
            apply: (d, value) => setControls(d, { style: withStylePart(d.controls.style, STYLIZE, STYLIZE[value] ?? "") }),
          },
          {
            type: "grid",
            id: "mood",
            label: "Mood",
            detail: "Colour and drama, written into the prompt",
            icon: "grid",
            x: { low: "Muted", high: "Vivid" },
            y: { low: "Calm", high: "Dramatic" },
            quadrants: ["Noir", "Epic", "Quiet", "Playful"],
            value: { x: 0.5, y: 0.5 },
            apply: (d, point) => {
              const names = ["noir mood, deep shadows", "epic mood, vivid dramatic light", "quiet mood, soft muted tones", "playful mood, bright cheerful colour"];
              const index = (point.y >= 0.5 ? 0 : 2) + (point.x >= 0.5 ? 1 : 0);
              return setControls(d, { style: withStylePart(d.controls.style, names, names[index] ?? "") });
            },
          },
          varietyTool,
          {
            type: "choice",
            id: "aspect",
            label: "Shape",
            detail: "The image's aspect ratio",
            icon: "image",
            options: [
              { id: "1:1", label: "Square" },
              { id: "3:2", label: "Wide" },
              { id: "2:3", label: "Tall" },
            ],
            value: controls.aspect,
            apply: (d, value) => setControls(d, { aspect: value as GeneratorShellData["controls"]["aspect"] }),
          },
        ]
      : [
          {
            type: "choice",
            id: "tone",
            label: "Tone",
            detail: "How it sounds",
            icon: "text",
            options: [...new Set([controls.tone, "Warm", "Bold", "Witty"])].slice(0, 3).map((tone) => ({ id: tone, label: tone })),
            value: controls.tone,
            apply: (d, value) => setControls(d, { tone: value }),
          },
          {
            type: "choice",
            id: "length",
            label: "Length",
            detail: "How long each variation is",
            icon: "scissors",
            options: [
              { id: "short", label: "Short" },
              { id: "medium", label: "Medium" },
              { id: "long", label: "Long" },
            ],
            value: controls.length,
            apply: (d, value) => setControls(d, { length: value as GeneratorShellData["controls"]["length"] }),
          },
          varietyTool,
        ];

  const chosen = data.variations.find((variation) => variation.id === data.chosen);
  const actions: GeneratedTool<GeneratorShellData>[] = [];
  if (data.variations.length) {
    actions.push(
      {
        type: "action",
        id: "vary-subtle",
        label: "Vary subtly",
        detail: chosen ? "Small changes to the one you chose" : "Small changes to the best of the three",
        icon: "sparkles",
      },
      {
        type: "action",
        id: "vary-strong",
        label: "Vary strongly",
        detail: "Same idea, a bolder take",
        icon: "sparkles",
      },
    );
  }
  actions.push({
    type: "action",
    id: "improve-prompt",
    label: "Improve the prompt",
    detail: data.mode === "image" ? "Add subject, light, lens and setting" : "Add audience, purpose and format",
    icon: "text",
  });
  if (data.references.length) {
    actions.push({
      type: "action",
      id: "describe",
      label: "Describe the reference",
      detail: "Turn the picture into prompt words",
      icon: "image",
    });
  }
  return mix(controlTools, actions);
}
