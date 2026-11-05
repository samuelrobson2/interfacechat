# Skeleton

Loading placeholder with pulse animation.

```tsx
import { Skeleton } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Skeleton (standalone)
```

## Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes (`id`, `style`, `onClick`, `aria-*`, etc.).

No custom props. Size and shape are controlled entirely via `className`. Default appearance: `bg-skeleton-primary animate-pulse rounded-[4px]`.

## Examples

```tsx
<Skeleton className="h-6 w-48" />
<Skeleton className="size-10 rounded-full" />
```
