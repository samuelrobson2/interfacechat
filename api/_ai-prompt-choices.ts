import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError, logAiStart } from "./_shared.js";

// While someone types a request on the chat home, the few choices their
// request leaves open that would most change what they get: who a document
// is for, what it should do, what it covers. Each comes with options and a
// guess; picking one adds a short phrase to their prompt. The card shows at
// most three, so the model is asked for few, and none when the request is clear.
//
// The client holds the choices already shown, by key. This answers with
// changes only, streamed as NDJSON, one line each:
//   {"drop":["key"]}  {"choice":{...}}  {"score":{"key":"…","impact":4,"said":0.2}}
//   {"done":{"ms":1234}}  or  {"error":"…"}
export const maxDuration = 30;

/** What most often changes the result, per interface: the model's checklist. */
const FORKS: Record<string, string> = {
  document: `For a document, these are what usually change the result; use them as a checklist,
not a script, and skip any their words already settle:
- audience: who will read it (leadership, the team, customers, a marker).
- purpose: what it has to achieve (get a decision, align people, persuade, inform).
- form: what kind of document and how long (a one-pager, a memo, a full report).
- coverage: what it must cover; several can hold at once (multi).
- voice: how it should sound (formal, plain and direct, warm).
- fact: one thing only they know that the writing hangs on (a date, a number, their main experience).
What matters depends on the kind of document. Think about what really varies for this one:
- an essay: the level (school, university, a general reader), the stance it argues, the length.
- a cover letter: what to lead with (their strongest experience), the tone, the length.
- a plan or proposal: who it's for, what decision it needs, what it covers.
- an email or message: who to, what they need to do, the tone.`,
};

// Loose on purpose: the SDK's check of a partial reply never throws the set away; the server trims.
const optionSchema = z.object({
  label: z.string().describe("One to three words, as it shows on the chip: 'Leadership'."),
  phrase: z.string().describe("How it reads added to their request, lowercase, no full stop: 'for the leadership team'."),
});
const choiceSchema = z.object({
  key: z.string().describe("Short and stable, e.g. 'audience'. Reuse a key from the table to change that choice."),
  kind: z.string().describe("audience, purpose, form, coverage, voice or fact."),
  ask: z.string().describe("The question, two to four words: 'Who it's for'."),
  options: z.array(optionSchema).describe("Two to four, the likeliest first."),
  guess: z.array(z.string()).describe("Labels of the option(s) you'd go with if they don't choose."),
  multi: z.boolean().describe("True when several options can hold at once (coverage)."),
  lead: z.string().optional().describe("For multi: the words before the picked items in their request, e.g. 'covering'."),
  impact: z.number().describe("1 to 5: how much a wrong guess would change what they get."),
  said: z.number().describe("0 to 1: how fully their own words already settle it."),
});
const diffSchema = z.object({
  drop: z.array(z.string()).describe("Keys of choices that no longer apply to their request."),
  scores: z
    .array(z.object({ key: z.string(), impact: z.number(), said: z.number() }))
    .describe("Fresh scores for choices in the table that stay exactly as they are."),
  add: z.array(choiceSchema).describe("Choices that are new, or changed (written again under their key)."),
});

type Row = { key?: string; ask?: string; picked?: string[] };

const SYSTEM = (kind: string, label: string) => `You are the listening half of an assistant. While someone types a request for a
${label}, you work out the few things the result would otherwise have to guess on
their behalf, and the app shows those as choices on a small card beside their
request. Each has a few options and your guess. They glance, and fix the one you
got wrong with a click; picking one adds a short phrase to their request, so it
also teaches them what a better request says. Whatever they ignore, you go with.

${FORKS[kind] ?? FORKS.document}

Be sparing; the card has room for three. A choice earns its place only when a
wrong guess would really change what they get, their words don't already settle
it, and a glance is enough to fix it. Never write a choice their words already
answer (a cover letter's form, an essay's purpose): leave it out. A short or
broad request ("Write an essay on trees") usually leaves two or three real forks
open; a detailed one leaves fewer; one that settles everything gets none. Never
ask about the topic itself, or anything they're likely to type next.

Options are specific to this request, not generic: for a launch plan, "Leadership",
"The launch team", "Customers"; never "Option A" or "Other". Each label is one to
three words; each phrase reads naturally added to their request ("for the
leadership team", "as a one-page memo"). For coverage (multi), the phrases are
noun phrases ("the timeline", "risks") and lead joins them ("covering").

You are updating a table that already exists. Write a choice out in full only
when it's new or its options need to change; to change one, write it again
under its key. For the rest give fresh scores. Drop a choice only when their
words give you a reason (they now say it themselves, or the request changed).
Rows marked picked are settled: leave them out entirely. Keep it calm: what is
on screen shouldn't shuffle while they type. Be quick. Never use em dashes.`;

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();
  const { kind = "document", label = "Document", prompt = "", table = [] }: { kind?: string; label?: string; prompt?: string; table?: Row[] } =
    await req.json();
  const known = new Set(table.map((row) => row.key));
  const picked = new Set(table.filter((row) => row.picked?.length).map((row) => row.key));
  const started = logAiStart("prompt-choices", `${kind} · ${table.length} rows · "${prompt.slice(0, 60)}"`);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (line: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`));
      const sent = { drop: 0, scores: 0, add: 0 };
      const flush = (partial: { drop?: unknown[]; scores?: unknown[]; add?: unknown[] }, final: boolean) => {
        const ready = (list?: unknown[]) => (list ? (final ? list.length : list.length - 1) : 0);
        const drops = (partial.drop ?? []).slice(sent.drop, ready(partial.drop));
        sent.drop += drops.length;
        const ids = drops.filter((key): key is string => typeof key === "string" && known.has(key) && !picked.has(key));
        if (ids.length) send({ drop: ids });
        for (const raw of (partial.scores ?? []).slice(sent.scores, ready(partial.scores))) {
          sent.scores += 1;
          const row = raw as { key?: unknown; impact?: unknown; said?: unknown };
          if (typeof row.key === "string" && known.has(row.key) && !picked.has(row.key)) send({ score: row });
        }
        for (const raw of (partial.add ?? []).slice(sent.add, ready(partial.add))) {
          sent.add += 1;
          const row = raw as { key?: unknown };
          if (typeof row.key === "string" && !picked.has(row.key)) send({ choice: raw, ms: Date.now() - started });
        }
      };
      try {
        const result = streamText({
          model: openai(chatLabModel()),
          output: Output.object({ schema: diffSchema }),
          system: SYSTEM(kind, label),
          prompt: [
            `Their request so far: "${prompt.trim().slice(0, 2000)}"`,
            `The table now (${table.length ? `${table.length} rows` : "empty"}): ${JSON.stringify(table)}`,
          ].join("\n"),
          abortSignal: req.signal,
          providerOptions: { openai: { strictJsonSchema: false, reasoningEffort: "none" } },
        });
        let last: Parameters<typeof flush>[0] = {};
        for await (const partial of result.partialOutputStream) {
          last = partial as typeof last;
          flush(last, false);
        }
        flush(last, true);
        send({ done: { ms: Date.now() - started } });
      } catch (error) {
        if (!req.signal.aborted) {
          logAiError("prompt-choices", error);
          send({ error: error instanceof Error ? error.message : String(error) });
        }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson", "cache-control": "no-store" } });
}
