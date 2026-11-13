import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError, logAiStart } from "./_shared.js";
import { paragraphTag } from "../src/features/generative-toolbar/model/paragraph-tags.js";

// Carries out a toolbar tool on one long text field (a Document's body) as
// edits to its numbered paragraphs, streamed as plain text:
//
//   SUMMARY: Added a closing section
//   REPLY: (optional, one paragraph for the chat)
//   ---
//   @replace 3
//   The new text of paragraph 3 (one or more paragraphs).
//   @after 7
//   A paragraph to add after paragraph 7.
//   @delete 2
//
// Paragraphs no edit names stay exactly as they are, so leaving something out
// can never lose it. No "---" means the body doesn't change.
export const maxDuration = 60;

type Body = {
  kind?: string;
  label?: string;
  title?: string;
  /** The field's text, split into paragraphs on blank lines, numbered from 0. */
  paragraphs?: string[];
  selection?: string | null;
  tool?: unknown;
  /** What using it asks for, in words ("Detail level: In depth"). */
  request?: string;
  /** The document's blanks, by key: what each asks and, once filled, the answer. */
  blanks?: Record<string, { ask?: string; value?: string }>;
};

const SYSTEM = `You carry out a tool the person just used on a document. You get its
paragraphs, each with its number (from 0) and a short tag, as [3#k7f], and the tool. Change the document to do what the
tool says, and nothing else.

Answer in exactly this shape, plain text, no code fences:
SUMMARY: what changed, under 60 characters
REPLY: only if there is something to tell them that isn't an edit; otherwise leave this line out
---
then your edits, each starting with a line of its own:
@replace N#tag   then the new text for paragraph N (it may become several paragraphs)
@after N#tag     then new paragraphs to add after paragraph N
@before 0        then new paragraphs to add at the very start
@delete N#tag    nothing after it; paragraph N goes
Copy the number and tag exactly as given ("@replace 3#k7f"); numbers always
mean the paragraphs as given to you, however many edits come before.

Paragraphs you don't name stay exactly as they are, so name only what changes.
An empty document has no paragraphs: write everything under one @before 0.

Before writing anything new, ask yourself what you would have to make up: how
many people, when, where, how much, for whom. Don't make those up: leave a
blank (below) for each. When the rest depends on them, write only an opening
that holds whatever they choose, with the blanks in it, and stop there. For
"Draft the plan" on an empty "Dinner party plan":
SUMMARY: Started the plan; needs the guest count and budget
---
@before 0
# Dinner party plan

A relaxed Saturday dinner for <blank>{"key":"guests","ask":"How many guests?","kind":"only_you","options":["4 people","6 people","8 people","12 people"],"placeholder":"how many","wait":true}</blank>, on a budget of about <blank>{"key":"budget","ask":"Budget for food and drink?","kind":"only_you","options":["£60","£100","£150","£250"],"placeholder":"how much","wait":true}</blank>.
Edits go in paragraph order. Write new text in Markdown like the rest. Most
tools change a few paragraphs; a tool about the whole document (tone, detail,
audience) may replace most of them, one @replace each.

A tool that checks, compares, explains or finds (anything whose answer is
information, not a change) never edits: write SUMMARY and REPLY and stop, with
no "---". Never use em dashes.

Blanks. You can leave a blank in what you write instead of making something
up. A blank is a slot inside a sentence that the person fills with a click;
whatever depends on it is then rewritten for them. Leave one exactly where you
would otherwise have to invent or quietly assume something that changes what
comes after:
- only_you: a fact only they know (how many guests, their budget, the venue).
- unsure: a few real candidates you can't choose between.
- yours: something that has to sound like them, or that they should decide.
Don't leave one for something a sensible default handles, and never more
than three. A small edit (tighten, add an example) usually needs none. New
writing (a draft, a plan, a new section) usually needs one to three: a menu
and shopping list hang on how many are coming; a budget hangs on what they
can spend. When most of it depends on such a fact, ask it first: open with a
sentence or two that holds whatever they choose, put the blank there with
wait true, and stop. When it hangs on several, ask them together in that
sentence and wait once. Write it inline, in the middle of the sentence, as
one tag holding one JSON object on one line:
<blank>{"key":"guests","ask":"How many guests?","kind":"only_you","options":["4 people","6 people","8 people","12 people"],"placeholder":"how many","wait":false}</blank>
- key: short, lowercase, unique in the document. ask: a few words.
- options: two to five answers, each reading naturally in the sentence in its place.
- placeholder: one to three words shown in the empty slot.
- wait: true when what comes after can't be written without it. Finish that
  paragraph, then stop all edits there; you carry on once it's filled.
A blank is always empty: never fill one yourself, and never state a value for
it elsewhere ("say, 8 people"). Never leave a gap in words ("room to fill in
the dates", "[your name]", "TBD"): whatever you'd leave for them is a blank,
with a few ways it could go as its options. Keep tags out of headings.

A {{key}} already in a paragraph is a blank the document has (listed below).
Keep it, exactly as written, in any paragraph you replace. To use a blank's
answer again later, write {{key}} where it goes.`;

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();
  const { kind, label, title, paragraphs = [], selection, tool, request, blanks = {} }: Body = await req.json();
  const blankLines = Object.entries(blanks).map(
    ([key, blank]) => `- {{${key}}}: ${blank.ask ?? ""} ${blank.value === undefined ? "(empty)" : `= "${blank.value}"`}`,
  );
  if (!request) return new Response(JSON.stringify({ error: "request is required" }), { status: 400 });

  logAiStart("toolbar-rewrite", `${kind} · ${request} · ${paragraphs.length} paragraphs`);
  try {
    const result = streamText({
      model: openai(chatLabModel()),
      system: SYSTEM,
      prompt: [
        paragraphs.length
          ? `The ${label ?? kind}${title ? `, "${title}"` : ""}, paragraph by paragraph:\n${paragraphs.map((paragraph, index) => `[${index}#${paragraphTag(paragraph)}] ${paragraph}`).join("\n\n")}`
          : `The ${label ?? kind}${title ? `, "${title}"` : ""} is empty.`,
        blankLines.length ? `\nIts blanks:\n${blankLines.join("\n")}` : "",
        `\nThe tool: ${JSON.stringify(tool ?? {})}`,
        `They used it as: ${request}`,
        selection?.trim() ? `It applies to the selected text: "${selection.trim().slice(0, 600)}"` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      abortSignal: req.signal,
      providerOptions: { openai: { reasoningEffort: "none" } },
      onError: ({ error }) => logAiError("toolbar-rewrite", error),
    });
    return result.toTextStreamResponse({ headers: { "cache-control": "no-store" } });
  } catch (error) {
    logAiError("toolbar-rewrite", error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}
