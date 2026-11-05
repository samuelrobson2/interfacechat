# Sidebar

Application sidebar layout. Collapses to a 48px icon rail and expands to 172px
on hover, revealing item labels.

```tsx
import { SidebarLayout, SidebarCard, SidebarItem, SidebarItemLabel } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
SidebarLayout (expanded?)
├── SidebarCard
│   ├── SidebarItem (isActive)
│   │   ├── <icon />
│   │   └── SidebarItemLabel
│   └── SidebarItem
└── SidebarCard
    └── SidebarItem (user)
```

## Expansion model

`SidebarLayout` tracks hover internally and writes the resulting state to the
`data-expanded` attribute. Children react to it through Tailwind
`group-data-[expanded=true]/sidebar` variants (width, label visibility, alignment).

Pass the `expanded` prop to force the expanded state regardless of hover — useful
when an inline menu inside the sidebar is open.

## SidebarLayout Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` attributes.
Positioned `fixed z-40 top-10 left-4 md:left-12`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `expanded` | boolean | `false` | Forces the expanded state in addition to hover. |

## SidebarCard Props

Extends `React.ComponentProps<"div">`. Bordered translucent pill
(`rounded-[24px]`, `0.5px stroke-secondary` border). `w-12` when collapsed,
`w-[172px]` when the sidebar is expanded.

## SidebarItem Props

Extends `React.ComponentProps<"div">`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isActive` | boolean | `false` | Active styling: `bg-blue-1` background + `blue-4` icon/label. |
| `asChild` | boolean | `false` | Render as the child element (e.g. `Link`, `button`). |

Idle items use a `gray-1/25` background. SVG icons are auto-sized to 18px and
recolored via `icon-primary` (idle) / `blue-4` (active).

## SidebarItemLabel Props

Extends `React.ComponentProps<"span">`. Hidden while collapsed
(`group-data-[expanded=true]/sidebar:block`), turns `blue-4` when the parent
`SidebarItem` is active.

## Example

```tsx
<SidebarLayout>
  <SidebarCard>
    <SidebarItem asChild isActive>
      <Link to="/dashboard">
        <DashboardIcon />
        <SidebarItemLabel>Dashboard</SidebarItemLabel>
      </Link>
    </SidebarItem>
    <SidebarItem asChild>
      <Link to="/settings">
        <SettingsIcon />
        <SidebarItemLabel>Settings</SidebarItemLabel>
      </Link>
    </SidebarItem>
  </SidebarCard>
</SidebarLayout>
```
