# Button

Primary action element.

```tsx
import { Button } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Button (standalone or with asChild)
├── children (text, icons)
└── isLoading → Lottie animation
```

## Props

Extends `React.ComponentProps<"button">` — accepts all standard `<button>` HTML attributes (`type`, `disabled`, `onClick`, `form`, `aria-*`, etc.).

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `variant` | `string` | `"primary"` | `"primary"` · `"secondary"` · `"tertiary"` · `"link"` · `"link-destructive"` · `"ghost"` · `"icon-button"` · `"destructive"` · `"black"` · `"blue"` |
| `size` | `string` | `"56"` | `"56"` (h-14) · `"48"` (h-12) · `"40"` (h-10) · `"icon"` (40×40) · `"icon-md"` (36×36) · `"icon-sm"` (32×32) |
| `radius` | `string` | `"default"` | `"default"` · `"rounded"` (60px pill) |
| `isLoading` | `boolean` | `false` | Shows Lottie loading animation, disables button |
| `lottieClassName` | `string` | — | Additional CSS classes for the Lottie animation element |
| `disabled` | `boolean` | `false` | Disables the button |
| `asChild` | `boolean` | `false` | Renders child element with button styles (Radix Slot) |

## Examples

```tsx
<Button variant="primary" size="48">Submit</Button>
<Button variant="ghost" size="icon">
  <SearchIcon pathClasses="stroke-current" />
</Button>
<Button asChild variant="primary">
  <a href="/page">Navigate</a>
</Button>
```
