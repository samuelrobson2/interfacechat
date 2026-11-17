import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError } from "./_shared.js";

// The chat home: one small call once a request has been typed, naming the
// interface it opened (a request is often a long sentence, too long for a
// title) and, for the interfaces made of steps, the first few steps, which
// the card adds one by one as suggestions.
export const maxDuration = 20;

const TITLE_MAX_CHARS = 40;

/** Which interfaces get their first steps, and what a step is there. */
const STEPS: Record<string, string> = {
  guide: "four to six steps, in order, each a short instruction in the imperative, under eight words (\"Soften the onions in olive oil\")",
  schedule: "three to five tasks for the day, each a short name under five words (\"Load in at the pier\", \"Lunch\")",
};

const schemaFor = (kind: string) =>
  z.object({
    title: z.string().describe(`The interface's name: at most 5 words and ${TITLE_MAX_CHARS} characters, sentence case, no quotes or full stop.`),
    ...(STEPS[kind] ? { steps: z.array(z.string()).describe(STEPS[kind]!) } : {}),
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
  const { kind, label, prompt }: { kind?: string; label?: string; prompt?: string } = await req.json();
  const text = prompt?.trim().slice(0, 1200);
  if (!kind || !text) {
    return new Response(JSON.stringify({ error: "kind and prompt are required" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  try {
    const { object } = await generateObject({
      model: openai(chatLabModel()),
      schema: schemaFor(kind),
      system: `Someone is typing a request on a chat home, and it opened a ${label ?? kind} interface. Name the interface for what it holds, short, as its title would read (a recipe's dish, a plan's subject), not the request itself: "Fish stew for six", not "Give me a recipe for a fish stew for six people". ${STEPS[kind] ? "Then write its first steps, specific to the request, so the interface starts to fill in." : ""} Plain words, no emoji.`,
      prompt: text,
    });
    const steps = "steps" in object && Array.isArray(object.steps) ? (object.steps as string[]).map((step) => step.trim()).filter(Boolean).slice(0, 6) : [];
    return new Response(JSON.stringify({ title: fitTitle(object.title), steps }), { headers: { "content-type": "application/json" } });
  } catch (error) {
    logAiError("interface-title", error);
    return new Response(JSON.stringify({ error: "Couldn't name it" }), { status: 502, headers: { "content-type": "application/json" } });
  }
}
