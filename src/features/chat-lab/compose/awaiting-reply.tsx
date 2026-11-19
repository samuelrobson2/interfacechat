import { trailingYesNo, type AnswerValue } from "@/features/interface-shells";
import { useChatLabSession } from "../model/chat-lab-session";
import { getMessageText, useChatLabStore, type ChatLabMessage } from "../model/chat-lab-store";
import { questionsOf, ReplyQuestions } from "./chat-lab-message";

/**
 * Whether the latest reply is waiting on the person: it asked with question
 * cards they haven't answered, or it ends in a question.
 */
export function needsReply(messages: ChatLabMessage[], answers: Record<string, (AnswerValue | null)[]> | undefined) {
  const last = messages.at(-1);
  if (!last || last.role !== "assistant") return false;
  if (questionsOf(last).some((group) => !answers?.[group.key])) return true;
  const text = getMessageText(last).replace(/\*+/g, "").trim();
  return /\?["')\]]?$/.test(text) && !answers?.[`${last.id}:yes-no`];
}

/**
 * With Chat minimized, a reply that needs an answer stays above the input
 * until it gets one (or Chat is opened), instead of flashing by: its words,
 * and its question cards to answer right there. An open question is answered
 * in the input just below.
 */
export function AwaitingReply({ onOpen }: { onOpen: () => void }) {
  const { sessionId, messages, isGenerating } = useChatLabSession();
  const answers = useChatLabStore((state) => state.sessions[sessionId]?.answers);
  const last = messages.at(-1) as ChatLabMessage | undefined;
  if (isGenerating || !last || !needsReply(messages as ChatLabMessage[], answers)) return null;
  const text = getMessageText(last);
  const cards = questionsOf(last).length > 0 || Boolean(trailingYesNo(text));
  return (
    <div className="flex max-h-[min(60vh,520px)] w-full flex-col gap-3 self-stretch overflow-y-auto rounded-[16px] bg-background-primary px-4 py-3 shadow-[0_4px_16px_rgba(26,23,24,0.1)] hairline [--hairline-radius:16px] [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.25]">
      {text && <p className="line-clamp-4 font-bureau text-[14px] leading-[1.45] text-typography-primary">{text.replace(/\*\*/g, "")}</p>}
      {cards && <ReplyQuestions message={last} text={text} live shown={[]} />}
      <button type="button" onClick={onOpen} className="cursor-pointer self-start font-bureau text-[12px] text-typography-secondary hover:text-typography-primary">
        Open chat
      </button>
    </div>
  );
}
