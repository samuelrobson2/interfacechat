# Accordion

Collapsible content sections based on Radix Accordion.

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Accordion
├── AccordionItem (value="q1")
│   ├── AccordionTrigger
│   └── AccordionContent
├── AccordionItem (value="q2")
│   ├── AccordionTrigger
│   └── AccordionContent
└── ...
```

## Accordion (Root) Props

Extends all props from Radix `Accordion.Root`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"single"` \| `"multiple"` | — | **Required.** Whether one or multiple items can be open at the same time |
| `value` | `string` \| `string[]` | — | Controlled value of the open item(s) |
| `defaultValue` | `string` \| `string[]` | — | Default open item(s) when uncontrolled |
| `onValueChange` | `(value: string \| string[]) => void` | — | Callback when value changes |
| `collapsible` | `boolean` | `false` | When `type="single"`, allows closing the currently open item |
| `disabled` | `boolean` | `false` | Prevents interaction with the accordion |
| `dir` | `"ltr"` \| `"rtl"` | — | Reading direction |
| `orientation` | `"vertical"` \| `"horizontal"` | `"vertical"` | Orientation of the accordion |
| `asChild` | `boolean` | `false` | Merge props onto child element instead of rendering a DOM node |

## AccordionItem Props

Extends all props from Radix `Accordion.Item`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | **Required.** Unique identifier for the item |
| `disabled` | `boolean` | `false` | Prevents interaction with this item |
| `asChild` | `boolean` | `false` | Merge props onto child element |

## AccordionTrigger Props

Extends all props from Radix `Accordion.Trigger`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showIcon` | `boolean` | `true` | Shows chevron icon |
| `asChild` | `boolean` | `false` | Merge props onto child element |

## AccordionContent Props

Extends all props from Radix `Accordion.Content`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element |
| `forceMount` | `boolean` | — | Force mount content when closed (useful for animation) |
| `className` | `string` | — | Additional CSS classes (applied to inner wrapper `div`) |

## Examples

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="q1">
    <AccordionTrigger>What is this?</AccordionTrigger>
    <AccordionContent>An accordion component.</AccordionContent>
  </AccordionItem>
</Accordion>
```
