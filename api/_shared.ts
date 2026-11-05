// Shared config for the interface builder/editor functions.
//
// Files prefixed with `_` are NOT treated as routes by Vercel, so this is a
// plain module both functions import.

// OpenAI model (used via @ai-sdk/openai with OPENAI_API_KEY), matching api/_ai-chat-lab.ts.
export const MODEL = "gpt-5.4-mini";

// How long a generation may stream for (seconds).
export const MAX_DURATION = 60;

/**
 * The structural contract the model MUST follow regardless of the user-editable
 * brief. It's always appended server-side so editing the prompt can never break
 * the renderer or the editing tools (which key off these markers).
 */
export const HTML_CONTRACT = `
OUTPUT CONTRACT (always follow, this overrides any conflicting instruction):
- Output a single self-contained HTML fragment and NOTHING else. No markdown, no
  code fences, no commentary, no <html>/<head>/<body> wrappers. Start your reply
  with the first HTML tag.
- Style exclusively with Tailwind utility classes on the elements. Do not emit
  <style> tags, <script> tags, event handler attributes (onclick, etc.), <iframe>,
  <form>, or external resources (no <img src> to remote URLs, no <link>).
- Wrap every distinct, self-contained UI component (a card, a panel, a tab, a row
  of stats, a list item that reads as a unit) in a div with a data-component
  attribute naming it, e.g. <div data-component="Revenue panel"> ... </div>.
  Components may nest. Keep names short and human readable.
- ALSO wrap any list/feed/container that holds repeated items in its own
  data-component (e.g. <div data-component="Conversation">, <div
  data-component="Account list">). This makes the container addressable so items
  can be added, removed, or reordered by regenerating that one container.
- Give every repeated/list item a stable, unique data-key (e.g. data-key="msg-3",
  data-key="row-acme"). Keys identify items across edits so the UI can update in
  place: when you edit a list, KEEP the existing data-key on every item you retain
  and only mint a new unique data-key for genuinely new items.
- Put a data-editable attribute on every element whose text the user might want to
  edit (headings, labels, values, descriptions). Editable elements should contain
  text directly, not other components.
- Build charts and visualizations out of divs/spans (e.g. bars with height/width
  classes), never images or canvas.
- The fragment is rendered into a flex container that fills a window; make the root
  a single element that lays out its children responsibly (flex/grid, gaps, padding).
`.trim();

/**
 * Visual language shared by builder and editor — Adaption's design system
 * (see design.md). Keep this faithful so generated/edited HTML looks on-brand.
 */
export const DESIGN_SYSTEM = `
ADAPTION DESIGN SYSTEM (follow faithfully):

Theme: a clean, airy LIGHT theme only. Page and card backgrounds are light
(bg-background-primary, bg-background-secondary, or gray-1). Never use dark fills
(gray-4/gray-5) as a background unless the user explicitly asks for dark mode.

Colors — use ONLY Adaption's Tailwind tokens. NEVER use default Tailwind palette
colors (no red-500, blue-600, slate-*, etc.), arbitrary hex, or rgb/hsl strings.
- Neutrals: gray-1 (light bg), gray-2 (hairlines/disabled), gray-3 (secondary
  text/icons), gray-6 (filled input bg). Semantic: text-typography-primary,
  text-typography-secondary, bg-background-primary, bg-background-secondary,
  border-stroke-primary/secondary.
- Accent (use sparingly, functionally): blue-5 (#1a84ae) for interaction, links,
  active/selected states; orange-5 amber for attention, pending states and
  warnings; red-5 for danger and errors; green-5 for positive/success/growth.
  Secondary accents: rose-1..3, mint-1..3. Tints like blue-1 / red-5/10 for soft
  fills and badges.

Typography: the brand typeface is "STK Bureau Sans" (font-bureau). Default to
font-light (300); 400 for body/labels; use font-medium (500) only for true
emphasis. Never font-semibold / font-bold. Sizes: h1 40px, h2 28px, h3 24px,
title 20px, body 16px, label 14px, caption 12px. Section labels are small,
uppercase, tracking-wide, in typography-secondary.

Geometry & materiality: rounded-[12px] or rounded-[14px] cards/panels/charts;
buttons are pill (rounded-full) or sharp, nothing in between. Thin hairline
borders (the hairline utility with [--hairline-radius], or border-gray-2/60),
never heavy. Soft, low-contrast, lightly offset shadows only (e.g.
shadow-[0_1px_3px_rgba(20,18,30,0.06)]); never hard/heavy shadows. Generous
whitespace; use gap-* between children (gap-2 tight, gap-4 fields, gap-5/6
sections), not margins. 4px spacing scale.

Build charts/visualizations from divs/spans (bars via height/width classes),
never images. Never use em dashes; use commas, colons, or separate sentences.
Never invent real-looking data the user did not ask for; use plausible placeholders.
`.trim();

/** Fallback brief if the client doesn't send an editable one. */
export const FALLBACK_BUILDER_BRIEF = `
You are Adaption's interface builder. Given a short goal, design a single polished
product interface (a dashboard or tool) that would help accomplish it.
`.trim();

export const FALLBACK_EDITOR_BRIEF = `
You are Adaption's interface editor. You revise an existing generated interface in
response to targeted change requests, making the smallest change that satisfies the
request while preserving everything else exactly as-is.
`.trim();

// --- observability: log what the AI is doing to the server console ---
// Under `pnpm dev` the functions run inside the Vite process, so these print to
// the same terminal. Each call logs: the request, then on completion the finish
// reason, output size, token usage and latency (or the error).

export function logAiStart(label: string, detail: string): number {
  console.log(`\n▸ [ai:${label}] ${detail}`);
  return Date.now();
}

export function logAiFinish(
  label: string,
  startedAt: number,
  e: {
    text: string;
    finishReason: string;
    totalUsage: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
  },
): void {
  const ms = Date.now() - startedAt;
  const u = e.totalUsage;
  console.log(
    `✓ [ai:${label}] ${ms}ms · finish=${e.finishReason} · out=${e.text.length} chars · tokens in/out/total=${u.inputTokens ?? "?"}/${u.outputTokens ?? "?"}/${u.totalTokens ?? "?"}`,
  );
}

export function logAiError(label: string, error: unknown): void {
  console.error(`✗ [ai:${label}]`, error);
}

/** True when the OpenAI key isn't configured. */
export function apiKeyMissing(): boolean {
  return !process.env.OPENAI_API_KEY;
}

export function configError(): Response {
  return new Response(
    JSON.stringify({
      error: "OPENAI_API_KEY is not set on the server.",
    }),
    { status: 500, headers: { "content-type": "application/json" } },
  );
}
