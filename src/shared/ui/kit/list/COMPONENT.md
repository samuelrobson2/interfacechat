# List

Styled list component with multiple marker types. Renders as `<ol>` for numbered lists, `<ul>` for others.

```tsx
import { List, ListItem } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
List
├── ListItem
├── ListItem
├── ListItem
└── ...
```

## List Props

Extends `Omit<React.HTMLAttributes<HTMLElement>, "type">` — accepts all standard HTML attributes (`id`, `style`, `className`, `onClick`, `aria-*`, etc.) except `type` which is overridden.

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `type` | `string` | `"dot"` | `"dot"` (blue circle marker) · `"number"` (CSS counter, renders `<ol>`) · `"line"` (blue dash marker) · `"check"` (blue checkmark icon) |

## ListItem Props

Extends `React.ComponentProps<"li">` — accepts all standard `<li>` HTML attributes (`id`, `style`, `onClick`, `aria-*`, etc.).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | — | Overrides parent List type for this item |

## Marker Types

| Type | Marker | Element |
|------|--------|---------|
| `dot` | Small blue circle (`bg-blue-5`, 4×4px) | `<ul>` |
| `number` | CSS counter with period (`1.`, `2.`, ...) | `<ol>` |
| `line` | Short blue dash (`bg-blue-5`, 6×2px) | `<ul>` |
| `check` | Blue checkmark icon (`stroke-blue-5`) | `<ul>` |

## Context

List uses React Context to pass `type` down to ListItem children. Individual ListItem can override the type via its own `type` prop.

## Examples

```tsx
{/* Dot list (default) */}
<List>
  <ListItem>First item</ListItem>
  <ListItem>Second item</ListItem>
  <ListItem>Third item</ListItem>
</List>

{/* Numbered list */}
<List type="number">
  <ListItem>Step one</ListItem>
  <ListItem>Step two</ListItem>
  <ListItem>Step three</ListItem>
</List>

{/* Check list */}
<List type="check">
  <ListItem>Feature A included</ListItem>
  <ListItem>Feature B included</ListItem>
</List>

{/* Line list */}
<List type="line">
  <ListItem>Benefit one</ListItem>
  <ListItem>Benefit two</ListItem>
</List>
```
