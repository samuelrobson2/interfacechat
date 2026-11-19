import { useState } from "react";
import { CopyIcon } from "@/shared/assets/icons/general/Copy";
import { cn } from "@/shared/lib/css";
import { textVariants } from "@/shared/ui/kit/text";
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
import { getMessageText, type ChatLabArtefact, type ChatLabMessage } from "../model/chat-lab-store";
import { ChatLabArtefactInline } from "./chat-lab-artefact";
import { QuestionGroup, trailingYesNo, type Question } from "@/features/interface-shells";
import { applyAnswers } from "../model/chat-lab-runtime";
import { useChatLabStore } from "../model/chat-lab-store";
import { AgentIsland } from "./agent-island";
import { OfferLink } from "./offer-link";
import { readOfferLink, withOfferLinks } from "../model/offer-links";

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

/** "Thought": shows or hides the reply's reasoning. Beside the orb where the orb sits over the reply. */
function ThoughtToggle({ open, onToggle, className }: { open: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className={cn(
        textVariants({ variant: "label" }),
        "flex h-[18px] cursor-pointer items-center text-typography-secondary hover:text-typography-primary",
        // The type sits high in its line (more room above the letters than below): down a pixel, so the word's
        // middle meets the orb's, beside it or in the gutter. Measured at 2x: it was 1.25 to 1.5px high.
        "translate-y-px",
        className,
      )}
    >
      {open ? "Hide thought" : "Thought"}
    </button>
  );
}

/** The reasoning itself, in the reply's own type, in grey. */
function ThoughtText({ text, className }: { text: string; className?: string }) {
  return <p className={cn(textVariants({ variant: "label" }), "whitespace-pre-wrap text-typography-secondary", className)}>{text}</p>;
}

/** The questions a reply asked with the ask tool, by its call, once the server has checked them. */
export function questionsOf(message: ChatLabMessage) {
  return (message.parts as { type?: string; toolCallId?: string; state?: string; output?: unknown }[]).flatMap((part) => {
    if (part.type !== "tool-ask" || part.state !== "output-available" || !part.toolCallId) return [];
    const output = part.output as { ok?: boolean; questions?: Question[] } | undefined;
    return output?.ok && output.questions?.length ? [{ key: part.toolCallId, questions: output.questions }] : [];
  });
}

/**
 * A reply's questions as tiny interfaces. Answering writes into the interfaces
 * they're for and sends one message. A plain reply that ends in a yes-or-no
 * question gets Yes · No · Something else even when the model didn't ask with the tool.
 */
export function ReplyQuestions({ message, text, live, shown }: { message: ChatLabMessage; text: string; live: boolean; shown: string[] }) {
  const { sessionId, sendText, isGenerating } = useChatLabSession();
  const answers = useChatLabStore((state) => state.sessions[sessionId]?.answers);
  const artefacts = useChatLabStore((state) => state.sessions[sessionId]?.artefacts);
  const asked = questionsOf(message);
  const yesNo = !asked.length && live ? trailingYesNo(text) : null;
  const groups = yesNo ? [{ key: `${message.id}:yes-no`, questions: [{ for: "chat", label: "Answer", ask: yesNo, control: "confirm" } as Question] }] : asked;
  if (!groups.length) return null;
  const kindOf = (id: string) => artefacts?.[id]?.shell?.kind ?? null;
  return (
    <>
      {groups.map((group) => (
        <div key={group.key} className="order-2 md:order-0">
          <QuestionGroup
            questions={group.questions}
            kindOf={kindOf}
            titleOf={(id) => artefacts?.[id]?.title}
            // The interface they're all for is already in the reply, just above: its name once.
            headerless={group.questions.every((question) => question.for === group.questions[0]!.for && shown.includes(question.for))}
            answered={answers?.[group.key]}
            disabled={!live || isGenerating}
            onAnswer={(values) => {
              const said = applyAnswers(sessionId, group.key, group.questions, values);
              void sendText(said);
            }}
            onSkip={() => {
              useChatLabStore.getState().setAnswers(sessionId, group.key, []);
              void sendText("Skip: you choose.");
            }}
          />
        </div>
      ))}
    </>
  );
}

