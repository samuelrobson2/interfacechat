import * as React from "react";

import { MicrophoneIcon } from "@/shared/assets/icons/general/Microphone";
import { StopIcon } from "@/shared/assets/icons/general/Stop";
import { ArrowUpIcon } from "@/shared/assets/icons/outlined/ArrowUp";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { cn } from "@/shared/lib/css";
import { Button, type ButtonProps } from "@/shared/ui/kit/button";
import { textVariants } from "@/shared/ui/kit/text";
import { Textarea, type TextareaProps } from "@/shared/ui/kit/textarea";

import { ChatGradientFrame } from "./chat-gradient-frame";
import { ChatGrayFrame } from "./chat-gray-frame";

const composerIconButtonClassName = cn(
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[60px]",
  "disabled:cursor-not-allowed disabled:opacity-50",
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
      <PlusSmallIcon svgClasses="size-3" />
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
  shimmer = false,
  ...props
}: Omit<ButtonProps, "size" | "variant"> & {
  active?: boolean;
  /** Opt-in glowing gradient-frame border (used by auto-interface's chat
   *  panel). The main chat composer defaults to the plain shaded fill. */
  shimmer?: boolean;
}) {
  if (active && shimmer) {
    return (
      <ChatGradientFrame
        frameThickness={1.5}
        blurAmount={1.5}
        className={cn("size-8 rounded-[6px]", className)}
        asChild
      >
        <Button
          variant="secondary"
          className="border-0 p-0"
          aria-label="Send"
          title="Send"
          {...props}
        >
          <ArrowUpIcon />
        </Button>
      </ChatGradientFrame>
    );
  }

  if (active) {
    return (
      <Button
        variant="secondary"
        className={cn(
          "size-8 rounded-[6px] border-0 p-0 bg-gradient-iridescent shadow-none",
          className,
        )}
        aria-label="Send"
        title="Send"
        {...props}
      >
        <ArrowUpIcon pathClasses="stroke-white" />
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      className={cn(
        "size-8 rounded-[6px] p-0 bg-transparent!",
        "[--hairline-radius:6px] [--hairline-color:var(--color-stroke-tertiary)]",
        className,
      )}
      aria-label="Send"
      title="Send"
      {...props}
    >
      <ArrowUpIcon />
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
      className={cn(
        "size-8 rounded-[6px] p-0 border border-stroke-tertiary bg-background-primary shadow-none",
        className,
      )}
      aria-label="Stop"
      title="Stop"
      {...props}
    >
      <StopIcon pathClasses="stroke-icon-primary" />
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
  /** Outer frame override class (applied to ChatGrayFrame). */
  frameClassName?: string;
  /** Passed through to ChatGrayFrame — dial in a hairline border (e.g. 0.5) for
   *  a flat card look instead of the default soft glass ring. */
  frameThickness?: number;
  /** Passed through to ChatGrayFrame — set to 0 for a crisp, unblurred fill. */
  blurAmount?: number;
  /** Passed through to ChatGrayFrame's border-ring color (defaults to gray-2). */
  fillClassName?: string;
  /** Passed through to ChatGrayFrame's inner fill — the composer's own
   *  background (defaults to the translucent off-white). */
  innerFillClassName?: string;
  /** Override class for the bottom action row — chiefly its gap above the text
   *  (`md:pt-6` by default), which a shorter frame has to tighten to fit. */
  actionsClassName?: string;
};

export function ChatTextareaComposer({
  leftActions,
  rightActions,
  topAction,
  frameClassName,
  frameThickness,
  blurAmount,
  fillClassName,
  innerFillClassName,
  actionsClassName,
  className,
  inputClassName,
  placeholder = "How can we help you?",
  value,
  ...textareaProps
}: ChatTextareaComposerProps) {
  const isTyping = typeof value === "string" ? value.trim().length > 0 : false;

  return (
    <ChatGrayFrame
      overlay={isTyping}
      frameThickness={frameThickness}
      blurAmount={blurAmount}
      fillClassName={fillClassName}
      innerFillClassName={innerFillClassName}
      className={cn(
        "group relative flex h-[214px] w-full has-focus:border-background-primary",
        frameClassName,
      )}
    >
      {topAction}
      <Textarea
        value={value}
        placeholder={placeholder}
        fill="filled"
        className={cn(
          "h-full w-full items-end rounded-[16px] bg-transparent p-4 shadow-none",
          "[--hairline-color:transparent] has-focus:[--hairline-color:transparent]",
          "flex flex-col items-stretch",
          className,
        )}
        inputClassName={cn(
          textVariants({ variant: "label" }),
          // iOS Safari/Chrome auto-zoom on focus when the field font is < 16px.
          // Keep the 14px design on desktop, bump to 16px on mobile to suppress it.
          "max-md:text-[16px]",
          "m-0 self-start placeholder:text-typography-secondary",
          inputClassName,
        )}
        rightElement={
          <div
            className={cn(
              "mt-auto flex w-full items-center justify-between gap-2 md:pt-6",
              actionsClassName,
            )}
          >
            <div className="flex items-center gap-2">{leftActions}</div>
            <div className="flex items-center gap-2">{rightActions}</div>
          </div>
        }
        {...textareaProps}
      />
    </ChatGrayFrame>
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
  /** Passed through to ChatGrayFrame — dial in a hairline border (e.g. 0.5) for
   *  a flat card look instead of the default soft glass ring. */
  frameThickness?: number;
  /** Passed through to ChatGrayFrame — set to 0 for a crisp, unblurred fill. */
  blurAmount?: number;
  /** Overrides ChatGrayFrame's border-ring color (defaults to the highlight
   *  tint when typing/highlighted, otherwise gray-2). */
  fillClassName?: string;
};

// Pure UI: typing state is derived from `value` so callers don't need to wire it.
export function ChatInlineComposer({
  leftActions,
  rightActions,
  frameClassName,
  frameThickness = 3,
  blurAmount,
  fillClassName,
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
      frameThickness={frameThickness}
      blurAmount={blurAmount}
      overlay={showHighlight}
      fillClassName={cn(
        fillClassName ?? (showHighlight && "bg-(--chat-selection-highlight)"),
      )}
    >
      <div className="flex h-full w-full items-center gap-2 p-4">
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
