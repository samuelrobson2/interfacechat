import { openai } from "@ai-sdk/openai";
import { generateImage, generateObject, type UserContent } from "ai";
import { z } from "zod";
import { chatLabModel } from "./_chat-lab.js";
import { apiKeyMissing, configError, logAiError, logAiStart } from "./_shared.js";

// The Generator interface and the Canvas: variations of text, an image, an
// SVG drawing or an HTML component, from a prompt, reference images or both,
// shaped by the card's controls. A drawing or component can be revised by
// sending it back as `source`. Three images can take most of a minute.
export const maxDuration = 120;

const IMAGE_MODEL = "gpt-image-1-mini";
const VARIATIONS = 3;
const MAX_REFERENCES = 4;

type Controls = {
  tone?: string;
  /** "short", "medium", "long", or the person's own words. */
  length?: string;
  style?: string;
  aspect?: "1:1" | "3:2" | "2:3";
  creativity?: number;
};

type Mode = "text" | "image" | "svg" | "html";

type Body = {
  mode?: Mode;
  /** How many variations, 1 to 3 (default 3). */
  count?: number;
  /** Words from what's selected on a canvas, for the model to work from. */
  context?: string;
  /** A drawing (SVG) or component (HTML) to revise, per the prompt. */
  source?: string;
  prompt?: string;
  /** Data URLs or https URLs. */
  references?: string[];
  controls?: Controls;
};

const SIZE: Record<NonNullable<Controls["aspect"]>, `${number}x${number}`> = {
  "1:1": "1024x1024",
  "3:2": "1536x1024",
  "2:3": "1024x1536",
};

const LENGTH: Record<string, string> = {
  short: "one line, under 15 words",
  medium: "two to four sentences",
  long: "a paragraph or two",
};

function creativityText(value = 50): string {
  if (value < 34) return "Stay close to the prompt and references; vary only small details between variations.";
  if (value < 67) return "Interpret the prompt with some freedom; make each variation a recognisably different take.";
  return "Interpret the prompt freely and boldly; make the three variations as different from each other as the prompt allows.";
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

type Reference = { data: Uint8Array; mediaType: string };

/** A reference as bytes, or null when a linked image can't be loaded in time. */
async function loadReference(src: string): Promise<Reference | null> {
  const match = src.match(/^data:([^;]+);base64,(.*)$/);
  if (match) return { mediaType: match[1], data: Buffer.from(match[2], "base64") };
  try {
    const response = await fetch(src, { signal: AbortSignal.timeout(8000) });
    const mediaType = response.headers.get("content-type")?.split(";")[0] ?? "";
    if (!response.ok || !mediaType.startsWith("image/")) return null;
    return { mediaType, data: new Uint8Array(await response.arrayBuffer()) };
  } catch {
    return null;
  }
}

async function generateImages(prompt: string, references: Reference[], controls: Controls, count: number) {
  const text = [
    prompt || "Make a new image based on the attached reference images.",
    controls.style && `Style: ${controls.style}.`,
    references.length > 0 && "Use the attached images as references for subject, composition and look.",
    creativityText(controls.creativity),
  ]
    .filter(Boolean)
    .join("\n");
  const { images } = await generateImage({
    model: openai.image(IMAGE_MODEL),
    prompt: references.length ? { text, images: references.map((reference) => reference.data) } : text,
    n: count,
    size: SIZE[controls.aspect ?? "1:1"],
    providerOptions: { openai: { quality: "medium", outputFormat: "webp", outputCompression: 82 } },
  });
  return images.map((image) => ({ src: `data:image/webp;base64,${image.base64}` }));
}

async function generateTexts(prompt: string, references: Reference[], controls: Controls, count: number, context: string) {
  const instructions = [
    `Write exactly ${count} distinct variations for this request: ${prompt || "Describe the attached images."}`,
    context && `Work from this, which the person selected:\n${context}`,
    controls.tone && `Tone: ${controls.tone}.`,
    `Length of each: ${LENGTH[controls.length ?? "short"] ?? controls.length}.`,
    references.length > 0 && "The attached images are references: draw on what's in them.",
    creativityText(controls.creativity),
    "Return only the variations themselves: no numbering, labels, quotes or commentary. Never use em dashes.",
  ]
    .filter(Boolean)
    .join("\n");
  const content: UserContent = [
    { type: "text", text: instructions },
    ...references.map((reference) => ({ type: "image" as const, image: reference.data, mediaType: reference.mediaType })),
  ];
  const { object } = await generateObject({
    model: openai(chatLabModel()),
    schema: z.object({ variations: z.array(z.string()).length(count) }),
    messages: [{ role: "user", content }],
  });
  return object.variations.map((text) => ({ text: text.trim() }));
}

/* ── Drawings and components ──────────────────────────────────────────── */

const PALETTE =
  "Charcoal #1a1718 for lines and text, #7a7a7a for secondary, near-white #fafafa and white backgrounds, hairlines #e5e5e5, and accents used sparingly: blue #46a5d8, mint #7fb5b3, rose #df91c6, amber #fcb723, green #64b48f.";

const SVG_BRIEF = `You draw with SVG. Each drawing is one self-contained <svg> element with xmlns and a viewBox (about 0 0 480 360), and no width or height attributes.
No <script>, no event attributes, no <foreignObject>, no external images, links or fonts. Text, if any, uses font-family="system-ui, sans-serif".
Draw clean, flat, modern vector illustrations from simple shapes, with even strokes and generous space. Colours: ${PALETTE}
If asked for an icon, diagram, chart, map, logo or sketch, draw that.`;

const HTML_BRIEF = `You build small UI components as HTML. Each is one self-contained HTML fragment: no <html>, <head> or <body>, no <script>, no event attributes, no forms that submit, no iframes, and no external resources except https images.
Style with inline style attributes, or one <style> block whose selectors all start with a class on the root element. The root is width:100% and sizes to its content, under 640px tall.
Look: a light, airy product interface. font-family: 'STK Bureau Sans', system-ui, sans-serif; weights 300 to 400, never bold. Cards radius 12 to 14px, buttons pill-shaped, thin hairline borders, soft low shadows. Colours: ${PALETTE}
Fill it with realistic placeholder content that fits the request.`;

/** Drop anything that could run or reach out: scripts, handlers, javascript: links, embeds. */
function clean(markup: string) {
  return markup
    // Whole elements first, contents and all, then any opening or self-closing tag left over.
    .replace(/<(script|iframe|object|embed|foreignObject)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?(script|iframe|object|embed|foreignObject|meta|link|base)\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src|xlink:href|action)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "")
    .trim();
}

