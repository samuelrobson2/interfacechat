# Slider

Range value slider based on Radix Slider.

```tsx
import { Slider, SliderRow, SliderRangeRow } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
SliderRow
├── label (text on the left, optional)
├── value input (editable number on the right)
└── Slider (size="small" by default, single thumb)

SliderRangeRow
├── left value input (editable number)
├── right value input (editable number)
└── Slider (size="small" by default, two thumbs)

Slider (standalone)
```

## Slider Props

Extends `React.ComponentProps<typeof SliderPrimitive.Root>` + custom `size` prop.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | string | `"default"` | `"default"` (8px track / 24px thumb) · `"small"` (2px track / 12px thumb) |
| `min` | number | `0` | Minimum value |
| `max` | number | `100` | Maximum value |
| `step` | number | `1` | Step increment |
| `value` | number[] | — | Controlled value(s) |
| `defaultValue` | number[] | — | Initial value(s) |
| `onValueChange` | `(value: number[]) => void` | — | Fires on every change while dragging |
| `onValueCommit` | `(value: number[]) => void` | — | Fires when thumb is released (end of interaction) |
| `disabled` | boolean | `false` | Disables the slider |
| `orientation` | string | `"horizontal"` | `"horizontal"` · `"vertical"` |
| `inverted` | boolean | `false` | Invert the slider direction |
| `minStepsBetweenThumbs` | number | `0` | Minimum steps between multiple thumbs |
| `name` | string | — | Form field name for native submission |
| `dir` | string | — | `"ltr"` · `"rtl"` — reading direction |

## SliderRow Props

No HTML element extension — accepts only explicitly declared props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | — | Text label on the left |
| `value` | number[] | — | Controlled value `[number]` |
| `defaultValue` | number[] | — | Initial value |
| `onValueChange` | `(value: number[]) => void` | — | Change callback |
| `min` | number | `0` | Minimum value |
| `max` | number | `100` | Maximum value |
| `step` | number | `1` | Step increment |
| `size` | string | `"small"` | `"default"` · `"small"` — controls inner Slider size |
| `disabled` | boolean | `false` | Disables slider and input |
| `className` | string | — | Root element class |

Input updates the slider immediately on every keystroke. Only digits are allowed; values above `max` are clamped instantly.

## SliderRangeRow Props

No HTML element extension — accepts only explicitly declared props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number[] | — | Controlled values `[min, max]` |
| `defaultValue` | number[] | — | Initial values |
| `onValueChange` | `(value: number[]) => void` | — | Change callback |
| `min` | number | `0` | Minimum value |
| `max` | number | `100` | Maximum value |
| `step` | number | `1` | Step increment |
| `size` | string | `"small"` | `"default"` · `"small"` — controls inner Slider size |
| `disabled` | boolean | `false` | Disables slider and inputs |
| `className` | string | — | Root element class |

Input behaviour:
- Only digits are allowed; values above `max` are clamped immediately while typing.
- Validation fires on **blur** or **Enter**: if the entered value crosses the other thumb, the two values are **swapped**. Equal values are separated by `step`.
- While an input is focused, dragging the slider thumb does not interfere with typing. When not focused, the input displays the current slider value directly.

## Examples

```tsx
<Slider defaultValue={[50]} min={0} max={100} />
<Slider defaultValue={[20, 80]} size="small" />

<SliderRow label="Amount" defaultValue={[500]} min={0} max={1000} />
<SliderRow label="Rows" value={[rows]} onValueChange={setRows} min={1} max={1000} />

<SliderRangeRow defaultValue={[25, 75]} min={0} max={100} />
<SliderRangeRow value={range} onValueChange={setRange} min={0} max={500} step={5} />
```
