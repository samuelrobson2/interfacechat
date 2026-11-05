# Combobox

Searchable dropdown selector based on Base UI.

```tsx
import {
  Combobox, ComboboxInput, ComboboxContent, ComboboxList,
  ComboboxItem, ComboboxEmpty, ComboboxGroup, ComboboxLabel,
  ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxCollection,
  ComboboxSeparator, ComboboxTrigger, ComboboxValue
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Combobox
├── ComboboxInput
└── ComboboxContent
    └── ComboboxList
        ├── ComboboxEmpty
        ├── ComboboxGroup
        │   ├── ComboboxLabel
        │   └── ComboboxItem (multiple)
        └── ComboboxItem (multiple)
```

### Chips variant

```
Combobox (multiple)
├── ComboboxChips (anchor)
│   ├── ComboboxChip (per selected value)
│   └── ComboboxChipsInput
└── ComboboxContent (anchor={chipsRef})
    └── ComboboxList
        └── ComboboxItem (multiple)
```

## Combobox (Root) Props

Base UI `Combobox.Root` — manages state and selection.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| string[]` | — | Controlled selected value(s) |
| `defaultValue` | `string \| string[]` | — | Initial value(s) when uncontrolled |
| `onValueChange` | `(value: string \| string[]) => void` | — | Callback when selection changes |
| `multiple` | `boolean` | `false` | Allow multiple selections |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |

## ComboboxInput Props

Extends Base UI `Combobox.Input` props and all `Input` component props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showTrigger` | `boolean` | `true` | Shows chevron trigger button |
| `disabled` | `boolean` | `false` | Disables the input |
| ...InputProps | — | — | All Input props (`label`, `fill`, `shape`, `leftElement`, etc.) |

## ComboboxContent Props

Extends Base UI `Combobox.Popup` props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"bottom"` | Popover placement side |
| `sideOffset` | `number` | `6` | Offset from anchor |
| `align` | `"start"` \| `"center"` \| `"end"` | `"start"` | Alignment along side |
| `alignOffset` | `number` | `0` | Alignment offset |
| `anchor` | `Ref \| Element` | — | Custom anchor element (for chips variant) |
| `container` | `Element` | — | Portal container |

## ComboboxItem Props

Extends Base UI `Combobox.Item` props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Item value |
| `disabled` | `boolean` | — | Disables the item |

Shows checkmark when selected.

## ComboboxChip Props

Extends Base UI `Combobox.Chip` props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showRemove` | `boolean` | `true` | Shows remove (X) button |

## Other Sub-components

| Component | Extends | Description |
|-----------|---------|-------------|
| `ComboboxValue` | `Combobox.Value` | Displays selected value text |
| `ComboboxTrigger` | `Combobox.Trigger` | Trigger element for the popup |
| `ComboboxList` | `Combobox.List` | Scrollable options list |
| `ComboboxGroup` | `Combobox.Group` | Groups items |
| `ComboboxLabel` | `Combobox.GroupLabel` | Group heading text |
| `ComboboxEmpty` | `Combobox.Empty` | Shown when no items match |
| `ComboboxSeparator` | `Combobox.Separator` | Visual separator between items |
| `ComboboxCollection` | `Combobox.Collection` | Data collection wrapper |
| `ComboboxChips` | `Combobox.Chips` | Chips container (multi-select) |
| `ComboboxChipsInput` | `Combobox.Input` | Input inside chips container |

## Examples

```tsx
<Combobox>
  <ComboboxInput label="Country" fill="outlined" />
  <ComboboxContent>
    <ComboboxList>
      <ComboboxEmpty>No results found</ComboboxEmpty>
      <ComboboxItem value="us">United States</ComboboxItem>
      <ComboboxItem value="uk">United Kingdom</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```
