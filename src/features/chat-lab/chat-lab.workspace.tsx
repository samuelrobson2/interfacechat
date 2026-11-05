import { useEffect, useState } from "react";
import { href, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useSessionStore } from "@/services/auth";
import { ArrowDownIcon } from "@/shared/assets/icons/outlined/ArrowDown";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { GradientText } from "@/shared/ui/gradient-text";
import { Text } from "@/shared/ui/kit/text";
import { HomeField } from "./compose/home-field";
import type { StarterField } from "./compose/visual-starter-suggestions";
import { ChatLabArtefactPanel } from "./compose/chat-lab-artefact";
import { ChatLabComposer } from "./compose/chat-lab-composer";
import { ChatLabConversation } from "./compose/chat-lab-conversation";
import { ChatLabHeading } from "./compose/chat-lab-heading";
import {
  ChatComposerInput,
  ChatInputLayout,
  ChatLayout,
  ChatPillButton,
  useChatScroll,
  useInputStore,
} from "./pharos/chat";
import { generateChatLabTitle } from "./model/chat-lab-api";
import {
  ChatLabSessionProvider,
  useChatLabSession,
  useChatLabSessionEffects,
} from "./model/chat-lab-session";
import { isFillableKind, type ChatShellData } from "@/features/interface-shells";

/** What a Chat card says, in the person's words: how the first reply is laid out, and who replies. */
type ChatModes = { format?: string; persona?: string };
import { getActiveArtefact, useChatLabStore, type ArtefactShell } from "./model/chat-lab-store";
import { titleOf, type KindData } from "./model/home-tiles";
import { useHomeField, type HomeField as HomeFieldState } from "./model/use-home-field";
import {
  draftShellData,
  isExpandableInterface,
  seedArtefactContent,
  starterTitle,
  type ExpandableInterfaceKind,
} from "./model/shell-adapters";
import {
  extractCustomization,
  matchVisualInterface,
  type VisualInterfaceKind,
} from "./model/visual-interfaces";

const EASE = [0.23, 1, 0.32, 1] as const;
/** Brief beat so siblings/orb can fade before the shared-element morph. */
const HANDOFF_MS = 140;
const MORPH_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

function StarterView({
  expandingKind,
  isStarting,
  onStart,
  onStartShell,
  onContinue,
  onReopen,
}: {
  expandingKind: ExpandableInterfaceKind | null;
  isStarting: boolean;
  onStart: (
    text: string,
    kind: VisualInterfaceKind | null,
    field: StarterField | null,
    modes?: ChatModes,
  ) => void;
  /** Open any other library interface beside the new thread, with its card's data. */
  onStartShell: (text: string, value: KindData) => void;
  /** Send into a past chat that matched, instead of starting a new one. */
  onContinue: (sessionId: string, text: string) => void;
  onReopen: (sessionId: string) => void;
}) {
  const userName =
    useSessionStore((state) => state.user?.profile?.name) ?? "Samuel";
  const draft = useInputStore((state) => state.message ?? "");
  const setMessage = useInputStore((state) => state.setMessage);
  const handingOff = isStarting || Boolean(expandingKind);

  // Freeze the home while the middle card morphs into the new thread.
  const live = useHomeField(draft, setMessage);
  const [frozen, setFrozen] = useState<HomeFieldState | null>(null);
  if (handingOff && !frozen) setFrozen(live);
  if (!handingOff && frozen) setFrozen(null);
  const field = frozen ?? live;

  const submit = (text: string = draft) => {
    if (!text.trim() || handingOff) return;
    const next = field.submission(text);
    if (next.type === "continue") onContinue(next.sessionId, next.text);
    else if (next.type === "interface") {
      const { kind } = next.interface;
      // Chat is the conversation itself: nothing opens beside it.
      if (kind === "chat") {
        const { format, persona } = next.interface.data as ChatShellData;
        onStart(next.text, null, null, { format, persona });
      }
      else if (isFillableKind(kind)) onStart(next.text, kind, next.interface as StarterField);
      else onStartShell(next.text, next.interface);
    } else onStart(next.text, null, null);
  };

  const focused = Boolean(field.card && field.card.leader.phase !== "hinted");

  return (
    // Absolute + no opacity fade — layoutId children stay put while they morph.
    <motion.div
      key="starter"
      className="absolute inset-0 flex w-full flex-col items-center overflow-hidden"
      exit={{ opacity: 1, transition: { duration: 0.5 } }}
    >
      <div className="relative w-full flex-1">
        <HomeField
          field={field}
          disabled={isStarting}
          handingOff={handingOff}
          onSubmit={() => submit()}
          onReopen={onReopen}
          headline={
            <Text variant="h1" as="h1" className="text-center max-md:text-[32px]">
              Welcome back, <GradientText>{userName}!</GradientText>
            </Text>
          }
        />
      </div>

      <ChatLayout className="w-full px-6 pb-8 md:w-[780px] md:px-0 md:pb-10">
        <motion.div
          layoutId="chat-lab-composer"
          className="w-full"
          transition={MORPH_SPRING}
          animate={{ opacity: focused ? 0.55 : 1 }}
        >
          <ChatInputLayout className="w-full gap-6">
            <ChatComposerInput onSubmit={submit} isSubmitLoading={isStarting} />
          </ChatInputLayout>
        </motion.div>
      </ChatLayout>
    </motion.div>
  );
}

