# Alert

Contextual feedback messages.

```tsx
import { Alert, AlertTitle, AlertDescription } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Alert
├── AlertTitle
└── AlertDescription
```

## Alert Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes (`id`, `style`, `onClick`, `aria-*`, etc.).

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `variant` | `string` | `"default"` | `"default"` · `"destructive"` |

## AlertTitle Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## AlertDescription Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## Examples

```tsx
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```
