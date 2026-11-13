/*
 * The Canvas's calls to the model: images, notes, SVG drawings and HTML
 * components, made new or revised. All go through /api/generate.
 */

const GENERATE_API = "/api/generate";

export type CanvasMake = "image" | "note" | "drawing" | "component";

const API_MODE: Record<CanvasMake, "image" | "text" | "svg" | "html"> = {
  image: "image",
  note: "text",
  drawing: "svg",
  component: "html",
};

export type CanvasResult = { src?: string; text?: string; code?: string };

export async function askCanvas({
  make,
  prompt,
  references = [],
  context,
  source,
  count,
}: {
  make: CanvasMake;
  prompt: string;
  /** Image URLs or data URLs to work from. */
  references?: string[];
  /** Words from the selection: a note, a caption. */
  context?: string;
  /** A drawing's SVG or a component's HTML, to revise. */
  source?: string;
  count: number;
}): Promise<CanvasResult[]> {
  const response = await fetch(GENERATE_API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mode: API_MODE[make],
      prompt,
      references,
      context,
      source,
      count,
      controls: { tone: "Warm", length: "short", style: "Photo", aspect: "1:1", creativity: 55 },
    }),
  });
  const body = (await response.json().catch(() => ({}))) as { variations?: CanvasResult[]; error?: string };
  if (!response.ok || !body.variations) throw new Error(body.error || `Generation failed (${response.status}).`);
  return body.variations;
}

/** An SVG as an image URL: drawn like any picture, so nothing in it can run. */
export const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/**
 * A component's HTML as a whole page for a sandboxed frame: the brand font and
 * a transparent body, nothing else. The frame never runs scripts.
 */
export const componentDoc = (html: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:transparent;font-family:'STK Bureau Sans',system-ui,sans-serif;color:#1a1718;font-weight:300}
*{box-sizing:border-box}
</style></head><body>${html}</body></html>`;
