# InteractiveBadge

Clickable badge with selection state. Extends Badge styling with hover effects and selected highlights. Rendered as `<button>`.

```tsx
import { InteractiveBadge } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
InteractiveBadge
├── children (text, icons)
└── closable → CrossLargeIcon (X button)
```

## Props

Extends `React.ComponentProps<"button">` — accepts all standard `<button>` HTML attributes (`onClick`, `disabled`, `type`, `aria-*`, etc.). Inherits Badge variant props (`size`, `color`, `radius`).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `string` | `"default"` | `"default"` · `"md"` · `"sm"` · `"icon"` |
| `color` | `string` | `"default"` | `"default"` · `"ghost"` · `"neutral"` · `"accent"` |
| `radius` | `string` | — | `"square"` (4px) — default is pill (56px) |
| `isSelected` | `boolean` | `false` | Activates selected visual state |
| `closable` | `boolean` | `false` | Shows close icon |
| `onClose` | `() => void` | — | Close callback (stops event propagation) |
| `asChild` | `boolean` | `false` | Polymorphic rendering via Radix Slot |

## Color Behavior (hover + selected)

| Color | Hover | Selected |
|-------|-------|----------|
| `default` | `bg-background-secondary` | Blue glow shadow + `bg-blue-1` + `border-blue-5` |
| `ghost` | Blue gradient bg, no shadow | Blue gradient bg + `border-blue-5` + blue glow |
| `neutral` | `border-stroke-primary` | `bg-gray-5` + inverse text color |
| `accent` | `border-blue-5` | `bg-blue-5` + inverse text color |

## Examples

```tsx
{/* Basic toggle */}
<InteractiveBadge isSelected={selected} onClick={handleToggle}>
  Category
</InteractiveBadge>

{/* Closable selected badge */}
<InteractiveBadge isSelected closable onClose={handleRemove}>
  Selected Tag
</InteractiveBadge>

{/* Neutral color variant */}
<InteractiveBadge color="neutral" isSelected={active}>
  Filter
</InteractiveBadge>

{/* Accent color variant */}
<InteractiveBadge color="accent" isSelected={active}>
  Accent Label
</InteractiveBadge>

{/* Tag group pattern */}
<div className="flex flex-wrap gap-2">
  {tags.map(tag => (
    <InteractiveBadge
      key={tag.id}
      isSelected={selectedTags.includes(tag.id)}
      onClick={() => handleToggleTag(tag.id)}
      size="md"
    >
      {tag.label}
    </InteractiveBadge>
  ))}
</div>
```
