import { useState } from "react";
import { CopyIcon } from "@/shared/assets/icons/general/Copy";
import { cn } from "@/shared/lib/css";
import { toast } from "@/shared/ui/kit/sonner-toast";
import {
  ChatAiAvatar,
  ChatDropdownMenu,
  ChatDropdownMenuContent,
  ChatDropdownMenuItem,
  ChatDropdownMenuTrigger,
  ChatUserMessage,
  ChatUserMessageLayout,
} from "../pharos/chat";
import {
  ChatAssistantActionsButton,
  ChatAssistantButtonsLayout,
  ChatAssistantMessage,
  ChatAssistantMessageLayout,
  ChatAssistantRefreshButton,
  ChatAssistantSourcesButton,
} from "../pharos/chat-feature/message/ui/chat-assistant-message";
import { ChatSourcesPopup, type ChatSource } from "./chat-lab-sources";
import { reasoningText } from "../model/agent-activity";
import { useChatLabSession } from "../model/chat-lab-session";
import { getMessageText, type ChatLabMessage } from "../model/chat-lab-store";
import { AgentIsland } from "./agent-island";

function sourcesFromMessage(message: ChatLabMessage): ChatSource[] {
  const seen = new Set<string>();
  const sources: ChatSource[] = [];

  const add = (url: string, title: string | undefined, id: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    let host = url;
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      // Keep the raw value when it is not a full URL.
    }
    sources.push({ id, title: title || host, url, source: host });
  };

  for (const part of message.parts) {
    if (part.type === "source-url") {
      add(part.url, part.title, part.sourceId);
      continue;
    }
    if (part.type !== "text") continue;
    const annotations = part.providerMetadata?.openai?.annotations;
    if (!Array.isArray(annotations)) continue;
    for (const annotation of annotations) {
      if (!isUrlCitation(annotation)) continue;
      add(annotation.url, annotation.title, annotation.url);
    }
  }

  return sources;
}

function isUrlCitation(
  value: unknown,
): value is { type: "url_citation"; url: string; title?: string } {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.type === "url_citation" && typeof record.url === "string";
}

function AgentThought({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="cursor-pointer text-[13px] text-typography-secondary"
      >
        {open ? "Hide thought" : "Thought"}
      </button>
      {open && (
        <p className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.4] text-typography-secondary">
          {text}
        </p>
      )}
    </div>
  );
}

/** Ported from pharos `ChatMessage`, minus the backend-only surfaces. */
export function ChatLabMessageItem({
  message,
  isLatestAssistantMessage,
}: {
  message: ChatLabMessage;
  isLatestAssistantMessage: boolean;
}) {
  const { isGenerating, isTextGenerating, regenerate } = useChatLabSession();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const text = getMessageText(message);
  const sources = sourcesFromMessage(message);

  if (message.role === "user") {
    return (
      <ChatUserMessageLayout data-message-id={message.id} data-role="user">
        <ChatUserMessage text={text} />
      </ChatUserMessageLayout>
    );
  }

  const isStreaming = isLatestAssistantMessage && isTextGenerating;
  const thought = reasoningText(message);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <ChatAssistantMessageLayout
      data-message-id={message.id}
      data-role="assistant"
      className={cn(text ? "gap-4" : "gap-0")}
    >
      <ChatAssistantFrame
        isActive={isLatestAssistantMessage && isGenerating}
        preload={isLatestAssistantMessage}
      >
        {isLatestAssistantMessage && isGenerating && (
          <AgentIsland className="order-2 md:order-0" />
        )}
        {thought && !isGenerating && (
          <AgentThought text={thought} className="order-2 md:order-0" />
        )}
        {text && (
          <ChatAssistantMessage
            className="order-2 md:order-0"
            messageId={message.id}
            answer={text}
            isStreaming={isStreaming}
          />
        )}
      </ChatAssistantFrame>

      {isLatestAssistantMessage && !isGenerating && (
        <ChatAssistantButtonsLayout>
          <div className="flex items-center gap-3">
            <ChatAssistantRefreshButton
              onClick={() => void regenerate({ messageId: message.id })}
            />
            {text && (
              <ChatDropdownMenu>
                <ChatDropdownMenuTrigger asChild>
                  <ChatAssistantActionsButton />
                </ChatDropdownMenuTrigger>
                <ChatDropdownMenuContent align="start" side="top">
                  <ChatDropdownMenuItem onSelect={() => void handleCopy()}>
                    <CopyIcon
                      svgClasses="size-4"
                      pathClasses="stroke-icon-primary"
                    />
                    Copy response
                  </ChatDropdownMenuItem>
                </ChatDropdownMenuContent>
              </ChatDropdownMenu>
            )}
          </div>
          {sources.length > 0 && (
            <div className="relative">
              <ChatAssistantSourcesButton
                active={sourcesOpen}
                onClick={() => setSourcesOpen((open) => !open)}
              />
              {sourcesOpen && (
                <div className="absolute bottom-full left-0 z-20 mb-2 w-[min(265px,70vw)] md:bottom-0 md:left-full md:mb-0 md:ml-4 md:w-[265px]">
                  <ChatSourcesPopup
                    sources={sources}
                    onClose={() => setSourcesOpen(false)}
                  />
                </div>
              )}
            </div>
          )}
        </ChatAssistantButtonsLayout>
      )}
    </ChatAssistantMessageLayout>
  );
}

/**
 * The assistant's avatar column (left gutter on desktop, inline on mobile)
 * around its content, as in pharos. Also used for the turn's placeholder row
 * before the first streamed token.
 */
export function ChatAssistantFrame({
  isActive,
  preload,
  children,
}: React.PropsWithChildren<{ isActive: boolean; preload: boolean }>) {
  return (
    <div className="relative flex min-w-0 flex-col gap-4">
      <aside className="order-1 md:absolute md:right-full md:top-0 md:order-0 md:mr-4 md:w-66.25">
        <ChatAiAvatar
          active={isActive}
          preload={preload}
          className="pointer-events-none w-[32px] select-none md:absolute md:right-0 md:-top-4 md:w-[50px]"
        />
      </aside>
      {children}
    </div>
  );
}
