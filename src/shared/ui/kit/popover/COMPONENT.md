# Popover

Floating content overlay based on Radix Popover.

```tsx
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Popover
├── PopoverAnchor (optional)
├── PopoverTrigger
│   └── (trigger element)
└── PopoverContent
    └── (popover body content)
```

## Popover (Root) Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | boolean | — | Uncontrolled open state on initial render |
| `open` | boolean | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |
| `modal` | boolean | `false` | When `true`, interaction with outside elements is blocked |

## PopoverTrigger Props

Extends `React.ComponentProps<typeof PopoverPrimitive.Trigger>` — renders a button by default.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | boolean | `false` | Merge props onto child element instead of rendering a button |

## PopoverContent Props

Extends `React.ComponentProps<typeof PopoverPrimitive.Content>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | string | `"bottom"` | `"top"` · `"right"` · `"bottom"` · `"left"` |
| `sideOffset` | number | `4` | Distance in px from the trigger |
| `align` | string | `"center"` | `"start"` · `"center"` · `"end"` |
| `alignOffset` | number | `0` | Offset in px from the alignment edge |
| `avoidCollisions` | boolean | `true` | Reposition to stay within boundary |
| `collisionBoundary` | `Element \| Element[]` | `[]` | Boundary element(s) for collision detection |
| `collisionPadding` | `number \| Padding` | `0` | Padding from collision boundary |
| `sticky` | string | `"partial"` | `"partial"` · `"always"` |
| `hideWhenDetached` | boolean | `false` | Hide when trigger scrolls out of view |
| `forceMount` | boolean | — | Force mount for animation control |
| `onOpenAutoFocus` | function | — | Called when focus moves into content after opening |
| `onCloseAutoFocus` | function | — | Called when focus moves to trigger after closing |
| `onEscapeKeyDown` | function | — | Called on Escape key press |
| `onPointerDownOutside` | function | — | Called on pointer event outside |
| `onFocusOutside` | function | — | Called when focus moves outside |
| `onInteractOutside` | function | — | Called on any interaction outside |

## PopoverAnchor Props

Extends `React.ComponentProps<typeof PopoverPrimitive.Anchor>`. Anchors content to a different element instead of the trigger.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | boolean | `false` | Merge props onto child element |

## Examples

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="secondary">Open</Button>
  </PopoverTrigger>
  <PopoverContent align="start">
    <Text>Popover body</Text>
  </PopoverContent>
</Popover>
```
