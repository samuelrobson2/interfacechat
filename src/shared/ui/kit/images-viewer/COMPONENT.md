# ImagesViewer

Displays a row of image thumbnails. Clicking any thumbnail opens a fullscreen lightbox with zoom (pinch/scroll/double-click) and carousel navigation when multiple images are present. The lightbox is a **compound component**: extend it with custom buttons, overlays or toolbars via slot subcomponents and the `useImagesViewerLightbox()` context hook.

```tsx
import { ImagesViewer } from "@adaptionlabs/ui-kit";
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `ImageItem[]` | — | Array of images to display |
| `size` | `"sm" \| "md" \| "lg"` | `"sm"` | Thumbnail size in the inline row |
| `className` | `string` | — | Extra classes applied to the thumbnail row container |
| `imageClassName` | `string` | — | Extra classes applied to each thumbnail image and skeleton |
| `skeletonClassName` | `string` | — | Extra classes applied to thumbnail skeleton placeholders |
| `children` | `React.ReactNode` | — | Optional compound slot children passed to the embedded lightbox (see Composition) |

### ImageItem

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `src` | `string` | — | Image URL |
| `alt` | `string` | `""` | Alt text for the image |
| `isLoading` | `boolean` | `false` | When `true`, shows an animated skeleton placeholder instead of the image |
| `attachmentId` | `string` | — | Optional attachment identifier — useful for custom slot components that need to identify the source |

### Thumbnail sizes

| Size | Width | Height |
|------|-------|--------|
| `sm` | 150px | 112px |
| `md` | 214px | 160px |
| `lg` | 360px | 270px |

All sizes use a 4:3 aspect ratio.

## Usage Tree

The lightbox centers an *image-bound stack* in the dialog. That stack is a `position: relative` container that shrinks to the image's actual rendered size (`max-h: 80dvh; max-w: 70dvw; object-contain`). The top bar and footer are absolutely positioned relative to it, so they always sit at the image's top/bottom edges regardless of image dimensions. Slot subcomponents portal their children into named anchors within that stack.

```
ImagesViewer
├── [thumbnail buttons]          — inline row, size controlled by `size` prop
│   ├── Skeleton                 — shown when image.isLoading is true
│   └── img                      — shown when loaded, with imageClassName applied
└── ImagesViewerLightbox         — fullscreen dialog (mounted only when open)
    ├── DialogOverlay             — blur backdrop
    ├── DialogClose (full-screen) — backdrop click closes the dialog
    └── centering wrapper (pointer-events-none)
        └── image-bound stack (relative, sized to image)
            ├── Top bar (absolute -top-12 left-0 right-0)
            │   ├── Close button + Title (left)
            │   └── [TopActions slot] + Default Download (right)
            ├── Image with TransformWrapper (max-h-[80dvh] max-w-[70dvw])
            │   └── [ImageOverlay slot]    — absolute layer over the image
            └── [Footer slot]               — absolute top-full -translate-x-1/2 mt-8 (centered under image)
    ├── [Floating slot]                     — full-screen overlay (hidden when empty)
    └── Navigation arrows                   — shown only when images.length > 1
```

## Examples

Single image (default size):

```tsx
<ImagesViewer images={[{ src: "/photo.jpg", alt: "A photo" }]} />
```

Multiple images, medium size:

```tsx
<ImagesViewer
  size="md"
  images={[
    { src: "/img1.jpg", alt: "First" },
    { src: "/img2.jpg", alt: "Second" },
    { src: "/img3.jpg", alt: "Third" },
  ]}
/>
```

Large thumbnails with custom image class:

```tsx
<ImagesViewer
  size="lg"
  images={photos}
  imageClassName="rounded-[16px]"
/>
```

Loading state (skeleton placeholders):

```tsx
<ImagesViewer
  size="lg"
  images={[
    { src: "", isLoading: true },
    { src: "", isLoading: true },
  ]}
/>
```

## Overflow counter

The component automatically measures its container width via `ResizeObserver` and calculates how many thumbnails fit. When images exceed the available space, the last visible thumbnail gets a semi-transparent overlay (`bg-black/20`) with a `+N` counter showing the number of hidden images. Clicking that thumbnail opens the lightbox at that position; all images remain navigable inside the lightbox.

## Composition

The lightbox is a compound component. Pass slot subcomponents as `children` (either of `ImagesViewer` or of `ImagesViewerLightbox`) to inject custom UI alongside the defaults.

```tsx
import {
  ImagesViewer,
  ImagesViewerLightboxTopActions,
  ImagesViewerLightboxImageOverlay,
  ImagesViewerLightboxFooter,
  ImagesViewerLightboxFloating,
  useImagesViewerLightbox,
} from "@adaptionlabs/ui-kit";

