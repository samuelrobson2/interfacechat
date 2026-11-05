# Command

Command palette / search menu based on cmdk.

```tsx
import {
  Command, CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator, CommandShortcut
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Command
├── CommandInput
└── CommandList
    ├── CommandEmpty
    ├── CommandGroup
    │   ├── heading (group label)
    │   └── CommandItem (multiple)
    ├── CommandSeparator
    └── CommandItem (multiple)
```

### Dialog variant

```
CommandDialog
└── Command (inside Dialog)
    ├── CommandInput
    └── CommandList
        └── ...
```

## Command (Root) Props

Extends all props from `cmdk` `Command` component (`value`, `onValueChange`, `filter`, `loop`, `shouldFilter`, `label`, etc.).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled selected value |
| `onValueChange` | `(value: string) => void` | — | Callback when selected item changes |
| `filter` | `(value: string, search: string) => number` | — | Custom filter function (return 0–1) |
| `shouldFilter` | `boolean` | `true` | Whether to filter items |
| `loop` | `boolean` | `false` | Loop through items when navigating |
| `label` | `string` | — | Accessible label |

## CommandDialog Props

Extends all `Dialog` (Radix) props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Command Palette"` | Accessible dialog title (sr-only) |
| `description` | `string` | `"Search for a command to run..."` | Accessible dialog description (sr-only) |
| `showCloseButton` | `boolean` | `true` | Shows close (X) button |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |

## CommandInput Props

Extends all props from `cmdk` `Command.Input` component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | — | Placeholder text |
| `value` | `string` | — | Controlled input value |
| `onValueChange` | `(value: string) => void` | — | Callback when input changes |

## CommandList Props

Extends all props from `cmdk` `Command.List` component.

## CommandGroup Props

Extends all props from `cmdk` `Command.Group` component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | — | Shows skeleton placeholder items |
| `heading` | `string` | — | Group heading text |

## CommandItem Props

Extends all props from `cmdk` `Command.Item` component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isSelected` | `boolean` | — | Shows checkmark indicator |
| `selectable` | `boolean` | `true` | Enables hover highlight on keyboard navigation |
| `closable` | `boolean` | `false` | Shows close (X) button |
| `onClose` | `() => void` | — | Callback when close button clicked |
| `value` | `string` | — | Item value for filtering/selection |
| `keywords` | `string[]` | — | Additional search keywords |
| `disabled` | `boolean` | — | Disables the item |
| `onSelect` | `(value: string) => void` | — | Callback when item is selected |

## CommandEmpty Props

Extends all props from `cmdk` `Command.Empty` component.

## CommandSeparator Props

Extends all props from `cmdk` `Command.Separator` component.

## CommandShortcut Props

Extends `React.ComponentProps<"span">` — accepts all standard `<span>` HTML attributes.

## Examples

```tsx
<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results</CommandEmpty>
    <CommandGroup heading="Actions">
      <CommandItem>New file</CommandItem>
      <CommandItem>Open project</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```
