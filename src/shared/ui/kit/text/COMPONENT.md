# Text

Typography component for consistent text rendering.

```tsx
import { Text } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Text (standalone)
```

## Props

Extends `Omit<React.HTMLAttributes<HTMLElement>, "color">` — accepts all standard HTML element attributes (`id`, `style`, `onClick`, `aria-*`, etc.) except `color` which is overridden by the CVA variant.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `"body"` | `"h1"` (40/48) · `"h2"` (28/36) · `"h3"` (24/32) · `"title"` (20/28) · `"subtitle"` (18/24) · `"body"` (16/24) · `"label"` (14/20) |
| `weight` | string | `"light"` | `"light"` (300) · `"regular"` (400) · `"bold"` (700) |
| `color` | string | `"primary"` | `"primary"` · `"secondary"` · `"inverse"` · `"darkGray"` · `"error"` · `"disabled"` · `"blue5"` · `"none"` |
| `as` | string | `"p"` | `"p"` · `"span"` · `"div"` · `"label"` · `"h1"` · `"h2"` — rendered HTML element |
| `asChild` | boolean | `false` | Renders child element with text styles via Radix Slot |
| `ref` | `React.Ref<HTMLElement>` | — | Ref forwarded to the rendered element |

Font: `font-bureau` (Bureau Sans), `font-light` by default.

## Examples

```tsx
<Text variant="h2" weight="bold">Heading</Text>
<Text variant="body" color="secondary">Description text</Text>
<Text as="span" variant="label" color="error">Error</Text>
```
