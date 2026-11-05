import { useIsMutating } from "@tanstack/react-query";
import { useState } from "react";

import { cn } from "@/shared/lib/css";
import { ChatLists } from "./_compose/chat-rail";
import { ChatMessageIntro } from "./_compose/chat-message-intro";
import { ChatProvider } from "./_model/store/chat-store";
import { useInputStore } from "./_model/store/input-store";
import { ChatAiAvatar } from "./_ui/chat-ai-avatar";
import { ChatInputLayout, ChatLayout } from "./_ui/chat-layout";
import {
  ChatLayoutToggle,
  type ChatPanelLayout,
} from "./_ui/chat-layout-toggle";
import { ChatInput } from "./input/chat-input";
import { MockStarterSuggestions } from "./suggestions/compose/mock-starter-suggestions";

function NewChatViewContent() {
  const hasText = useInputStore((state) => Boolean(state.message?.trim()));
  const isCreatingChat =
    useIsMutating({ mutationKey: ["post", "/chat/sessions"] }) > 0;
  const [layout, setLayout] = useState<ChatPanelLayout>("message");

  const suggestions = <MockStarterSuggestions />;

  const composer = (
    <ChatLayout
      className={cn(
        "flex w-full flex-col items-center overflow-visible",
        layout === "side" ? "lg:w-[580px]" : "lg:w-[600px]",
      )}
    >
      {/* Suggestions sit above the chat bar. */}
      {suggestions}

      <ChatInputLayout className="mt-10 gap-6 overflow-visible">
        <ChatInput isNewChat />
      </ChatInputLayout>
    </ChatLayout>
  );

  return (
    <>
      {/* The orb floats freely around the whole viewport, behind everything. */}
      <div className="orb-float pointer-events-none fixed left-0 top-0 -z-10 w-[112px]">
        <ChatAiAvatar
          active={hasText || isCreatingChat}
          preload
          className="w-full"
        />
      </div>

      {layout === "message" ? (
        // Version 3: greeting streams in on the left, projects/history on the right.
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-20 px-8 lg:flex-row lg:justify-center">
          <ChatMessageIntro />
          <aside className="w-full shrink-0 lg:w-[480px]">
            <ChatLists layout="stacked" />
          </aside>
        </div>
      ) : layout === "side" ? (
        // Version 1: composer left, projects/history stacked on the right.
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-20 px-8 lg:flex-row lg:justify-center">
          {composer}
          <aside className="w-full shrink-0 lg:w-[480px]">
            <ChatLists layout="stacked" />
          </aside>
        </div>
      ) : (
        // Version 2: composer on top, projects + history below as two columns.
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-20 px-8">
          {composer}
          <ChatLists layout="columns" className="max-w-[760px]" />
        </div>
      )}

      <ChatLayoutToggle value={layout} onChange={setLayout} />
    </>
  );
}

export function NewChatView() {
  return (
    <ChatProvider>
      <NewChatViewContent />
    </ChatProvider>
  );
}
