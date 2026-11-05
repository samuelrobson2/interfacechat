import * as React from "react";

import { ArrowUp } from "@/shared/assets/icons/general/ArrowUp";
import { MicrophoneIcon } from "@/shared/assets/icons/general/Microphone";
import { StopIcon } from "@/shared/assets/icons/general/Stop";
import { CheckmarkIcon } from "@/shared/assets/icons/outlined/Checkmark";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Button, type ButtonProps } from "@/shared/ui/kit/button";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Text, textVariants } from "@/shared/ui/kit/text";
import { Textarea, type TextareaProps } from "@/shared/ui/kit/textarea";

import { ChatGrayFrame } from "./chat-gray-frame";
import { ChatSurfaceFrame } from "./chat-surface-frame";

// Figma caps the composer at ~198px: 16px padding, 7 lines of text, 16px gap, 32px action row.
// Past that the field scrolls internally instead of growing the frame.
const COMPOSER_MAX_ROWS = 7;

const composerIconButtonClassName = cn(
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[60px]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

// Send / stop share the Figma "AI / Button" box: 32px square, 6px radius, 1px stroke.
// The stroke is a real border, so the kit's hairline stays off in every state — the
// secondary variant would otherwise re-enable it on hover as a second, 4px-radius ring.
const composerActionButtonClassName = cn(
  "size-8 rounded-[6px] p-0",
  "border border-stroke-tertiary bg-transparent",
  "[--hairline-color:transparent] hover:[--hairline-color:transparent]",
  "hover:border-stroke-secondary",
);

export type ChatComposerAttachButtonProps = React.ComponentProps<"button">;

export function ChatComposerAttachButton({
  className,
  ...props
}: ChatComposerAttachButtonProps) {
  return (
    <button
      type="button"
      className={cn(composerIconButtonClassName, className)}
      aria-label="Attach"
      title="Attach"
      {...props}
    >
      <PlusSmallIcon svgClasses="size-3" pathClasses="stroke-icon-primary" />
    </button>
  );
}

export type ChatComposerMicButtonProps = React.ComponentProps<"button">;

export function ChatComposerMicButton({
  className,
  ...props
}: ChatComposerMicButtonProps) {
  return (
    <button
      type="button"
      className={cn(composerIconButtonClassName, className)}
      aria-label="Voice input"
      title="Voice input"
      {...props}
    >
      <MicrophoneIcon svgClasses="size-4" pathClasses="stroke-icon-primary" />
    </button>
  );
}

export function ChatComposerSendButton({
  className,
  active = false,
  ...props
}: Omit<ButtonProps, "size" | "variant"> & {
  active?: boolean;
}) {
  return (
    <Button
      variant="secondary"
      className={cn(
        composerActionButtonClassName,
        // The kit's secondary variant repaints the fill when disabled; the design keeps it.
        "bg-background-primary disabled:bg-background-primary",
        // Idle is the same outlined box dimmed over the composer fill; focusing the composer
        // lifts it to full strength so the field reads as active while the button stays disabled.
        !active && "opacity-50 group-has-focus:opacity-100",
        className,
      )}
      aria-label="Send"
      title="Send"
      {...props}
    >
      <ArrowUp
        svgClasses="size-4 rotate-90"
        pathClasses={active ? "stroke-icon-primary" : "stroke-icon-secondary"}
      />
    </Button>
  );
}

export type ChatComposerStopButtonProps = Omit<ButtonProps, "size" | "variant">;

export function ChatComposerStopButton({
  className,
  ...props
}: ChatComposerStopButtonProps) {
  return (
    <Button
      variant="secondary"
      className={cn(composerActionButtonClassName, className)}
      aria-label="Stop"
      title="Stop"
      {...props}
    >
      <StopIcon svgClasses="size-4" pathClasses="stroke-icon-primary" />
    </Button>
  );
}

export type ChatTextareaComposerProps = Omit<
  TextareaProps,
  "leftElement" | "rightElement" | "variant" | "fill" | "shape"
> & {
  /** Left action rail rendered at the bottom (attach button, file previews, badges, etc.). */
  leftActions?: React.ReactNode;
  /** Right action rail rendered at the bottom (microphone, send/stop button, etc.). */
  rightActions?: React.ReactNode;
  /** Element rendered in the top. */
  topAction?: React.ReactNode;
  /**
   * Squares off the bottom edge and tucks it 16px over the element below, so
   * the composer and an attached `ChatComposerDropdown` read as one card.
   */
  attached?: boolean;
  /** Outer frame override class (applied to ChatSurfaceFrame). */
  frameClassName?: string;
  layoutId?: string;
  layoutTransition?: import("motion/react").Transition;
};

export function ChatTextareaComposer({
  leftActions,
  rightActions,
  topAction,
  attached = false,
  frameClassName,
  layoutId,
  layoutTransition,
  className,
  inputClassName,
  placeholder = "How can we help you?",
  value,
  maxRows = COMPOSER_MAX_ROWS,
  ...textareaProps
}: ChatTextareaComposerProps) {
  // The AI stroke stays lit while there is a draft, not just while the field is focused.
  const hasDraft = String(value ?? "").trim().length > 0;

  return (
    <ChatSurfaceFrame
      hoverable={!hasDraft}
      gradientStroke={hasDraft ? "always" : "focus"}
      layoutId={layoutId}
      layoutTransition={layoutTransition}
      className={cn(
        "flex min-h-[100px] w-full",
        attached && "-mb-4",
        frameClassName,
      )}
    >
      {topAction}
      <Textarea
        value={value}
        placeholder={placeholder}
        maxRows={maxRows}
        fill="filled"
        className={cn(
          "h-full w-full rounded-[16px] bg-transparent p-4 shadow-none",
          "[--hairline-color:transparent] has-focus:[--hairline-color:transparent]",
          "flex flex-col items-stretch gap-4",
          className,
        )}
        inputClassName={cn(
          textVariants({ variant: "label" }),
          // iOS Safari/Chrome auto-zoom on focus when the field font is < 16px.
          // Keep the 14px design on desktop, bump to 16px on mobile to suppress it.
          "max-md:text-[16px]",
          // The kit field is `flex-1` (basis 0), which hides the autosize height from
          // the column layout. Sizing it to its content is what lets the frame grow.
          "m-0 min-h-0 flex-none placeholder:text-typography-secondary",
          inputClassName,
        )}
        rightElement={
          <div className="mt-auto flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">{leftActions}</div>
            <div className="flex items-center gap-2">{rightActions}</div>
          </div>
        }
        {...textareaProps}
      />
    </ChatSurfaceFrame>
  );
}

/** Panel that slides out from under the composer, e.g. a source picker. */
export function ChatComposerDropdown({
  title,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-b-[16px] bg-background-primary px-3 pt-8 pb-3",
        "hairline [--hairline-radius:16px] [--hairline-color:var(--color-stroke-tertiary)]",
        // The top edge hides behind the composer, so it must stay square.
        "[&::after]:rounded-t-none",
        className,
      )}
      {...props}
    >
      <Text variant="label" color="secondary">
        {title}
      </Text>
      {children}
    </div>
  );
}

