# Timeline

Config-driven Gantt-chart style timeline. Columns and row data are passed as config — the component renders everything automatically. Segments are positioned using percentage ranges (0–100) relative to the content area.

```tsx
import {
  Timeline, TimelineHeader, TimelineTitle, TimelineDescription,
  TimelineBody, TimelineRow, TimelineBar,
  type TimelineColumn, type TimelineRowData, type TimelineSegment
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Timeline (columns, rows → Context)
├── TimelineHeader
│   ├── TimelineTitle
│   └── TimelineDescription
└── TimelineBody (auto-renders column headers + rows)
    └── optional: (row, index) => ReactNode  ← render callback
        └── TimelineRow (label)
            └── TimelineBar (start, end, color)
```

## Data Types

```ts
interface TimelineColumn {
  key: string;   // unique identifier
  label: string; // displayed in the header row
}

interface TimelineSegment {
  key: string;
  label: string;
  start: number;          // start position 0–100 (%)
  end: number;            // end position 0–100 (%)
  color?: TimelineBarColor;
}

interface TimelineRowData {
  key: string;
  label: string;
  segments: TimelineSegment[];
}
```

## Timeline (Root) Props

Extends `React.ComponentProps<"div">`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TimelineColumn[]` | **required** | Column definitions (evenly distributed headers) |
| `rows` | `TimelineRowData[]` | **required** | Row data with segments |

Card is 100% width by default. Column headers stretch evenly across the content area.

## TimelineHeader / TimelineTitle / TimelineDescription Props

Wrappers for title area. No custom props.

## TimelineBody Props

Extends `Omit<React.ComponentProps<"div">, "children">`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `(row: TimelineRowData, index: number) => ReactNode` | `undefined` | Optional render callback |

**Without children** — auto-renders all rows from context.
**With render callback** — calls the function for each row for custom rendering.

Uses a 2-column grid (`auto 1fr`) — row labels auto-size and align across all rows.

## TimelineRow Props

Extends `React.ComponentProps<"div">`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `React.ReactNode` | `undefined` | Row label content |

Renders a label cell + a relative-positioned content cell. `className` applies to the content cell.

## TimelineBar Props

Extends `React.ComponentProps<"div">`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `TimelineBarColor` | `"blue"` | `"header"` · `"rose"` · `"blue"` · `"orange"` · `"green"` · `"mint"` · `"red"` · `"yellow"` |
| `start` | `number` | **required** | Start position as percentage (0–100) |
| `end` | `number` | **required** | End position as percentage (0–100) |

Bars are absolutely positioned inside the row content cell using `left: start%` and `width: (end - start)%`.

## Design Tokens

- Container: Card shape="rounded", border stroke-secondary, shadow-inset-default
- Header: px-6 pt-8, title variant 20px, label variant 14px secondary
- Body: grid auto 1fr, px-8 pb-8, gap-y-2 gap-x-4
- Column headers: flex, equal width, gap-1
- Bar height: min-h-[40px], rounded-[8px], px-2 py-1
- Header bars: bg-background-secondary-inverse, text-gray-0
- Data bars: pastel backgrounds (rose-1, blue-1, etc.), text-gray-5

## Examples

### Auto-render

```tsx
const columns: TimelineColumn[] = [
  { key: "jan", label: "January" },
  { key: "feb", label: "February" },
  { key: "mar", label: "March" },
];

const rows: TimelineRowData[] = [
  {
    key: "design",
    label: "Design",
    segments: [
      { key: "d1", label: "UI Kit", start: 0, end: 33, color: "rose" },
    ],
  },
  {
    key: "dev",
    label: "Dev",
    segments: [
      { key: "v1", label: "Build", start: 33, end: 100, color: "blue" },
    ],
  },
];

<Timeline columns={columns} rows={rows}>
  <TimelineHeader>
    <TimelineTitle>Plan</TimelineTitle>
  </TimelineHeader>
  <TimelineBody />
</Timeline>
```

### Multiple segments with gaps

```tsx
const rows: TimelineRowData[] = [
  {
    key: "person-1",
    label: "Person 1",
    segments: [
      { key: "s1", label: "Task A", start: 10, end: 30, color: "rose" },
      { key: "s2", label: "Task B", start: 55, end: 80, color: "blue" },
    ],
  },
];
```

### Custom row rendering

```tsx
<TimelineBody>
  {(row, index) => (
    <TimelineRow label={`${index + 1}. ${row.label}`}>
      {row.segments.map((seg) => (
        <TimelineBar key={seg.key} start={seg.start} end={seg.end} color={seg.color}>
          {seg.label}
        </TimelineBar>
      ))}
    </TimelineRow>
  )}
</TimelineBody>
```
