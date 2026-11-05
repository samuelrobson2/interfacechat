import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { ApiError } from "@/shared/api/api-error";
import { cn } from "@/shared/lib/css";
import { useTypewriter } from "@/shared/lib/react/use-typewriter";
import { DEV_AUTH_BYPASS } from "@/shared/model/dev-auth-bypass";
import { Text } from "@/shared/ui/kit/text";
import { ChatInputLayout, ChatLayout } from "../_ui/chat-layout";
import { ChatInput } from "../input/chat-input";
import {
  ChatStarterSuggestions,
  ChatStarterSuggestionsSkeleton,
} from "../suggestions/compose/chat-starter-suggestions";
import { MockStarterSuggestions } from "../suggestions/compose/mock-starter-suggestions";

const GREETING = "Hi! I'm Adaption AI, I can help with things like:";

/**
 * Message layout (third chat tab): a left column where the greeting streams in,
 * then the starter suggestions, a prompt line and the composer fade in once the
 * greeting has finished typing. All copy is sized to match the composer (16px).
 */
export function ChatMessageIntro() {
  const { typed, done } = useTypewriter(GREETING);

  return (
    <ChatLayout className="flex w-full flex-col items-start overflow-visible lg:w-[620px]">
      <Text as="h2" variant="body" className="min-h-[20px] text-left">
        {typed}
        {!done && (
          <span className="ml-0.5 inline-block w-px animate-pulse">|</span>
        )}
      </Text>

      <div
        aria-hidden={!done}
        className={cn(
          "mt-6 flex w-full flex-col gap-6 transition-all duration-500 ease-out",
          done
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {DEV_AUTH_BYPASS ? (
          <MockStarterSuggestions orientation="row" />
        ) : (
          <ErrorBoundary
            fallbackRender={({ error }) => (
              <Text variant="body" color="error">
                Cannot load suggestions: {(error as ApiError)?.responseMessage}
              </Text>
            )}
          >
            <Suspense
              fallback={<ChatStarterSuggestionsSkeleton orientation="row" />}
            >
              <ChatStarterSuggestions orientation="row" />
            </Suspense>
          </ErrorBoundary>
        )}

        <ChatInputLayout className="gap-6 overflow-visible">
          <ChatInput
            isNewChat
            placeholder="or anything else which would be helpful"
          />
        </ChatInputLayout>
      </div>
    </ChatLayout>
  );
}
