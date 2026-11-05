# ImageGrid

Responsive masonry-style image grid.

```tsx
import { ImageGrid, ImageGridItem, ImageGridItemImage, ImageGridItemCaption } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
ImageGrid
├── ImageGridItem
│   ├── ImageGridItemImage
│   └── ImageGridItemCaption
├── ImageGridItem
│   ├── ImageGridItemImage
│   └── ImageGridItemCaption
└── ...
```

## ImageGrid Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes (`id`, `style`, `onClick`, `aria-*`, etc.).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `number` | `3` | Number of columns |
| `columnGap` | `string` | `"md"` | `"sm"` (12px) · `"md"` (16px) · `"lg"` (20px) |
| `rowGap` | `string` | `"lg"` | `"sm"` (16px) · `"md"` (20px) · `"lg"` (24px) |

## ImageGridItem Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## ImageGridItemImage Props

Extends `React.ComponentProps<"img">` — accepts all standard `<img>` HTML attributes (`src`, `alt`, `loading`, `draggable`, etc.).

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `orientation` | `string` | `"square"` | `"landscape"` (16:9) · `"square"` (1:1) · `"portrait"` (3:4) |
| `src` | `string` | — | Image URL |
| `alt` | `string` | `""` | Alt text |

## ImageGridItemCaption Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | Caption title (rendered as Text variant="title") |
| `description` | `ReactNode` | — | Caption description (rendered as Text variant="label" color="secondary") |

## Recommended Image Specifications

Each `ImageGridItemImage` accepts an `orientation` prop that sets a CSS aspect-ratio. Source images should match the chosen orientation to avoid quality loss from heavy cropping (`object-cover` is applied).

| Orientation | Aspect ratio | Ideal size | Min size |
|-------------|-------------|------------|----------|
| `landscape` | 16:9 | 640 × 360 px | 480 × 270 px |
| `square` | 1:1 | 600 × 600 px | 400 × 400 px |
| `portrait` | 3:4 | 600 × 800 px | 400 × 534 px |

Column width depends on the container and `columns` count. For a typical 3-column layout at 900 px container, each column is ~280 px — source images 2× that width (560 px+) are recommended for retina displays.

## Examples

```tsx
<ImageGrid columns={3} columnGap="md">
  <ImageGridItem>
    <ImageGridItemImage src="/img.jpg" orientation="landscape" />
    <ImageGridItemCaption title="Photo" description="Description" />
  </ImageGridItem>
</ImageGrid>
```
