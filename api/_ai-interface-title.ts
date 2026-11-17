import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError } from "./_shared.js";

// The chat home: one small call once a request has been typed. The card
// names itself from the request without the model; this only condenses a
// name that came out very long, and, for the interfaces made of steps, writes
// the first few steps, which the card adds one by one as suggestions. Each is
// asked for only when it's wanted.
export const maxDuration = 20;

const TITLE_MAX_CHARS = 40;

/** Which interfaces get their first steps, and what a step is there. */
const STEPS: Record<string, string> = {
  guide: "four to six steps, in order, each a short instruction in the imperative, under eight words (\"Soften the onions in olive oil\")",
  schedule: "three to five tasks for the day, each a short name under five words (\"Load in at the pier\", \"Lunch\")",
};

const schemaFor = (kind: string, want: { title: boolean; steps: boolean }) =>
  z.object({
    ...(want.title ? { title: z.string().describe(`The interface's name: at most 5 words and ${TITLE_MAX_CHARS} characters, sentence case, no quotes or full stop.`) } : {}),
    ...(want.steps && STEPS[kind] ? { steps: z.array(z.string()).describe(STEPS[kind]!) } : {}),
  });

const fitTitle = (title: string) => {
  const clean = title.trim().replace(/^["'“”]+|["'“”]+$/g, "").replace(/[.!?:;,]+$/, "").trim();
  if (clean.length <= TITLE_MAX_CHARS) return clean;
  const words = clean.split(/\s+/);
  while (words.length > 1 && words.join(" ").length > TITLE_MAX_CHARS) words.pop();
  return words.join(" ");
};

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();
  const { kind, label, prompt, want: asked }: { kind?: string; label?: string; prompt?: string; want?: { title?: boolean; steps?: boolean } } = await req.json();
  const want = { title: asked?.title !== false, steps: asked?.steps !== false && Boolean(kind && STEPS[kind]) };
  const text = prompt?.trim().slice(0, 1200);
  if (!kind || !text) {
    return new Response(JSON.stringify({ error: "kind and prompt are required" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  if (!want.title && !want.steps) return new Response(JSON.stringify({ steps: [] }), { headers: { "content-type": "application/json" } });
  try {
    const { object } = await generateObject({
      model: openai(chatLabModel()),
      schema: schemaFor(kind, want),
      // Fast over thorough: a name and a few steps need no reasoning.
      providerOptions: { openai: { strictJsonSchema: false, reasoningEffort: "none" } },
      system: `Someone is typing a request on a chat home, and it opened a ${label ?? kind} interface. ${want.title ? `Name the interface for what it holds, short, as its title would read (a recipe's dish, a plan's subject), not the request itself: "Fish stew for six", not "Give me a recipe for a fish stew for six people". ` : ""}${want.steps ? "Write its first steps, specific to the request, so the interface starts to fill in. " : ""}Plain words, no emoji.`,
      prompt: text,
    });
    const result = object as { title?: string; steps?: unknown };
    const steps = Array.isArray(result.steps) ? (result.steps as string[]).map((step) => String(step).trim()).filter(Boolean).slice(0, 6) : [];
    return new Response(JSON.stringify({ ...(result.title ? { title: fitTitle(result.title) } : {}), steps }), { headers: { "content-type": "application/json" } });
  } catch (error) {
    logAiError("interface-title", error);
    return new Response(JSON.stringify({ error: "Couldn't name it" }), { status: 502, headers: { "content-type": "application/json" } });
  }
}
