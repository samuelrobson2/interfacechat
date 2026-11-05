import {
  ChatAiAvatar,
  ChatMarkdown,
  ChatUserMessage,
  ChatUserMessageLayout,
} from "@/services/chat";
import type { ApiSchemas } from "@/shared/api/schema";
import { cn } from "@/shared/lib/css";
import { textVariants } from "@/shared/ui/kit/text";
import type { ChartTurn } from "../_lib/chart-turn";

const noop = () => {};

function VisualizeTurnText({ text }: { text?: string }) {
  if (!text) return null;

  return (
    <div
      className={cn(
        textVariants({ variant: "label" }),
        "flex min-w-0 flex-col gap-2 wrap-anywhere",
      )}
    >
      <ChatMarkdown
        content={text}
        isHighlightActive={false}
        isStreaming={false}
        selectCodeBlock={noop}
      />
    </div>
  );
}

export function VisualizeAssistantTurn({
  messageId,
  turn,
  isGenerating,
  actions,
  chart,
}: {
  messageId?: string;
  turn?: ChartTurn;
  isGenerating: boolean;
  actions?: React.ReactNode;
  chart?: React.ReactNode;
}) {
  return (
    <div
      data-message-id={messageId}
      data-role="assistant"
      className="relative flex w-full min-w-0 flex-col gap-4"
    >
      <ChatAiAvatar
        active={isGenerating}
        preload
        className="pointer-events-none w-[32px] select-none md:absolute md:-top-4 md:right-full md:mr-4 md:w-[50px]"
      />

      <VisualizeTurnText text={turn?.textBefore} />
      {chart}
      <VisualizeTurnText text={turn?.textAfter} />

      {actions}
    </div>
  );
}

export function VisualizeMessage({
  message,
  turn,
  isGenerating,
  actions,
  chart,
}: {
  message: ApiSchemas["ChatMessageDto"];
  turn?: ChartTurn;
  isGenerating: boolean;
  actions?: React.ReactNode;
  chart?: React.ReactNode;
}) {
  if (message.role === "user") {
    return (
      <ChatUserMessageLayout
        data-message-id={message.message_id}
        data-role={message.role}
      >
        <ChatUserMessage text={message.content} />
      </ChatUserMessageLayout>
    );
  }

  return (
    <VisualizeAssistantTurn
      messageId={message.message_id}
      turn={turn}
      isGenerating={isGenerating}
      actions={actions}
      chart={chart}
    />
  );
}
