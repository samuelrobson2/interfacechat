# Tabs

Tabbed content navigation based on Radix Tabs.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Tabs
├── TabsList
│   ├── TabsTrigger (value="tab1")
│   ├── TabsTrigger (value="tab2")
│   └── TabsTrigger (value="tab3")
├── TabsContent (value="tab1")
├── TabsContent (value="tab2")
└── TabsContent (value="tab3")
```

## Tabs (Root) Props

Extends `React.ComponentProps<typeof TabsPrimitive.Root>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValue` | string | — | Initial active tab (uncontrolled) |
| `value` | string | — | Controlled active tab |
| `onValueChange` | `(value: string) => void` | — | Called when active tab changes |
| `orientation` | string | `"horizontal"` | `"horizontal"` · `"vertical"` |
| `dir` | string | — | `"ltr"` · `"rtl"` — reading direction |
| `activationMode` | string | `"automatic"` | `"automatic"` (on focus) · `"manual"` (on click/Enter) |

## TabsList Props

Extends `React.ComponentProps<typeof TabsPrimitive.List>` + CVA variants + context props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `"underline"` | `"underline"` (bottom border) · `"solid"` (filled bg, 4px radius) · `"pill"` (filled bg, 52px radius) |
| `color` | string | `"default"` | `"default"` (dark gradient / black border) · `"blue"` (blue-5 active) |
| `size` | string | `"lg"` | `"lg"` (title/20px text) · `"md"` (body/16px text) |
| `loop` | boolean | `true` | Keyboard navigation wraps from last to first trigger |

`variant`, `color`, and `size` are passed to child `TabsTrigger` components via React context.

## TabsTrigger Props

Extends `React.ComponentProps<typeof TabsPrimitive.Trigger>`. Reads `variant`/`color`/`size` from `TabsList` context automatically.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | — | Tab value (required, must match a `TabsContent` value) |
| `disabled` | boolean | `false` | Disables this trigger |
| `asChild` | boolean | `false` | Merge props onto child element |

## TabsContent Props

Extends `React.ComponentProps<typeof TabsPrimitive.Content>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | — | Tab value (required, must match a `TabsTrigger` value) |
| `forceMount` | boolean | — | Keep mounted when inactive |

## Examples

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Overview</TabsTrigger>
    <TabsTrigger value="tab2">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Overview content</TabsContent>
  <TabsContent value="tab2">Details content</TabsContent>
</Tabs>

<Tabs defaultValue="tab1">
  <TabsList variant="solid" color="blue" size="md">
    <TabsTrigger value="tab1">Tab A</TabsTrigger>
    <TabsTrigger value="tab2">Tab B</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content A</TabsContent>
  <TabsContent value="tab2">Content B</TabsContent>
</Tabs>

<Tabs defaultValue="tab1">
  <TabsList variant="pill">
    <TabsTrigger value="tab1">Label</TabsTrigger>
    <TabsTrigger value="tab2">Label</TabsTrigger>
  </TabsList>
</Tabs>
```
