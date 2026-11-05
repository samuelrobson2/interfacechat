# Badge

Small status and label indicator. Non-interactive display element rendered as `<span>`.

```tsx
import { Badge } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Badge
├── children (text, icons)
└── closable → CrossLargeIcon (X button)
```

## Props

Extends `React.ComponentProps<"span">` — accepts all standard `<span>` HTML attributes (`id`, `style`, `onClick`, `aria-*`, etc.).

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `color` | `string` | — | `"default"` (white bg, secondary border) · `"ghost"` (transparent bg, inset shadow) · `"neutral"` (gray-6 bg, no border) · `"accent"` (gray-6 bg, no border) |
| `size` | `string` | `"default"` | `"default"` (py-2.5) · `"md"` (py-1.5) · `"sm"` (label text, py-1, px-2) · `"icon"` (32×32 circle) |
| `radius` | `string` | — | `"square"` (4px radius) — by default uses pill shape (56px) |
| `closable` | `boolean` | `false` | Shows close (X) icon |
| `closeIconClassName` | `string` | — | Extra class for close icon |
| `onClose` | `() => void` | — | Callback when close icon clicked |
| `asChild` | `boolean` | `false` | Polymorphic rendering via Radix Slot |

## Visual Variants

- **default** — white background, secondary border stroke
- **ghost** — transparent background with `shadow-inset-default` neumorphic shadow
- **neutral** — `gray-6` filled background, no visible border
- **accent** — `gray-6` filled background, no visible border (same base as neutral, differs in InteractiveBadge)

## Size Guide

| Size | Padding | Text Variant | Use Case |
|------|---------|--------------|----------|
| `default` | `py-2.5 px-4` | body (16px) | Standard tags, categories |
| `md` | `py-1.5 px-4` | body (16px) | Compact tags |
| `sm` | `py-1 px-2` | label (14px) | Inline status labels |
| `icon` | `p-0` (32×32) | — | Icon-only badge |

## Examples

```tsx
<Badge color="default" size="md">Active</Badge>
<Badge color="ghost">Ghost style</Badge>
<Badge color="neutral" size="sm">Status</Badge>
<Badge color="default" closable onClose={() => {}}>Removable Tag</Badge>
<Badge radius="square" size="md">Square Badge</Badge>
```
