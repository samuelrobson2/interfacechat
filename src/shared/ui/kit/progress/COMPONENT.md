# Progress

Progress bar indicator.

```tsx
import { Progress, ProgressRow } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
ProgressRow
├── label (text on the left)
├── Progress (bar)
└── value display (percentage or checkmark at 100%)
```

## Progress Props

Extends `Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "color">` — accepts all Radix Progress Root props except `color` which is overridden by the CVA variant.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | `0` | Progress percentage (0–100) |
| `color` | string | `"default"` | `"default"` (icon-primary) · `"gradient"` (black-blue gradient) · `"blue"` (blue-5) |
| `max` | number | `100` | Maximum value |
| `getValueLabel` | `(value: number, max: number) => string` | — | Accessible label for current value |

## ProgressRow Props

Extends `Omit<React.ComponentProps<"div">, "color">` — accepts all standard `<div>` HTML attributes except `color`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | — | Text label on the left |
| `value` | number | `0` | Progress value (0–100); shows percentage or checkmark at 100% |
| `color` | string | `"default"` | `"default"` · `"gradient"` · `"blue"` — matches Progress color |
| `sign`  | string | `"%"` | Sign that will be displayed after value |

ProgressRow accepts `<Progress>` as children. At 100% it displays a gradient checkmark icon instead of percentage text.

## Examples

```tsx
<Progress value={65} color="blue" />

<ProgressRow label="Upload progress" value={65} color="gradient">
  <Progress value={65} color="gradient" />
</ProgressRow>
```
