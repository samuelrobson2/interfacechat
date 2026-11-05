import { useIsMutating } from "@tanstack/react-query";

import { useSessionStore } from "@/services/auth";
import { Text } from "@/shared/ui/kit/text";
import { ChatProvider } from "./_model/store/chat-store";
import { useInputStore } from "./_model/store/input-store";
import { ChatAiAvatar } from "./_ui/chat-ai-avatar";
import { ChatInputLayout, ChatLayout } from "./_ui/chat-layout";
import { ChatInput } from "./input/chat-input";
import { MockStarterSuggestions } from "./suggestions/compose/mock-starter-suggestions";
import { GradientText } from "@/shared/ui/gradient-text";

interface NewChatViewProps {
  showAvatar?: boolean;
  /** Render the composer with the glossy neumorphic frame (Studio page). */
  glossyInput?: boolean;
  /** Lay the starter suggestions out as full-width horizontal rows (Studio). */
  horizontalSuggestions?: boolean;
}

function NewChatViewContent({
  showAvatar = true,
  glossyInput = false,
  horizontalSuggestions = false,
}: NewChatViewProps) {
  const hasText = useInputStore((state) => Boolean(state.message?.trim()));
  const isCreatingChat =
    useIsMutating({ mutationKey: ["post", "/chat/sessions"] }) > 0;
  const displayName =
    useSessionStore((state) => state.user?.profile?.name) ?? "Samuel";

  return (
    <ChatLayout className="flex h-full w-full flex-col md:h-auto md:w-[660px] md:items-center">
      <div className="flex flex-1 flex-col items-center justify-center md:flex-none">
        <Text
          variant="h2"
          as="h1"
          className="mb-8 text-center md:hidden"
        >
          Welcome back, <GradientText>{displayName}!</GradientText>
        </Text>

        {showAvatar && (
          <ChatAiAvatar
            active={hasText || isCreatingChat}
            preload
            className="w-[88px] md:w-[140px]"
          />
        )}
      </div>

      <div className="mb-8 flex w-full flex-col-reverse gap-2 md:flex-col md:gap-0">
        <ChatInputLayout className="gap-6 md:mt-10">
          <ChatInput isNewChat glossy={glossyInput} />
        </ChatInputLayout>

        <MockStarterSuggestions
          layout={horizontalSuggestions ? "list" : "grid"}
        />
      </div>
    </ChatLayout>
  );
}

export function NewChatView({
  showAvatar = true,
  glossyInput = false,
  horizontalSuggestions = false,
}: NewChatViewProps) {
  return (
    <ChatProvider>
      <NewChatViewContent
        showAvatar={showAvatar}
        glossyInput={glossyInput}
        horizontalSuggestions={horizontalSuggestions}
      />
    </ChatProvider>
  );
}
