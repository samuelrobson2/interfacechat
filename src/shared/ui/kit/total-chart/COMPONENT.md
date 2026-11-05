# TotalChart

Usage chart card with a multi-segment donut and per-segment progress bars.

```tsx
import { TotalChart } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
TotalChart (Card shape="rounded")
├── title (Text variant="title")
├── value display ("{totalUsed}{unit}")
├── subtitle ("of {totalMax}{unit}")
├── multi-segment donut (120×120 SVG)
│   ├── track ring (gray-2)
│   ├── segment arcs (custom colors)
│   └── center label ("{percentage}%" + centerLabel)
└── segment rows (ProgressRow + Progress per segment)
```

## Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Chart heading |
| `totalMax` | `number` | **required** | Maximum capacity (denominator for percentages) |
| `unit` | `string` | `""` | Unit label displayed after values (e.g. `"GB"`, `"%"`) |
| `centerLabel` | `string` | `"Used"` | Secondary text inside the donut center |
| `segments` | `TotalChartSegment[]` | **required** | Data segments (see below) |

## TotalChartSegment

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Row label text |
| `value` | `number` | Segment value (absolute, not percentage) |
| `color` | `string` | Tailwind color token (e.g. `"blue-4"`, `"orange-5"`) or raw CSS color (`"#46a5d8"`, `"var(--color-blue-4)"`) |

Colors are resolved automatically: a token like `"blue-4"` becomes `var(--color-blue-4)`. Raw CSS values (`#hex`, `rgb()`, `hsl()`, `var()`) are used as-is.

## Design Tokens

- Container: Card shape="rounded", spacing="none", p-8
- Donut: 120×120, stroke-width 8, butt linecaps, track gray-2
- Title: Text variant="title"
- Value: Text variant="h2" + variant="title" color="secondary" for unit
- Subtitle: Text variant="label" color="secondary"
- Rows: ProgressRow (label + value) with Progress bar, custom indicator color via CSS variable

## Examples

### Basic usage

```tsx
<TotalChart
  title="Usage details"
  totalMax={100}
  unit="GB"
  centerLabel="Used"
  segments={[
    { label: "Option 1", value: 25, color: "blue-4" },
    { label: "Option 2", value: 25, color: "orange-5" },
    { label: "Option 3", value: 25, color: "yellow-5" },
    { label: "Option 4", value: 12.5, color: "green-5" },
  ]}
/>
```

### Custom colors

```tsx
<TotalChart
  title="Resources"
  totalMax={100}
  unit="%"
  centerLabel="Load"
  segments={[
    { label: "CPU", value: 35, color: "red-5" },
    { label: "Memory", value: 25, color: "mint-2" },
    { label: "Disk", value: 15, color: "rose-2" },
  ]}
/>
```

### Single segment

```tsx
<TotalChart
  title="Bandwidth"
  totalMax={100}
  unit="GB"
  segments={[{ label: "Total used", value: 42, color: "blue-5" }]}
/>
```
