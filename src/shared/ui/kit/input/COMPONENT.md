# Input

Text input field with floating/labeled/plain variants.

```tsx
import { Input } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Input (standalone)
├── leftElement (icon/element on the left)
├── label (floating/above)
├── <input> (inner element)
├── rightElement (icon/element on the right)
└── error (message below)
```

## Props

Extends `Omit<React.ComponentProps<"input">, "className" | "ref">` — accepts all standard `<input>` HTML attributes (`type`, `placeholder`, `name`, `value`, `onChange`, `disabled`, `autoComplete`, `aria-*`, etc.) except `className` and `ref` which are overridden.

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `variant` | `string` | `"floating"` | `"floating"` (label animates inside) · `"labeled"` (label above) · `"plain"` (no label) |
| `fill` | `string` | `"default"` | `"default"` · `"outlined"` · `"filled"` · `"underline"` |
| `shape` | `string` | `"square"` | `"square"` (4px radius) · `"rounded"` (20px+ for floating, 52px for labeled/plain) |
| `label` | `string` | — | Label text |
| `error` | `string \| ReactNode` | — | Error message below input |
| `isError` | `boolean` | `false` | Error border without message |
| `leftElement` | `ReactNode` | — | Icon/element on the left |
| `rightElement` | `ReactNode` | — | Icon/element on the right |
| `disabled` | `boolean` | `false` | Disables input |
| `className` | `string` | — | Class for the input container div |
| `wrapperClassName` | `string` | — | Class for outer wrapper div |
| `inputClassName` | `string` | — | Class for inner `<input>` element |
| `labelClassName` | `string` | — | Class for label element |
| `inputRef` | `React.Ref<HTMLInputElement>` | — | Ref forwarded to the `<input>` element |
| `ref` | `React.Ref<HTMLDivElement>` | — | Ref for the outer wrapper div |

## Examples

```tsx
<Input label="Email" fill="outlined" />
<Input variant="labeled" fill="filled" label="Search" placeholder="Type..." />
<Input variant="plain" fill="outlined" shape="rounded" placeholder="Message" />
<Input label="Password" error="Required field" />
```
