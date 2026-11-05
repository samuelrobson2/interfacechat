# RadioGroup

Single-choice radio buttons based on Radix RadioGroup.

```tsx
import { RadioGroup, RadioGroupItem } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
RadioGroup
├── Label
│   └── RadioGroupItem (value="a")
├── Label
│   └── RadioGroupItem (value="b")
└── Label
    └── RadioGroupItem (value="c")
```

## RadioGroup Props

Extends `React.ComponentProps<typeof RadioGroupPrimitive.Root>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | string | `"vertical"` | `"vertical"` · `"horizontal"` |
| `value` | string | — | Controlled selected value |
| `defaultValue` | string | — | Uncontrolled default value |
| `onValueChange` | `(value: string) => void` | — | Called when selection changes |
| `disabled` | boolean | — | Disable all items |
| `name` | string | — | Form field name (for native form submission) |
| `required` | boolean | — | Make selection required in forms |
| `dir` | string | — | `"ltr"` · `"rtl"` — reading direction |
| `loop` | boolean | `true` | Keyboard navigation wraps from last to first |

## RadioGroupItem Props

Extends `React.ComponentProps<typeof RadioGroupPrimitive.Item>` + CVA variant.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `"default"` | `"default"` (border + solid black on check) · `"filled"` (gray-6 bg, blue-5 on check) |
| `value` | string | — | Item value (required) |
| `disabled` | boolean | `false` | Disables the item |
| `required` | boolean | — | Make this item required |

24×24px rounded-full. `"default"` uses `bg-gray-4` when checked. `"filled"` uses `bg-blue-5` when checked. Supports `aria-invalid` for error state.

## Examples

```tsx
<RadioGroup defaultValue="a">
  <Label htmlFor="a">
    <RadioGroupItem value="a" id="a" />
    Option A
  </Label>
  <Label htmlFor="b">
    <RadioGroupItem value="b" id="b" />
    Option B
  </Label>
</RadioGroup>

<RadioGroup defaultValue="a">
  <Label htmlFor="af">
    <RadioGroupItem value="a" id="af" variant="filled" />
    Filled A
  </Label>
  <Label htmlFor="bf">
    <RadioGroupItem value="b" id="bf" variant="filled" />
    Filled B
  </Label>
</RadioGroup>
```
