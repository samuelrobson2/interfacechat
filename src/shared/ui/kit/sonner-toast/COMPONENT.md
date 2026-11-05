# Toaster & toast

Toast notification system based on Sonner.

```tsx
import { Toaster, toast } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Toaster (placed once at app root)
└── renders toast notifications in bottom-right

toast.success / toast.error / toast.warning / toast.info / toast.loading (imperative API)
```

## Toaster Props

Extends `ToasterProps` from `sonner` — accepts all Sonner Toaster props. Custom defaults override Sonner defaults.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | string | `"bottom-right"` | `"top-left"` · `"top-center"` · `"top-right"` · `"bottom-left"` · `"bottom-center"` · `"bottom-right"` |
| `theme` | string | auto (from `next-themes`) | `"light"` · `"dark"` · `"system"` |
| `richColors` | boolean | `false` | More colorful success/error states |
| `expand` | boolean | `false` | Expand toasts by default |
| `visibleToasts` | number | `3` | Max visible toasts at once |
| `closeButton` | boolean | `false` | Add close button to all toasts |
| `duration` | number | `4000` | Default auto-close duration in ms |
| `gap` | number | `14` | Gap between toasts in px |
| `offset` | number | `24` | Offset from screen edges in px |
| `dir` | string | `"ltr"` | `"ltr"` · `"rtl"` · `"auto"` |
| `hotkey` | string[] | `["altKey", "KeyT"]` | Keyboard shortcut to focus toasts |
| `invert` | boolean | `false` | Dark toast in light mode and vice versa |
| `toastOptions` | object | `{ unstyled: true }` | Default options applied to all toasts (`className`, `style`, `duration`, etc.) |
| `pauseWhenPageIsHidden` | boolean | — | Pause auto-close when page is hidden |

## toast API

| Method | Signature | Description |
|--------|-----------|-------------|
| `toast.success` | `(title: string, options?) => id` | Green check icon |
| `toast.error` | `(title: string, options?) => id` | Red alert icon |
| `toast.warning` | `(title: string, options?) => id` | Orange info icon |
| `toast.info` | `(title: string, options?) => id` | Blue info icon |
| `toast.loading` | `(title: string, options?) => id` | Spinning loader |
| `toast.dismiss` | `(id?) => void` | Dismiss a specific toast or all |
| `toast.promise` | `(promise, data?) => id` | Toast tied to a Promise lifecycle |

### ToastOptions (options parameter)

Extends `ExternalToast` from `sonner`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `ReactNode \| (() => ReactNode)` | — | Secondary text below title |
| `duration` | number | `4000` | Auto-close duration in ms |
| `button` | `{ label: string; onClick: () => void }` | — | Action button below description |
| `dismissible` | boolean | `true` | Allow user to dismiss |
| `onDismiss` | function | — | Called on close/swipe dismiss |
| `onAutoClose` | function | — | Called when auto-closed by timer |
| `id` | `string \| number` | — | Custom toast ID |

## Examples

```tsx
// In root layout:
<Toaster />

// Anywhere in code:
toast.success("Saved!", { description: "Your changes were saved." });
toast.error("Failed", { button: { label: "Retry", onClick: handleRetry } });
toast.loading("Uploading...");
```
