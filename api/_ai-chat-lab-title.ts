import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError } from "./_shared.js";

// Chat Lab thread titles: short enough to show in full in the threads rail.
export const maxDuration = 30;

const TITLE_MAX_CHARS = 28;

const TitleSchema = z.object({ title: z.string() });

const TITLE_SYSTEM = `Name a chat from its first message. Write a title of at
most 4 words and ${TITLE_MAX_CHARS} characters as an action in progress, title
case, starting with a present participle. For example "Prioritising Weekly
Tasks" or "Drafting Launch Email". Do not write a noun phrase such as "weekly
task prioritisation". No quotes, no trailing punctuation, no emoji, no em
dashes.`;

const fitTitle = (title: string) => {
  const clean = title
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/[.!?:;,]+$/, "")
    .trim();
  if (clean.length <= TITLE_MAX_CHARS) return clean;
  // Over the limit despite the prompt: drop whole words until it fits.
  const words = clean.split(/\s+/);
  while (words.length > 1 && words.join(" ").length > TITLE_MAX_CHARS) {
    words.pop();
  }
  return words.join(" ");
};

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();

  const { message }: { message?: string } = await req.json();
  const text = message?.trim().slice(0, 2000);
  if (!text) {
    return new Response(JSON.stringify({ error: "message is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const { object } = await generateObject({
      model: openai(chatLabModel()),
      schema: TitleSchema,
      system: TITLE_SYSTEM,
      prompt: text,
    });

    return new Response(JSON.stringify({ title: fitTitle(object.title) }), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    logAiError("chat-lab-title", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
