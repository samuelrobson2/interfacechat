# HeaderImage

Full-width header banner image with 21:9 aspect ratio.

```tsx
import { HeaderImage } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
HeaderImage
├── <img> (absolute, object-cover)
└── children (overlay content)
```

## Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes (`id`, `style`, `onClick`, `aria-*`, etc.).

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `src` | `string` | — | Image URL. Optional when `isLoading` is `true` |
| `alt` | `string` | `""` | Alt text for the image |
| `size` | `string` | `"lg"` | `"sm"` (21:9, max-h-32 / 128px) · `"md"` (21:9, max-h-48 / 192px) · `"lg"` (full 21:9) |
| `isLoading` | `boolean` | `false` | When `true`, renders a pulsing `Skeleton` inside the container instead of the `<img>`; the 21:9 frame stays in place so layout doesn't shift once the image loads |
| `children` | `ReactNode` | — | Overlay content rendered on top of the image |

Renders a full-width container with 21:9 aspect ratio and an absolutely positioned `<img>` covering the area via `object-cover`. Pass children for overlay content (text, buttons, gradients).

## Recommended Image Specifications

| Property | Value |
|----------|-------|
| **Aspect ratio** | 21:9 (~2.33:1) |
| **Ideal size** | 1680 × 720 px (21:9) |
| **Min width** | 1050 px |

The component uses `aspect-[21/9]` to maintain a consistent 21:9 ratio. The `sm` and `md` variants add max-height constraints for compact layouts; `lg` shows the full ratio. Image uses `object-cover`, so non-21:9 sources will be cropped to fit.

| Size variant | Behavior | Recommended source |
|-------------|----------|--------------------|
| `sm` | 21:9, capped at 128 px | 1680 × 720 px |
| `md` | 21:9, capped at 192 px | 1680 × 720 px |
| `lg` | Full 21:9 | 1680 × 720 px |

A single 1680 × 720 px source works well across all size variants.

## Examples

```tsx
<HeaderImage src="/banner.jpg" size="md" alt="Page banner" />
<HeaderImage src="/hero.jpg" size="lg">
  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
    <Text variant="h2" color="inverse">Overlay Title</Text>
  </div>
</HeaderImage>

// Loading state — container keeps 21:9 so layout stays stable
<HeaderImage size="lg" isLoading />