/** The <svg> element out of whatever came back, cleaned; or null when there isn't one. */
function svgOf(text: string) {
  const match = text.match(/<svg[\s\S]*<\/svg>/i);
  return match ? clean(match[0]) : null;
}

/** An HTML fragment, without code fences, cleaned. */
const htmlOf = (text: string) => clean(text.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/, ""));

async function generateMarkup(kind: "svg" | "html", prompt: string, references: Reference[], count: number, context: string, source: string) {
  const what = kind === "svg" ? "SVG drawings" : "HTML components";
  const instructions = [
    kind === "svg" ? SVG_BRIEF : HTML_BRIEF,
    source
      ? `Revise this ${kind === "svg" ? "drawing" : "component"} as asked, keeping what isn't mentioned. Return ${count === 1 ? "the whole revised version" : `${count} whole revised versions, each a different take`}.\nAsk: ${prompt || "Improve it."}\n\nCurrent:\n${source.slice(0, 20000)}`
      : `Make exactly ${count} distinct ${what} for: ${prompt || "the attached images"}`,
    context && `Work from this, which the person selected:\n${context}`,
    references.length > 0 && "The attached images are references for subject and look.",
  ]
    .filter(Boolean)
    .join("\n\n");
  const content: UserContent = [
    { type: "text", text: instructions },
    ...references.map((reference) => ({ type: "image" as const, image: reference.data, mediaType: reference.mediaType })),
  ];
  const { object } = await generateObject({
    model: openai(chatLabModel()),
    schema: z.object({ variations: z.array(z.string()).length(count) }),
    messages: [{ role: "user", content }],
  });
  const variations = object.variations.map((text) => (kind === "svg" ? svgOf(text) : htmlOf(text))).filter((code): code is string => Boolean(code));
  if (!variations.length) throw new Error(`The model didn't return ${kind === "svg" ? "a drawing" : "a component"}. Try rewording.`);
  return variations.map((code) => ({ code }));
}

export async function POST(req: Request) {
  if (apiKeyMissing()) return configError();

  const body = (await req.json()) as Body;
  const mode: Mode = body.mode === "text" || body.mode === "svg" || body.mode === "html" ? body.mode : "image";
  const count = Math.min(VARIATIONS, Math.max(1, Math.round(body.count ?? VARIATIONS)));
  const context = body.context?.trim().slice(0, 4000) ?? "";
  const source = body.source?.trim() ?? "";
  const prompt = body.prompt?.trim().slice(0, 4000) ?? "";
  const sources = (body.references ?? [])
    .filter((src) => /^(data:image\/|https:\/\/)/.test(src))
    .slice(0, MAX_REFERENCES);
  const controls = body.controls ?? {};
  if (!prompt && sources.length === 0 && !context && !source) return json({ error: "Add a prompt or a reference image." }, 400);
  // A linked image that won't load is left out rather than failing the run.
  const references = (await Promise.all(sources.map(loadReference))).filter((reference) => reference !== null);
  if (!prompt && references.length === 0 && !context && !source) return json({ error: "The reference images couldn't be loaded." }, 400);

  logAiStart("generate", `${mode} ×${count} · ${references.length} refs${source ? " · revising" : ""} · "${prompt.slice(0, 80)}"`);
  try {
    const variations =
      mode === "image"
        ? await generateImages(prompt, references, controls, count)
        : mode === "text"
          ? await generateTexts(prompt, references, controls, count, context)
          : await generateMarkup(mode, prompt, references, count, context, source);
    return json({ variations });
  } catch (error) {
    logAiError("generate", error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
