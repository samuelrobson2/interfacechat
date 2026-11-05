# Table

Data table with sticky header and custom scrollbar.

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableCaption,
  computeColWidths,
  equalColumnPercents,
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Table
├── TableCaption (optional)
├── TableHeader
│   └── TableRow
│       ├── TableHead
│       └── TableHead
├── TableBody
│   ├── TableRow
│   │   ├── TableCell
│   │   └── TableCell
│   └── TableRow
│       ├── TableCell
│       └── TableCell
└── TableFooter (optional)
    └── TableRow
        └── TableCell
```

## Table Props

Extends `React.ComponentProps<"table">` — accepts all standard `<table>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `wrapperClassName` | string | — | Class for the outer scroll container div |
| `size` | `"default" \| "compact"` | `"default"` | Controls cell density. `compact` shrinks `TableHead`/`TableCell` padding (`px-2 py-2`) and switches their text variant from `body` (16px) to `label` (14px). Propagated to descendants via React context — set it only on the top-level `<Table>`. |

The outer wrapper provides custom styled scrollbars and overflow handling. Header is sticky at `top-0`.

## TableHeader Props

Extends `React.ComponentProps<"thead">` — accepts all standard `<thead>` HTML attributes. Sticky header with `bg-background-primary`.

## TableBody Props

Extends `React.ComponentProps<"tbody">` — accepts all standard `<tbody>` HTML attributes.

## TableRow Props

Extends `React.ComponentProps<"tr">` — accepts all standard `<tr>` HTML attributes. Supports `data-[state=selected]` for selected row styling.

## TableHead Props

Extends `React.ComponentProps<"th">` — accepts all standard `<th>` HTML attributes. Text variant and padding follow the parent `Table`'s `size` prop: `body` (16px) + `px-3 py-4` for `default`, `label` (14px) + `px-2 py-2` for `compact`. Color is `secondary`.

## TableCell Props

Extends `React.ComponentProps<"td">` — accepts all standard `<td>` HTML attributes. Text variant and padding follow the parent `Table`'s `size` prop: `body` (16px) + `px-3 py-4` for `default`, `label` (14px) + `px-2 py-2` for `compact`.

## TableFooter Props

Extends `React.ComponentProps<"td">` — rendered as a `<div>`, sticky at `bottom-0`.

## TableCaption Props

Extends `React.ComponentProps<"caption">` — accepts all standard `<caption>` HTML attributes.

## Utility: `computeColWidths`

```ts
computeColWidths(keys: string[], rows: Record<string, unknown>[]): number[]
```

Returns integer column widths as percentages that sum to **100**, derived from the average string length of each key across `rows`. Short columns are floored at a minimum share (at most **15%**, capped so `n` columns can still total 100); remaining width is distributed proportionally among the rest. Use with TanStack `columnDef.size` when rendering widths as `%`.

## Utility: `equalColumnPercents`

```ts
equalColumnPercents(columnCount: number): number[]
```

Returns integer percentages summing to **100** with each column as equal a share as possible (remainder of `100 % columnCount` is spread across the first columns). Prefer this when every column should have the same width.

## Examples

```tsx
<Table wrapperClassName="max-h-96">
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item A</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Compact density

```tsx
<Table size="compact">
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item A</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```
