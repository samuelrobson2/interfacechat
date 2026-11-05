# Switch

Toggle on/off switch based on Radix Switch.

```tsx
import { Switch } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Label
└── Switch (standalone)
```

## Props

Extends `React.ComponentProps<typeof SwitchPrimitive.Root>` + CVA variants — accepts all Radix Switch Root props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `"default"` | `"default"` (solid black on check, wider thumb) · `"filled"` (blue-5 on check, round thumb) |
| `size` | string | `"default"` | `"default"` · `"sm"` |
| `checked` | boolean | — | Controlled checked state |
| `defaultChecked` | boolean | — | Uncontrolled initial state |
| `onCheckedChange` | `(checked: boolean) => void` | — | Called when checked state changes |
| `disabled` | boolean | — | Disables the switch |
| `required` | boolean | — | Make required in forms |
| `name` | string | — | Form field name for native submission |
| `value` | string | `"on"` | Value submitted with form |

## Size Reference

| Variant × Size | Root Dimensions | Thumb |
|----------------|-----------------|-------|
| default/default | 64×28 | 39×24 |
| default/sm | 56×24 | 32×20 |
| filled/default | 52×28 | 24×24 |
| filled/sm | 40×24 | 20×20 |

## Examples

```tsx
<Label>
  <Switch onCheckedChange={setDark} />
  Dark mode
</Label>

<Label>
  <Switch variant="filled" size="sm" />
  Compact toggle
</Label>
```
