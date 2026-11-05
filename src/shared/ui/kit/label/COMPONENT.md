# Label

Form field label based on Radix Label.

```tsx
import { Label } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Label (standalone)
└── children (text + optional form control)
```

## Props

Extends `React.ComponentProps<typeof LabelPrimitive.Root>` — accepts all Radix Label props and standard `<label>` HTML attributes (`id`, `style`, `aria-*`, etc.).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `htmlFor` | `string` | — | Associates with input id |
| `disabled` | `boolean` | `false` | Grayed out styling (`text-gray-2`) |
| `asChild` | `boolean` | `false` | Polymorphic rendering via Radix Slot |

## Examples

```tsx
<Label htmlFor="email">Email address</Label>
<Label disabled>Disabled label</Label>
```
