# LLM Frontend Code Generation Guide

You are generating frontend code for a mini-application that will run inside an iframe (Modal Sandbox).
The app uses **React 19**, **TypeScript**, **Tailwind CSS v4**, and the **@adaptionlabs/ui-kit** component library.
You MUST follow all rules in this document to produce visually consistent, production-quality code.

---

## 1. Project Setup

### 1.1 CSS Entry Point

Your main CSS file must import Tailwind first, then the kit styles:

```css
@import "tailwindcss";
@import "@adaptionlabs/ui-kit/styles.css";
```

`styles.css` already contains all design-system CSS variables (colors, shadows, radii, theme tokens).
**Do NOT redefine these variables** — they come from the kit.

### 1.2 Component Imports

```tsx
import { Button, Input, Card, Dialog, ... } from "@adaptionlabs/ui-kit";
```

### 1.3 Icon Imports

Use [`lucide-react`](https://lucide.dev/icons/) for all icons:

```tsx
import { Search, Star, ArrowRight } from "lucide-react";
```

---

## 2. Design System

### 2.1 Color Palette

All colors are defined as Tailwind theme tokens. Use them via Tailwind utility classes (e.g. `bg-gray-1`, `text-blue-4`, `border-red-5`).

#### Gray (achromatic)

| Token      | Hex       | Usage |
|------------|-----------|-------|
| `gray-0`   | `#ffffff` | White / light background |
| `gray-1`   | `#fafafa` | Primary background (light mode) |
| `gray-2`   | `#c4c4c4` | Disabled text, secondary strokes |
| `gray-3`   | `#7a7a7a` | Secondary text / icons |
| `gray-4`   | `#373737` | Dark surfaces, primary background (dark mode) |
| `gray-5`   | `#1a1718` | Near-black, primary text (light mode) |
| `gray-6`   | `#F3F2F3` | Filled input background |

#### Blue

| Token      | Hex       |
|------------|-----------|
| `blue-1`   | `#e7f7ff` |
| `blue-2`   | `#c8e9fa` |
| `blue-3`   | `#85c9ee` |
| `blue-4`   | `#46a5d8` |
| `blue-5`   | `#1a84ae` |
| `blue-6`   | `#054761` |

#### Mint

| Token      | Hex       |
|------------|-----------|
| `mint-1`   | `#b6e8e2` |
| `mint-2`   | `#7fb5b3` |
| `mint-3`   | `#004652` |

#### Rose

| Token      | Hex       |
|------------|-----------|
| `rose-1`   | `#ffe5fa` |
| `rose-2`   | `#df91c6` |
| `rose-3`   | `#631d4d` |

#### Accent Colors

| Token        | Hex       |
|--------------|-----------|
| `red-1`      | `#ffebe4` |
| `red-5`      | `#f76666` |
| `orange-1`   | `#fff0d5` |
| `orange-5`   | `#fc8723` |
| `yellow-1`   | `#ffffbe` |
| `yellow-5`   | `#ffdb11` |
| `green-1`    | `#e9ffeb` |
| `green-5`    | `#64b48f` |

### 2.2 Semantic Color Tokens

Use these semantic tokens instead of raw palette values for themeable UI:

| Tailwind Class Prefix         | Purpose |
|-------------------------------|---------|
| `text-typography-primary`     | Main body text |
| `text-typography-secondary`   | Muted / helper text |
| `text-typography-inverse`     | Text on dark backgrounds |
| `bg-background-primary`       | Main page background |
| `bg-background-secondary`     | Card / elevated surface |
| `bg-background-primary-inverse` | Dark surface on light mode |
| `bg-background-secondary-inverse` | Near-black surface |
| `border-stroke-primary`       | Strong borders |
| `border-stroke-secondary`     | Subtle borders |
| `text-icon-primary`           | Primary icon color |
| `text-icon-secondary`         | Muted icon color |
| `text-icon-inverse`           | Icon on dark backgrounds |
| `bg-skeleton-primary`         | Skeleton loader background |

#### Shadcn-compatible Tokens (also available)

`background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `border`, `input`, `ring`.

### 2.3 Typography

The design system uses **"STK Bureau Sans"** font (`font-bureau` in Tailwind). All text is `font-light` (300) by default.

**Always prefer the `<Text>` component** for rendering standalone text — headings, paragraphs, labels, descriptions. It ensures correct font family, weight, size, line-height, and color tokens automatically. Do **not** wrap text inside components that already handle their own typography (e.g. `Button`, `Badge`, `TabsTrigger`, `CommandItem`, `DropdownMenuItem` — just pass text as children). Fall back to `textVariants()` only when you need to apply typography styles to a non-`<Text>` element (e.g. an `<input>` or a third-party component).

| Variant  | Size   | Line Height | Tracking     |
|----------|--------|-------------|--------------|
| `h1`     | 40px   | 48px        | -0.8px       |
| `h2`     | 28px   | 36px        | —            |
| `h3`     | 24px   | 32px        | —            |
| `title`  | 20px   | 28px        | —            |
| `body`   | 16px   | 24px        | —            |
| `label`  | 14px   | 20px        | —            |

**Font weights:** `light` (300, default), `regular` (400), `bold` (700).

**Text colors:** `primary`, `secondary`, `inverse`, `darkGray`, `error`, `disabled`, `blue5`, `none`.

```tsx
import { Text } from "@adaptionlabs/ui-kit";

<Text variant="h2" weight="bold">Heading</Text>
<Text variant="body" color="secondary">Description text</Text>
<Text variant="label" color="error">Error message</Text>
```

### 2.4 Border Radius

Use pixel values in `rounded-[Npx]` instead of Tailwind's named sizes:

| Usage                 | Value |
|-----------------------|-------|
| Default (buttons, cards, inputs) | `rounded-[4px]` |
| Dialog content        | `rounded-[8px]` |
| Floating input (rounded shape) | `rounded-[20px]` |
| Pills / badges        | `rounded-[56px]` |
| Full round            | `rounded-full` |

**Base radius variable:** `--radius: 0.25rem` (4px).

### 2.5 Shadows

| Tailwind Class               | Usage |
|------------------------------|-------|
| `shadow-inset-default`       | Cards, legacy inputs (neumorphic inset) |
| `shadow-highlight-blue`      | Blue glow highlight |
| `shadow-highlight-green`     | Green glow highlight |
| `shadow-highlight-rose`      | Rose glow highlight |
| `shadow-highlight-orange`    | Orange glow highlight |
| `shadow-inset-highlight`     | Inset + blue glow combined |

### 2.6 Gradient Utilities

| Class                      | Description |
|----------------------------|-------------|
| `bg-gradient-yellow`       | Vertical: gray-1 → yellow-1 → gray-1 |
| `bg-gradient-orange`       | Vertical: gray-1 → orange-1 → gray-1 |
| `bg-gradient-red`          | Vertical: gray-0 → red-1 → gray-0 |
| `bg-gradient-green`        | Vertical: gray-1 → green-1 → gray-1 |
| `bg-gradient-blue`         | Vertical: gray-1 → blue-1 → gray-1 |
| `bg-gradient-rose`         | Vertical: gray-1 → rose-1 → gray-1 |
| `bg-gradient-mint`         | Vertical: gray-1 → mint-1 → gray-1 |
| `bg-gradient-black-blue`   | Vertical: gray-4 → blue-6 (primary button bg) |

### 2.7 Custom Utilities

| Class          | Description |
|----------------|-------------|
| `no-scrollbar` | Hides scrollbar (both webkit and Firefox) |
| `hairline`     | Cross-DPI 0.5px border (renders a true half-pixel on Retina, a thin anti-aliased line on standard screens) |
| `hairline-b`   | Bottom-only version of `hairline` (underlines, e.g. tabs/inputs) |
| `hairline-t`   | Top-only version of `hairline` (e.g. table footer divider) |

#### Hairline border (0.5px)

A real CSS `border` cannot render thinner than 1px on standard (DPR=1) screens — the browser rounds `0.5px` up to `1px`. The `hairline` utility solves this by drawing a 1px border on a 2×-sized `::after` pseudo-element and scaling it down by `0.5`. The `Card` component (`default`/`outlined` variants) already uses it internally.

Configure it with CSS variables (set them via Tailwind arbitrary properties):

| Variable | Purpose | Default |
|----------|---------|---------|
| `--hairline-color` | Border color — use a design token, e.g. `var(--color-gray-3)` | `var(--color-stroke-secondary)` |
| `--hairline-radius` | Set to the element's **own** `border-radius` value (the utility doubles it internally) | `0px` |
| `--hairline-opacity` | Opacity, lets translucent borders reuse solid tokens (e.g. `gray-3` at 20%) | `1` |
| `--hairline-scale` | Line thickness in px (`0.5` = half-pixel, `1` = 1px, `2` = 2px). Change per state with no layout shift | `0.5` |

```tsx
{/* Standalone element with a 0.5px border, 8px corners, gray-3 @ 20% */}
<div className="hairline rounded-[8px] [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.2]" />

{/* Thin by default, thickens to 1px and turns primary on focus (e.g. inputs) */}
<div className="hairline [--hairline-radius:4px] has-focus:[--hairline-scale:1] has-focus:[--hairline-color:var(--color-stroke-primary)]" />

{/* Underline that thickens to 2px when active (e.g. tabs) */}
<button className="hairline-b data-[state=active]:[--hairline-scale:2] data-[state=active]:[--hairline-color:var(--color-stroke-primary)]" />
```

> ⚠️ On a `Card` (or any `hairline`/`hairline-b` element), the border is a pseudo-element — **not** a real CSS border. So `border-*` color/width classes, `border-none`, and `border-0` have **no effect** on it. To recolor it use `[--hairline-color:...]`; to hide it use `[--hairline-color:transparent]`; to change thickness per state use `[--hairline-scale:...]` (don't switch to a real `border-*` — that causes a 1px layout shift). When you override the radius via `className` (e.g. `rounded-[8px]`), also set a matching `[--hairline-radius:8px]`, otherwise the border corners won't follow the element.

> ⚠️ **Do NOT put `overflow-hidden` on a `hairline` element with a large `border-radius` (pills, `rounded-full`).** The hairline pseudo-element sits exactly on the element's edge, so `overflow-hidden` clips the rounded parts of the border and it looks erased/missing (most visible on pills). It's harmless at small radii (e.g. a 4px `Card`). If a child must be clipped to the rounded shape, put `overflow-hidden` on that child (or a dedicated inner wrapper), not on the `hairline` element itself.

### 2.8 Spacing

The design system uses Tailwind's default **4 px base** spacing scale. Use `gap-*`, `p-*`, and `m-*` utilities — never arbitrary pixel values unless the exact value isn't on the scale.

| Tailwind Class | Value | Common usage |
|----------------|-------|--------------|
| `gap-1` / `p-1` | 4 px  | Tight inner spacing (icon + text inside a badge) |
| `gap-1.5` / `p-1.5` | 6 px | Compact rows (progress row label ↔ bar) |
| `gap-2` / `p-2` | 8 px  | Default small spacing (header items, tab ↔ content) |
| `gap-3` / `p-3` | 12 px | Card content padding, radio/checkbox group items, ghost/outlined card gap |
| `gap-4` / `p-4` | 16 px | Card `spacing="md"` padding, form field groups, section padding |
| `gap-6` / `p-6` | 24 px | Default card variant inner gap, between major blocks |
| `gap-8` / `p-8` | 32 px | Large section separation |
| `gap-10` | 40 px | Extra-large separation (showcase grids) |

**Rules:**

- Use `gap-*` between children instead of margins on individual elements.
- Use `flex flex-col gap-*` for vertical stacking and `flex items-center gap-*` for horizontal rows.
- Card root padding is controlled via the `spacing` prop (`"none"` | `"md"`). Do not add padding to the Card itself — if you need custom padding, set `spacing="none"` and add padding to `CardContent` instead.
- For page/section-level layout, prefer `gap-6` or `gap-8` between blocks.
- For form fields stacked vertically, use `gap-4`.
- For tightly related elements (label + input, icon + text), use `gap-1` or `gap-2`.

---

## 3. Components Reference

All components are imported from `@adaptionlabs/ui-kit`.

If you need a UI element that is not available as a kit component, use standard HTML elements (`<div>`, `<span>`, `<nav>`, `<section>`, `<header>`, `<footer>`, `<form>`, `<ul>`, `<li>`, etc.) styled with Tailwind classes from the design system. Always prefer kit components when available.

Detailed documentation for each component (props, usage tree, examples) lives in its own `COMPONENT.md` file inside the component folder. See links below:

| # | Component | Description | Docs |
|---|-----------|-------------|------|
| 1 | **Text** | Typography component | [text/COMPONENT.md](./text/COMPONENT.md) |
| 2 | **Button** | Primary action element | [button/COMPONENT.md](./button/COMPONENT.md) |
| 3 | **Input** | Text input (floating/labeled/plain) | [input/COMPONENT.md](./input/COMPONENT.md) |
| 4 | **Textarea** | Multi-line input with auto-resize | [textarea/COMPONENT.md](./textarea/COMPONENT.md) |
| 5 | **Card** | Flexible content container | [card/COMPONENT.md](./card/COMPONENT.md) |
| 6 | **Badge** | Status and label indicator | [badge/COMPONENT.md](./badge/COMPONENT.md) |
| 7 | **InteractiveBadge** | Clickable badge with selection | [interactive-badge/COMPONENT.md](./interactive-badge/COMPONENT.md) |
| 8 | **Dialog** | Modal overlay window | [dialog/COMPONENT.md](./dialog/COMPONENT.md) |
| 9 | **Sheet** | Slide-in panel (drawer) | [sheet/COMPONENT.md](./sheet/COMPONENT.md) |
| 10 | **Select** | Single-value dropdown | [select/COMPONENT.md](./select/COMPONENT.md) |
| 11 | **Combobox** | Searchable dropdown | [combobox/COMPONENT.md](./combobox/COMPONENT.md) |
| 12 | **MultiSelect** | Multi-value select with badges | [multi-select/COMPONENT.md](./multi-select/COMPONENT.md) |
| 13 | **Command** | Command palette / search menu | [command/COMPONENT.md](./command/COMPONENT.md) |
| 14 | **Tabs** | Tabbed content navigation | [tabs/COMPONENT.md](./tabs/COMPONENT.md) |
| 15 | **Accordion** | Collapsible content sections | [accordion/COMPONENT.md](./accordion/COMPONENT.md) |
| 16 | **Collapsible** | Simple show/hide panel | [collapsible/COMPONENT.md](./collapsible/COMPONENT.md) |
| 17 | **Tooltip** | Hover hint overlay | [tooltip/COMPONENT.md](./tooltip/COMPONENT.md) |
| 18 | **Popover** | Floating content overlay | [popover/COMPONENT.md](./popover/COMPONENT.md) |
| 19 | **DropdownMenu** | Contextual action menu | [dropdown-menu/COMPONENT.md](./dropdown-menu/COMPONENT.md) |
| 20 | **Checkbox** | Boolean toggle input | [checkbox/COMPONENT.md](./checkbox/COMPONENT.md) |
| 21 | **Switch** | Toggle on/off switch | [switch/COMPONENT.md](./switch/COMPONENT.md) |
| 22 | **RadioGroup** | Single-choice radio buttons | [radio-group/COMPONENT.md](./radio-group/COMPONENT.md) |
| 23 | **Slider** | Range value slider | [slider/COMPONENT.md](./slider/COMPONENT.md) |
| 24 | **Progress** | Progress bar indicator | [progress/COMPONENT.md](./progress/COMPONENT.md) |
| 25 | **CircularProgress** | Circular progress ring | [circular-progress/COMPONENT.md](./circular-progress/COMPONENT.md) |
| 26 | **Label** | Form field label | [label/COMPONENT.md](./label/COMPONENT.md) |
| 27 | **Separator** | Visual divider line | [separator/COMPONENT.md](./separator/COMPONENT.md) |
| 28 | **Skeleton** | Loading placeholder | [skeleton/COMPONENT.md](./skeleton/COMPONENT.md) |
| 29 | **ScrollArea** | Custom scrollable container | [scroll-area/COMPONENT.md](./scroll-area/COMPONENT.md) |
| 30 | **Avatar** | User profile image with fallback | [avatar/COMPONENT.md](./avatar/COMPONENT.md) |
| 31 | **Breadcrumb** | Navigation hierarchy trail | [breadcrumb/COMPONENT.md](./breadcrumb/COMPONENT.md) |
| 32 | **ButtonGroup** | Grouped set of buttons | [button-group/COMPONENT.md](./button-group/COMPONENT.md) |
| 33 | **Calendar** | Date picker calendar | [calendar/COMPONENT.md](./calendar/COMPONENT.md) |
| 34 | **Carousel** | Scrollable item slideshow | [carousel/COMPONENT.md](./carousel/COMPONENT.md) |
| 35 | **Table** | Data table with sticky header | [table/COMPONENT.md](./table/COMPONENT.md) |
| 36 | **Alert** | Contextual feedback messages | [alert/COMPONENT.md](./alert/COMPONENT.md) |
| 37 | **Dropzone** | File drag-and-drop area | [dropzone/COMPONENT.md](./dropzone/COMPONENT.md) |
| 38 | **FileUpload** | File upload trigger + content | [file-upload/COMPONENT.md](./file-upload/COMPONENT.md) |
| 39 | **ImageGrid** | Responsive masonry image grid | [image-grid/COMPONENT.md](./image-grid/COMPONENT.md) |
| 40 | **InputOTP** | One-time password input | [otp-input/COMPONENT.md](./otp-input/COMPONENT.md) |
| 41 | **Item** | Generic list item (media, title, actions) | [item/COMPONENT.md](./item/COMPONENT.md) |
| 42 | **ExpandedText** | Text with expand/collapse toggle | [expanded-text/COMPONENT.md](./expanded-text/COMPONENT.md) |
| 43 | **TruncatedText** | Text with ellipsis and tooltip | [truncated-text/COMPONENT.md](./truncated-text/COMPONENT.md) |
| 44 | **SelectedText** | Text with yellow highlight | [selected-text/COMPONENT.md](./selected-text/COMPONENT.md) |
| 45 | **Stepper** | Multi-step process indicator | [stepper/COMPONENT.md](./stepper/COMPONENT.md) |
| 46 | **Toaster & toast** | Toast notification system | [sonner-toast/COMPONENT.md](./sonner-toast/COMPONENT.md) |
| 47 | **Chart** | Data visualization (Recharts) | [chart/COMPONENT.md](./chart/COMPONENT.md) |
| 48 | **Sidebar** | Application sidebar layout | [sidebar/COMPONENT.md](./sidebar/COMPONENT.md) |
| 49 | **HeaderImage** | Full-width header banner | [header-image/COMPONENT.md](./header-image/COMPONENT.md) |
| 50 | **List** | Styled list with marker types | [list/COMPONENT.md](./list/COMPONENT.md) |
| 51 | **NavigationMenu** | Accessible navigation menu | [navigation-menu/COMPONENT.md](./navigation-menu/COMPONENT.md) |
| 52 | **CodeBlock** | Syntax-highlighted code with copy action | [code-block/COMPONENT.md](./code-block/COMPONENT.md) |
| 53 | **VideoPlayer** | Custom video player with fully custom controls | [video-player/COMPONENT.md](./video-player/COMPONENT.md) |
| 54 | **ImagesViewer** | Image thumbnails with fullscreen lightbox & zoom | [images-viewer/COMPONENT.md](./images-viewer/COMPONENT.md) |
| 55 | **Pagination** | Page navigation controls with numbered pages and arrows | [pagination/COMPONENT.md](./pagination/COMPONENT.md) |
| 56 | **Timeline** | Gantt-chart style timeline with colored bars | [timeline/COMPONENT.md](./timeline/COMPONENT.md) |
| 57 | **TotalChart** | Multi-segment donut chart card with progress bars | [total-chart/COMPONENT.md](./total-chart/COMPONENT.md) |
| 58 | **Checklist** | Interactive checklist with checkboxes | [checklist/COMPONENT.md](./checklist/COMPONENT.md) |
| 59 | **ComparisonCard** | Side-by-side comparison with status icons | [comparison-card/COMPONENT.md](./comparison-card/COMPONENT.md) |
| 60 | **ChartCard** | Composable chart card with 6 chart types (horizontal bars, density curve, box plot, histogram, diverging bars, bubble) | [chart-card/COMPONENT.md](./chart-card/COMPONENT.md) |

---

## 4. Icons

Use [`lucide-react`](https://lucide.dev/icons/) for all icons. The library is already a peer dependency of the kit.

```tsx
import { Search, Star, ArrowRight, Trash2, Info, ChevronDown } from "lucide-react";
```

**Setting icon size and color:** use Tailwind utility classes directly on the Lucide component:

```tsx
<Search className="size-5 text-icon-primary" />
<Star className="size-6 text-yellow-5" />
<Trash2 className="size-5 text-red-5" />
<ArrowRight className="size-4 text-current" />
<Info className="size-6 text-icon-secondary" />
```

**Icon in a button:**

```tsx
<Button variant="ghost" size="icon-sm" aria-label="Delete">
  <Trash2 className="size-5" />
</Button>
```

Browse the full icon catalog at [lucide.dev/icons](https://lucide.dev/icons/).

---

## 5. Coding Rules

### 5.1 General

- **Language:** TypeScript with strict mode.
- **Framework:** React 19 with functional components only.
- **Styling:** Tailwind CSS v4 utility classes only. Avoid inline `style` attributes unless a value must be computed dynamically at runtime (e.g. `style={{ width: `${percent}%` }}`). Never use CSS-in-JS. Never create separate CSS files for component styling.
- **State management:** Use React `useState` / `useReducer` for local state. Use Zustand for shared state if needed.
- **Data fetching:** Use `@tanstack/react-query` for server state.
- **Forms:** Use `react-hook-form` with `zod` validation when needed.

### 5.2 TypeScript Conventions

- Always define explicit types for component props.
- Use `interface` for component props, `type` for unions and utility types.
- Use `const` arrow functions for components and handlers:

```tsx
const MyComponent = ({ title, onAction }: MyComponentProps) => {
  const handleClick = () => { onAction(); };
  return <Button onClick={handleClick}>{title}</Button>;
};
```

- Prefix event handlers with `handle`: `handleClick`, `handleKeyDown`, `handleSubmit`.
- Use early returns for guard clauses and conditional rendering.

### 5.3 Tailwind CSS Rules

- **ONLY use colors from the design system.** Never use arbitrary hex values or default Tailwind palette colors (`red-500`, `blue-600`, etc.). Use `red-5`, `blue-4`, `gray-3`, etc.
- Use semantic tokens for themeable surfaces: `bg-background-primary`, `text-typography-secondary`, `border-stroke-secondary`.
- Use `rounded-[Npx]` with pixel values for border radius, not Tailwind named sizes (`rounded-sm`, `rounded-md`).
- Use `gap-*` for spacing between children instead of margins on individual elements.
- Use `flex` and `grid` layouts. Prefer `flex flex-col gap-*` for vertical stacking and `flex items-center gap-*` for horizontal alignment.
- When applying conditional classes, use `cn()` utility from `clsx` + `tailwind-merge`:

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:

```tsx
<div className={cn(
  "flex items-center gap-2 p-4",
  isActive && "bg-blue-1 border-blue-4",
  isDisabled && "opacity-50 pointer-events-none",
  className,
)}>
```

### 5.4 Component Patterns

- Always use UI Kit components before building custom ones. Prefer `<Button>`, `<Input>`, `<Card>`, `<Text>` etc.
- When no kit component fits, use standard HTML elements (`<div>`, `<nav>`, `<section>`, `<ul>`, `<li>`, `<form>`, `<header>`, `<footer>`, etc.) styled with Tailwind utility classes from the design system.
- Use `class-variance-authority` (CVA) for creating variant-based components:

```tsx
import { cva, type VariantProps } from "class-variance-authority";

import { textVariants } from "@adaptionlabs/ui-kit";

const statusBadgeVariants = cva(
  [textVariants({ variant: "label" }), "inline-flex items-center rounded-[56px] px-3 py-1"],
  {
    variants: {
      status: {
        active: "bg-green-1 text-green-5",
        inactive: "bg-gray-6 text-gray-3",
        error: "bg-red-1 text-red-5",
      },
    },
    defaultVariants: { status: "active" },
  },
);
```

- Use Radix Slot (`asChild` pattern) for polymorphic components that need to forward styles to a child element.
- When building a **custom reusable component** (not a one-off layout), accept and forward a `className` prop so the parent can position it in the layout. This is about composability of your own components — it does **not** mean you should add `className` to every kit component you use. Only pass `className` to a kit component when you have a concrete layout or colour reason to do so (see Section 5.7).

### 5.5 Accessibility

- Always add `aria-label` to icon-only buttons.
- Use semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`.
- Use `<label>` or `htmlFor` for form inputs.
- Add `aria-invalid` and `aria-describedby` for inputs with errors.
- Ensure interactive elements are keyboard-navigable (`tabIndex`, `onKeyDown`).

### 5.6 File Structure

For a generated mini-app, organize code as:

```
src/
├── app.tsx              # Root component
├── main.tsx             # Entry point (ReactDOM.createRoot)
├── index.css            # Tailwind + kit styles import
├── lib/
│   └── cn.ts            # cn() utility
├── components/          # Shared UI pieces
│   └── ...
└── features/            # Feature-specific code
    └── ...
```

### 5.7 className Usage Rules (CRITICAL for UI quality)

The `className` prop on kit components is meant for **positioning in layout, colour accents, and minor spacing tweaks** — NOT for overriding the component's structural properties (size, shape, variant, border-radius, font-size). Misusing `className` to fight a component's built-in structure is the #1 cause of broken, ugly UI.

#### 5.7.1 Allowed className use cases

Use `className` on kit components for:

- **Layout positioning:** `className="mt-4"`, `className="flex-1"`, `className="col-span-2"`, `className="self-start"`
- **Width / max-width constraints:** `className="w-full"`, `className="max-w-[400px]"`, `className="shrink-0"`
- **Responsive visibility:** `className="hidden md:flex"`
- **Outer margins (sparingly):** `className="mb-6"`
- **Color overrides** — using design system tokens only (see Section 2.1 and 2.2). For example: `className="text-blue-5"`, `className="bg-green-1"`, `className="border-red-5"`. **Never** use arbitrary hex values or default Tailwind palette (`text-red-500`, `bg-blue-600`, etc.)
- **Padding adjustments** — using the 4px base scale values only (see Section 2.8). For example: `className="p-6"`, `className="px-4 py-2"`, `className="pt-2"`. **Never** use arbitrary pixel values like `p-[13px]`.

#### 5.7.2 Prefer props over className for structural properties

When a component has a prop that controls a structural visual property — always use the prop. Overriding structural properties via `className` breaks the component's internal layout contract.

| Don't do this | Do this instead |
|---------------|-----------------|
| `<Card className="rounded-[16px]">` | `<Card shape="rounded">` (use `shape` prop) |
| `<Card spacing="md" className="p-8">` | `<Card spacing="none"><CardContent className="p-8">` (avoid double padding) |
| `<Button className="h-10">` | `<Button size="40">` (use `size` prop) |
| `<Button className="rounded-full">` | `<Button radius="rounded">` (use `radius` prop) |
| `<Input className="rounded-[20px]">` | `<Input shape="rounded">` (use `shape` prop) |
| `<Badge className="py-1 px-2 text-xs">` | `<Badge size="sm">` (use `size` prop) |
| `<Badge className="rounded-[4px]">` | `<Badge radius="square">` (use `radius` prop) |
| `<Text className="text-2xl font-bold">` | `<Text variant="h3" weight="bold">` (use `variant`/`weight` props) |
| `<TabsList className="bg-gray-6">` | `<TabsList variant="solid">` (use `variant` prop) |
| `<InteractiveBadge className="bg-blue-1 border-blue-5">` | `<InteractiveBadge isSelected>` (use `isSelected` prop) |

**Rule of thumb:** Props control structure (size, shape, variant, radius). `className` adds context-specific colour or spacing adjustments on top. Do NOT fight the component's built-in structure with className.

#### 5.7.3 Text overflow prevention

Text that overflows its container is the most common visual bug. Follow these rules:

1. **In horizontal flex layouts**, always add `min-w-0` to the text-containing flex child to allow truncation:

```tsx
{/* ✅ Correct — min-w-0 allows text to shrink */}
<div className="flex items-center gap-3">
  <Avatar className="size-10 shrink-0">...</Avatar>
  <div className="flex flex-col min-w-0">
    <TruncatedText variant="body" weight="regular">Very long user name</TruncatedText>
    <Text variant="label" color="secondary">Subtitle</Text>
  </div>
</div>

{/* ❌ Wrong — text will overflow the container */}
<div className="flex items-center gap-3">
  <Avatar className="size-10">...</Avatar>
  <div className="flex flex-col">
    <Text variant="body">Very long user name that will break layout</Text>
  </div>
</div>
```

2. **Use `TruncatedText`** for any single-line text that could be longer than its container:

```tsx
<TruncatedText variant="body" className="max-w-[200px]">
  Potentially long text
</TruncatedText>
```

3. **Use `ExpandedText`** for multi-line text that should be collapsible.

4. **Always set width constraints** on text containers: `max-w-*`, `w-full` with a parent that has bounded width, or `flex-1 min-w-0`.

5. **Never use `overflow-visible`** on containers with dynamic text content.

#### 5.7.4 Layout and spacing rules

1. **Never double-pad.** If a Card has `spacing="md"` (which applies `p-4`), don't add more padding via `className` on the Card. If you need different internal padding, use `spacing="none"` and handle padding yourself inside `CardContent`:

```tsx
{/* ✅ Correct */}
<Card spacing="none">
  <CardContent className="p-6">Custom padding content</CardContent>
</Card>

{/* ❌ Wrong — double padding from spacing="md" + className */}
<Card spacing="md" className="p-6">
  <CardContent>Content</CardContent>
</Card>
```

2. **Use gap, not margins between siblings.** Wrap siblings in a flex container with `gap-*`:

```tsx
{/* ✅ Correct */}
<div className="flex flex-col gap-4">
  <Input label="Name" fill="outlined" />
  <Input label="Email" fill="outlined" />
  <Button variant="primary">Submit</Button>
</div>

{/* ❌ Wrong — margins create inconsistent spacing */}
<div>
  <Input label="Name" fill="outlined" className="mb-4" />
  <Input label="Email" fill="outlined" className="mb-4" />
  <Button variant="primary">Submit</Button>
</div>
```

3. **Use `shrink-0` on fixed-size elements** in flex layouts (icons, avatars, images):

```tsx
<div className="flex items-center gap-3">
  <Avatar className="size-10 shrink-0">...</Avatar>
  <div className="flex-1 min-w-0">...</div>
  <Button variant="ghost" size="icon-sm" className="shrink-0">...</Button>
</div>
```

#### 5.7.5 Common layout patterns

**Form layout:**
```tsx
<div className="flex flex-col gap-4 w-full max-w-[480px]">
  <Text variant="h3" weight="bold">Form Title</Text>
  <Text variant="body" color="secondary">Description text</Text>
  <div className="flex flex-col gap-3">
    <Input label="Field 1" fill="outlined" />
    <Input label="Field 2" fill="outlined" />
    <Textarea label="Field 3" />
  </div>
  <Button variant="primary" size="48">Submit</Button>
</div>
```

**Card grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} variant="outlined">
      <CardContent className="flex flex-col gap-2">
        <TruncatedText variant="body" weight="regular">{item.title}</TruncatedText>
        <Text variant="label" color="secondary">{item.description}</Text>
      </CardContent>
    </Card>
  ))}
