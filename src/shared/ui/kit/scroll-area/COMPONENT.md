# ScrollArea

Custom scrollable container based on Radix ScrollArea.

```tsx
import { ScrollArea, ScrollBar } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
ScrollArea
├── (scrollable content)
└── ScrollBar (auto, custom thin scrollbar)
```

## ScrollArea Props

Extends `React.ComponentProps<typeof ScrollAreaPrimitive.Root>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `"hover"` | `"auto"` · `"always"` · `"scroll"` · `"hover"` — scrollbar visibility behavior |
| `scrollHideDelay` | number | `600` | Delay in ms before hiding scrollbars (for `type` `"scroll"` or `"hover"`) |
| `dir` | string | — | `"ltr"` · `"rtl"` — reading direction |

## ScrollBar Props

Extends `React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | string | `"vertical"` | `"vertical"` · `"horizontal"` |
| `forceMount` | boolean | — | Force mount scrollbar for animation control |

## Examples

```tsx
<ScrollArea className="h-72">
  {/* Long scrollable content */}
</ScrollArea>

<ScrollArea className="w-96 whitespace-nowrap">
  <div className="flex gap-4">
    {/* Horizontal scrollable content */}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>
```
