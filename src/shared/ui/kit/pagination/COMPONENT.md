# Pagination

Page navigation controls with numbered pages, directional arrows and neumorphic styling.

```tsx
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationPrevious, PaginationNext,
  PaginationEllipsis
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Pagination
└── PaginationContent
    ├── PaginationItem
    │   └── PaginationPrevious
    ├── PaginationItem
    │   └── PaginationLink (multiple, isActive on current)
    ├── PaginationItem
    │   └── PaginationEllipsis
    └── PaginationItem
        └── PaginationNext
```

## Pagination Props

Extends `React.ComponentProps<"nav">` — accepts all standard `<nav>` HTML attributes.

No custom props. Wrapper for the navigation landmark.

## PaginationContent Props

Extends `React.ComponentProps<"ul">` — accepts all standard `<ul>` HTML attributes.

No custom props. Flex container for pagination items.

## PaginationItem Props

Extends `React.ComponentProps<"li">` — accepts all standard `<li>` HTML attributes.

No custom props. Wrapper for each pagination element.

## PaginationLink Props

Extends `React.ComponentProps<"a">` — accepts all standard `<a>` HTML attributes (`href`, `onClick`, `aria-*`, etc.).

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `isActive` | `boolean` | `false` | `true` (blue-5 bg, white text, no shadow) · `false` (neumorphic) |
| `shape` | `string` | `"default"` | `"default"` (rounded-[8px]) · `"circle"` (rounded-[32px]) |

## PaginationPrevious / PaginationNext Props

Extends `React.ComponentProps<"a">` — accepts all standard `<a>` HTML attributes.

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `shape` | `string` | `"default"` | `"default"` · `"circle"` |
| `disabled` | `boolean` | `false` | Disables the control, uses `stroke-gray-2` icon |

## PaginationEllipsis Props

Extends `React.ComponentProps<"span">` — accepts all standard `<span>` HTML attributes.

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `shape` | `string` | `"default"` | `"default"` · `"circle"` |

## Design Tokens

- Size: 32×32px
- Border: 1px solid stroke-secondary, hover → stroke-primary
- Background: background-primary + shadow-inset-default (neumorphism)
- Active: bg blue-5, text gray-0, no shadow
- Typography: STK/Label (14px/20px, font-light)
- Gap: 5px between items
- Icons: 16×16 ChevronLeft / ChevronRight, stroke-icon-primary

## Examples

### Default (rounded)

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">10</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### Circle variant

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" shape="circle" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive shape="circle">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" shape="circle">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" shape="circle" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### With page select

```tsx
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from "@adaptionlabs/ui-kit";
import { Text } from "@adaptionlabs/ui-kit";

<div className="flex items-center gap-2">
  <Text as="span" variant="label" color="secondary">Page</Text>
  <Select value={currentPage} onValueChange={onPageChange}>
    <SelectTrigger variant="outline" size="sm" className="w-[70px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {Array.from({ length: totalPages }, (_, i) => (
        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
      ))}
    </SelectContent>
  </Select>
  <Text as="span" variant="label" color="secondary">of {totalPages}</Text>
</div>
```