export function ChatComposerDropdownList({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      ref={ref}
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

export function ChatComposerDropdownItem({
  icon,
  label,
  selected = false,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      title={label}
      className={cn(
        "group flex h-8 w-full shrink-0 cursor-pointer items-center gap-2 rounded-[16px] text-left",
        "hover:bg-gray-6",
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
        color={selected ? "primary" : "secondary"}
        className="min-w-0 flex-1 truncate group-hover:text-typography-primary"
      >
        {label}
      </Text>

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
    </button>
  );
}

/** Trailing row of a dropdown that triggers an action instead of picking a value. */
export function ChatComposerDropdownAction({
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

export function ChatComposerDropdownSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full rounded-[16px]" />
      ))}
    </div>
  );
}

export type ChatInlineComposerProps = Omit<
  React.ComponentProps<"input">,
  "type" | "size"
> & {
  /** Left action rail rendered next to the input (attach button, etc.). */
  leftActions?: React.ReactNode;
  /** Right action rail (microphone, send/stop button, etc.). */
  rightActions?: React.ReactNode;
  /** Outer frame override class (applied to ChatGrayFrame). */
  frameClassName?: string;
  /** Forces the highlight tone (used for brief attention-grabbing flashes). */
  highlighted?: boolean;
};

// Pure UI: typing state is derived from `value` so callers don't need to wire it.
export function ChatInlineComposer({
  leftActions,
  rightActions,
  frameClassName,
  className,
  placeholder = "Describe edits",
  value,
  highlighted = false,
  ...inputProps
}: ChatInlineComposerProps) {
  const isTyping = typeof value === "string" ? value.trim().length > 0 : false;
  const showHighlight = isTyping || highlighted;

  return (
    <ChatGrayFrame
      className={cn("w-[440px] max-w-[92vw]", frameClassName)}
      frameThickness={3}
      overlay={showHighlight}
      fillClassName={cn(showHighlight && "bg-(--chat-selection-highlight)")}
    >
      <div className="flex w-full items-center gap-2 p-4">
        {leftActions}
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          className={cn(
            textVariants({ variant: "label" }),
            "max-md:text-[16px]",
            "h-8 min-w-0 flex-1 bg-transparent outline-none placeholder:text-typography-secondary",
            className,
          )}
          {...inputProps}
        />
        <div className="flex items-center gap-2">{rightActions}</div>
      </div>
    </ChatGrayFrame>
  );
}
