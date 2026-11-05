# DropdownMenu

Contextual action menu based on Radix DropdownMenu.

```tsx
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
  DropdownMenuShortcut, DropdownMenuPortal
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
DropdownMenu
├── DropdownMenuTrigger
│   └── (trigger element)
└── DropdownMenuContent
    ├── DropdownMenuLabel
    ├── DropdownMenuSeparator
    ├── DropdownMenuGroup
    │   └── DropdownMenuItem (multiple)
    ├── DropdownMenuCheckboxItem
    ├── DropdownMenuRadioGroup
    │   └── DropdownMenuRadioItem (multiple)
    └── DropdownMenuSub
        ├── DropdownMenuSubTrigger
        └── DropdownMenuSubContent
            └── DropdownMenuItem (multiple)
```

## DropdownMenu (Root) Props

Extends all props from Radix `DropdownMenu.Root`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | — | Uncontrolled initial open state |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |
| `modal` | `boolean` | `true` | Whether menu is modal |
| `dir` | `"ltr"` \| `"rtl"` | — | Reading direction |

## DropdownMenuTrigger Props

Extends all props from Radix `DropdownMenu.Trigger`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element |

## DropdownMenuContent Props

Extends all props from Radix `DropdownMenu.Content`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sideOffset` | `number` | `4` | Distance from trigger |
| `side` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"bottom"` | Preferred side |
| `align` | `"start"` \| `"center"` \| `"end"` | `"center"` | Alignment along side |
| `alignOffset` | `number` | `0` | Alignment offset |
| `avoidCollisions` | `boolean` | `true` | Auto-flip to avoid viewport overflow |
| `onCloseAutoFocus` | `(event: Event) => void` | — | Override auto-focus on close |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | — | Callback on Escape key |
| `onPointerDownOutside` | `(event: Event) => void` | — | Callback on click outside |
| `onFocusOutside` | `(event: Event) => void` | — | Callback on focus outside |
| `onInteractOutside` | `(event: Event) => void` | — | Callback on any interaction outside |

## DropdownMenuItem Props

Extends all props from Radix `DropdownMenu.Item`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `inset` | `boolean` | — | Adds left padding for icon-aligned text |
| `variant` | `"default"` \| `"destructive"` | `"default"` | Visual style |
| `disabled` | `boolean` | — | Disables the item |
| `onSelect` | `(event: Event) => void` | — | Callback when item is selected |
| `textValue` | `string` | — | Text used for typeahead search |

## DropdownMenuCheckboxItem Props

Extends all props from Radix `DropdownMenu.CheckboxItem`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean \| "indeterminate"` | — | Checked state |
| `onCheckedChange` | `(checked: boolean) => void` | — | Callback when checked changes |
| `disabled` | `boolean` | — | Disables the item |
| `onSelect` | `(event: Event) => void` | — | Callback when selected |

## DropdownMenuRadioGroup Props

Extends all props from Radix `DropdownMenu.RadioGroup`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled selected value |
| `onValueChange` | `(value: string) => void` | — | Callback when selection changes |

## DropdownMenuRadioItem Props

Extends all props from Radix `DropdownMenu.RadioItem`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | **Required.** Item value |
| `disabled` | `boolean` | — | Disables the item |

## DropdownMenuLabel Props

Extends all props from Radix `DropdownMenu.Label`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `inset` | `boolean` | — | Adds left padding |

## DropdownMenuSub Props

Extends all props from Radix `DropdownMenu.Sub`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | — | Uncontrolled initial open state |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |

## DropdownMenuSubTrigger Props

Extends all props from Radix `DropdownMenu.SubTrigger`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `inset` | `boolean` | — | Adds left padding |
| `asChild` | `boolean` | `false` | Merge props onto child element |

## Other Sub-components

| Component | Extends | Description |
|-----------|---------|-------------|
| `DropdownMenuSubContent` | Radix `DropdownMenu.SubContent` | Submenu popup content |
| `DropdownMenuSeparator` | Radix `DropdownMenu.Separator` | Visual divider |
| `DropdownMenuPortal` | Radix `DropdownMenu.Portal` | Portal for content |
| `DropdownMenuShortcut` | `React.ComponentProps<"span">` | Keyboard shortcut hint text |

## Examples

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <DotVerticalIcon pathClasses="stroke-current" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```
