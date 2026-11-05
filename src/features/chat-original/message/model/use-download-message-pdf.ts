import { useState } from "react";

import { captureElementAsBlob } from "@/shared/lib/html-to-image-webkit";
import { toast } from "@/shared/ui/kit/sonner-toast";

// A3 portrait dimensions in millimeters. A3 (vs A4) is used so the wide chat
// snapshot (message content + both sidebars) renders at a larger scale while
// keeping the natural portrait orientation.
const A3_WIDTH_MM = 297;
const A3_HEIGHT_MM = 420;
const PAGE_MARGIN_MM = 8;

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (event) => reject(event);
    image.src = src;
  });

const findExportElement = (messageId: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(
    `[data-slot="chat-message-export-${messageId}"]`,
  );

/**
 * Temporarily replaces every <video> in `root` with an <img> built from its
 * poster, returning a restore callback.
 *
 * The AI avatar streams from a cross-origin (Cloudinary) source, so
 * html-to-image draws its frame onto a canvas and calls toDataURL, which throws
 * a SecurityError on the tainted canvas. The poster is a same-origin asset, so
 * swapping to it keeps the avatar visible in the snapshot without tainting.
 * Overlay videos without a poster are detached for the duration of the capture.
 */
const swapVideosWithPosters = (root: HTMLElement): (() => void) => {
  const videos = Array.from(root.querySelectorAll("video"));
  const restores: Array<() => void> = [];

  videos.forEach((video) => {
    const parent = video.parentNode;
    if (!parent) return;

    // Comment marker preserves the original DOM position for restoration.
    const placeholder = document.createComment("video-export-placeholder");
    parent.replaceChild(placeholder, video);

    let posterImage: HTMLImageElement | null = null;
    if (video.poster) {
      posterImage = document.createElement("img");
      posterImage.src = video.poster;
      posterImage.className = video.className;
      posterImage.style.cssText = video.style.cssText;
      parent.insertBefore(posterImage, placeholder);
    }

    restores.push(() => {
      parent.replaceChild(video, placeholder);
      posterImage?.remove();
    });
  });

  return () => restores.forEach((restore) => restore());
};

// aside w-[292px] + ml-4/mr-4 (16px) = 308px on each side of the wrapper.
const SIDEBAR_OFFSET_PX = 308;

/**
 * Computes the snapshot area covering the wrapper and both absolute aside
 * sidebars (AI avatar / quote on the left, follow-up suggestions on the right).
 *
 * Asides sit outside the wrapper's box, so we widen the capture by
 * `SIDEBAR_OFFSET_PX` on each side and shift everything via CSS transform so
 * that the off-screen left aside lands inside the SVG viewport.
 */
const measureExportArea = (wrapper: HTMLElement) => {
  const wrapperRect = wrapper.getBoundingClientRect();
  const asideEls = wrapper.querySelectorAll<HTMLElement>(":scope > aside");

  let minTop = wrapperRect.top;
  let maxBottom = wrapperRect.bottom;

  asideEls.forEach((aside) => {
    const rect = aside.getBoundingClientRect();
    if (rect.height === 0) return;
    minTop = Math.min(minTop, rect.top);
    maxBottom = Math.max(maxBottom, rect.bottom);
  });

  const width = Math.ceil(wrapperRect.width + SIDEBAR_OFFSET_PX * 2);
  const height = Math.ceil(maxBottom - minTop);
  const offsetTop = Math.max(0, wrapperRect.top - minTop);

  return { width, height, offsetTop };
};

const savePdfFromImage = async (
  image: HTMLImageElement,
  dataUrl: string,
  fileName: string,
) => {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a3",
  });

  const usableWidth = A3_WIDTH_MM - PAGE_MARGIN_MM * 2;
  const usablePageHeight = A3_HEIGHT_MM - PAGE_MARGIN_MM * 2;

  // Convert source pixel height to millimeters while preserving aspect ratio.
  const pxPerMm = image.width / usableWidth;
  const totalHeightMm = image.height / pxPerMm;

  if (totalHeightMm <= usablePageHeight) {
    pdf.addImage(
      dataUrl,
      "PNG",
      PAGE_MARGIN_MM,
      PAGE_MARGIN_MM,
      usableWidth,
      totalHeightMm,
    );
    pdf.save(fileName);
    return;
  }

  // Render image slice-by-slice using an offscreen canvas to avoid blank pages.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to acquire 2D canvas context");
  }

  const sliceHeightPx = Math.floor(usablePageHeight * pxPerMm);
  canvas.width = image.width;

  let renderedPx = 0;
  let pageIndex = 0;

  while (renderedPx < image.height) {
    const remainingPx = image.height - renderedPx;
    const currentSlicePx = Math.min(sliceHeightPx, remainingPx);
    canvas.height = currentSlicePx;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      0,
      renderedPx,
      image.width,
      currentSlicePx,
      0,
      0,
      image.width,
      currentSlicePx,
    );

    const sliceHeightMm = currentSlicePx / pxPerMm;
    const sliceDataUrl = canvas.toDataURL("image/png");

    if (pageIndex > 0) {
      pdf.addPage();
    }
    pdf.addImage(
      sliceDataUrl,
      "PNG",
      PAGE_MARGIN_MM,
      PAGE_MARGIN_MM,
      usableWidth,
      sliceHeightMm,
    );

    renderedPx += currentSlicePx;
    pageIndex += 1;
  }

  pdf.save(fileName);
};

export function useDownloadMessagePdf() {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const downloadMessagePdf = async (messageId: string) => {
    if (isDownloadingPdf) return;

    const element = findExportElement(messageId);
    if (!element) {
      toast.error("Failed to prepare message for export");
      return;
    }

    setIsDownloadingPdf(true);
    const restoreVideos = swapVideosWithPosters(element);
    try {
      const { width, height, offsetTop } = measureExportArea(element);
      // `cacheBust` is intentionally not used here: presigned S3 URLs for chat
      // attachments break when an extra query string is appended.
      const blob = await captureElementAsBlob(element, {
        pixelRatio: 2,
        width,
        height,
        style: {
          transform: `translate(${SIDEBAR_OFFSET_PX}px, ${offsetTop}px)`,
          transformOrigin: "top left",
        },
      });
      const dataUrl = await blobToDataUrl(blob);
      const image = await loadImage(dataUrl);
      const fileName = `chat-message-${messageId}.pdf`;
      await savePdfFromImage(image, dataUrl, fileName);
    } catch (error) {
      console.error("Failed to download message as PDF:", error);
      toast.error("Failed to download message as PDF");
    } finally {
      restoreVideos();
      setIsDownloadingPdf(false);
    }
  };

  return {
    downloadMessagePdf,
    isDownloadingPdf,
  };
}
