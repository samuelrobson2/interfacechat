# ComparisonCard

Displays a side-by-side comparison of items, each with a title, status icon (accepted/rejected), and an image. Commonly used for AI-generated comparison results.

```tsx
import { ComparisonCard } from "@adaptionlabs/ui-kit";
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ComparisonCardItem[]` | — | Array of items to compare (required) |
| `className` | `string` | — | Extra classes applied to the root container |

### ComparisonCardItem

Extends `React.ComponentProps<"img">` — accepts all standard `<img>` HTML attributes (`src`, `alt`, `loading`, `onLoad`, `srcSet`, etc.).

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | — | Label for the item |
| `status` | `"accepted" \| "rejected"` | — | Determines the icon: green check or red cross |
| `isLoading` | `boolean` | `false` | When `true`, renders a pulsing `Skeleton` instead of the `<img>`, keeping layout stable while the image loads |
| `src`, `alt`, `className`, `style`, … | img props | — | Any standard `<img>` attribute forwarded to the rendered image |

## Usage Tree

```
ComparisonCard (div, flex row, gap-6)
└── item (repeated, flex-1)
    ├── title row (flex, justify-between)
    │   ├── Text variant="title"
    │   └── CircleCheckFilledIcon / CircleCrossFilledIcon
    └── img (aspect-square, rounded-[4px])
```

## Examples

Basic two-item comparison:

```tsx
<ComparisonCard
  items={[
    { title: "Title 1", src: "/img1.jpg", status: "accepted" },
    { title: "Title 2", src: "/img2.jpg", status: "rejected" },
  ]}
/>
```

Three-item comparison:

```tsx
<ComparisonCard
  items={[
    { title: "Sample A", src: "/a.jpg", status: "accepted" },
    { title: "Sample B", src: "/b.jpg", status: "rejected" },
    { title: "Sample C", src: "/c.jpg", status: "accepted" },
  ]}
/>
```

Loading state (per item):

```tsx
<ComparisonCard
  items={[
    { title: "Ready", src: "/a.jpg", status: "accepted" },
    { title: "Loading…", status: "accepted", isLoading: true },
  ]}
/>
```

## Recommended Image Specifications

Images are always rendered as squares (`aspect-square`) with `object-cover` — the aspect ratio is fixed and cannot be changed via props. Non-square sources are center-cropped. The image width is determined by the item's flex share of the container.

| Property | Value |
|----------|-------|
| **Aspect ratio** | 1:1 (square, fixed) |
| **Ideal source size** | 400 × 400 px (2× for retina) |
| **Min source size** | 200 × 200 px |
| **CSS** | `aspect-square w-full rounded-[4px] object-cover` |

## Notes

- Returns `null` when `items` is empty.
- Items stretch equally to fill the available width (`flex-1`).
- Aspect ratio is fixed at `aspect-square`; images use `object-cover` — non-square sources are center-cropped.
- The status icon is purely visual; `aria-label` is set to "Accepted" or "Rejected".
- Each item can individually show a skeleton placeholder via `isLoading: true`; no `src` is needed in that case.
