# CircularProgress

Circular progress ring indicator (SVG-based).

```tsx
import { CircularProgress } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
CircularProgress
├── SVG ring (track + progress arc)
├── value display ("{value}%")
├── label (optional secondary text)
└── children (replaces default value/label)
```

## Props

Extends `React.ComponentProps<"div">` (with `color` omitted to avoid conflict) — accepts standard `<div>` HTML attributes (`id`, `style`, `onClick`, `aria-*`, etc.).

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `value` | `number` | `0` | Progress percentage (0–100) |
| `label` | `string` | — | Secondary text below the percentage |
| `size` | `string` | `"lg"` | `"lg"` (160×160) · `"md"` (120×120) |
| `color` | `string` | `"default"` | `"default"` (icon-primary) · `"gradient"` (gray-4 → blue-6 SVG gradient) · `"blue"` (blue-5) |
| `children` | `ReactNode` | — | Custom content replacing default value/label |

Renders an SVG ring with a track (gray-2) and progress arc. By default shows `{value}%` and an optional label inside. Pass `children` to fully replace the inner content.

## Examples

```tsx
<CircularProgress value={75} label="Complete" />
<CircularProgress value={50} size="md" color="gradient" />
<CircularProgress value={100} color="blue">
  <CircleCheckFilledIcon className="size-8" pathClasses="fill-blue-5" />
  <Text variant="label" color="secondary">Done</Text>
</CircularProgress>
```
