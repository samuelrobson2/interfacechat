import { useSessionStore } from "@/services/auth";
import { GradientText } from "@/shared/ui/gradient-text";
import { Text } from "@/shared/ui/kit/text";
import { NewChatView } from "./new-chat-view";

// Standalone, full-viewport rendering of the pristine ("original") pharos
// New Chat experience. Unlike the homepage's Chat tab, this page has no tabs
// and no Build toggle — it's just the chat starter view on its own route.
//
// Pharos's own NewChatView hides its internal "Welcome back" heading on
// desktop (`md:hidden`) because its home.page.tsx wrapper already renders an
// h1 above the Build/Chat tabs. This page has no such wrapper, so it renders
// that same heading itself — otherwise desktop never sees it at all.
function NewChatOriginalPage() {
  const displayName =
    useSessionStore((state) => state.user?.profile?.name) ?? "Samuel";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-10 px-6 py-24">
      {/* Desktop only — NewChatView renders its own equivalent heading on
          mobile (md:hidden there), so showing both would duplicate it. */}
      <Text variant="h1" as="h1" className="hidden text-center md:block">
        Welcome back, <GradientText>{displayName}!</GradientText>
      </Text>
      <NewChatView />
    </div>
  );
}

export const Component = NewChatOriginalPage;
