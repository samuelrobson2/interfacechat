# Dropzone

File drag-and-drop area based on react-dropzone.

```tsx
import {
  Dropzone, DropzoneEmptyState, DropzoneContent,
  DropzoneUploading, DropzoneError
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
Dropzone
├── DropzoneEmptyState (no files state)
├── DropzoneContent (files uploaded state)
├── DropzoneUploading (upload in progress state)
└── DropzoneError (error state)
```

## Dropzone Props

Extends `DropzoneOptions` from `react-dropzone` (with `onDrop` re-typed) — accepts all [react-dropzone options](https://react-dropzone.js.org/).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `Record<string, string[]>` | — | MIME type map, e.g. `{ "text/csv": [".csv"] }` |
| `maxFiles` | `number` | `1` | Max file count |
| `maxSize` | `number` | — | Max file size in bytes |
| `minSize` | `number` | — | Min file size in bytes |
| `onDrop` | `(acceptedFiles: File[], rejections: FileRejection[], event: DropEvent) => void` | — | Drop callback |
| `onError` | `(error: Error) => void` | — | Error callback |
| `disabled` | `boolean` | — | Disables the drop zone |
| `src` | `File[]` | — | Already uploaded files (drives state display) |
| `isError` | `boolean` | — | Forces error state display |
| `uploading` | `boolean` | — | Forces uploading state display |
| `className` | `string` | — | Additional CSS classes |
| `children` | `ReactNode` | — | Sub-component slots |
| `multiple` | `boolean` | — | Allow multiple file selection |
| `noClick` | `boolean` | — | Disable click to open file dialog |
| `noDrag` | `boolean` | — | Disable drag'n'drop |
| `noKeyboard` | `boolean` | — | Disable keyboard events |

## DropzoneEmptyState Props

Shown when `src` is empty and not in error/uploading state.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `caption` | `string` | — | Secondary text below "Drag & drop files to upload" |
| `children` | `ReactNode` | — | Custom empty state content (replaces default) |
| `className` | `string` | — | Additional CSS classes |

## DropzoneContent Props

Shown when `src` has files and not in error/uploading state.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRemove` | `() => void` | — | Callback to remove uploaded files |
| `children` | `ReactNode` | — | Custom content (replaces default file list) |
| `className` | `string` | — | Additional CSS classes |

## DropzoneUploading Props

Shown when `uploading` is `true`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progress` | `number` | — | **Required.** Upload progress percentage (0–100) |
| `children` | `ReactNode` | — | Custom uploading content (replaces default) |
| `className` | `string` | — | Additional CSS classes |

## DropzoneError Props

Shown when `isError` is `true`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Error title text |
| `caption` | `string` | — | Error description text |
| `children` | `ReactNode` | — | Custom error content (replaces default) |
| `className` | `string` | — | Additional CSS classes |

## Examples

```tsx
<Dropzone accept={{ "text/csv": [".csv"] }} onDrop={handleDrop}>
  <DropzoneEmptyState caption="CSV files up to 10MB" />
  <DropzoneContent onRemove={handleRemove} />
  <DropzoneUploading progress={45} />
  <DropzoneError title="Upload failed" caption="Try again" />
</Dropzone>
```
