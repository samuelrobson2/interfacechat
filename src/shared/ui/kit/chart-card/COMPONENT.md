# ChartCard

Composable chart card based on [`recharts`](https://recharts.org/). Provides a single outer card wrapper (`ChartCard`) with a shared shell (rounded border, inset shadow, backdrop blur) and seven chart types that slot inside it.

```tsx
import {
  ChartCard,
  ChartCardHeader,
  ChartCardFooter,
  ChartCardLegend,
  HorizontalBarsChart,
  DensityCurveChart,
  BoxPlotChart,
  HistogramChart,
  DivergingBarsChart,
  BubbleChart,
  BubbleSizeLegend,
} from "@adaptionlabs/ui-kit";
```

## Composition

Follows the shadcn "compound component" pattern. Assemble the card yourself:

```tsx
<ChartCard>
  <ChartCardHeader title="Title" subtitle="Subtitle" />
  <HorizontalBarsChart ... />
  <ChartCardLegend items={[{ label: "A", color: "blue-4" }]} />
  <ChartCardFooter title="Main text" subtitle="Secondary text" />
</ChartCard>
```

All slot components render `data-slot="chart-card*"` attributes so they can be targeted from the parent.

## Wrapper components

### `ChartCard`
Outer shell: `div` with rounded-[24px], border, shadow-inset, `bg-background-primary` and `pb-8`. Accepts all `<div>` props.

### `ChartCardHeader`
| Prop | Type | Description |
|------|------|-------------|
| `title` | `ReactNode` | Rendered as `Text variant="title"`. |
| `subtitle` | `ReactNode` | Rendered as `Text variant="label" color="secondary"`. |

### `ChartCardFooter`
Centered label/sub-label under the plot. Same `title` / `subtitle` props as header.

### `ChartCardLegend`
| Prop | Type | Description |
|------|------|-------------|
| `items` | `{ label, color }[]` | Color accepts Tailwind token (`"blue-4"`) or raw CSS color. |
| `title` | `ReactNode` | Optional heading (e.g. "Legend"). |
| `orientation` | `"horizontal" \| "vertical"` | Default `"horizontal"` (row under the chart). Use `"vertical"` for a side column. |

## Color tokens

All chart components accept Tailwind color tokens (e.g. `"blue-4"`, `"orange-5"`, `"rose-2"`) or raw CSS values (`"#fc8723"`, `"rgb(...)"`, `"var(--color-...)"`). Tokens are resolved to `var(--color-<token>)`.

## Chart components

Every chart renders inside a `ChartContainer` (from `../chart`) with a full-width `ResponsiveContainer`. All accept `height` (default per chart) and `className`.

### 1. `HorizontalBarsChart`
Grouped horizontal bars.

| Prop | Type | Description |
|------|------|-------------|
| `data` | `Array<Record<string, string \| number>>` | Row per category. |
| `categoryKey` | `string` | Key on each row used for the Y-axis label. |
| `series` | `{ key, label?, color }[]` | One `<Bar>` per series. |
| `colorKey` | `string?` | Optional per-row color override (token or CSS color on each row). |

### 2. `DensityCurveChart`
Smooth multi-group area chart with opacity + outline.

| Prop | Type | Description |
|------|------|-------------|
| `data` | `Array<Record<string, number>>` | Sorted by `xKey`. |
| `xKey` | `string` | — |
| `series` | `{ key, label?, color }[]` | — |
| `xLabel` / `yLabel` | `ReactNode?` | Axis titles. Rendered with our `Text` next to the plot (not via recharts' built-in axis label). |
| `fillOpacity` | `number?` | Default `0.35`. |

### 3. `BoxPlotChart`
Box-and-whisker diagram rendered via a custom SVG layer inside `<ComposedChart>`.

| Prop | Type | Description |
|------|------|-------------|
| `data` | `{ name, min, q1, median, q3, max, outliers?, color? }[]` | Per-group statistics. |
  | `defaultColor` | `string?` | Used when a datum doesn't specify `color`. Default `"gray-3"`. |
| `fillOpacity` | `number?` | Box fill opacity. Default `0.3`. |
| `xLabel` / `yLabel` | `ReactNode?` | Axis titles. Rendered with our `Text` next to the plot (not via recharts' built-in axis label). |

### 4. `HistogramChart`
Unified histogram — switch between bar (overlap, opacity) and dot-column rendering via the `variant` prop. Both variants share the same data shape.

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `"bars" \| "dots"` | Default `"bars"`. |
| `series` | `{ key, label?, color, data: { x, count }[] }[]` | One entry per group. |
| `xLabel` / `yLabel` | `ReactNode?` | Axis titles. |
| `fillOpacity` | `number?` | **bars** only. Default `0.8`. |
| `barCategoryGap` | `number \| string?` | **bars** only. Default `"10%"`. |
| `barSize` | `number?` | **bars** only. Fixed bar width in px. Default `8`. |
| `dotSize` | `number?` | **dots** only. Dot diameter in px. Default `8` — matches Figma. |
| `dotGapY` | `number?` | **dots** only. Vertical gap between dots in a column (px). Default `1`. |
| `columnGapX` | `number?` | **dots** only. Horizontal gap between dot columns (px). Default `4`. |
| `xLabelStep` | `number?` | **dots** only. Show an X-axis label every Nth column. Default `5`. |
| `yLabelStep` | `number?` | **dots** only. Count step for Y-axis labels/gridlines. Default `15`. |

### 5. `DivergingBarsChart`
Population-pyramid style — two conditions laid out on opposite sides of a central axis.

| Prop | Type | Description |
|------|------|-------------|
| `data` | `{ name, left, right }[]` | Values are treated as absolute (signs ignored). |
| `leftColor`, `rightColor` | `string` | Colors per side. |
| `leftLabel`, `rightLabel` | `ReactNode?` | Used in the tooltip. |

### 6. `BubbleChart`
Scatter plot with variable bubble size (`ZAxis`).

| Prop | Type | Description |
|------|------|-------------|
| `series` | `{ key, label?, color, data: { x, y, z }[] }[]` | `z` drives bubble size. |
| `sizeRange` | `[number, number]?` | Default `[60, 2400]` — Recharts Z range (area in px²). |
| `fillOpacity` | `number?` | Default `0.45`. |
| `xTickFormatter`, `yTickFormatter` | `(n) => string` | E.g. `(v) => \`${v/1000}K\``. |

### `BubbleSizeLegend`
Vertical legend that visually encodes bubble radius.

| Prop | Type | Description |
|------|------|-------------|
| `items` | `{ label, size }[]` | `size` is the circle diameter in px. |
| `color` | `string?` | Fill token. Default `"gray-3"`. |

## Examples

See `chart-card.stories.tsx` for one story per chart type plus a composition example.

```tsx
<ChartCard>
  <ChartCardHeader title="Bubble chart" subtitle="#5 colors, 5 sizes" />
  <div className="flex items-start gap-2">
    <div className="flex-1">
      <BubbleChart series={series} xLabel="Title" yLabel="Title" />
    </div>
    <BubbleSizeLegend
      items={[
        { label: "Value 1", size: 14 },
        { label: "Value 2", size: 20 },
        { label: "Value 3", size: 28 },
      ]}
    />
  </div>
  <ChartCardLegend items={legendItems} />
</ChartCard>
```

## Notes

- All chart components are `recharts`-based and use the existing `ChartContainer` / `ChartTooltipContent` from `../chart`, so they inherit CSS variable handling and the shared tooltip style.
- `BoxPlotChart` uses `recharts`' `<Customized>` hook to render SVG primitives directly — whiskers, caps, box (Q1→Q3, rounded 4px), median line, and outlier dots. The X-axis padding is computed dynamically from the measured plot width (`plotWidth / (n + 2)`), so the first and last group are inset by one bandwidth and never overlap the Y-axis or clip at the right edge.
- `HistogramChart` with `variant="dots"` renders the **entire** plot area in a `<Customized>` layer — dots, horizontal gridlines, Y-axis labels and X-axis labels are all placed at fixed pixel offsets (`dotSize`, `dotGapY`, `columnGapX`). This guarantees that, e.g., the "15" label sits flush with the top of the 15th dot in every column. Recharts' own `<XAxis>` / `<YAxis>` are present but `hide`d — they only feed the coordinate system. The container auto-grows in height when `yMax * (dotSize + dotGapY)` exceeds the requested `height`, so the top of the stack never clips.
- `HistogramChart` with `variant="bars"` merges per-series long-form data into a wide array and forces sibling bars to overlap at the same category position via `barGap = -barSize` — so overlapping bins from different series blend through `fillOpacity`.
- `DivergingBarsChart` renders the "left" series as negative internally (x-axis tick formatter maps back to absolute values).
