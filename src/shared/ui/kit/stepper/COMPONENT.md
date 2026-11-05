# Stepper

Multi-step process indicator.

```tsx
import {
  Stepper, StepperNav, StepperItem, StepperTrigger,
  StepperIndicator, StepperSeparator, StepperTitle,
  StepperDescription, StepperPanel, StepperContent,
  useStepper, useStepItem
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Stepper
├── StepperNav
│   ├── StepperItem (step=1)
│   │   └── StepperTrigger
│   │       ├── StepperIndicator
│   │       ├── StepperTitle
│   │       └── StepperDescription
│   ├── StepperSeparator
│   ├── StepperItem (step=2)
│   │   └── StepperTrigger
│   │       ├── StepperIndicator
│   │       └── StepperTitle
│   └── StepperSeparator
└── StepperPanel
    ├── StepperContent (value=1)
    └── StepperContent (value=2)
```

## Stepper (Root) Props

Extends `React.HTMLAttributes<HTMLDivElement>` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValue` | number | `1` | Initial active step (uncontrolled) |
| `value` | number | — | Controlled active step |
| `onValueChange` | `(value: number) => void` | — | Step change callback |
| `orientation` | string | `"horizontal"` | `"horizontal"` · `"vertical"` |
| `indicators` | `StepIndicators` | `{}` | Custom indicator content per state |

### StepIndicators

| Field | Type | Description |
|-------|------|-------------|
| `active` | ReactNode | Custom indicator for active step |
| `completed` | ReactNode | Custom indicator for completed step |
| `inactive` | ReactNode | Custom indicator for inactive step |
| `loading` | ReactNode | Custom indicator for loading step |

## StepperItem Props

Extends `React.HTMLAttributes<HTMLDivElement>` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `step` | number | — | Step number (required) |
| `completed` | boolean | `false` | Force completed state |
| `disabled` | boolean | `false` | Disable step interaction |
| `loading` | boolean | `false` | Show loading state (only when step is active) |

## StepperTrigger Props

Extends `React.ButtonHTMLAttributes<HTMLButtonElement>` — accepts all standard `<button>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | boolean | `false` | When `true`, renders a `<span>` wrapper instead of interactive `<button>` |

When not `asChild`, renders as `role="tab"` with full keyboard navigation (Arrow keys, Home/End, Enter/Space).

## StepperIndicator Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes. Renders a rounded-full indicator circle. Displays custom indicator from `Stepper.indicators` or falls back to `children`.

## StepperSeparator Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes. Renders a line between steps; turns `bg-stroke-primary` when the step is completed.

## StepperTitle Props

Extends `React.ComponentProps<"h3">` — accepts all standard `<h3>` HTML attributes. Text color changes based on step state (`gray-2` for inactive, `typography-primary` for active/completed).

## StepperDescription Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## StepperNav Props

Extends `React.ComponentProps<"nav">` — accepts all standard `<nav>` HTML attributes. Wraps step items; layout direction follows `orientation`.

## StepperPanel Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes. Container for `StepperContent` panels.

## StepperContent Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | — | Step number this panel belongs to (required) |
| `forceMount` | boolean | — | Keep mounted when inactive (hidden via `display: none`) |

## Hooks

| Hook | Returns | Description |
|------|---------|-------------|
| `useStepper()` | `StepperContextValue` | Access `activeStep`, `setActiveStep`, `stepsCount`, `orientation`, `indicators` |
| `useStepItem()` | `StepItemContextValue` | Access `step`, `state` (`"active"` · `"completed"` · `"inactive"`), `isDisabled`, `isLoading` |

## Examples

```tsx
<Stepper defaultValue={1}>
  <StepperNav>
    <StepperItem step={1}>
      <StepperTrigger>
        <StepperIndicator className="size-8" />
        <StepperTitle>Step 1</StepperTitle>
      </StepperTrigger>
    </StepperItem>
    <StepperSeparator />
    <StepperItem step={2}>
      <StepperTrigger>
        <StepperIndicator className="size-8" />
        <StepperTitle>Step 2</StepperTitle>
      </StepperTrigger>
    </StepperItem>
  </StepperNav>
  <StepperPanel>
    <StepperContent value={1}>Step 1 content</StepperContent>
    <StepperContent value={2}>Step 2 content</StepperContent>
  </StepperPanel>
</Stepper>
```