<ImagesViewer images={images}>
  {/* Adds a Share button before the built-in Download */}
  <ImagesViewerLightboxTopActions>
    <MyShareButton />
  </ImagesViewerLightboxTopActions>

  <ImagesViewerLightboxImageOverlay>
    <MySelectionRectangle />
  </ImagesViewerLightboxImageOverlay>

  <ImagesViewerLightboxFooter>
    <MyToolbar />
  </ImagesViewerLightboxFooter>

  <ImagesViewerLightboxFloating>
    <MyLoader />
  </ImagesViewerLightboxFloating>
</ImagesViewer>
```

### Slot subcomponents

Each slot portals its children into the corresponding region of the lightbox. They must be rendered as descendants of `ImagesViewer` or `ImagesViewerLightbox`.

| Slot | Position | Notes |
|------|----------|-------|
| `ImagesViewerLightboxTopActions` | Top bar, right side, **before** the built-in Download button | The default Download is always rendered inline by the lightbox. Use this slot to add extra buttons next to it (Highlight, Share, etc.). |
| `ImagesViewerLightboxImageOverlay` | Absolute layer covering the image | `pointer-events-none` by default; children opt in with `pointer-events-auto`. Useful for selection rectangles or markers. |
| `ImagesViewerLightboxFooter` | Below the image, in the column flow | Always visible while rendered. Use to keep an input/toolbar permanently in view (e.g. when entering an edit mode). The anchor is hidden when empty. |
| `ImagesViewerLightboxFloating` | Full-screen overlay above the image (`z-55`) | For loaders, popovers, etc. Hidden when empty. |
| `ImagesViewerLightboxDownloadButton` | — | The default Download button, exported for advanced cases where a consumer reconstructs the top bar manually. |

### `useImagesViewerLightbox()`

Hook for reading lightbox state from any descendant. Throws if used outside a lightbox.

```ts
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
  // Register mouse handlers on the image container (used by custom drag overlays).
  // Handlers are stored in a ref — call again with null to clear.
  registerImageMouseHandlers: (handlers: ImageMouseHandlers | null) => void;
  setSlotNode: (slot: SlotName, node: HTMLElement | null) => void;
  slotNodes: Record<SlotName, HTMLElement | null>;
};
```

Use `registerImageMouseHandlers` to attach drag-to-select or other gestures to the image container without losing the built-in zoom / pan behaviour when the gesture is disabled.

## Recommended Image Specifications

### Thumbnails

Thumbnails have a fixed **4:3** aspect ratio across all sizes. Images are rendered with `object-cover` — sources that don't match 4:3 will be center-cropped.

| Size variant | Display size | Source min (2×) |
|-------------|-------------|-----------------|
| `sm` | 150 × 112 px | 300 × 224 px |
| `md` | 214 × 160 px | 428 × 320 px |
| `lg` | 360 × 270 px | 720 × 540 px |

### Lightbox (fullscreen view)

The lightbox displays the original image with `object-contain` (no crop), capped at 70vw × 80vh. Any aspect ratio is supported — provide the highest resolution available for the best zoom experience.

| Property | Value |
|----------|-------|
| **Aspect ratio** | Any (4:3 ideal for thumbnail match) |
| **Ideal size** | 1920 × 1440 px (4:3) or original resolution |
| **Min size** | 800 × 600 px |

## ImagesViewerLightbox Props

Exported separately for advanced use cases where you need a custom trigger.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `ImageItem[]` | — | Array of images (required) |
| `open` | `boolean` | — | Controls lightbox visibility (required) |
| `onOpenChange` | `(open: boolean) => void` | — | Open state change callback (required) |
| `startIndex` | `number` | — | Initial image index (required) |
| `children` | `React.ReactNode` | — | Compound slot subcomponents |

## Notes

- The visible count recalculates on container resize — works with any layout.
- In fullscreen mode, double-click or scroll wheel to zoom; drag to pan when zoomed in.
- Arrow keys (`←` / `→`) navigate between images in fullscreen mode.
- Escape or clicking the backdrop closes the lightbox.
- Clicking exactly on the image area does NOT close the lightbox (only the area outside the image does).
- When `isLoading` is `true`, the thumbnail button is disabled and shows a skeleton with the same dimensions as a normal thumbnail.
- The `imageClassName` prop is applied to both `<img>` elements and `<Skeleton>` placeholders, useful for custom sizing of individual thumbnails.
- Download action uses a direct link-based browser flow (`<a download>`).
- Slot subcomponents render via `createPortal` — they may appear anywhere in the JSX tree below the lightbox.