/** Ported from pharos `ChatMessage`, minus the backend-only surfaces. */
export function ChatLabMessageItem({
  message,
  isLatestAssistantMessage,
  inline,
}: {
  message: ChatLabMessage;
  isLatestAssistantMessage: boolean;
  /** Interfaces this reply made, shown under its text. */
  inline?: ChatLabArtefact[];
}) {
  const { sessionId, isGenerating, isTextGenerating, regenerate, sendText } = useChatLabSession();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [thoughtOpen, setThoughtOpen] = useState(false);
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
      // Spaced whenever something shows: text, interfaces, or questions alone (no text), so the buttons below never touch them.
      className={cn(text || inline?.length || questionsOf(message).length ? "gap-4" : "gap-0")}
    >
      <ChatAssistantFrame
        isActive={isLatestAssistantMessage && isGenerating}
        preload={isLatestAssistantMessage}
        // Where the orb sits over the reply (a narrow Chat, a phone), "Thought" is beside it.
        beside={thought && !isGenerating ? <ThoughtToggle open={thoughtOpen} onToggle={() => setThoughtOpen((value) => !value)} /> : undefined}
      >
        {isLatestAssistantMessage && isGenerating && (
          <AgentIsland className="order-2 md:order-0" />
        )}
        {thought && !isGenerating && (
          // With the orb in the gutter, "Thought" is the reply's first line, level with the orb; otherwise it's beside the orb, above.
          <div className="order-2 flex flex-col gap-1 md:order-0">
            <ThoughtToggle
              open={thoughtOpen}
              onToggle={() => setThoughtOpen((value) => !value)}
              className="max-md:hidden group-data-narrow/chat:hidden!"
            />
            {thoughtOpen && <ThoughtText text={thought} />}
          </div>
        )}
        {text && (
          <ChatAssistantMessage
            className="order-2 md:order-0"
            messageId={message.id}
            // What the latest reply offers to make is a click away, once it's finished.
            answer={isLatestAssistantMessage && !isGenerating ? withOfferLinks(text) : text}
            isStreaming={isStreaming}
            renderLink={(href, children) => {
              const offer = readOfferLink(href);
              return offer ? <OfferLink kind={offer.kind} onMake={() => void sendText(offer.request)}>{children}</OfferLink> : null;
            }}
          />
        )}
        {inline?.map((artefact) => (
          <div key={artefact.id} className="order-2 md:order-0">
            <ChatLabArtefactInline sessionId={sessionId} artefact={artefact} />
          </div>
        ))}
        {/* Under the interfaces they fill, so a shared one is named once. */}
        <ReplyQuestions message={message} text={text} live={isLatestAssistantMessage} shown={inline?.map((artefact) => artefact.id) ?? []} />
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
  beside,
  children,
}: React.PropsWithChildren<{
  isActive: boolean;
  preload: boolean;
  /** Next to the avatar where it sits over the reply (a narrow Chat, a phone): "Thought". Hidden with the avatar in the gutter. */
  beside?: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-w-0 flex-col gap-4">
      {/* In a narrow Chat there's no gutter: the avatar sits above the reply, with "Thought" beside it. */}
      <aside className="order-1 flex items-center gap-2.5 group-data-narrow/chat:static! group-data-narrow/chat:mr-0! group-data-narrow/chat:flex! group-data-narrow/chat:w-auto! md:absolute md:right-full md:top-0 md:order-0 md:mr-4 md:block md:w-66.25">
        <ChatAiAvatar
          active={isActive}
          preload={preload}
          className="pointer-events-none w-[32px] shrink-0 select-none group-data-narrow/chat:static! group-data-narrow/chat:w-[32px]! md:absolute md:right-0 md:-top-4 md:w-[50px]"
        />
        {beside && <div className="md:hidden group-data-narrow/chat:block!">{beside}</div>}
      </aside>
      {children}
    </div>
  );
}
