# ButtonGroup

Grouped set of buttons with merged border-radius.

```tsx
import { ButtonGroup, ButtonGroupText, ButtonGroupSeparator } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
ButtonGroup
├── Button
├── ButtonGroupSeparator
├── Button
├── ButtonGroupSeparator
└── Button
```

## ButtonGroup Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes. Renders with `role="group"`.

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `orientation` | `string` | `"horizontal"` | `"horizontal"` · `"vertical"` |

Merges border-radius of adjacent children automatically.

## ButtonGroupText Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Polymorphic rendering via Radix Slot |

## ButtonGroupSeparator Props

Extends all props from `Separator` component (which wraps Radix `Separator`).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal"` \| `"vertical"` | `"vertical"` | Separator direction |
| `decorative` | `boolean` | — | When `true`, hides from assistive technology |

## Examples

```tsx
<ButtonGroup>
  <Button variant="secondary">Left</Button>
  <ButtonGroupSeparator />
  <Button variant="secondary">Right</Button>
</ButtonGroup>
```
