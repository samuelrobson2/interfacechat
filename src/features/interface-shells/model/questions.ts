import { z } from "zod";
import type { GuideShellData, ScheduleShellData, ShellKind } from "./shell-types.js";

/**
 * Questions: when the model needs something from the person, it asks with a
 * tiny interface instead of a sentence, the smallest size in the system,
 * drawn in its reply. A few controls cover every question:
 *
 * - confirm: Yes · No · Something else (plain chat)
 * - choose: two to four chips, one or several, and Something else
 * - number: a stepper with a unit (8 people, 3 days)
 * - time: chips around the guess, and a picker
 * - date: Today, the next few days, and a picker
 * - duration: 30 min, 1 hour, Half day …
 * - text: one line
 *
 * Each interface declares the questions it can ask (QUESTION_FIELDS), each
 * bound to a field, so an answer goes straight into the interface (Serves 8
 * sets the Guide's Serves). Every question comes with the model's guess, so
 * confirming is one tap. Read by the app and the chat API, so it imports
 * nothing but zod (and types).
 */

export const QUESTION_CONTROLS = ["confirm", "choose", "number", "time", "date", "duration", "text"] as const;
export type QuestionControl = (typeof QUESTION_CONTROLS)[number];

export type AnswerValue = string | number | string[];

export type Question = {
  /** The interface it's for (its id in the thread), or "chat" for a plain question. */
  for: string;
  /** The field it fills, from the interface's QUESTION_FIELDS; none for chat. */
  field?: string;
  /** Short, as a label: Guests, Start, Diet. */
  label: string;
  /** The question itself, short. */
  ask: string;
  control: QuestionControl;
  options?: string[];
  multi?: boolean;
  guess?: AnswerValue;
  unit?: string;
  min?: number;
  max?: number;
};

type Write = (data: unknown, value: AnswerValue) => unknown;
type Field = Pick<Question, "label" | "control" | "options" | "multi" | "unit" | "min" | "max"> & {
  /** The answer, written into the interface's data. */
  write: Write;
};

const text = (value: AnswerValue) => (Array.isArray(value) ? value.join(", ") : String(value));
const toHours = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) + (m ?? 0) / 60;
};

/** A Guide's fact, set or added: Serves 8, Time 1 hour, Diet Vegetarian. */
const setFact = (label: string) => (data: GuideShellData, value: AnswerValue): GuideShellData => {
  const at = data.facts.findIndex((fact) => fact.label.toLowerCase() === label.toLowerCase());
  const fact = { label, value: text(value) };
  return { ...data, facts: at >= 0 ? data.facts.map((entry, i) => (i === at ? fact : entry)) : [...data.facts, fact] };
};

