# Collapsible

Simple show/hide content panel based on Radix Collapsible.

```tsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Collapsible
├── CollapsibleTrigger
│   └── (trigger element)
└── CollapsibleContent
    └── (hidden content)
```

## Collapsible (Root) Props

Extends all props from Radix `Collapsible.Root`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | — | Uncontrolled initial open state |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |
| `disabled` | `boolean` | — | Prevents interaction |
| `asChild` | `boolean` | `false` | Merge props onto child element |

## CollapsibleTrigger Props

Extends all props from Radix `Collapsible.Trigger`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element (e.g. render as Button) |

## CollapsibleContent Props

Extends all props from Radix `Collapsible.Content`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element |
| `forceMount` | `boolean` | — | Force mount content when closed (useful for animation) |

CSS variables `--radix-collapsible-content-width` and `--radix-collapsible-content-height` are available for animations.

## Examples

```tsx
<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="ghost">Toggle</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>Hidden content</CollapsibleContent>
</Collapsible>
```
