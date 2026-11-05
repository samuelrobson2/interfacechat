"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { createPortal } from "react-dom";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { cn } from "@/shared/lib/css";
import { Button } from "../button";
import { DialogOverlay } from "../dialog";
import { Skeleton } from "../skeleton";
import { Text } from "../text";

type ImageItem = {
  src: string;
  alt?: string;
  title?: string;
  isLoading?: boolean;
  attachmentId?: string;
};

const thumbnailVariants = cva("block object-cover", {
  variants: {
    size: {
      sm: "h-[112px] w-[150px]",
      md: "h-[160px] w-[214px]",
      lg: "h-[270px] w-[360px]",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const THUMBNAIL_WIDTHS: Record<
  NonNullable<ImagesViewerProps["size"]>,
  number
> = { sm: 150, md: 214, lg: 360 };
const THUMBNAIL_GAP = 8;

type ImagesViewerProps = {
  images: ImageItem[];
  className?: string;
  imageClassName?: string;
  skeletonClassName?: string;
  onImageClick?: (index: number) => void;
  aspectRatio?: string;
  children?: React.ReactNode;
} & VariantProps<typeof thumbnailVariants>;

function ImagesViewer({
  images,
  size,
  className,
  imageClassName,
  skeletonClassName,
  onImageClick,
  aspectRatio,
  children,
}: ImagesViewerProps) {
  const [open, setOpen] = React.useState(false);
  const [startIndex, setStartIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(images.length);

  const resolvedSize = size ?? "sm";
  const thumbWidth = THUMBNAIL_WIDTHS[resolvedSize];

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calcVisible = (width: number) =>
      Math.max(
        1,
        Math.floor((width + THUMBNAIL_GAP) / (thumbWidth + THUMBNAIL_GAP)),
      );

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setVisibleCount(calcVisible(entry.contentRect.width));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [thumbWidth]);

  const handleImageClick = (index: number) => {
    if (onImageClick) {
      onImageClick(index);
      return;
    }
    setStartIndex(index);
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleImageClick(index);
    }
  };

  if (images.length === 0) return null;

  const hasOverflow = images.length > visibleCount;
  const displayImages = hasOverflow ? images.slice(0, visibleCount) : images;
  const hiddenCount = hasOverflow ? images.length - visibleCount : 0;

  return (
    <>
      <div
        ref={containerRef}
        data-slot="images-viewer"
        className={cn("flex gap-2 overflow-hidden", className)}
      >
        {displayImages.map((image, index) => {
          const isLastWithOverflow =
            hasOverflow && index === displayImages.length - 1;

          return (
            <button
              key={`${image.src}-${index}`}
              type="button"
              className="relative shrink-0 cursor-pointer overflow-hidden border-none bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => !image.isLoading && handleImageClick(index)}
              onKeyDown={(e) => !image.isLoading && handleKeyDown(e, index)}
              aria-label={
                isLastWithOverflow
                  ? `View ${hiddenCount} more images`
                  : image.alt || `View image ${index + 1}`
              }
              disabled={image.isLoading}
            >
              {image.isLoading ? (
                <Skeleton
                  className={cn(
                    thumbnailVariants({ size }),
                    "rounded-[4px]",
                    skeletonClassName,
                    imageClassName,
                  )}
                />
              ) : (
                <img
                  src={image.src}
                  alt={image.alt || ""}
                  loading="lazy"
                  className={cn(
                    thumbnailVariants({ size }),
                    "rounded-[4px]",
                    imageClassName,
                  )}
                  draggable={false}
                />
              )}
              {isLastWithOverflow && !image.isLoading && (
                <div className="absolute inset-0 flex items-center rounded-[4px] justify-center bg-black/20">
                  <Text variant="title" color="inverse">
                    +{hiddenCount}
                  </Text>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!onImageClick && (
        <ImagesViewerLightbox
          images={images}
          open={open}
          key={open ? "open" : "closed"}
          onOpenChange={setOpen}
          startIndex={startIndex}
          aspectRatio={aspectRatio}
        >
          {children}
        </ImagesViewerLightbox>
      )}
    </>
  );
}

// Compound slot identifiers — each slot has a dedicated anchor in the layout
// that consumer-provided slot components portal their children into.
type SlotName = "topActions" | "imageOverlay" | "footer" | "floating";

type ImageMouseHandlers = {
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
};

type ImagesViewerLightboxContextValue = {
  images: ImageItem[];
  currentImage: ImageItem;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  imageRef: React.RefObject<HTMLImageElement | null>;
  canGoPrev: boolean;
  canGoNext: boolean;
  goPrev: () => void;
  goNext: () => void;
  close: () => void;
  // Handlers are stored in a ref to avoid re-render loops when external
  // selection layers update their callbacks every render.
  registerImageMouseHandlers: (handlers: ImageMouseHandlers | null) => void;
  setSlotNode: (slot: SlotName, node: HTMLElement | null) => void;
  slotNodes: Record<SlotName, HTMLElement | null>;
};

const ImagesViewerLightboxContext =
  React.createContext<ImagesViewerLightboxContextValue | null>(null);

const useImagesViewerLightbox = (): ImagesViewerLightboxContextValue => {
  const ctx = React.useContext(ImagesViewerLightboxContext);
  if (!ctx) {
    throw new Error(
      "useImagesViewerLightbox must be used within <ImagesViewerLightbox>",
    );
  }
  return ctx;
};

type ImagesViewerLightboxProps = {
  images: ImageItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startIndex: number;
  aspectRatio?: string;
  children?: React.ReactNode;
};

function ImagesViewerLightbox({
  images,
  open,
  onOpenChange,
  startIndex,
  aspectRatio,
  children,
}: ImagesViewerLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;
  const hasMultiple = images.length > 1;

  const goPrev = React.useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = React.useCallback(() => {
    setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
  }, [images.length]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goPrev, goNext],
  );

  const currentImage = images[currentIndex];

  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const imageMouseHandlersRef = React.useRef<ImageMouseHandlers | null>(null);
  const [imageInteractionLocked, setImageInteractionLocked] =
    React.useState(false);

  const registerImageMouseHandlers = React.useCallback(
    (handlers: ImageMouseHandlers | null) => {
      imageMouseHandlersRef.current = handlers;
      setImageInteractionLocked(handlers !== null);
    },
    [],
  );

  const close = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const [slotNodes, setSlotNodes] = React.useState<
    Record<SlotName, HTMLElement | null>
  >({
    topActions: null,
    imageOverlay: null,
    footer: null,
    floating: null,
  });

  const setSlotNode = React.useCallback(
    (slot: SlotName, node: HTMLElement | null) => {
      setSlotNodes((prev) => {
        if (prev[slot] === node) return prev;
        return { ...prev, [slot]: node };
      });
    },
    [],
  );

  const contextValue =
    React.useMemo<ImagesViewerLightboxContextValue | null>(() => {
      if (!currentImage) return null;
      return {
        images,
        currentImage,
        currentIndex,
        setCurrentIndex,
        imageRef,
        canGoPrev,
        canGoNext,
        goPrev,
        goNext,
        close,
        registerImageMouseHandlers,
        setSlotNode,
        slotNodes,
      };
    }, [
      images,
      currentImage,
      currentIndex,
      canGoPrev,
      canGoNext,
      goPrev,
      goNext,
      close,
      registerImageMouseHandlers,
      setSlotNode,
      slotNodes,
    ]);

  const handleImageContainerMouseDown = (e: React.MouseEvent) => {
    imageMouseHandlersRef.current?.onMouseDown?.(e);
  };
  const handleImageContainerMouseMove = (e: React.MouseEvent) => {
    imageMouseHandlersRef.current?.onMouseMove?.(e);
  };
  const handleImageContainerMouseUp = (e: React.MouseEvent) => {
    imageMouseHandlersRef.current?.onMouseUp?.(e);
  };

  if (!currentImage || !contextValue) return null;

  return (
    <ImagesViewerLightboxContext.Provider value={contextValue}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogOverlay />
          <DialogPrimitive.Content
            data-slot="images-viewer-content"
            className={cn("fixed inset-0 z-50 outline-none")}
            onKeyDown={handleKeyDown}
            aria-label={`Image viewer, ${currentIndex + 1} of ${images.length}`}
          >
            <DialogPrimitive.Title className="sr-only">
              Image viewer
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {`Viewing image ${currentIndex + 1} of ${images.length}`}
            </DialogPrimitive.Description>

            {/* Close on background click */}
            <DialogPrimitive.Close
              className="absolute inset-0 cursor-default bg-transparent"
              aria-label="Close image viewer"
            />

            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 py-16">
              <div
                className="relative max-w-[70dvw] max-h-[80dvh]"
                style={
                  aspectRatio
                    ? {
                        aspectRatio,
                        width: `min(70dvw, calc(80dvh * ${aspectRatio}))`,
                      }
                    : undefined
                }
              >
                {/* Top bar — anchored above the image, spans its width */}
                <div className="absolute -top-17 left-0 right-0 flex items-center justify-between gap-4">
                  <div className="pointer-events-auto flex min-w-0 items-center gap-4">
                    <Button
                      onClick={close}
                      aria-label="Close image viewer"
                      title="Close"
                      variant="secondary"
                      size="icon-sm"
                      radius="rounded"
                    >
                      <CrossLargeIcon svgClasses="size-4" />
                    </Button>
                    <Text
                      variant="label"
                      color="inverse"
                      title={currentImage.alt || `Image ${currentIndex + 1}`}
                    >
                      {currentImage.alt || `Image ${currentIndex + 1}`}
                    </Text>
                  </div>
                  <div className="pointer-events-auto flex shrink-0 items-center gap-3">
                    {/* Top-actions slot anchor — `display: contents` so
                        portal children participate in the parent flex row */}
                    <div
                      ref={(node) => setSlotNode("topActions", node)}
                      data-slot="images-viewer-top-actions"
                      className="contents"
                    />
                  </div>
                </div>

                {/* Image with zoom/pan  */}
                <div className="relative z-10">
                  <TransformWrapper
                    key={currentIndex}
                    initialScale={1}
                    minScale={1}
                    maxScale={4}
                    doubleClick={{
                      mode: "toggle",
                      step: 2,
                      disabled: imageInteractionLocked,
                    }}
                    wheel={{ step: 0.2 }}
                    panning={{
                      velocityDisabled: true,
                      disabled: imageInteractionLocked,
                    }}
                  >
                    <TransformComponent
                      wrapperClass="!pointer-events-auto !overflow-visible !w-full"
                      contentClass="!overflow-visible !w-full"
                    >
                      <div
                        className="relative overflow-visible w-full"
                        onMouseDown={handleImageContainerMouseDown}
                        onMouseMove={handleImageContainerMouseMove}
                        onMouseUp={handleImageContainerMouseUp}
                      >
                        <img
                          ref={imageRef}
                          src={currentImage.src}
                          alt={currentImage.alt || ""}
                          loading="lazy"
                          style={aspectRatio ? { aspectRatio } : undefined}
                          className={cn(
                            "block max-h-[80dvh] max-w-[70dvw] w-full object-contain",
                          )}
                          draggable={false}
                        />
                        {/* Image-overlay slot anchor — overlays the image area
                            exactly so consumer overlays (selection bbox, etc.)
                            can use percentage coords. `pointer-events-none`
                            keeps mouse events on the image; children may opt
                            back in with `pointer-events-auto`. */}
                        <div
                          ref={(node) => setSlotNode("imageOverlay", node)}
                          data-slot="images-viewer-image-overlay"
                          className="pointer-events-none absolute inset-0"
                        />
                      </div>
                    </TransformComponent>
                  </TransformWrapper>
                </div>
                {hasMultiple && canGoPrev && (
                  <Button
                    className="pointer-events-auto absolute -left-25 top-1/2 -translate-y-1/2"
                    onClick={goPrev}
                    aria-label="Previous image"
                    variant="secondary"
                    size="icon-sm"
                    radius="rounded"
                  >
                    <ArrowLeftIcon
                      pathClasses="stroke-icon-primary"
                      svgClasses="size-4"
                    />
                  </Button>
                )}

                {hasMultiple && canGoNext && (
                  <Button
                    className="pointer-events-auto absolute -right-25 top-1/2 -translate-y-1/2"
                    onClick={goNext}
                    aria-label="Next image"
                    variant="secondary"
                    size="icon-sm"
                    radius="rounded"
                  >
                    <ArrowRightIcon
                      pathClasses="stroke-icon-primary"
                      svgClasses="size-4"
                    />
                  </Button>
                )}

                {/* Footer slot anchor — anchored below the image, centered
                    relative to it; hidden when empty so it doesn't catch
                    clicks or disrupt centering */}
                <div
                  ref={(node) => setSlotNode("footer", node)}
                  data-slot="images-viewer-footer"
                  className="pointer-events-auto absolute left-1/2 top-full mt-8 flex -translate-x-1/2 justify-center empty:hidden"
                />
              </div>
            </div>

            {/* Floating slot anchor — full-screen overlay; doesn't catch clicks when empty */}
            <div
              ref={(node) => setSlotNode("floating", node)}
              data-slot="images-viewer-floating"
              className="pointer-events-none absolute inset-0 z-55 empty:hidden"
            />

            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ImagesViewerLightboxContext.Provider>
  );
}

// Slot subcomponents: each portals its children into the matching anchor div
// that the lightbox renders inside its layout. Consumers can compose any
// number of children — they all end up in the corresponding region.
const createSlotComponent = (
  slot: SlotName,
  displayName: string,
): React.FC<{ children?: React.ReactNode }> => {
  const Component: React.FC<{ children?: React.ReactNode }> = ({
    children,
  }) => {
    const { slotNodes } = useImagesViewerLightbox();
    const node = slotNodes[slot];
    if (!node) return null;
    return createPortal(children, node);
  };
  Component.displayName = displayName;
  return Component;
};

const ImagesViewerLightboxTopActions = createSlotComponent(
  "topActions",
  "ImagesViewerLightboxTopActions",
);

const ImagesViewerLightboxImageOverlay = createSlotComponent(
  "imageOverlay",
  "ImagesViewerLightboxImageOverlay",
);

const ImagesViewerLightboxFooter = createSlotComponent(
  "footer",
  "ImagesViewerLightboxFooter",
);

const ImagesViewerLightboxFloating = createSlotComponent(
  "floating",
  "ImagesViewerLightboxFloating",
);

export {
  ImagesViewer,
  ImagesViewerLightbox,
  ImagesViewerLightboxFloating,
  ImagesViewerLightboxFooter,
  ImagesViewerLightboxImageOverlay,
  ImagesViewerLightboxTopActions,
  thumbnailVariants,
  useImagesViewerLightbox,
  type ImageItem,
  type ImageMouseHandlers,
  type ImagesViewerLightboxContextValue,
  type ImagesViewerLightboxProps,
  type ImagesViewerProps,
};
