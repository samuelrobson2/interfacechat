# Breadcrumb

Navigation hierarchy trail.

```tsx
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Breadcrumb
└── BreadcrumbList
    ├── BreadcrumbItem
    │   └── BreadcrumbLink
    ├── BreadcrumbSeparator
    ├── BreadcrumbItem
    │   └── BreadcrumbLink
    ├── BreadcrumbSeparator
    ├── BreadcrumbEllipsis (optional, for overflow)
    ├── BreadcrumbSeparator
    └── BreadcrumbItem
        └── BreadcrumbPage (current page, no link)
```

## Breadcrumb Props

Extends `React.ComponentProps<"nav">` — accepts all standard `<nav>` HTML attributes. Automatically sets `aria-label="breadcrumb"`.

## BreadcrumbList Props

Extends `React.ComponentProps<"ol">` — accepts all standard `<ol>` HTML attributes.

## BreadcrumbItem Props

Extends `React.ComponentProps<"li">` — accepts all standard `<li>` HTML attributes.

## BreadcrumbLink Props

Extends `React.ComponentProps<"a">` — accepts all standard `<a>` HTML attributes (`href`, `target`, etc.).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Polymorphic rendering via Radix Slot (use for router `<Link>`) |
| `href` | `string` | — | Link destination URL |

## BreadcrumbPage Props

Extends `React.ComponentProps<"span">` — accepts all standard `<span>` HTML attributes. Renders with `aria-current="page"` and `aria-disabled="true"`.

## BreadcrumbSeparator Props

Extends `React.ComponentProps<"li">` — accepts all standard `<li>` HTML attributes. Renders with `role="presentation"` and `aria-hidden="true"`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | `<ChevronRightIcon />` | Custom separator content (defaults to chevron icon) |

## BreadcrumbEllipsis Props

Extends `React.ComponentProps<"span">` — accepts all standard `<span>` HTML attributes. Renders with `role="presentation"` and `aria-hidden="true"`.

## Examples

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Profile</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```
