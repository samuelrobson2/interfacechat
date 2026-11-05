# Dialog

Modal overlay window based on Radix Dialog.

```tsx
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
  DialogOverlay, DialogPortal
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Dialog
├── DialogTrigger
│   └── (trigger element, e.g. Button)
└── DialogContent
    ├── DialogHeader
    │   ├── DialogTitle
    │   └── DialogDescription
    ├── (body content)
    ├── DialogFooter
    │   ├── DialogClose (auto Cancel if showCancelButton)
    │   └── (action buttons)
    └── showCloseButton → X button (top-right)
```

## Dialog (Root) Props

Extends all props from Radix `Dialog.Root`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | — | Uncontrolled initial open state |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |
| `modal` | `boolean` | `true` | Whether dialog is modal (blocks interaction with rest of page) |

## DialogTrigger Props

Extends all props from Radix `Dialog.Trigger`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element |

## DialogContent Props

Extends all props from Radix `Dialog.Content`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCloseButton` | `boolean` | `false` | Renders X button in top-right corner |
| `asChild` | `boolean` | `false` | Merge props onto child element |
| `forceMount` | `boolean` | — | Force mount content when closed |
| `onOpenAutoFocus` | `(event: Event) => void` | — | Override auto-focus on open |
| `onCloseAutoFocus` | `(event: Event) => void` | — | Override auto-focus on close |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | — | Callback on Escape key |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void` | — | Callback on click outside |
| `onInteractOutside` | `(event: Event) => void` | — | Callback on any interaction outside |

## DialogHeader Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## DialogFooter Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCancelButton` | `boolean` | `true` | Auto-renders Cancel button via DialogClose |

## DialogTitle Props

Extends all props from Radix `Dialog.Title`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element |

## DialogDescription Props

Extends all props from Radix `Dialog.Description`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element |

## DialogClose Props

Extends all props from Radix `Dialog.Close`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element |

## DialogOverlay Props

Extends all props from Radix `Dialog.Overlay`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Merge props onto child element |
| `forceMount` | `boolean` | — | Force mount overlay when closed |

## Examples

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent showCloseButton>
    <DialogHeader>
      <DialogTitle>Confirm</DialogTitle>
      <DialogDescription>Are you sure?</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="primary">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```
