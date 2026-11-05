# Calendar

Date picker calendar based on react-day-picker.

```tsx
import { Calendar } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Calendar (standalone)
├── caption (month/year navigation)
└── day grid
```

## Props

Extends `React.ComponentProps<typeof DayPicker>` — accepts all [react-day-picker](https://daypicker.dev/) props.

### Custom Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `buttonVariant` | `ButtonProps["variant"]` | `"ghost"` | Variant for navigation arrow buttons |

### Key DayPicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `string` | — | `"single"` · `"range"` · `"multiple"` |
| `selected` | `Date \| DateRange \| Date[]` | — | Selected date(s) |
| `onSelect` | `function` | — | Selection callback |
| `defaultMonth` | `Date` | — | Initial month to display |
| `month` | `Date` | — | Controlled displayed month |
| `onMonthChange` | `(month: Date) => void` | — | Callback when displayed month changes |
| `showOutsideDays` | `boolean` | `true` | Show days from adjacent months |
| `showWeekNumber` | `boolean` | `false` | Show week numbers |
| `captionLayout` | `string` | `"label"` | `"label"` · `"dropdown"` · `"dropdown-months"` · `"dropdown-years"` |
| `numberOfMonths` | `number` | `1` | Number of months to display |
| `fromDate` | `Date` | — | Earliest selectable date |
| `toDate` | `Date` | — | Latest selectable date |
| `disabled` | `Matcher` | — | Disable specific dates |
| `locale` | `Locale` | — | date-fns locale for internationalization |
| `weekStartsOn` | `0-6` | — | Day the week starts on (0 = Sunday) |
| `fixedWeeks` | `boolean` | `false` | Always display 6 weeks per month |
| `hideNavigation` | `boolean` | `false` | Hide navigation buttons |
| `disableNavigation` | `boolean` | `false` | Disable month navigation |
| `pagedNavigation` | `boolean` | `false` | Paginated navigation with multiple months |
| `formatters` | `object` | — | Custom date formatting functions |
| `components` | `object` | — | Custom component overrides |
| `classNames` | `object` | — | Custom CSS class names per element |

## Examples

```tsx
<Calendar mode="single" selected={date} onSelect={setDate} />
<Calendar mode="range" selected={range} onSelect={setRange} />
```
