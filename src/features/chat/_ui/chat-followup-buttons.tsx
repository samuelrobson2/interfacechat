import {
  ChatGrayFrame,
  ChatHighlightFrame,
  ChatPillButton,
  type ChatPillButtonProps,
} from "@/services/chat";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { cn } from "@/shared/lib/css";
import { Text, textVariants } from "@/shared/ui/kit/text";
import type { ComponentProps, ReactNode } from "react";

export function FollowupSuggestionButton({
  label,
  endIcon,
  hideEndIconUntilHover = false,
  className,
  ...props
}: Omit<
  React.ComponentProps<"button">,
  "children" | "onMouseEnter" | "onMouseLeave"
> & {
  label: string;
  endIcon: ReactNode;
  hideEndIconUntilHover?: boolean;
}) {
  return (
    <ChatHighlightFrame asChild clearOnHover className="hover:border-blue-5">
      <button
        type="button"
        className={cn(
          "inline-flex max-w-full cursor-pointer items-center gap-2 px-3 py-3 text-left",
          className,
        )}
        {...props}
      >
        <Text
          className="relative z-10 text-left group-hover:text-blue-5"
          variant="label"
          color="primary"
        >
          {label}
        </Text>
        <span
          className={cn(
            "relative z-10 shrink-0 group-hover:[&_path]:stroke-blue-5",
            hideEndIconUntilHover
              ? "hidden md:group-hover:inline-flex"
              : "inline-flex",
          )}
        >
          {endIcon}
        </span>
      </button>
    </ChatHighlightFrame>
  );
}

export function FollowupBackButton({
  className,
  type = "button",
  ...props
}: Omit<ChatPillButtonProps, "shape" | "children">) {
  return (
    <ChatPillButton
      shape="pill-icon"
      type={type}
      className={cn(
        "shadow-[0_0_6px_0_var(--chat-highlight-glow)]",
        className,
      )}
      {...props}
    >
      <ArrowLeftIcon svgClasses="size-4" pathClasses="stroke-icon-primary" />
    </ChatPillButton>
  );
}

export function CustomFollowupTextarea({
  actions,
  className,
  frameClassName,
  ...props
}: ComponentProps<"textarea"> & {
  actions?: ReactNode;
  frameClassName?: string;
}) {
  return (
    <ChatGrayFrame
      overlay
      className={cn(
        "flex w-full flex-col gap-2 p-4",
        "shadow-[0_0_6px_0_var(--chat-highlight-glow)]",
        frameClassName,
      )}
    >
      <textarea
        {...props}
        className={cn(
          textVariants({ variant: "label" }),
          "max-md:text-[16px]",
          "w-full resize-none bg-transparent text-typography-primary outline-none placeholder:text-typography-secondary",
          className,
        )}
      />
      {actions ? <div className="flex justify-end">{actions}</div> : null}
    </ChatGrayFrame>
  );
}
