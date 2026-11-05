# ExpandedText

Text with expand/collapse toggle.

```tsx
import { ExpandedText } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
ExpandedText (standalone)
├── truncated text content
└── "See more" / "See less" toggle link
```

## Props

Extends `Omit<TextProps, "as">` — accepts all Text component props (`variant`, `weight`, `color`, `asChild`, `className`, `children`, etc.) except `as`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxLines` | `number` | `3` | Visible lines before truncation |
| `seeMoreText` | `string` | `"See more"` | Expand button label |
| `seeLessText` | `string` | `"See less"` | Collapse button label |
| `variant` | `string` | `"body"` | `"h1"` · `"h2"` · `"h3"` · `"title"` · `"body"` · `"label"` |
| `weight` | `string` | `"light"` | `"light"` · `"regular"` · `"bold"` |
| `color` | `string` | `"primary"` | `"primary"` · `"secondary"` · `"inverse"` · `"darkGray"` · `"error"` · `"disabled"` · `"none"` · `"blue5"` |

## Examples

```tsx
<ExpandedText variant="body" maxLines={3}>
  Long text that will be truncated after 3 lines with a "See more" link...
</ExpandedText>
```