function SessionView({ sessionId }: { sessionId: string }) {
  return (
    // Opaque shell so shared elements aren't faded mid-morph.
    <motion.div
      key={`session-${sessionId}`}
      className="absolute inset-0 w-full"
      initial={false}
      exit={{ opacity: 1, transition: { duration: 0.5 } }}
    >
      <ChatLabSessionProvider sessionId={sessionId}>
        <SessionViewInner sessionId={sessionId} />
      </ChatLabSessionProvider>
    </motion.div>
  );
}

/** Past this length, a document docks beside chat instead of stacked below. */
const DOCUMENT_SIDE_CHARS = 900;

function SessionViewInner({ sessionId }: { sessionId: string }) {
  const isMobile = useIsMobile();
  useChatLabSessionEffects(sessionId);
  const { isGenerating, isPending, stop } = useChatLabSession();
  const artefact = useChatLabStore((state) =>
    getActiveArtefact(state.sessions[sessionId]),
  );
  const hasArtefact = Boolean(artefact);
  const sideBySide =
    !isMobile &&
    artefact?.kind === "document" &&
    artefact.content.trim().length >= DOCUMENT_SIDE_CHARS;
  const {
    inputLayoutRef,
    conversationRef,
    conversationScrollRef,
    inputLayoutHeight,
    totalBottomPadding,
    showScrollToBottom,
    handleScrollToBottom,
  } = useChatScroll();

  const showStopResponse = isGenerating && !isPending;

  return (
    <ChatLayout className="relative flex h-dvh max-w-[1280px] flex-col overflow-hidden">
      <motion.div
        className="shrink-0"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: EASE, delay: 0.12 }}
      >
        <ChatLabHeading sessionId={sessionId} />
      </motion.div>

      <div
        className={
          hasArtefact
            ? sideBySide
              ? "grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden px-4 pt-[72px] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-6 md:px-6 md:pt-[56px]"
              : "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 pt-[72px] md:gap-4 md:px-6 md:pt-[56px]"
            : "contents"
        }
        style={
          hasArtefact
            ? { paddingBottom: Math.max(totalBottomPadding - 24, 120) }
            : undefined
        }
      >
        <motion.div
          className={
            hasArtefact
              ? sideBySide
                ? "flex min-h-0 min-w-0 flex-col overflow-hidden"
                : "flex max-h-[38%] min-h-0 w-full shrink-0 flex-col overflow-hidden"
              : "contents"
          }
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.36,
            ease: EASE,
            delay: hasArtefact ? 0.18 : 0.08,
          }}
        >
          <ChatLabConversation
            className="min-h-0 w-full flex-1"
            conversationRef={conversationRef}
            ref={conversationScrollRef}
            contentClassName={
              hasArtefact ? "md:w-full md:max-w-none px-0" : undefined
            }
            style={
              hasArtefact
                ? { paddingTop: 8, paddingBottom: 8 }
                : {
                    paddingTop: isMobile ? 88 : 75,
                    paddingBottom: totalBottomPadding,
                  }
            }
          />
        </motion.div>

        {hasArtefact && (
          <div
            className={
              sideBySide
                ? "flex min-h-0 min-w-0 flex-col overflow-hidden"
                : "flex min-h-0 w-full flex-1 flex-col overflow-hidden"
            }
          >
            <ChatLabArtefactPanel sessionId={sessionId} />
          </div>
        )}
      </div>

      <motion.div layoutId="chat-lab-composer" transition={MORPH_SPRING}>
        <ChatLabComposer inputLayoutRef={inputLayoutRef} />
      </motion.div>

      {(showStopResponse || showScrollToBottom) && (
        <div
          style={{ bottom: inputLayoutHeight }}
          className="absolute left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          {showScrollToBottom && (
            <ChatPillButton
              shape="icon-round"
              onClick={handleScrollToBottom}
              aria-label="Scroll to bottom"
            >
              <ArrowDownIcon svgClasses="size-6" />
            </ChatPillButton>
          )}
          {showStopResponse && (
            <ChatPillButton shape="pill-text" onClick={() => void stop()}>
              <CrossLargeIcon svgClasses="size-4" />
              <Text variant="label" color="primary">
                Stop response
              </Text>
            </ChatPillButton>
          )}
        </div>
      )}
    </ChatLayout>
  );
}