/** The questions each interface can ask, by field. */
export const QUESTION_FIELDS: Partial<Record<ShellKind, Record<string, Field>>> = {
  guide: {
    serves: { label: "Serves", control: "number", unit: "people", min: 1, max: 60, write: setFact("Serves") as unknown as Write },
    time: { label: "Time", control: "duration", options: ["30 min", "1 hour", "2 hours", "Half day"], write: setFact("Time") as unknown as Write },
    diet: { label: "Diet", control: "choose", multi: true, options: ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free"], write: setFact("Diet") as unknown as Write },
  },
  schedule: {
    date: { label: "Date", control: "date", write: ((data: ScheduleShellData, value: AnswerValue) => (/^\d{4}-\d{2}-\d{2}$/.test(text(value)) ? { ...data, start: text(value) } : data)) as unknown as Write },
    start: { label: "Start", control: "time", write: ((data: ScheduleShellData, value: AnswerValue) => ({ ...data, hours: [toHours(text(value)), data.hours[1]] as [number, number] })) as unknown as Write },
    end: { label: "End", control: "time", write: ((data: ScheduleShellData, value: AnswerValue) => ({ ...data, hours: [data.hours[0], toHours(text(value))] as [number, number] })) as unknown as Write },
    days: { label: "Days", control: "number", unit: "days", min: 1, max: 14, write: ((data: ScheduleShellData, value: AnswerValue) => ({ ...data, dayCount: Math.max(1, Math.round(Number(value) || 1)) })) as unknown as Write },
  },
};

/** What an interface can be asked, for the model: "serves (number of people), time (duration)". */
export function askableFields(kind: ShellKind) {
  return Object.entries(QUESTION_FIELDS[kind] ?? {}).map(([key, field]) => `${key} (${field.control}${field.unit ? `, ${field.unit}` : ""})`);
}

/** The ask tool's input: one to three questions, each with a guess. */
export const askInputSchema = z.object({
  questions: z
    .array(
      z.object({
        for: z.string().describe('The id of the interface it fills, or "chat" for a plain question'),
        field: z.string().optional().describe("The field it fills, from that interface's askable fields; or a short label for a fact to note"),
        label: z.string().describe("Short: Guests, Start, Diet"),
        ask: z.string().describe("The question in five words or fewer, no unit or example in it: How many guests? What time? Any diet needs?"),
        control: z.enum(QUESTION_CONTROLS).describe("confirm (yes or no), choose (options), number, time, date, duration, or text"),
        options: z.array(z.string()).optional().describe("For choose and duration: two to four options, one or two words each"),
        multi: z.boolean().optional().describe("For choose: several can be picked"),
        guess: z.union([z.string(), z.number(), z.array(z.string())]).optional().describe('Your best guess, pre-selected: 8, "19:00", "2026-11-28", ["Vegetarian"], "Yes"'),
        unit: z.string().optional().describe("For number: people, days, guests"),
      }),
    )
    .min(1)
    .max(3),
});

/**
 * The questions as they'll be drawn: one bound to a declared field takes that
 * field's control, unit and options; a plain one keeps what the model gave.
 * Questions for interfaces not in play are dropped.
 */
export function normalizeQuestions(input: unknown, targets: { id: string; kind: ShellKind }[]): Question[] {
  const parsed = askInputSchema.safeParse(input);
  if (!parsed.success) return [];
  return parsed.data.questions.flatMap((raw) => {
    const target = targets.find((entry) => entry.id === raw.for);
    if (raw.for !== "chat" && !target) return [];
    const declared = target && raw.field ? QUESTION_FIELDS[target.kind]?.[raw.field] : undefined;
    const question: Question = {
      for: raw.for,
      ...(raw.field ? { field: raw.field } : {}),
      label: raw.label,
      ask: raw.ask,
      control: declared?.control ?? raw.control,
      ...((raw.options ?? declared?.options) ? { options: raw.options?.length ? raw.options : declared?.options } : {}),
      ...((raw.multi ?? declared?.multi) ? { multi: true } : {}),
      ...(raw.guess !== undefined ? { guess: raw.guess } : {}),
      ...((declared?.unit ?? raw.unit) ? { unit: declared?.unit ?? raw.unit } : {}),
      ...(declared?.min !== undefined ? { min: declared.min } : {}),
      ...(declared?.max !== undefined ? { max: declared.max } : {}),
    };
    return [question];
  });
}

/** An answer written into the interface it's for, when the field is one it declares. */
export function writeAnswer(kind: ShellKind, data: unknown, field: string | undefined, value: AnswerValue): unknown {
  const declared = field ? QUESTION_FIELDS[kind]?.[field] : undefined;
  return declared ? declared.write(data, value) : data;
}

/** An answer in words: "8 people", "7:00 pm", "Vegetarian, Gluten-free". */
export function answerText(question: Pick<Question, "control" | "unit">, value: AnswerValue): string {
  if (question.control === "number") return `${value}${question.unit ? ` ${question.unit}` : ""}`;
  if (question.control === "time" && typeof value === "string" && /^\d{1,2}:\d{2}$/.test(value)) {
    const hours = toHours(value);
    const h = Math.floor(hours) % 12 || 12;
    const m = Math.round((hours % 1) * 60);
    return `${h}${m ? `:${String(m).padStart(2, "0")}` : ""} ${hours >= 12 ? "pm" : "am"}`;
  }
  if (question.control === "date" && typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }
  return text(value);
}

/** A plain-chat reply that ends in a yes-or-no question: offered Yes · No · Something else even without the tool. */
export function trailingYesNo(reply: string): string | null {
  // Bold and italics around it aren't part of the question.
  const plain = reply.replace(/\*+/g, "").trim();
  const last = plain.split(/(?<=[.!?])\s+/).at(-1) ?? "";
  if (!last.endsWith("?")) return null;
  // Asks for a yes or a no, and doesn't offer alternatives ("the tart or the lasagne?").
  if (/\bor\b/i.test(last)) return null;
  return /^(?:do|does|did|would|should|shall|can|could|will|want|is|are|was|were|have|has|may|need)\b/i.test(last) ? last : null;
}
