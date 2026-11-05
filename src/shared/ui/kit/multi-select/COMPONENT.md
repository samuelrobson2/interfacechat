# MultiSelect

Multi-value select with search and badges.

```tsx
import {
  MultiSelect, MultiSelectTrigger, MultiSelectValue,
  MultiSelectContent, MultiSelectItem, MultiSelectGroup,
  MultiSelectSeparator
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
MultiSelect
├── MultiSelectTrigger
│   └── MultiSelectValue (renders selected badges)
└── MultiSelectContent
    ├── search input (built-in)
    ├── MultiSelectGroup
    │   └── MultiSelectItem (multiple)
    ├── MultiSelectSeparator
    └── MultiSelectItem (multiple)
```

## MultiSelect Props (Root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `values` | `string[]` | — | Controlled selected values |
| `defaultValues` | `string[]` | — | Uncontrolled initial values |
| `onValuesChange` | `(values: string[]) => void` | — | Change callback |
| `children` | `ReactNode` | — | Sub-components |

## MultiSelectTrigger Props

Extends `ComponentPropsWithoutRef<typeof Button>` — accepts all Button component props (`disabled`, `aria-*`, etc.).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `error` | `string` | — | Error message below trigger |
| `children` | `ReactNode` | — | Trigger content (typically MultiSelectValue) |

## MultiSelectValue Props

Extends `Omit<ComponentPropsWithoutRef<"div">, "children">` — accepts all standard `<div>` HTML attributes except `children`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | — | Placeholder when empty |
| `clickToRemove` | `boolean` | `true` | Allow removing via badge close icon |
| `badgeColor` | `string` | `"default"` | Badge color variant (BadgeColors type) |
| `isLoading` | `boolean` | `false` | Shows skeleton loader |

## MultiSelectContent Props

Extends `Omit<ComponentPropsWithoutRef<typeof Command>, "children">` — accepts all Command component props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `search` | `boolean \| { placeholder?: string; emptyMessage?: string }` | `true` | Show search input. Object form for custom placeholder/empty message |
| `children` | `ReactNode` | — | MultiSelectItem / MultiSelectGroup elements |

## MultiSelectItem Props

Extends `Omit<ComponentPropsWithoutRef<typeof CommandItem>, "value">` — accepts all CommandItem props except `value`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Item value (required) |
| `badgeLabel` | `ReactNode` | — | Custom label for the selected badge (defaults to children) |
| `onSelect` | `(value: string) => void` | — | Custom select callback |
| `children` | `ReactNode` | — | Item content |

## MultiSelectGroup Props

Extends `ComponentPropsWithoutRef<typeof CommandGroup>` — accepts all CommandGroup props (`heading`, `className`, etc.).

## MultiSelectSeparator Props

Extends `ComponentPropsWithoutRef<typeof CommandSeparator>` — accepts all CommandSeparator props.

## Examples

```tsx
<MultiSelect values={selected} onValuesChange={setSelected}>
  <MultiSelectTrigger>
    <MultiSelectValue placeholder="Select tags..." />
  </MultiSelectTrigger>
  <MultiSelectContent search={{ placeholder: "Search..." }}>
    <MultiSelectItem value="react">React</MultiSelectItem>
    <MultiSelectItem value="vue">Vue</MultiSelectItem>
  </MultiSelectContent>
</MultiSelect>
```
