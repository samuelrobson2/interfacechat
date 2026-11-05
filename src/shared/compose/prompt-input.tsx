import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";

import { ArrowUp } from "@/shared/assets/icons/general/ArrowUp";
import { MicrophoneIcon } from "@/shared/assets/icons/general/Microphone";
import { StopIcon } from "@/shared/assets/icons/general/Stop";
import { CheckmarkIcon } from "@/shared/assets/icons/outlined/Checkmark";
import { ChevronBottomIcon } from "@/shared/assets/icons/outlined/ChevronBottom";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Button, type ButtonProps } from "@/shared/ui/kit/button";
import { FileUploadAttachmentTrigger } from "@/shared/ui/kit/file-upload";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Text, textVariants } from "@/shared/ui/kit/text";
import { Textarea, type TextareaProps } from "@/shared/ui/kit/textarea";
import { SurfaceFrame } from "@/shared/ui/surface-frame";

// Figma caps the composer at ~198px: 16px padding, 7 lines of text, 16px gap, 32px action row.
// Past that the field scrolls internally instead of growing the frame.
export const PROMPT_INPUT_MAX_ROWS = 7;

const iconButtonClassName = cn(
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[60px]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const hasDraft = (value: unknown) => String(value ?? "").trim().length > 0;

const promptInputVariants = cva("flex w-full", {
  variants: {
    variant: {
      default: "min-h-[100px] flex-col gap-4 p-4",
      inline: "w-[440px] max-w-[92vw] items-center gap-2 p-3",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/** Frame of the prompt input. Compose the field, footer and actions inside it. */
export function PromptInput({
  variant,
  attached = false,
  highlighted = false,
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof promptInputVariants> & {
    /**
     * Squares off the bottom edge and tucks it 16px over the element below, so
     * the input and an attached `PromptInputDropdown` read as one card.
     */
    attached?: boolean;
    /** Forces the AI stroke (used for brief attention-grabbing flashes). */
    highlighted?: boolean;
  }) {
  return (
    <SurfaceFrame
      data-slot="prompt-input"
      hoverable={!highlighted}
      gradientStroke={highlighted ? "always" : "filled"}
      className={cn(
        promptInputVariants({ variant }),
        attached && "-mb-4",
        className,
      )}
      {...props}
    />
  );
}

/** Auto-growing multi-line field for the `default` variant. */
export function PromptInputTextarea({
  className,
  inputClassName,
  placeholder = "How can we help you?",
  maxRows = PROMPT_INPUT_MAX_ROWS,
  value,
  ...props
}: Omit<
  TextareaProps,
  "leftElement" | "rightElement" | "variant" | "fill" | "shape" | "label"
>) {
  return (
    <Textarea
      data-slot="prompt-input-field"
      data-filled={hasDraft(value) || undefined}
      value={value}
      placeholder={placeholder}
      maxRows={maxRows}
      fill="filled"
      className={cn(
        "rounded-none bg-transparent p-0 shadow-none",
        "[--hairline-color:transparent] has-focus:[--hairline-color:transparent]",
        className,
      )}
      inputClassName={cn(
        textVariants({ variant: "label" }),
        // iOS Safari/Chrome auto-zoom on focus when the field font is < 16px.
        // Keep the 14px design on desktop, bump to 16px on mobile to suppress it.
        "max-md:text-[16px]",
        // A single row must stay at its line height, otherwise the 100px frame grows.
        "m-0 min-h-0 placeholder:text-typography-secondary",
        inputClassName,
      )}
      {...props}
    />
  );
}

/** Single-line field for the `inline` variant. */
export function PromptInputField({
  className,
  placeholder = "Describe edits",
  value,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "size">) {
  return (
    <input
      type="text"
      data-slot="prompt-input-field"
      data-filled={hasDraft(value) || undefined}
      value={value}
      placeholder={placeholder}
      className={cn(
        textVariants({ variant: "label" }),
        "max-md:text-[16px]",
        "h-8 min-w-0 flex-1 bg-transparent outline-none placeholder:text-typography-secondary",
        className,
      )}
      {...props}
    />
  );
}

/** Bottom action row, pinned under the field. */
export function PromptInputFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prompt-input-footer"
      className={cn(
        "mt-auto flex w-full items-center justify-between gap-2",
        // Dims together with the disabled field, like the field's own container does.
        "group-has-[[data-slot=prompt-input-field]:disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** Group of actions inside the footer (attach, chips, send, etc.). */
export function PromptInputActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prompt-input-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

export function PromptInputAttachButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(iconButtonClassName, className)}
      aria-label="Attach"
      title="Attach"
      {...props}
    >
      <PlusSmallIcon svgClasses="size-3" pathClasses="stroke-icon-primary" />
    </button>
  );
}

/** Attach button that opens the file picker. Must be rendered inside `FileUpload`. */
export function PromptInputFileTrigger({
  className,
  ...props
}: React.ComponentProps<typeof FileUploadAttachmentTrigger>) {
  return (
    <FileUploadAttachmentTrigger
      className={cn("size-8 rounded-[60px] p-0", className)}
      {...props}
    />
  );
}

export function PromptInputMicButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(iconButtonClassName, className)}
      aria-label="Voice input"
      title="Voice input"
      {...props}
    >
      <MicrophoneIcon svgClasses="size-4" pathClasses="stroke-icon-primary" />
    </button>
  );
}

/** Text trigger that opens an attached dropdown (dataset picker, model list, etc.). */
export function PromptInputPickerTrigger({
  label,
  open = false,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  label: string;
  open?: boolean;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      className={cn(
        "flex shrink-0 cursor-pointer items-center gap-2",
        className,
      )}
      {...props}
    >
      <Text variant="label" className="leading-4.25">
        {label}
      </Text>
      <ChevronBottomIcon
        svgClasses={cn(
          "size-4 shrink-0 transition-transform",
          open && "rotate-180",
        )}
        pathClasses="stroke-icon-primary"
      />
    </button>
  );
}

/** Attached item (file, dataset). Clicking the label is optional. */
export function PromptInputChip({
  icon,
  label,
  onClick,
  onRemove,
  removeLabel = `Remove ${label}`,
  removeTitle = removeLabel,
  disabled = false,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  removeTitle?: string;
  disabled?: boolean;
  className?: string;
}) {
  const content = (
    <>
      {icon}
      <Text variant="label" className="max-w-[220px] truncate leading-none">
        {label}
      </Text>
    </>
  );

  return (
    <div
      data-slot="prompt-input-chip"
      className={cn(
        "flex h-8 min-w-0 items-center gap-2 rounded-[16px] bg-gray-6 px-3",
        disabled && "opacity-50",
        className,
      )}
    >
      {onClick ? (
        <button
          type="button"
          title={label}
          disabled={disabled}
          className="flex min-w-0 cursor-pointer items-center gap-2 disabled:cursor-not-allowed"
          onClick={onClick}
        >
          {content}
        </button>
      ) : (
        <span title={label} className="flex min-w-0 items-center gap-2">
          {content}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          title={removeTitle}
          disabled={disabled}
          className="flex shrink-0 cursor-pointer items-center disabled:cursor-not-allowed"
          onClick={onRemove}
        >
          <CrossLargeIcon
            svgClasses="size-4"
            pathClasses="stroke-icon-primary"
          />
        </button>
      )}
    </div>
  );
}

/** Send button. Pass `children` to render a labelled pill (e.g. "Generate"). */
export function PromptInputSubmit({
  active,
  disabled,
  children,
  className,
  ...props
}: Omit<ButtonProps, "size" | "variant"> & {
  /** Dims the button without disabling it. Defaults to `!disabled`. */
  active?: boolean;
}) {
  const isActive = active ?? !disabled;

  return (
    <Button
      variant="primary"
      size={children ? "40" : "icon-sm"}
      className={cn(
        "rounded-[6px] p-0",
        "[--hairline-color:transparent] hover:[--hairline-color:transparent]",
        "bg-gray-4 hover:bg-gray-5",
        children && [
          textVariants({ variant: "caption", weight: "light", color: "none" }),
          "h-8 gap-1.5 rounded-[40px] px-3",
        ],
        !isActive && "opacity-40",
        className,
      )}
      aria-label={children ? undefined : "Send"}
      title={children ? undefined : "Send"}
      disabled={disabled}
      {...props}
    >
      {children}
      <ArrowUp svgClasses="size-4 rotate-90" pathClasses="stroke-gray-1" />
    </Button>
  );
}

export function PromptInputStop({
  className,
  ...props
}: Omit<ButtonProps, "size" | "variant">) {
  return (
    <Button
      variant="secondary"
      className={cn(
        "size-8 rounded-[6px] p-0",
        "border border-stroke-tertiary bg-transparent",
        "[--hairline-color:transparent] hover:[--hairline-color:transparent]",
        "hover:border-stroke-secondary",
        className,
      )}
      aria-label="Stop"
      title="Stop"
      {...props}
    >
      <StopIcon svgClasses="size-4" pathClasses="stroke-icon-primary" />
    </Button>
  );
}

/**
 * Drop target rendered in place of the input while files are dragged over the
 * page. Pair it with `useWindowFileDrag` to decide when to show it.
 */
export function PromptInputDropzone({
  title = "Drag & drop files to upload",
  caption,
  attached = false,
  className,
  ...options
}: Omit<DropzoneOptions, "noClick" | "noKeyboard"> & {
  title?: string;
  /** Supported formats, e.g. "PDF, TXT files". */
  caption?: string;
  /** Tucks the bottom edge over the dropdown below, like `PromptInput` does. */
  attached?: boolean;
  className?: string;
}) {
  const { getRootProps, getInputProps } = useDropzone({
    ...options,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div
      {...getRootProps({
        className: cn(
          "flex min-h-[100px] w-full flex-col items-center justify-center gap-1.5 p-4",
          "rounded-[16px] border border-dashed border-blue-4 bg-[#f5f9fb] shadow-elevated",
          attached && "-mb-4",
          className,
        ),
      })}
    >
      <input {...getInputProps()} />
      <Text variant="label">{title}</Text>
      {caption && (
        <Text variant="small" weight="regular" color="secondary">
          {caption}
        </Text>
      )}
    </div>
  );
}

/** Panel that slides out from under the input, e.g. a source picker. */
export function PromptInputDropdown({
  title,
  topContent,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title?: string;
  /** Rendered above the title, e.g. an in-progress upload. */
  topContent?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-b-[16px] bg-background-primary px-3 pt-8 pb-3",
        "hairline [--hairline-radius:16px] [--hairline-color:var(--color-stroke-tertiary)]",
        // The top edge hides behind the input, so it must stay square.
        "[&::after]:rounded-t-none",
        className,
      )}
      {...props}
    >
      {topContent}
      {title && (
        <Text variant="label" color="secondary">
          {title}
        </Text>
      )}
      {children}
    </div>
  );
}

export function PromptInputDropdownList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      // Three 32px rows with 8px gaps; anything beyond that scrolls.
      className={cn(
        "flex max-h-28 w-full flex-col gap-2 overflow-y-auto",
        "[&::-webkit-scrollbar]:w-[2px]",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-[8px] [&::-webkit-scrollbar-thumb]:bg-gray-2",
        "[&::-webkit-scrollbar-thumb]:hover:bg-border-primary",
        className,
      )}
      {...props}
    />
  );
}

