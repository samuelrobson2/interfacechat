import { QUESTION_FIELDS, writeAnswer, type SuggestedValues } from "@/features/interface-shells";
import type { KindData } from "./home-tiles";
import type { PromptChoice } from "./prompt-choices";
import { joinList } from "./prompt-fields";
import type { HomeCard } from "./use-home-field";

/** A picked choice as a line of notes: "Guests: 6 to 8", from the choice's own words. */
function pickedLine(choice: PromptChoice & { picked?: string[] }, orGuess = false) {
  // Left alone, a choice goes with its guess: "whatever they ignore, you go with".
  const picked = choice.picked?.length ? choice.picked : orGuess ? choice.guess : [];
  if (!picked.length) return null;
  const labels = joinList(picked);
  if (choice.lead) return `${choice.lead.charAt(0).toUpperCase()}${choice.lead.slice(1)} ${labels}`;
  const phrases = picked.map((label) => choice.options.find((option) => option.label === label)?.phrase ?? label);
  const line = phrases.join(", ");
  return line.charAt(0).toUpperCase() + line.slice(1);
}

/**
 * The card's notes, with a line for each choice picked that isn't in them yet;
 * and, when sending (`orGuess`), each choice left alone at its guess too, so
 * nothing on the card is asked again.
 */
export function withPickedLines(card: HomeCard, shown: (PromptChoice & { picked?: string[]; skipped?: boolean })[], orGuess = false): HomeCard {
  const data = card.interface.data as { title: string; body: string };
  const have = new Set(data.body.split("\n").map((line) => line.trim().toLowerCase()));
  const lines = shown.map((choice) => (choice.skipped ? null : pickedLine(choice, orGuess))).filter((line): line is string => Boolean(line) && !have.has(line!.toLowerCase()));
  if (!lines.length) return card;
  return { ...card, interface: { kind: "notes", data: { ...data, body: [data.body.replace(/\s+$/, ""), ...lines].filter(Boolean).join("\n") } } as KindData };
}

type CardChoice = PromptChoice & { picked?: string[]; skipped?: boolean };

/** A choice's answer: what they picked, or the guess they left alone. None when passed over. */
const answerOf = (choice: CardChoice) => (choice.skipped ? [] : choice.picked?.length ? choice.picked : choice.guess);
/** Its question as a label: "Dietary limits?" → "Dietary limits". */
const labelOf = (choice: CardChoice) => {
  const label = choice.ask.replace(/\?+$/, "").trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
};
const phrasesOf = (choice: CardChoice, labels: string[]) => labels.map((label) => choice.options.find((option) => option.label === label)?.phrase ?? label);
const addOnce = (list: string[], values: string[]) => [...list, ...values.filter((value) => !list.some((have) => have.trim().toLowerCase() === value.trim().toLowerCase()))];

/**
 * Where a settled choice goes in each interface, so what was chosen on the card
 * is in the interface itself, as it would be had they typed it there:
 * - notes: a line (withPickedLines)
 * - guide: a fact beside Serves and Time (Dietary limits: Vegetarian)
 * - schedule: a limit to plan around (Pace: Relaxed)
 * - search: a filter chip (Compare options)
 * - generator: words in the prompt (… for an Instagram post)
 * A choice that names one of the interface's own fields (QUESTION_FIELDS) fills
 * that field instead. Interfaces with no such place (a document, a table, a
 * checklist) carry their choices as context with the rest of the brief.
 */
const CHOICE_PLACES: Partial<Record<string, (data: never, choice: CardChoice, answer: string[]) => unknown>> = {
  guide: (data: { facts: { label: string; value: string }[] }, choice, answer) => {
    const label = labelOf(choice);
    const fact = { label, value: joinList(answer) };
    const at = data.facts.findIndex((entry) => entry.label.toLowerCase() === label.toLowerCase());
    return { ...data, facts: at >= 0 ? data.facts.map((entry, i) => (i === at ? fact : entry)) : [...data.facts, fact] };
  },
  schedule: (data: { constraints: string[] }, choice, answer) => ({ ...data, constraints: addOnce(data.constraints, [`${labelOf(choice)}: ${joinList(answer)}`]) }),
  search: (data: { filters: string[] }, _choice, answer) => ({ ...data, filters: addOnce(data.filters, answer) }),
  generator: (data: { title: string }, choice, answer) => {
    const phrase = choice.lead ? `${choice.lead} ${joinList(phrasesOf(choice, answer))}` : phrasesOf(choice, answer).join(", ");
    return data.title.toLowerCase().includes(phrase.toLowerCase()) ? data : { ...data, title: `${data.title.replace(/[\s.]+$/, "")} ${phrase}` };
  },
};

/** The choices written into the interface, wherever it keeps them. */
export function withChoices(kind: string, data: unknown, choices: CardChoice[]): unknown {
  return choices.reduce((current, choice) => {
    const answer = answerOf(choice);
    if (!answer.length) return current;
    if (QUESTION_FIELDS[kind as keyof typeof QUESTION_FIELDS]?.[choice.key]) return writeAnswer(kind as never, current, choice.key, choice.multi ? answer : answer[0]!);
    const place = CHOICE_PLACES[kind];
    return place ? place(current as never, choice, answer) : current;
  }, data);
}

/**
 * The card as it's sent: as they see it. Every choice goes with it, picked,
 * passed over ("No preference") or left at its guess, and so does every value
 * the card shows in place of an answer (a Guide's Serves 4): each is settled,
 * so none is asked again. Each choice is written where the interface keeps it
 * (CHOICE_PLACES: a line of notes, a Guide's fact, a Schedule's limit), and a
 * shown value into the field it stands in (QUESTION_FIELDS). What it
 * only offers (suggested steps, columns) goes along as context, not as content.
 */
export function sendCard(card: HomeCard, choices: CardChoice[], suggested: SuggestedValues): { interface: KindData; brief?: string } {
  const kind = card.interface.kind;
  const settled = choices.map((choice) => {
    const ask = choice.ask.replace(/\?$/, "");
    if (choice.picked?.length) return `${ask}: ${joinList(choice.picked)}`;
    if (choice.skipped) return `${ask}: no preference`;
    return choice.guess.length ? `${ask}: ${joinList(choice.guess)} (the suggested answer, left as is)` : null;
  });
  let data: unknown = card.interface.data;
  const offered: string[] = [];
  for (const [group, values] of Object.entries(suggested)) {
    const words = (values ?? []).map((value) => (typeof value === "string" ? value : value.value)).filter((value) => value.trim());
    if (!words.length) continue;
    const field = QUESTION_FIELDS[kind]?.[group];
    if (field) {
      data = writeAnswer(kind, data, group, words[0]!);
      settled.push(`${field.label}: ${words[0]} (the suggested answer, left as is)`);
    } else offered.push(`${group}: ${words.join("; ")}`);
  }
  const sent: HomeCard = { ...card, interface: { kind, data: kind === "notes" ? data : withChoices(kind, data, choices) } as KindData };
  const given = settled.filter(Boolean);
  const brief = [
    given.length ? `Settled on the home card, so don't ask about these again: ${given.join("; ")}` : "",
    offered.length ? `Offered on the card, not added: ${offered.join(" | ")}` : "",
  ].filter(Boolean).join("\n");
  return { interface: (kind === "notes" ? withPickedLines(sent, choices, true) : sent).interface, ...(brief ? { brief } : {}) };
}