</div>
```

**List item row:**
```tsx
<div className="flex items-center gap-3 p-3">
  <div className="size-10 shrink-0 rounded-full bg-blue-1 flex items-center justify-center">
    <UserIcon className="size-5" pathClasses="stroke-blue-5" />
  </div>
  <div className="flex-1 min-w-0 flex flex-col">
    <TruncatedText variant="body" weight="regular">{name}</TruncatedText>
    <TruncatedText variant="label" color="secondary">{email}</TruncatedText>
  </div>
  <Button variant="ghost" size="icon-sm" className="shrink-0">
    <ChevronRightIcon className="size-5" pathClasses="stroke-current" />
  </Button>
</div>
```

### 5.8 Do NOT

- **Do NOT** use custom SVG icons or other icon libraries. Use `lucide-react` for all icons (see Section 4).
- **Do NOT** override design system CSS variables.
- **Do NOT** use `!important` in Tailwind classes (the `!` modifier) unless absolutely necessary.
- **Do NOT** use default Tailwind color palette (`slate`, `zinc`, `stone`, `neutral`, `red-500`, `blue-600`, etc.). Use only the palette from Section 2.1.
- **Do NOT** use `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`. Use `rounded-[Npx]` with pixel values.
- **Do NOT** create separate `.css` or `.scss` files for component styling.
- **Do NOT** use inline `style` attributes unless a value must be dynamically computed at runtime (e.g. percentage widths, transforms based on state).
- **Do NOT** use `any` type. Always provide proper types.
- **Do NOT** override `border-radius`, `font-size`, `font-weight`, or `height` via `className` on kit components that have props for these properties — use the props instead. See Section 5.7.2.
- **Do NOT** add padding or color via `className` using arbitrary values (`p-[13px]`, `text-[#ff0000]`) — only use design system scale values. See Sections 2.1 and 2.8.
- **Do NOT** place text in flex containers without `min-w-0` on the text's parent. See Section 5.7.3.
- **Do NOT** nest padding — if a component has built-in padding (`spacing`, etc.), don't add more via `className`. See Section 5.7.4.
- **Do NOT** use `border-*` color classes, `border-none`, or `border-0` to style/hide the border of a `Card` or `hairline` element — its border is a pseudo-element. Use `[--hairline-color:...]` / `[--hairline-color:transparent]` instead. See Section 2.7.

---

## 6. Full Mini-App Examples

Complete mini-application examples demonstrating how to combine UI Kit components, design tokens, and coding rules from this guide. Each example intentionally uses diverse component variants (Card: `default`/`ghost`/`outlined`/`filled`/`shape="rounded"`, Button: `primary`/`secondary`/`tertiary`/`ghost`/`black`/`blue`/`link`/`link-destructive`, Badge: all colors and sizes, Tabs: `underline`/`solid`/`pill`, etc.) to showcase the full design system.

| # | Example | Description | Docs |
|---|---------|-------------|------|
| 1 | **Finance Dashboard** | KPI cards, charts, transactions table, budget progress | [_examples/FINANCE_DASHBOARD.md](./_examples/FINANCE_DASHBOARD.md) |
| 2 | **Shopping UI** | Product grid, filters, featured promo, carousel | [_examples/SHOPPING_UI.md](./_examples/SHOPPING_UI.md) |
| 3 | **Project Management** | Kanban board, list view, sprint metrics, team | [_examples/PROJECT_MANAGEMENT.md](./_examples/PROJECT_MANAGEMENT.md) |
