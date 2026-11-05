# NavigationMenu

Accessible navigation menu based on Radix NavigationMenu. Supports dropdown content panels, viewport rendering, and keyboard navigation.

```tsx
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem,
  NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink,
  NavigationMenuIndicator, NavigationMenuViewport
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
NavigationMenu
├── NavigationMenuList
│   ├── NavigationMenuItem
│   │   ├── NavigationMenuTrigger
│   │   └── NavigationMenuContent
│   │       ├── NavigationMenuLink (variant="content")
│   │       ├── NavigationMenuLink (variant="content")
│   │       └── NavigationMenuLink (variant="content")
│   ├── NavigationMenuItem
│   │   └── NavigationMenuLink (variant="inline")
│   └── NavigationMenuItem
│       ├── NavigationMenuTrigger
│       └── NavigationMenuContent
│           └── NavigationMenuLink (variant="content")
├── NavigationMenuIndicator
└── NavigationMenuViewport (auto-rendered when viewport=true)
```

## NavigationMenu Props

Extends `React.ComponentProps<typeof NavigationMenuPrimitive.Root>` — accepts all Radix NavigationMenu.Root props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `viewport` | `boolean` | `true` | Renders shared viewport container. Set `false` for per-item absolute positioning |
| `defaultValue` | `string` | — | Active menu item value (uncontrolled) |
| `value` | `string` | — | Active menu item value (controlled) |
| `onValueChange` | `(value: string) => void` | — | Value change callback |
| `delayDuration` | `number` | `200` | Delay in ms before menu opens on hover |
| `skipDelayDuration` | `number` | `300` | Delay in ms before menu closes |
| `dir` | `string` | — | Reading direction (`"ltr"` · `"rtl"`) |
| `orientation` | `string` | `"horizontal"` | `"horizontal"` · `"vertical"` |

## NavigationMenuList Props

Extends `React.ComponentProps<typeof NavigationMenuPrimitive.List>` — accepts all Radix NavigationMenu.List props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Polymorphic rendering |

## NavigationMenuItem Props

Extends `React.ComponentProps<typeof NavigationMenuPrimitive.Item>` — accepts all Radix NavigationMenu.Item props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Unique value for identifying the active item |
| `asChild` | `boolean` | `false` | Polymorphic rendering |

## NavigationMenuTrigger Props

Extends `React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>` — accepts all Radix NavigationMenu.Trigger props. Renders a button with chevron icon.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Polymorphic rendering |

CVA variants via `navigationMenuTriggerVariants`:

| Variant | State | Description |
|---------|-------|-------------|
| `state` | `"default"` | No background |
| `state` | `"active"` | `bg-gray-6 rounded-[4px]` |

Hover and `data-[state=open]` automatically apply `bg-gray-6 rounded-[4px]`.

## NavigationMenuContent Props

Extends `React.ComponentProps<typeof NavigationMenuPrimitive.Content>` — accepts all Radix NavigationMenu.Content props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Polymorphic rendering |
| `forceMount` | `boolean` | — | Force mounting when more control is needed |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | — | Escape key handler |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void` | — | Pointer outside handler |
| `onFocusOutside` | `(event: FocusOutsideEvent) => void` | — | Focus outside handler |
| `onInteractOutside` | `(event: ...) => void` | — | Any interaction outside handler |

In viewport mode, renders inside `NavigationMenuViewport`. In non-viewport mode (`viewport=false`), renders absolutely positioned under the trigger with border and bg.

## NavigationMenuLink Props

Extends `React.ComponentProps<typeof NavigationMenuPrimitive.Link>` — accepts all Radix NavigationMenu.Link props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `"content"` | `"content"` — dropdown item (flex column, p-3, hover bg-gray-6) · `"inline"` — top-level nav link (same look as trigger) |
| `active` | `boolean` | — | Marks link as active (Radix prop) |
| `onSelect` | `(event: Event) => void` | — | Select handler (Radix prop) |
| `asChild` | `boolean` | `false` | Polymorphic rendering |

## NavigationMenuIndicator Props

Extends `React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>` — accepts all Radix NavigationMenu.Indicator props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `forceMount` | `boolean` | — | Force mounting |

## NavigationMenuViewport Props

Extends `React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>` — accepts all Radix NavigationMenu.Viewport props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `forceMount` | `boolean` | — | Force mounting |

## Examples

```tsx
{/* With viewport (default) */}
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/analytics">
          <Text variant="body" weight="regular">Analytics</Text>
          <Text variant="label" color="secondary">Track your metrics</Text>
        </NavigationMenuLink>
        <NavigationMenuLink href="/reports">
          <Text variant="body" weight="regular">Reports</Text>
          <Text variant="label" color="secondary">Generate reports</Text>
        </NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink variant="inline" href="/pricing">
        Pricing
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>

{/* Without viewport */}
<NavigationMenu viewport={false}>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/item-1">Item 1</NavigationMenuLink>
        <NavigationMenuLink href="/item-2">Item 2</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```
