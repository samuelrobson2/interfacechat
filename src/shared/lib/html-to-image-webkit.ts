import { toBlob } from "html-to-image";

type HtmlToImageOptions = NonNullable<Parameters<typeof toBlob>[1]>;

/** WebKit (Safari / iOS) often returns blank PNGs from html-to-image on the first pass. */
export function shouldUseHtmlToImageWebKitWorkaround(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iP(ad|hone|od)/i.test(ua)) return true;
  return (
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|FxiOS|Firefox/i.test(ua)
  );
}

export async function toBlobWithWebKitWorkaround(
  element: HTMLElement,
  options: HtmlToImageOptions,
): Promise<Blob | null> {
  if (shouldUseHtmlToImageWebKitWorkaround()) {
    try {
      await toBlob(element, options);
    } catch {
      /* warm-up is best-effort; second pass still runs */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return toBlob(element, options);
}

/** Waits for N animation frames. Lets layout / fonts settle before capture. */
export async function waitForFrames(count = 2): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}

/** Waits until every <img> inside `element` is fully decoded (best effort). */
export async function waitForImagesInElement(
  element: HTMLElement,
): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((image) => image.decode?.().catch(() => undefined)),
  );
}

export type CaptureElementOptions = HtmlToImageOptions & {
  /** Default white background to avoid transparent regions in raster output. */
  backgroundColor?: string;
};

/**
 * Transparent 1x1 PNG. Used as a fallback when html-to-image cannot fetch
 * a source image (e.g. cross-origin S3 URL without CORS). Keeps the snapshot
 * succeeding instead of failing the whole export.
 */
const TRANSPARENT_PIXEL_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

/**
 * Snapshots a DOM element to a PNG blob. Waits for fonts and images to be
 * ready, measures the element, then runs the WebKit-safe html-to-image pass.
 *
 * Note: `cacheBust` is intentionally omitted from the defaults — it appends a
 * query string to image URLs which breaks signed S3 links and triggers CORS
 * failures. Pass it explicitly only for static, same-origin assets.
 */
export async function captureElementAsBlob(
  element: HTMLElement,
  options: CaptureElementOptions = {},
): Promise<Blob> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await waitForImagesInElement(element);

  const rect = element.getBoundingClientRect();
  const width = Math.ceil(options.width ?? rect.width);
  const height = Math.ceil(options.height ?? rect.height);

  const blob = await toBlobWithWebKitWorkaround(element, {
    backgroundColor: "#FFFFFF",
    imagePlaceholder: TRANSPARENT_PIXEL_PNG,
    ...options,
    width,
    height,
  });

  if (!blob) {
    throw new Error("Failed to generate image from element");
  }

  return blob;
}

export async function captureElementAsFile(
  element: HTMLElement,
  fileName: string,
  options: CaptureElementOptions = {},
): Promise<File> {
  const blob = await captureElementAsBlob(element, options);
  return new File([blob], fileName, { type: blob.type || "image/png" });
}
