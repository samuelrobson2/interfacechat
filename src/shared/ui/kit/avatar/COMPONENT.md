# Avatar

User profile image with fallback based on Radix Avatar.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Avatar
├── AvatarImage
└── AvatarFallback (shown when image fails to load)
```

## Avatar (Root) Props

Extends all props from Radix `Avatar.Root`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element instead of rendering a DOM node |

## AvatarImage Props

Extends all props from Radix `Avatar.Image` (which extends `<img>` attributes).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image source URL |
| `alt` | `string` | — | Alt text for the image |
| `onLoadingStatusChange` | `(status: "idle" \| "loading" \| "loaded" \| "error") => void` | — | Callback for image loading status changes |
| `asChild` | `boolean` | `false` | Merge props onto child element |

## AvatarFallback Props

Extends all props from Radix `Avatar.Fallback`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userName` | `string \| null` | — | Extracts first letter as fallback initial |
| `delayMs` | `number` | — | Delay in ms before rendering fallback (avoids flash for fast connections) |
| `asChild` | `boolean` | `false` | Merge props onto child element |

## Recommended Image Specifications

| Property | Value |
|----------|-------|
| **Aspect ratio** | 1:1 (square) |
| **Min size** | 128 × 128 px |
| **Ideal size** | 256 × 256 px |

The component renders at fixed square sizes controlled via `className`. Image uses `object-cover` — non-square sources will be center-cropped.

| className | Display size | Source min (2×) |
|-----------|-------------|-----------------|
| `size-6` | 24 × 24 px | 48 × 48 px |
| `size-8` | 32 × 32 px | 64 × 64 px |
| `size-10` | 40 × 40 px | 80 × 80 px |
| `size-12` | 48 × 48 px | 96 × 96 px |
| `size-14` | 56 × 56 px | 112 × 112 px |

## Examples

```tsx
<Avatar className="size-10">
  <AvatarImage src="/user.jpg" alt="User" />
  <AvatarFallback userName="John Doe" />
</Avatar>
```
