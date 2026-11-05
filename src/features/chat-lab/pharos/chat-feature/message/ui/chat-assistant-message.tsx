import { ChatPillButton } from "../../../chat";
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
      className={cn("relative flex flex-col w-full min-w-0", className)}
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

export function ChatAssistantThinking({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <Text variant="label" color="secondary" className="animate-pulse">
        {text}..
      </Text>
    </div>
  );
}

export function ChatAssistantMessage({
  messageId,
  answer,
  className,
  isStreaming = false,
}: {
  messageId: string;
  answer: string;
  className?: string;
  /**
   * True while the assistant message is still being streamed. Used by the
   * `numi-plot` code-block renderer to show a typed skeleton when the
   * fence body isn't yet parseable as valid JSON.
   */
  isStreaming?: boolean;
}) {
  return (
    <div
      className={cn(
        textVariants({ variant: "label" }),
        "relative flex flex-col gap-2 min-w-0",
        className,
      )}
      data-slot={`chat-answer-${messageId}`}
    >
      <ChatAssistantMarkdown content={answer} isStreaming={isStreaming} />
    </div>
  );
}
