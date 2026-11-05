# Checkbox

Boolean toggle input based on Radix Checkbox.

```tsx
import { Checkbox } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Label
└── Checkbox (standalone)
```

## Props

Extends all props from Radix `Checkbox.Root`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `"default"` | `"default"` (border + solid black on check) · `"filled"` (gray-6 bg, blue-5 on check) |
| `checked` | `boolean \| "indeterminate"` | — | Controlled checked state |
| `defaultChecked` | `boolean \| "indeterminate"` | — | Uncontrolled initial state |
| `onCheckedChange` | `(checked: boolean \| "indeterminate") => void` | — | Change callback |
| `disabled` | `boolean` | — | Disables the checkbox |
| `required` | `boolean` | — | Marks as required for form validation |
| `name` | `string` | — | Name attribute for form submission |
| `value` | `string` | `"on"` | Value attribute for form submission |
| `asChild` | `boolean` | `false` | Merge props onto child element |

24×24px. `"default"` variant uses `bg-gray-4` when checked. `"filled"` variant uses `bg-blue-5` when checked. Supports `aria-invalid` for error state.

## Examples

```tsx
<Label>
  <Checkbox onCheckedChange={setChecked} />
  Accept terms
</Label>

<Label>
  <Checkbox variant="filled" defaultChecked />
  Filled variant
</Label>
```
