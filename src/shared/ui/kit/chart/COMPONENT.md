# Chart

Data visualization based on Recharts.

```tsx
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
ChartContainer
└── (Recharts chart, e.g. BarChart / LineChart / AreaChart)
    ├── Bar / Line / Area (data series)
    ├── ChartTooltip
    │   └── ChartTooltipContent
    └── ChartLegend
        └── ChartLegendContent
```

## ChartContainer Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes (`id`, `style`, `className`, etc.).

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `ChartConfig` | yes | Color/label config for data keys |
| `children` | `ResponsiveContainer["children"]` | yes | Recharts chart component |

### ChartConfig Type

```ts
type ChartConfig = {
  [key: string]: {
    label?: ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: { light: string; dark: string } }
  );
};
```

## ChartTooltip

Re-export of `Recharts.Tooltip`. Accepts all [Recharts Tooltip props](https://recharts.org/en-US/api/Tooltip).

## ChartTooltipContent Props

Extends `React.ComponentProps<"div">` and Recharts `Tooltip` props (`active`, `payload`, `label`, `formatter`, `labelFormatter`).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `indicator` | `"dot"` \| `"line"` \| `"dashed"` | `"dot"` | Visual indicator style |
| `hideLabel` | `boolean` | `false` | Hides the tooltip label |
| `hideIndicator` | `boolean` | `false` | Hides the color indicator |
| `nameKey` | `string` | — | Key to use for item name lookup in config |
| `labelKey` | `string` | — | Key to use for label lookup in config |
| `color` | `string` | — | Override indicator color |
| `labelClassName` | `string` | — | Additional CSS classes for label |

## ChartLegend

Re-export of `Recharts.Legend`. Accepts all [Recharts Legend props](https://recharts.org/en-US/api/Legend).

## ChartLegendContent Props

Extends `React.ComponentProps<"div">`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hideIcon` | `boolean` | `false` | Hides the color icon |
| `nameKey` | `string` | — | Key to use for item name lookup in config |
| `payload` | `LegendProps["payload"]` | — | Legend payload (passed by Recharts) |
| `verticalAlign` | `"top"` \| `"bottom"` | `"bottom"` | Vertical alignment (affects padding) |

## Examples

```tsx
const config = {
  revenue: { label: "Revenue", color: "var(--color-blue-4)" },
  expenses: { label: "Expenses", color: "var(--color-red-5)" },
};

<ChartContainer config={config} className="h-64">
  <BarChart data={data}>
    <Bar dataKey="revenue" fill="var(--color-revenue)" />
    <Bar dataKey="expenses" fill="var(--color-expenses)" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
  </BarChart>
</ChartContainer>
```
