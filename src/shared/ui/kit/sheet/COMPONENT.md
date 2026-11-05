# Sheet

Slide-in panel (drawer) based on Radix Dialog.

```tsx
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader,
  SheetTitle, SheetDescription, SheetFooter, SheetClose
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Sheet
├── SheetTrigger
│   └── (trigger element)
└── SheetContent
    ├── SheetHeader
    │   ├── SheetTitle
    │   └── SheetDescription
    ├── (body content)
    └── SheetFooter
        ├── SheetClose
        └── (action buttons)
```

## Sheet (Root) Props

Extends `React.ComponentProps<typeof SheetPrimitive.Root>` (Radix Dialog Root).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | boolean | — | Uncontrolled open state on initial render |
| `open` | boolean | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |
| `modal` | boolean | `true` | When `true`, interaction with outside elements is blocked |

## SheetTrigger Props

Extends `React.ComponentProps<typeof SheetPrimitive.Trigger>` (Radix Dialog Trigger).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | boolean | `false` | Merge props onto child element instead of rendering a button |

## SheetContent Props

Extends `React.ComponentProps<typeof SheetPrimitive.Content>` (Radix Dialog Content) + custom `side` prop.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | string | `"right"` | `"top"` · `"right"` · `"bottom"` · `"left"` |
| `forceMount` | boolean | — | Force mount for animation control |
| `onOpenAutoFocus` | function | — | Called when focus moves into content after opening |
| `onCloseAutoFocus` | function | — | Called when focus moves to trigger after closing |
| `onEscapeKeyDown` | function | — | Called on Escape key press |
| `onPointerDownOutside` | function | — | Called on pointer event outside |
| `onInteractOutside` | function | — | Called on any interaction outside |

Includes built-in `SheetOverlay` (bg-black/50 backdrop) and a close button (X icon) in the top-right corner.

## SheetHeader Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## SheetFooter Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## SheetTitle Props

Extends `React.ComponentProps<typeof SheetPrimitive.Title>` (Radix Dialog Title).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | boolean | `false` | Merge props onto child element |

## SheetDescription Props

Extends `React.ComponentProps<typeof SheetPrimitive.Description>` (Radix Dialog Description).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | boolean | `false` | Merge props onto child element |

## SheetClose Props

Extends `React.ComponentProps<typeof SheetPrimitive.Close>` (Radix Dialog Close).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | boolean | `false` | Merge props onto child element |

## Examples

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button>Open Panel</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Settings</SheetTitle>
    </SheetHeader>
    <div className="p-4">Panel content</div>
    <SheetFooter>
      <Button>Save</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```
