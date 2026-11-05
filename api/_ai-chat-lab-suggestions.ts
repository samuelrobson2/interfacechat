import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError } from "./_shared.js";

// Chat Lab suggestion cards: starter prompts for the empty chat, and follow-ups
// for the latest assistant turn (pharos's /chat/suggestions and /followups).
export const maxDuration = 30;

const SuggestionsSchema = z.object({
  suggestions: z.array(z.string()).min(3).max(3),
});

type Turn = { role: "user" | "assistant"; text: string };

const STARTER_SYSTEM = `Write three short prompts a curious professional might
send to a general AI assistant to start a conversation. Vary them: one practical,
one analytical (something that could be answered with a small chart), one
creative. Each is a single sentence under 90 characters, written as the user would
type it. Never use em dashes.`;

const FOLLOWUP_SYSTEM = `Given a conversation, write three follow-up messages the
user is most likely to send next. Each must build on the latest assistant reply,
be specific to it, and differ from the others (go deeper, apply it, challenge
it). Write each as the user would type it, a single sentence under 90
characters. Never use em dashes.`;

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();

  const { kind, turns = [] }: { kind: "starter" | "followup"; turns?: Turn[] } =
    await req.json();

  // Long chats only need their recent context to suggest a next step.
  const transcript = turns
    .slice(-6)
    .map((turn) => `${turn.role.toUpperCase()}: ${turn.text.slice(0, 4000)}`)
    .join("\n\n");

  try {
    const { object } = await generateObject({
      model: openai(chatLabModel()),
      schema: SuggestionsSchema,
      system: kind === "starter" ? STARTER_SYSTEM : FOLLOWUP_SYSTEM,
      prompt:
        kind === "starter"
          ? "Write the three starter prompts."
          : `Conversation:\n\n${transcript}`,
    });

    return new Response(
      JSON.stringify({
        suggestions: object.suggestions.map((text, index) => ({
          id: `${kind}-${Date.now()}-${index}`,
          text,
        })),
      }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (error) {
    logAiError("chat-lab-suggestions", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
