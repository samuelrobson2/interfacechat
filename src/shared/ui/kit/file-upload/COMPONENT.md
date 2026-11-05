# FileUpload

File upload with trigger and content display.

```tsx
import {
  FileUpload, FileUploadTrigger, FileUploadContent,
  FileUploadedItem, FileUploadAttachmentTrigger, FileUploadAttachmentContent
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
FileUpload
├── FileUploadTrigger (full-size upload trigger)
├── FileUploadContent (file list display)
│   └── FileUploadedItem (default file card)
├── FileUploadAttachmentTrigger (compact icon button)
└── FileUploadAttachmentContent (file as closable badge)
```

## FileUpload Props (Root)

Context provider wrapping all sub-components.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `files` | `Map<string, File>` | — | Current files state |
| `className` | `string` | — | Additional CSS classes for wrapper div |
| `children` | `ReactNode` | — | Sub-components |

## FileUploadTrigger Props

Extends `Omit<React.ComponentProps<"input">, "onChange">` — accepts all standard `<input>` HTML attributes (`accept`, `multiple`, `disabled`, `aria-*`, etc.) except `onChange`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onChange` | `(files: Map<string, File>) => void` | — | Files change callback |
| `maxFiles` | `number` | `3` | Max allowed files |
| `children` | `ReactNode` | — | Custom trigger content (defaults to upload icon + text) |
| `disabled` | `boolean` | — | Disables the trigger |

## FileUploadContent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Custom content (bypasses default rendering) |
| `onRemove` | `() => void` | — | Remove callback |
| `className` | `string` | — | Additional CSS classes |

## FileUploadedItem Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `files` | `File[]` | — | Array of file objects (required) |
| `onRemove` | `() => void` | — | Remove callback (shows X button when provided) |

## FileUploadAttachmentTrigger Props

Extends `Omit<React.ComponentProps<"input">, "onChange">` — accepts all standard `<input>` HTML attributes (`accept`, `multiple`, `disabled`, `aria-*`, etc.) except `onChange`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onChange` | `(files: Map<string, File>) => void` | — | Files change callback |
| `maxFiles` | `number` | `3` | Max allowed files |
| `tooltipContent` | `ReactNode` | — | Tooltip text on hover |
| `disabled` | `boolean` | — | Disables the trigger |

Default visual style for `FileUploadAttachmentTrigger`:

- Trigger button container: `w-10 h-11.5` (centered icon)
- Icon: `PlusSmallIcon` with `size-20`
- Can be overridden via `className` (for example compact chat variants)

## FileUploadAttachmentContent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fileKey` | `string` | — | File identifier |
| `file` | `File` | — | File object |
| `onRemove` | `(fileKey: string) => void` | — | Remove callback |
| `className` | `string` | — | Additional CSS classes for badge |
| `textClassName` | `string` | — | Additional CSS classes for file name text |

## Examples

```tsx
<FileUpload files={files}>
  <FileUploadTrigger onChange={setFiles} multiple accept=".pdf,.doc" />
  <FileUploadContent onRemove={handleRemove} />
</FileUpload>
```

```tsx
<FileUpload files={files}>
  <FileUploadAttachmentTrigger
    onChange={setFiles}
    className="size-8 rounded-[60px] p-0 [&_svg]:size-4"
    tooltipContent="Attach file"
  />
</FileUpload>
```
