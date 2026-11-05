# Item

Generic list item with media, title, description, actions.

```tsx
import {
  Item, ItemGroup, ItemMedia, ItemContent,
  ItemTitle, ItemDescription, ItemActions,
  ItemHeader, ItemFooter, ItemSeparator
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
ItemGroup
├── Item
│   ├── ItemMedia (icon/image)
│   ├── ItemContent
│   │   ├── ItemTitle
│   │   └── ItemDescription
│   └── ItemActions
│       └── (action buttons)
├── ItemSeparator
├── Item
│   ├── ItemMedia
│   ├── ItemContent
│   │   ├── ItemHeader
│   │   ├── ItemTitle
│   │   ├── ItemDescription
│   │   └── ItemFooter
│   └── ItemActions
└── ...
```

## ItemGroup Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes. Renders with `role="list"`.

## Item Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes (`id`, `style`, `onClick`, `aria-*`, etc.).

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `variant` | `string` | `"default"` | `"default"` · `"outline"` (bordered + shadow) · `"muted"` (bg-background-primary) |
| `size` | `string` | `"default"` | `"default"` (gap-4 p-4) · `"sm"` (gap-2.5 px-4 py-3) |
| `asChild` | `boolean` | `false` | Polymorphic rendering via Radix Slot |

## ItemMedia Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `variant` | `string` | `"default"` | `"default"` · `"icon"` (32px bordered box) · `"image"` (40px image container) |

## Sub-component Props

| Component | Extends |
|-----------|---------|
| `ItemContent` | `React.ComponentProps<"div">` |
| `ItemTitle` | `React.ComponentProps<"div">` |
| `ItemDescription` | `React.ComponentProps<"p">` |
| `ItemActions` | `React.ComponentProps<"div">` |
| `ItemHeader` | `React.ComponentProps<"div">` |
| `ItemFooter` | `React.ComponentProps<"div">` |
| `ItemSeparator` | Separator component props (Radix Separator) |

## Examples

```tsx
<ItemGroup>
  <Item variant="outline">
    <ItemMedia variant="icon">
      <FileIcon pathClasses="stroke-current" />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Document.pdf</ItemTitle>
      <ItemDescription>2.4 MB · Uploaded yesterday</ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button variant="ghost" size="icon-sm">
        <TrashIcon pathClasses="stroke-current" />
      </Button>
    </ItemActions>
  </Item>
  <ItemSeparator />
</ItemGroup>
```
