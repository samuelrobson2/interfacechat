# Separator

Visual divider line based on Radix Separator.

```tsx
import { Separator } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Separator (standalone)
```

## Props

Extends `React.ComponentProps<typeof SeparatorPrimitive.Root>` + CVA `color` variant.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | string | `"horizontal"` | `"horizontal"` · `"vertical"` |
| `color` | string | `"primary"` | `"primary"` (stroke-primary) · `"secondary"` (stroke-secondary) |
| `decorative` | boolean | `true` | When `true`, element is purely visual and hidden from screen readers |
| `asChild` | boolean | `false` | Merge props onto child element |

## Examples

```tsx
<Separator color="secondary" />
<Separator orientation="vertical" color="primary" />
```
