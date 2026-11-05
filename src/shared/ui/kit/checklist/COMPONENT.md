# Checklist

Generic interactive checklist. Each item renders a checkbox paired with custom content provided via a render function.

```tsx
import { Checklist } from "@adaptionlabs/ui-kit";
```

## Props

`ChecklistProps<T>` — the component is generic over the item type `T`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | — | Array of data items |
| `renderItem` | `(item: T, index: number) => ReactNode` | — | Render function for each item's content (placed next to the checkbox) |
| `values` | `boolean[]` | all `false` | Controlled checked state for each item |
| `onValuesChange` | `(values: boolean[]) => void` | — | Callback when any checkbox changes |
| `className` | `string` | — | Extra classes on the root container |

## Usage Tree

```
Checklist
├── label                    — flex row, gap-2, cursor-pointer
│   ├── Checkbox             — from kit, 24×24px
│   └── renderItem(item, 0)  — custom content
├── label
│   ├── Checkbox
│   └── renderItem(item, 1)
└── ...
```

## Examples

Text checklist:

```tsx
<Checklist
  items={["Task one", "Task two", "Task three"]}
  renderItem={(item) => <Text as="span">{item}</Text>}
/>
```

Image checklist:

```tsx
<Checklist
  items={["/img1.jpg", "/img2.jpg", "/img3.jpg"]}
  renderItem={(url) => (
    <img
      src={url}
      alt=""
      className="size-[120px] shrink-0 rounded-[4px] object-cover"
      draggable={false}
    />
  )}
/>
```

Custom objects:

```tsx
type Task = { title: string; description: string };

<Checklist<Task>
  items={tasks}
  renderItem={(task) => (
    <div>
      <Text as="span" weight="regular">{task.title}</Text>
      <Text as="span" variant="label" color="secondary">{task.description}</Text>
    </div>
  )}
/>
```

Controlled:

```tsx
const [values, setValues] = useState([false, true, false]);

<Checklist
  items={["First", "Second", "Third"]}
  renderItem={(item) => <Text as="span">{item}</Text>}
  values={values}
  onValuesChange={setValues}
/>
```

## Recommended Image Specifications

The component does not enforce any image sizing — it is fully controlled by the `renderItem` function. The recommended defaults below match the original Figma design, but any dimensions can be used if needed.

| Property | Recommended value |
|----------|-------------------|
| **Display size** | 120 × 120 px |
| **Aspect ratio** | 1:1 (square) |
| **Ideal source size** | 240 × 240 px (2× for retina) |
| **Min source size** | 120 × 120 px |
| **CSS** | `size-[120px] rounded-[4px] object-cover` |

## Notes

- Component supports both controlled (`values` + `onValuesChange`) and uncontrolled usage.
- Returns `null` when `items` is empty.
- Each `<label>` wraps the checkbox for native click-to-toggle behavior.
- The `renderItem` function receives both the item and its index for keying or conditional rendering.