export function PromptInputDropdownItem({
  icon,
  label,
  selected = false,
  trailingContent,
  disabled,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  trailingContent?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      title={label}
      disabled={disabled}
      className={cn(
        "group flex h-8 w-full shrink-0 cursor-pointer items-center gap-2 rounded-[16px] text-left",
        "disabled:cursor-not-allowed disabled:opacity-[0.48]",
        !disabled && "hover:bg-gray-6",
        selected && "bg-gray-6",
        className,
      )}
      {...props}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-[18px]">
        {icon}
      </span>

      <Text
        variant="label"
        className={cn(
          "min-w-0 flex-1 truncate",
          !disabled && "group-hover:text-typography-primary",
        )}
      >
        {label}
      </Text>

      {trailingContent ?? (
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-[18px]",
            !selected && "opacity-0 transition-opacity group-hover:opacity-100",
          )}
        >
          {selected ? (
            <CheckmarkIcon
              svgClasses="size-4"
              pathClasses="stroke-icon-primary"
            />
          ) : (
            <PlusSmallIcon
              svgClasses="size-4"
              pathClasses="stroke-icon-primary"
            />
          )}
        </span>
      )}
    </button>
  );
}

/** Trailing row of a dropdown that triggers an action instead of picking a value. */
export function PromptInputDropdownAction({
  icon,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 w-full shrink-0 cursor-pointer items-center gap-2 rounded-[16px] text-left",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-[18px]",
          "border border-gray-1 bg-gray-6 shadow-[0_0_3px_1px_var(--color-rose-1)]",
        )}
      >
        {icon}
      </span>

      <Text variant="label">{label}</Text>
    </button>
  );
}

export function PromptInputDropdownSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full rounded-[16px]" />
      ))}
    </div>
  );
}
