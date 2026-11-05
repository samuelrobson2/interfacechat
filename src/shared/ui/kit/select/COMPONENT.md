# Select

Single-value dropdown selector based on Radix Select.

```tsx
import {
  Select, SelectTrigger, SelectValue, SelectContent,
  SelectItem, SelectGroup, SelectLabel, SelectSeparator
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Select
├── SelectTrigger
│   └── SelectValue
└── SelectContent
    ├── SelectGroup
    │   ├── SelectLabel
    │   └── SelectItem (multiple)
    └── SelectSeparator
```

## Select (Root) Props

Extends `React.ComponentProps<typeof SelectPrimitive.Root>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | — | Controlled selected value |
| `defaultValue` | string | — | Uncontrolled default value |
| `onValueChange` | `(value: string) => void` | — | Called when value changes |
| `open` | boolean | — | Controlled open state |
| `defaultOpen` | boolean | — | Uncontrolled default open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |
| `dir` | string | — | `"ltr"` · `"rtl"` — reading direction |
| `name` | string | — | Form field name for native submission |
| `disabled` | boolean | — | Disable the entire select |
| `required` | boolean | — | Make selection required in forms |

## SelectTrigger Props

Extends `React.ComponentProps<typeof SelectPrimitive.Trigger>` + CVA variants + custom `error` prop.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `"default"` | `"default"` (neumorphic) · `"outline"` (8px radius) · `"pill"` (56px) |
| `size` | string | `"default"` | `"default"` (h-16) · `"sm"` (h-9) · `"pill"` |
| `error` | string | — | Error message displayed below trigger |
| `asChild` | boolean | `false` | Merge props onto child element |

## SelectValue Props

Extends `React.ComponentProps<typeof SelectPrimitive.Value>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | ReactNode | — | Placeholder when no value is selected |
| `asChild` | boolean | `false` | Merge props onto child element |

## SelectContent Props

Extends `React.ComponentProps<typeof SelectPrimitive.Content>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | string | `"popper"` | `"popper"` · `"item-aligned"` |
| `align` | string | `"start"` | `"start"` · `"center"` · `"end"` |
| `side` | string | `"bottom"` | `"top"` · `"right"` · `"bottom"` · `"left"` |
| `sideOffset` | number | `0` | Distance in px from trigger |
| `alignOffset` | number | `0` | Offset in px from alignment edge |
| `avoidCollisions` | boolean | `true` | Reposition to stay within boundary |
| `hideWhenDetached` | boolean | `false` | Hide when trigger scrolls out of view |
| `onCloseAutoFocus` | function | — | Called when focus returns to trigger |
| `onEscapeKeyDown` | function | — | Called on Escape key press |
| `onPointerDownOutside` | function | — | Called on pointer event outside |

## SelectItem Props

Extends `React.ComponentProps<typeof SelectPrimitive.Item>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | — | Item value (required) |
| `disabled` | boolean | — | Disable this item |
| `textValue` | string | — | Text used for typeahead; defaults to item text content |

## SelectGroup Props

Extends `React.ComponentProps<typeof SelectPrimitive.Group>`. Groups related items.

## SelectLabel Props

Extends `React.ComponentProps<typeof SelectPrimitive.Label>`. Non-interactive label for a group.

## SelectSeparator Props

Extends `React.ComponentProps<typeof SelectPrimitive.Separator>`. Visual separator between items.

## Examples

```tsx
<Select>
  <SelectTrigger variant="outline" size="sm">
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>
```
