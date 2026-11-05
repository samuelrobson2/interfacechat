# SelectedText

Text with yellow gradient highlight.

```tsx
import { SelectedText } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
SelectedText (standalone)
```

## Props

Extends `React.ComponentProps<typeof Text>` (TextProps) — accepts all Text props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | — | `"heading"` · `"subheading"` · `"title"` · `"body"` · `"label"` · `"caption"` |
| `weight` | string | — | `"regular"` · `"medium"` · `"semibold"` · `"bold"` |
| `color` | string | — | `"primary"` · `"secondary"` · `"tertiary"` · `"inverse"` · `"error"` |
| `as` | string | `"p"` | `"p"` · `"span"` · `"div"` · `"label"` · `"h1"` · `"h2"` |
| `asChild` | boolean | `false` | Merge props onto child element via Slot |

Renders a `<Text>` wrapped with a `bg-gradient-yellow` highlight span behind the content.

## Examples

```tsx
<SelectedText variant="body">Highlighted text</SelectedText>
```
