import { ChatPillButton } from "../../_ui-original/chat-pill-button";
import { DotVerticalIcon } from "@/shared/assets/icons/outlined/DotVertical";
import { LinkIcon } from "@/shared/assets/icons/outlined/Link";
import { RefreshIcon } from "@/shared/assets/icons/outlined/Refresh";
import { cn } from "@/shared/lib/css";
import { Text, textVariants } from "@/shared/ui/kit/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import { ChatAssistantMarkdown } from "./chat-assistant-markdown";

export function ChatAssistantMessageLayout({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn("relative flex flex-col gap-4 w-full", className)}
      {...props}
    />
  );
}

export function ChatAssistantButtonsLayout({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full items-center justify-between", className)}
      {...props}
    />
  );
}

export function ChatAssistantRefreshButton({
  ...props
}: React.ComponentProps<"button">) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ChatPillButton shape="pill-icon" {...props}>
          <RefreshIcon svgClasses="size-4" pathClasses="stroke-icon-primary" />
        </ChatPillButton>
      </TooltipTrigger>
      <TooltipContent className="max-w-[320px]">Regenerate</TooltipContent>
    </Tooltip>
  );
}

export function ChatAssistantActionsButton({
  ...props
}: React.ComponentProps<"button">) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ChatPillButton shape="pill-icon" {...props}>
          <DotVerticalIcon
            svgClasses="size-4"
            pathClasses="fill-icon-primary stroke-icon-primary"
          />
        </ChatPillButton>
      </TooltipTrigger>
      <TooltipContent className="max-w-[320px]">Actions</TooltipContent>
    </Tooltip>
  );
}

export function ChatAssistantSourcesButton({
  active = false,
  ref,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <ChatPillButton ref={ref} shape="pill-text" active={active} {...props}>
      <LinkIcon svgClasses="size-4" pathClasses="stroke-icon-primary" />
      <Text variant="label" color="primary">
        Sources
      </Text>
    </ChatPillButton>
  );
}

export function ChatAssistantMessage({
  messageId,
  answer,
  className,
  selectCodeBlock,
  isHighlightActive,
  isStreaming = false,
  imagesSlot,
  imageAnchor,
}: {
  messageId: string;
  answer: string;
  className?: string;
  selectCodeBlock: (
    el: HTMLElement,
    code: string,
    start: number,
    end: number,
  ) => void;
  isHighlightActive: boolean;
  /**
   * True while the assistant message is still being streamed. Used by the
   * `numi-plot` code-block renderer to show a typed skeleton when the
   * fence body isn't yet parseable as valid JSON.
   */
  isStreaming?: boolean;
  /**
   * Optional image unit to render alongside the message. Placed inline at
   * `imageAnchor` when provided, otherwise appended after the full content.
   */
  imagesSlot?: React.ReactNode;
  /**
   * 0-based UTF-16 offset into `answer` marking where `imagesSlot` should be
   * spliced in. Absent for older messages — the unit then renders at the end.
   */
  imageAnchor?: number | null;
}) {
  const shouldUseTwoColumns = answer.trim().split(/\s+/).length > 100;

  const markdownProps = {
    shouldUseTwoColumns,
    isHighlightActive,
    isStreaming,
    selectCodeBlock,
  };

  // Render images inline only when a valid anchor is provided; the anchor is
  // clamped to the content bounds so backend/browser UTF-16 offsets stay safe.
  const hasInlineImages = imagesSlot != null;
  const anchor =
    typeof imageAnchor === "number"
      ? Math.max(0, Math.min(imageAnchor, answer.length))
      : null;
  const renderInline = hasInlineImages && anchor !== null;

  return (
    <div
      className={cn(
        textVariants({ variant: "label" }),
        "relative flex flex-col gap-2",
        className,
      )}
      data-slot={`chat-answer-${messageId}`}
    >
      {renderInline ? (
        <>
          {anchor > 0 && (
            <ChatAssistantMarkdown
              content={answer.slice(0, anchor)}
              {...markdownProps}
            />
          )}
          {imagesSlot}
          {anchor < answer.length && (
            <ChatAssistantMarkdown
              content={answer.slice(anchor)}
              {...markdownProps}
            />
          )}
        </>
      ) : (
        <>
          <ChatAssistantMarkdown content={answer} {...markdownProps} />
          {imagesSlot}
        </>
      )}
    </div>
  );
}
