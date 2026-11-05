# Textarea

Multi-line text input with auto-resize.

```tsx
import { Textarea } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Textarea (standalone)
├── leftElement
├── label (floating)
├── <textarea> (auto-resizing)
├── rightElement
└── error (message below)
```

## Props

Extends `Omit<TextareaAutosizeProps, "className" | "style">` from `react-textarea-autosize` — accepts all `<textarea>` HTML attributes (`value`, `defaultValue`, `onChange`, `placeholder`, `name`, `rows`, `disabled`, `autoComplete`, `aria-*`, etc.) plus auto-resize specific props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `"floating"` | `"floating"` (label animates inside) · `"plain"` (no label, placeholder only) |
| `fill` | string | `"default"` | `"default"` · `"filled"` · `"underline"` |
| `shape` | string | `"square"` | `"square"` (4px radius) · `"rounded"` (24px radius) |
| `label` | string | — | Floating label text (if `variant="floating"` and no label, falls back to `"plain"`) |
| `error` | `string \| ReactNode` | — | Error message below textarea |
| `isError` | boolean | `false` | Error border without message |
| `maxRows` | number | `4` | Max visible rows before scrolling (from `react-textarea-autosize`) |
| `minRows` | number | — | Minimum visible rows (from `react-textarea-autosize`) |
| `onHeightChange` | `(height: number, meta: { rowHeight: number }) => void` | — | Called when textarea height changes (from `react-textarea-autosize`) |
| `leftElement` | ReactNode | — | Left icon/element |
| `rightElement` | ReactNode | — | Right icon/element |
| `disabled` | boolean | `false` | Disables textarea |
| `className` | string | — | Class for the textarea container div |
| `inputClassName` | string | — | Class for the inner `<textarea>` element |
| `wrapperClassName` | string | — | Class for the outermost wrapper div |
| `ref` | `React.Ref<HTMLTextAreaElement>` | — | Ref forwarded to the `<textarea>` element |

## Examples

```tsx
<Textarea label="Description" maxRows={6} />
<Textarea label="Bio" error="Too long" />
<Textarea variant="plain" fill="filled" placeholder="Type something..." />
<Textarea variant="plain" fill="filled" shape="rounded" placeholder="Message..." />
<Textarea variant="plain" fill="underline" placeholder="Enter text..." />
```
