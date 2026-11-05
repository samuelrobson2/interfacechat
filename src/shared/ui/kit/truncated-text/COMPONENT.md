# TruncatedText

Text with overflow ellipsis and tooltip.

```tsx
import { TruncatedText } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
TruncatedText (standalone)
└── Tooltip (auto, shown only when text overflows)
```

## Props

Extends `Omit<TextProps, "as">` — accepts all Text props except `as` (always renders as `<p>`).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxLines` | number | `1` | Lines before truncation (1 = single-line ellipsis, >1 = multi-line `-webkit-line-clamp`) |
| `tooltipContent` | ReactNode | — | Custom tooltip content (defaults to `children`) |
| `variant` | string | `"body"` | `"h1"` · `"h2"` · `"h3"` · `"title"` · `"body"` · `"label"` — inherited from Text |
| `weight` | string | `"light"` | `"light"` · `"regular"` · `"bold"` — inherited from Text |
| `color` | string | `"primary"` | `"primary"` · `"secondary"` · `"inverse"` · `"darkGray"` · `"error"` · `"disabled"` · `"blue5"` · `"none"` — inherited from Text |
| `asChild` | boolean | `false` | Renders child element with text styles via Slot — inherited from Text |

Automatically detects overflow via ResizeObserver and shows full text in a tooltip on hover. When `maxLines=1`, uses `white-space: nowrap` + `text-overflow: ellipsis`. When `maxLines>1`, uses `-webkit-line-clamp`.

## Examples

```tsx
<TruncatedText className="max-w-[200px]">
  Very long text that gets truncated with ellipsis
</TruncatedText>

<TruncatedText maxLines={3} variant="label" color="secondary" className="max-w-[300px]">
  Multi-line text that will be clamped after 3 lines with a tooltip on hover
</TruncatedText>
```
