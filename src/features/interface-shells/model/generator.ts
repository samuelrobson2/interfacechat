import { shellId, type GeneratorControls, type GeneratorMode, type GeneratorShellData, type GeneratorVariation } from "./shell-types";

const GENERATE_API = "/api/generate";

/** Choices offered on the card; tone and style also take free text. */
export const GENERATOR_TONES = ["Warm", "Bold", "Playful", "Formal", "Witty", "Calm"];
export const GENERATOR_STYLES = ["Photo", "Illustration", "3D render", "Watercolour", "Line art", "Film still"];
export const GENERATOR_LENGTHS: { value: GeneratorControls["length"]; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];
export const GENERATOR_ASPECTS: { value: GeneratorControls["aspect"]; label: string }[] = [
  { value: "1:1", label: "Square" },
  { value: "3:2", label: "Wide" },
  { value: "2:3", label: "Tall" },
];

export const ASPECT_CLASS: Record<GeneratorControls["aspect"], string> = {
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
  "2:3": "aspect-[2/3]",
};

const IMAGE_WORDS = /\b(image|images|photo|photos|picture|pictures|illustration|illustrations|logo|logos|poster|posters|render|drawing|painting|icon|artwork|wallpaper)\b/i;
const TEXT_WORDS = /\b(tagline|taglines|slogan|slogans|names?|headlines?|captions?|copy|poem|poems|lines?|bio|bios|descriptions?|tweets?|posts?|subject lines?|jokes?|titles?|lyrics|blurbs?)\b/i;

/** Text or image, from what a prompt asks for. Pictures win a tie: a "poster with a tagline" is an image. */
export function generatorModeFor(prompt: string): GeneratorShellData["mode"] {
  if (IMAGE_WORDS.test(prompt)) return "image";
  return TEXT_WORDS.test(prompt) ? "text" : "image";
}

/** Whether there's enough to run: a prompt, a reference, or both. */
export const canGenerate = (data: GeneratorShellData) => Boolean(data.title.trim() || data.references.length);

/** Run the model: three variations of text or images. */
export async function generateVariations(data: GeneratorShellData, signal?: AbortSignal): Promise<GeneratorVariation[]> {
  const response = await fetch(GENERATE_API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal,
    body: JSON.stringify({
      mode: data.mode,
      prompt: data.title,
      references: data.references.map((reference) => reference.src),
      controls: data.controls,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    variations?: { text?: string; src?: string }[];
    error?: string;
  };
  if (!response.ok || !body.variations) throw new Error(body.error || `Generation failed (${response.status}).`);
  return body.variations.map((variation) => ({ id: shellId("var"), ...variation }));
}

const MAX_SIDE = 1024;

/**
 * Read a picked or dropped image as a data URL the server can use, scaled so
 * its longest side is at most 1024px, which keeps requests small.
 */
export async function readReferenceFile(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ── Presets ──────────────────────────────────────────────────────────── */

/** A saved set of settings: what to make and how. */
export type GeneratorPreset = { id: string; name: string; mode: GeneratorMode; controls: GeneratorControls };

/** Ready-made presets every Generator starts with. */
export const BUILT_IN_PRESETS: GeneratorPreset[] = [
  { id: "product-shot", name: "Product shot", mode: "image", controls: { tone: "Warm", length: "short", style: "Photo", aspect: "1:1", creativity: 25 } },
  { id: "poster", name: "Poster", mode: "image", controls: { tone: "Warm", length: "short", style: "Film still", aspect: "2:3", creativity: 60 } },
  { id: "tagline", name: "Taglines", mode: "text", controls: { tone: "Bold", length: "short", style: "Photo", aspect: "1:1", creativity: 70 } },
  { id: "caption", name: "Social caption", mode: "text", controls: { tone: "Playful", length: "medium", style: "Photo", aspect: "1:1", creativity: 55 } },
];

const PRESETS_KEY = "interface-chat.generator-presets";

/** The person's own presets. Kept in this browser, so they follow them from one Generator to the next. */
export function loadPresets(): GeneratorPreset[] {
  try {
    const raw = window.localStorage.getItem(PRESETS_KEY);
    const parsed = raw ? (JSON.parse(raw) as GeneratorPreset[]) : [];
    return Array.isArray(parsed) ? parsed.filter((preset) => preset && preset.name && preset.controls) : [];
  } catch {
    return [];
  }
}

export function storePresets(presets: GeneratorPreset[]) {
  try {
    window.localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // Private windows and blocked storage: presets last for this visit only.
  }
}

/** Whether the settings now are this preset's. */
export const isPreset = (preset: GeneratorPreset, mode: GeneratorMode, controls: GeneratorControls) =>
  preset.mode === mode &&
  (Object.keys(preset.controls) as (keyof GeneratorControls)[]).every((key) => preset.controls[key] === controls[key]);
