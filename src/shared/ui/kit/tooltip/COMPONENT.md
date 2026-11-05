# Tooltip

Hover hint overlay based on Radix Tooltip.

```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Tooltip (wraps TooltipProvider + TooltipPrimitive.Root automatically)
├── TooltipTrigger
│   └── (trigger element)
└── TooltipContent
    └── (tooltip text/content)
```

## Tooltip (Root) Props

Extends `React.ComponentProps<typeof TooltipPrimitive.Root>`. Internally wraps children with a `TooltipProvider` (delayDuration=0).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | boolean | — | Uncontrolled open state on initial render |
| `open` | boolean | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |
| `delayDuration` | number | `0` (via internal Provider) | ms to wait before showing tooltip |
| `disableHoverableContent` | boolean | — | Prevent tooltip content from being hoverable |

## TooltipProvider Props

Extends `React.ComponentProps<typeof TooltipPrimitive.Provider>`. Wrap app root to control global tooltip timing.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `delayDuration` | number | `0` | Global delay in ms before showing tooltips |
| `skipDelayDuration` | number | `300` | ms before showing next tooltip when one is already open |
| `disableHoverableContent` | boolean | — | Prevent tooltip content from being hoverable |

## TooltipTrigger Props

Extends `React.ComponentProps<typeof TooltipPrimitive.Trigger>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | boolean | `false` | Merge props onto child element |

## TooltipContent Props

Extends `React.ComponentProps<typeof TooltipPrimitive.Content>` + custom `showArrow` prop.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | string | `"top"` | `"top"` · `"right"` · `"bottom"` · `"left"` |
| `sideOffset` | number | `4` | Distance in px from trigger |
| `align` | string | `"center"` | `"start"` · `"center"` · `"end"` |
| `alignOffset` | number | `0` | Offset in px from alignment edge |
| `showArrow` | boolean | `false` | Show arrow pointing to trigger |
| `avoidCollisions` | boolean | `true` | Reposition to stay within boundary |
| `collisionBoundary` | `Element \| Element[]` | `[]` | Boundary element(s) for collision detection |
| `collisionPadding` | `number \| Padding` | `0` | Padding from collision boundary |
| `sticky` | string | `"partial"` | `"partial"` · `"always"` |
| `hideWhenDetached` | boolean | `false` | Hide when trigger scrolls out of view |
| `forceMount` | boolean | — | Force mount for animation control |
| `onEscapeKeyDown` | function | — | Called on Escape key press |
| `onPointerDownOutside` | function | — | Called on pointer event outside |

## Examples

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <CircleInfoIcon pathClasses="stroke-current" />
    </Button>
  </TooltipTrigger>
  <TooltipContent side="bottom">Helpful info</TooltipContent>
</Tooltip>

<Tooltip>
  <TooltipTrigger asChild>
    <span>Hover me</span>
  </TooltipTrigger>
  <TooltipContent showArrow>Tooltip with arrow</TooltipContent>
</Tooltip>
```
