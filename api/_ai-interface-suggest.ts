import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError } from "./_shared.js";

/**
 * Suggestions for any interface, from the thread around it: what to add, each
 * as the thing itself where it would go (a column among the columns, a step
 * after the step it follows, a line in the notes). It reads the interface as
 * it is and the conversation's context (the Notes, the latest messages), so a
 * dinner for 8 with one vegetarian gets suggestions for that, not stock ones.
 */
export const maxDuration = 20;

/** What each interface can be offered, by suggestion group, and what one is. */
const OFFERS: Record<string, Record<string, string>> = {
  document: { text: "a next sentence or short paragraph that carries the writing on, placed after the paragraph it follows (by its opening words)" },
  notes: { text: "a line worth noting that isn't there yet: a fact to pin down, a decision to make, or what's next, as 'Label: value' or '[ ] Next step'" },
  search: { filters: "a short filter chip that sharpens the search (Past year, Reviews, Under £200)" },
  table: { columns: "a column this table would gain from, one to three words" },
  tracker: { items: "a thing to do that's missing, a few words in the imperative, placed after the item it follows and in its group" },
  schedule: {
    tasks: "a missing block of the day, a few words, placed after the task it follows",
    constraints: "a limit to plan around that the thread implies (Loft from 8am)",
  },
  guide: {
    steps: "a missing step, in the imperative, placed after the step it follows",
    needs: "a missing ingredient, part or piece of equipment, with its amount (2 tbsp tomato purée), placed after the item it follows and in its group",
  },
  generator: { tones: "a tone (Warm, Wry)", styles: "a style (Cinematic, Risograph)", lengths: "a length (One line, Under 6 words)" },
  moodboard: { notes: "a short note on the look (Soft daylight)" },
};

const suggestion = z.object({
  value: z.string(),
  after: z.string().optional().describe("The opening words of the existing item it goes after, when it belongs inside the content"),
  group: z.string().optional().describe("For a tracker item: the group it belongs in"),
});

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();
  const { kind, label, data, context, groups }: { kind?: string; label?: string; data?: unknown; context?: string; groups?: string[] } = await req.json();
  // Only what the interface shows at its size: a medium plus Guide draws its steps, not what you need.
  const all = kind ? OFFERS[kind] : undefined;
  const shown = all && groups?.length ? Object.fromEntries(Object.entries(all).filter(([group]) => groups.includes(group))) : all;
  const offers = shown && Object.keys(shown).length ? shown : undefined;
  if (!kind || !offers) return new Response(JSON.stringify({ suggested: {} }), { headers: { "content-type": "application/json" } });
  // One suggestion, always, in whichever of its kinds fits best: more than one is a lot to take in, and
  // leaving the model a way to offer nothing meant most interfaces showed none. Dismissing it is one tap.
  const schema = z.object({
    group: z.enum(Object.keys(offers) as [string, ...string[]]).describe(`Which kind: ${Object.entries(offers).map(([group, what]) => `${group}, ${what}`).join("; ")}.`),
    suggestion,
  });
  try {
    const { object } = await generateObject({
      model: openai(chatLabModel()),
      schema,
      providerOptions: { openai: { strictJsonSchema: false, reasoningEffort: "none" } },
      system: `Suggest the one most useful thing to add to this ${label ?? kind}, about what it holds: the next step in a recipe, a missing ingredient, the missing item on a list, the column a table needs. Read the thread only to make it fit (their guests, their dates, their diet); don't bring in things that belong elsewhere. Never suggest what it already has, in any wording. Check its parts against each other first: something a step uses that the list doesn't have, a gap between two steps, a column the rows imply. Specific, never a stock example. Plain words, no emoji.`,
      prompt: `The thread so far:\n${(context ?? "").slice(0, 6000) || "(nothing yet)"}\n\nThe ${label ?? kind} as it is now (JSON):\n${JSON.stringify(data).slice(0, 8000)}`,
    });
    const result = object as { group: string | null; suggestion: z.infer<typeof suggestion> | null };
    const suggested = result.group && result.suggestion?.value ? { [result.group]: [result.suggestion] } : {};
    return new Response(JSON.stringify({ suggested }), { headers: { "content-type": "application/json" } });
  } catch (error) {
    logAiError("interface-suggest", error);
    return new Response(JSON.stringify({ error: "Couldn't suggest" }), { status: 502, headers: { "content-type": "application/json" } });
  }
}
