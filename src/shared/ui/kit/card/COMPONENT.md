# Card

Flexible content container with multiple visual styles.

```tsx
import { Card, CardImage, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Card
├── CardImage
├── CardHeader
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardContent
│   └── (arbitrary content)
└── CardFooter
    └── (actions / buttons)
```

## Card Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `variant` | `string` | `"default"` | `"default"` (neumorphic shadow + border) · `"ghost"` (no bg/border) · `"outlined"` (subtle border) · `"filled"` (gray-6 bg) |
| `shape` | `string` | `"square"` | `"square"` (4px) · `"rounded"` (24px) |
| `orientation` | `string` | `"vertical"` | `"vertical"` · `"horizontal"` |
| `spacing` | `string` | `"md"` | `"none"` · `"md"` (p-4) |
| `highlight` | `boolean` | `false` | Adds blue glow + blue-4 hairline border |
| `asChild` | `boolean` | `false` | Polymorphic rendering via Radix Slot |

## Border (hairline)

The `default` and `outlined` variants render their border via the `hairline` utility (a scaled `::after` pseudo-element) instead of a real CSS `border`. This produces a crisp 0.5px line on high-DPI screens and a thin anti-aliased line on standard displays — consistent across all monitors.

The hairline is configured with CSS variables:

| Variable | Purpose | Default |
|----------|---------|---------|
| `--hairline-color` | Border color (use a project token, e.g. `var(--color-gray-3)`) | `var(--color-stroke-secondary)` |
| `--hairline-radius` | Corner radius of the hairline — set it to the card's **visual `border-radius`** (the utility doubles it internally, since the pseudo-element is drawn at 2× and scaled to 0.5) | set by `shape` (`square` → 4px, `rounded` → 24px) |
| `--hairline-opacity` | Opacity of the hairline, lets translucent borders reuse solid tokens | `1` |

> ⚠️ The hairline border is a scaled `::after` pseudo-element whose right/bottom edge sits exactly on the card edge. `overflow-hidden` would clip it (the right/bottom line turns invisible), so the `default` and `outlined` variants deliberately do **not** set `overflow-hidden`. Only the borderless `ghost` and `filled` variants clip their content. If you need to clip an edge-to-edge child (e.g. a `CardImage`) to the rounded corners of a `default`/`outlined` card, wrap that child in an inner `overflow-hidden rounded-[…]` element instead of adding `overflow-hidden` to the card.

> ⚠️ When overriding the corner radius via `className` (e.g. `rounded-[8px]`), set a matching `--hairline-radius` to the **same value**, otherwise the border corners won't follow the card. To hide the border entirely, use `[--hairline-color:transparent]` (not `border-none`, which has no effect on the pseudo-element):
>
> ```tsx
> <Card className="rounded-[8px] [--hairline-radius:8px]">…</Card>
> ```

## CardImage Props

Extends `React.ComponentProps<"img">` — accepts all standard `<img>` HTML attributes (`src`, `alt`, `loading`, `onLoad`, etc.).

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `ratio` | `string` | `"landscape"` | `"landscape"` (16:9) · `"square"` (1:1) · `"portrait"` (3:4) |
| `shape` | `string` | `"square"` | `"square"` · `"rounded"` (24px) |
| `alt` | `string` | `""` | Image alt text |
| `isLoading` | `boolean` | `false` | When `true`, renders a pulsing `Skeleton` instead of the `<img>`, keeping the same `ratio`/`shape`/`className` so the card layout stays stable while the image loads |

## Sub-component Props

**CardHeader**, **CardTitle**, **CardDescription**, **CardContent**, **CardFooter**, **CardAction** — each extends `React.ComponentProps<"div">`, accepts all standard `<div>` HTML attributes (`className`, `id`, `style`, `onClick`, etc.).

## Recommended Image Specifications (CardImage)

### Vertical orientation

`CardImage` fills the full card width. Source images should match the `ratio` prop to avoid distortion (`object-fill` is applied).

| Ratio | Aspect ratio | Ideal size | Min size |
|-------|-------------|------------|----------|
| `landscape` (default) | 16:9 | 640 × 360 px | 480 × 270 px |
| `square` | 1:1 | 600 × 600 px | 400 × 400 px |
| `portrait` | 3:4 | 600 × 800 px | 400 × 534 px |

Typical card widths: 224 px (`w-56`) – 320 px (`w-80`). Source at 2× card width ensures retina quality.

### Horizontal orientation

In horizontal layout the image is typically constrained to `w-[120px]`. Use square sources for best results.

| Property | Value |
|----------|-------|
| **Aspect ratio** | 1:1 (square) |
| **Ideal size** | 240 × 240 px (2× display) |
| **Min size** | 120 × 120 px |

## Examples

```tsx
<Card variant="ghost" spacing="none">
  <CardImage src="/img.jpg" ratio="landscape" />
  <CardContent className="flex-col p-3">
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardContent>
</Card>

<Card variant="outlined" spacing="md" orientation="horizontal">
  <CardImage src="/img.jpg" ratio="square" className="w-[120px] shrink-0" />
  <CardContent className="flex-col p-3">
    <CardTitle>Horizontal Card</CardTitle>
  </CardContent>
</Card>

<Card highlight>
  <CardHeader>
    <CardTitle>Highlighted</CardTitle>
  </CardHeader>
  <CardContent>Body content</CardContent>
  <CardFooter className="gap-2">
    <Button variant="primary" size="48">Action</Button>
  </CardFooter>
</Card>

<Card variant="ghost" spacing="none">
  <CardImage ratio="square" isLoading />
  <CardContent className="flex-col p-3">
    <CardTitle>Loading…</CardTitle>
  </CardContent>
</Card>
```
