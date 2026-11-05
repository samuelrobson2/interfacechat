import Lottie from "lottie-react";

import loadingBlackAnimation from "@/shared/assets/lottie/loading-black.json";
import { cn } from "@/shared/lib/css";
import { useChatContext } from "../_model/store/chat-store";
import { useChatSelection } from "../_model/use-chat-selection";
import { ChatMessage } from "../message/compose/chat-message";

export function ChatConversation({
  className,
  conversationRef,
  ...props
}: React.ComponentProps<"div"> & {
  conversationRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const messages = useChatContext((state) => state.messages);
  const isLoadingMore = useChatContext((state) => state.isLoadingMore);

  useChatSelection();

  return (
    <>
      {isLoadingMore && (
        <div className="absolute top-0 z-5 w-full flex justify-center items-center">
          <Lottie
            className="size-15"
            animationData={loadingBlackAnimation}
            loop={true}
          />
        </div>
      )}
      <div
        className={cn(
          "relative h-full overflow-y-auto no-scrollbar",
          className,
        )}
        {...props}
      >
        <div
          className="mx-auto flex w-[660px] flex-col gap-6"
          data-slot="chat-area"
          ref={conversationRef}
        >
          {messages.map((message) => (
            <ChatMessage key={message.message_id} message={message} />
          ))}
        </div>
      </div>
    </>
  );
}