/**
 * Single-page chat lab: starter and session share one mount. Starting a chat
 * only updates the URL — the interface morphs in place instead of reloading.
 */
export function ChatLabWorkspace() {
  const navigate = useNavigate();
  const { chat_id } = useParams<PathParams[typeof ROUTES.CHAT_LAB_SESSION]>();
  const sessionExists = useChatLabStore((state) =>
    Boolean(chat_id && state.sessions[chat_id]),
  );
  const sessionId = sessionExists ? chat_id : undefined;
  const createSession = useChatLabStore((state) => state.createSession);
  const setMessage = useInputStore((state) => state.setMessage);

  const [isStarting, setIsStarting] = useState(false);
  const [expandingKind, setExpandingKind] =
    useState<ExpandableInterfaceKind | null>(null);

  // Deep link to a missing thread → back to the starter, same page shell.
  useEffect(() => {
    if (chat_id && !sessionExists) {
      navigate(ROUTES.CHAT_LAB, { replace: true });
    }
  }, [chat_id, sessionExists, navigate]);

  // Reset starter handoff state only when returning home — keep it during exit
  // so the morphing shell stays visible for layoutId.
  useEffect(() => {
    if (!sessionId) {
      setExpandingKind(null);
      setIsStarting(false);
    }
  }, [sessionId]);

  const startChat = async (
    text: string,
    kind: VisualInterfaceKind | null = matchVisualInterface(text),
    field: StarterField | null = null,
    modes?: ChatModes,
  ) => {
    if (isStarting) return;
    setIsStarting(true);
    const opensInterface = isExpandableInterface(kind);
    if (opensInterface) {
      setExpandingKind(kind);
      // Let siblings/orb fade first; the selected shell stays put for layoutId.
      await new Promise((resolve) => setTimeout(resolve, HANDOFF_MS));
    }

    const shell = opensInterface
      ? field?.kind === kind
        ? field.data
        : draftShellData(kind, text)
      : null;
    const id = createSession(text, {
      fromChatCard: Boolean(modes),
      replyFormat: modes?.format,
      persona: modes?.persona,
      artefact:
        opensInterface && shell
          ? {
              kind,
              title: starterTitle(kind, shell) || extractCustomization(text),
              content: seedArtefactContent(kind, shell),
            }
          : undefined,
    });
    void generateChatLabTitle(id, text);
    setMessage("");
    navigate(href(ROUTES.CHAT_LAB_SESSION, { chat_id: id }), { replace: false });
  };

  /** Any library interface beyond the first three: open it docked, holding its card's data. */
  const startShell = async (text: string, value: KindData) => {
    if (isStarting) return;
    setIsStarting(true);
    await new Promise((resolve) => setTimeout(resolve, HANDOFF_MS));
    const id = createSession(text, {
      artefact: { kind: "shell", title: titleOf(value) || extractCustomization(text), shell: value as ArtefactShell },
    });
    void generateChatLabTitle(id, text);
    setMessage("");
    navigate(href(ROUTES.CHAT_LAB_SESSION, { chat_id: id }), { replace: false });
  };

  const openSession = (id: string) =>
    navigate(href(ROUTES.CHAT_LAB_SESSION, { chat_id: id }), { replace: false });

  const reopenChat = (id: string) => {
    setMessage("");
    openSession(id);
  };

  const continueChat = (id: string, text: string) => {
    useChatLabStore.getState().queueMessage(id, text);
    reopenChat(id);
  };

  return (
    <LayoutGroup id="chat-lab">
      <div className="relative min-h-dvh w-full">
        <AnimatePresence mode="sync" initial={false}>
          {sessionId ? (
            <SessionView key={sessionId} sessionId={sessionId} />
          ) : (
            <StarterView
              key="starter"
              expandingKind={expandingKind}
              isStarting={isStarting}
              onStart={(text, kind, field, modes) => void startChat(text, kind, field, modes)}
              onStartShell={(text, value) => void startShell(text, value)}
              onContinue={continueChat}
              onReopen={reopenChat}
            />
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
