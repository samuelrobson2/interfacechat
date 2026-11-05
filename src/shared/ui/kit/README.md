# @adaptionlabs/ui-kit

Numi Labs shared UI component library built with React, Tailwind CSS v4, and Radix UI primitives.

## Installation

```bash
npm install @adaptionlabs/ui-kit
# or
pnpm add @adaptionlabs/ui-kit
```

> **Note:** This is a private package on npmjs.org. Configure your `.npmrc` with a read-token for the `@numi-labs` scope:
> ```
> @numi-labs:registry=https://registry.npmjs.org
> //registry.npmjs.org/:_authToken=${NPM_TOKEN}
> ```
> Request a read-only `NPM_TOKEN` from the Numi Labs admin.

## Setup

### 1. Import styles

In your main CSS file, import Tailwind and the kit styles:

```css
@import "tailwindcss";
@import "@adaptionlabs/ui-kit/styles.css";
```

### 2. Use components

Import from `@adaptionlabs/ui-kit`

```tsx
import { Button, Input, Card } from '@adaptionlabs/ui-kit';

export default function App() {
  return (
    <Card>
      <Input placeholder="Enter text..." />
      <Button>Submit</Button>
    </Card>
  );
}
```

### 3. Use icons

For icons, use [`lucide-react`](https://lucide.dev/icons/):

```tsx
import { Search, Star, ArrowRight } from 'lucide-react';

export default function Example() {
  return <Search className="size-5 text-icon-primary" />;
}
```

---

## Components

| Component | Description |
|-----------|-------------|
| `Accordion` | Collapsible content sections |
| `Alert` | Contextual feedback messages |
| `Avatar` | User profile image with fallback |
| `Badge` | Small status and label indicators |
| `Breadcrumb` | Navigation hierarchy trail |
| `Button` | Primary action element |
| `ButtonGroup` | Grouped set of buttons |
| `Calendar` | Date picker calendar |
| `Card` | Content container surface |
| `Carousel` | Scrollable item slideshow |
| `Chart` | Data visualization (Recharts-based) |
| `ChartCard` | Composable chart card with 6 chart types (horizontal bars, density curve, box plot, histogram, diverging bars, bubble) |
| `Checkbox` | Boolean toggle input |
| `CircularProgress` | Circular progress ring indicator |
| `HeaderImage` | Full-width header banner image |
| `Collapsible` | Show/hide content panel |
| `Combobox` | Searchable dropdown selector |
| `CodeBlock` | Code snippet with copy action |
| `Command` | Command palette / search menu |
| `Dialog` | Modal overlay window |
| `DropdownMenu` | Contextual action menu |
| `Dropzone` | File drag-and-drop area |
| `ExpandedText` | Text with expand/collapse |
| `FileUpload` | File upload input |
| `ImageGrid` | Responsive image grid layout |
| `ImagesViewer` | Image thumbnails with fullscreen lightbox |
| `Input` | Text input field |
| `InputOTP` | One-time password input |
| `InteractiveBadge` | Clickable badge with state |
| `Item` | Generic list item |
| `Label` | Form field label |
| `List` | Typed list with dot/number/line/check markers |
| `NavigationMenu` | Nav menu |
| `MultiSelect` | Multi-value select input |
| `Pagination` | Page navigation controls |
| `Popover` | Floating content overlay |
| `Progress` | Progress bar indicator |
| `RadioGroup` | Single-choice radio buttons |
| `ScrollArea` | Custom scrollable container |
| `Select` | Single-value dropdown |
| `SelectedText` | Highlighted selected text display |
| `Separator` | Visual divider line |
| `Sheet` | Slide-in panel (drawer) |
| `Sidebar` | Application sidebar layout |
| `Skeleton` | Loading placeholder |
| `Slider` | Range value slider |
| `Toaster` | Toast notification system (Sonner) |
| `Stepper` | Multi-step process indicator |
| `Switch` | Toggle on/off switch |
| `Table` | Data table |
| `Tabs` | Tabbed content navigation |
| `Text` | Typography component |
| `Textarea` | Multi-line text input |
| `Tooltip` | Hover hint overlay |
| `Timeline` | Gantt-chart style timeline with colored bars |
| `TotalChart` | Multi-segment donut chart card with progress bars |
| `TruncatedText` | Text with overflow truncation |
| `VideoPlayer` | Custom video player with controls |
| `Checklist` | Interactive checklist with checkboxes |
| `ComparisonCard` | Side-by-side comparison of items with status icons |

---

## Icons

This library does **not** ship its own icons. Use [`lucide-react`](https://lucide.dev/icons/) for all icon needs.

```tsx
import { Search, Star, ArrowRight, Trash2 } from 'lucide-react';

<Search className="size-5 text-icon-primary" />
<Star className="size-6 text-yellow-5" />
```

Browse the full icon catalog at [lucide.dev/icons](https://lucide.dev/icons/).

---

## LLM / AI Code Generation Guide

For AI-assisted development (Cursor, Copilot, etc.), a detailed prompt guide is bundled with the package — read it from `node_modules/@numi-labs/ui-kit/LLM_FRONTEND_GUIDE.md`:

👉 [LLM_FRONTEND_GUIDE.md](./LLM_FRONTEND_GUIDE.md)

It covers the full design system (colors, typography, spacing, shadows, gradients), all component APIs with props tables and usage examples, icon lists, and coding rules. Per-component reference docs are also bundled at `node_modules/@numi-labs/ui-kit/<component>/COMPONENT.md`.

---

## License

Private — © Numi Labs
