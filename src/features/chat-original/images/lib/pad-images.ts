import type { ImageItem } from "@/shared/ui/kit/images-viewer";

// Pads the images list with loading placeholders up to the given count, so the
// layout can reserve space for images that are still being generated.
export const padImages = (
  images: ImageItem[],
  count: number,
): ImageItem[] => {
  if (images.length >= count) return images;
  const placeholders: ImageItem[] = Array.from(
    { length: count - images.length },
    () => ({ src: "", isLoading: true }),
  );
  return [...images, ...placeholders];
};
