import { useEffect, useMemo, useState } from "react";
import { href, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useSessionStore } from "@/services/auth";
import { ArrowDownIcon } from "@/shared/assets/icons/outlined/ArrowDown";
import { CrossLargeIcon } from "@/shared/assets/icons/outlined/CrossLarge";
import { type PathParams, ROUTES } from "@/shared/model/routes";
import { GradientText } from "@/shared/ui/gradient-text";
import { Text } from "@/shared/ui/kit/text";
import { HomeField } from "./compose/home-field";
import type { StarterField } from "./compose/visual-starter-suggestions";
import { ChatLabArtefactWindow } from "./compose/chat-lab-artefact";
import { ChatLabComposer } from "./compose/chat-lab-composer";
import { ChatLabConversation } from "./compose/chat-lab-conversation";
import { ChatLabTitle } from "./compose/chat-lab-heading";
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
import { CHAT_WINDOW, useChatLabStore, type ArtefactShell } from "./model/chat-lab-store";
import {
  addInterface,
  artefactLabel,
  artefactWindowTitle,
  clearInlineEditing,
  clearPeek,
  layoutOf,
  preview,
  redo,
  removeWindow,
  setWorkspaceWidth,
  touch,
  transact,
  undo,
  useChatWorkbenchView,
  workbenchInstances,
} from "./model/chat-lab-workbench";
import {
  ReplyPeek,
  shellSizeFor,
  WorkbenchSurface,
  type LayoutEntry,
  type Rect,
  type WorkbenchHost,
  type WorkbenchInstance,
} from "@/features/workbench";
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
      {/* The field is the whole page; the input floats over its bottom edge. */}
      <div className="absolute inset-0">
        <HomeField
          lift={HOME_INPUT_LIFT}
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

      <ChatLayout className="pointer-events-none absolute bottom-0 w-full px-6 pb-8 md:w-[780px] md:px-0 md:pb-10">
        <motion.div
          layoutId="chat-lab-composer"
          className="pointer-events-auto w-full"
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

/** How far the home's middle sits above the page's, to clear the input. */
const HOME_INPUT_LIFT = 70;

/** Below this a Chat frame has no gutter for the avatar, and the reply fills the frame. */
const NARROW_CHAT = 800;
/** The suggestion cards need this much room beside the input. */
const SUGGESTIONS_CHAT = 920;

/** The conversation, as the body of the workbench's Chat frame. Its input is here while Chat is open. */
function ChatPane({ width, open }: { width: number; open: boolean }) {
  const { isGenerating, isPending, stop } = useChatLabSession();
  const {
    inputLayoutRef,
    conversationRef,
    conversationScrollRef,
    inputLayoutHeight,
    totalBottomPadding,
    showScrollToBottom,
    handleScrollToBottom,
  } = useChatScroll();
  const narrow = width < NARROW_CHAT;
  const showStopResponse = isGenerating && !isPending;

  return (
    <div className="group/chat relative h-full" data-narrow={narrow || undefined}>
      <ChatLabConversation
        className="h-full w-full"
        conversationRef={conversationRef}
        ref={conversationScrollRef}
        contentClassName={narrow ? "md:w-full md:max-w-[660px] md:px-4" : undefined}
        style={{ paddingTop: 16, paddingBottom: totalBottomPadding }}
      />

      {open && (
        <ChatLabComposer
          inputLayoutRef={inputLayoutRef}
          mode={width >= SUGGESTIONS_CHAT ? "full" : "compact"}
        />
      )}

      {(showStopResponse || showScrollToBottom) && (
        <div
          style={{ bottom: inputLayoutHeight }}
          className="absolute left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          {showScrollToBottom && (
            <ChatPillButton shape="icon-round" onClick={handleScrollToBottom} aria-label="Scroll to bottom">
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
    </div>
  );
}

/**
 * A thread is a workbench: Chat is the page, and the interfaces it makes open
 * beside it, minimize to the strip and move. See docs/workbench.md.
 */
function SessionViewInner({ sessionId }: { sessionId: string }) {
  useChatLabSessionEffects(sessionId);
  const { isGenerating, sendText } = useChatLabSession();
  const session = useChatLabStore((state) => state.sessions[sessionId]);
  const flashId = useChatWorkbenchView((state) => state.flashId);
  const peek = useChatWorkbenchView((state) => (state.peek?.sessionId === sessionId ? state.peek : null));

  // Threads from before the workbench get a layout the first time they're opened.
  useEffect(() => {
    layoutOf(sessionId);
  }, [sessionId]);

  // Escape puts a selected inline interface back: inline, and staying in the reply.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      clearInlineEditing();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const layout = session?.layout;
  const artefacts = session?.artefacts;
  const instances = useMemo(
    () => (session && layout ? workbenchInstances(session, layout) : []),
    // Only what's in the thread and where it sits changes the windows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artefacts, layout],
  );

  const host = useMemo<WorkbenchHost>(() => {
    const artefactOf = (id: string) => useChatLabStore.getState().sessions[sessionId]?.artefacts?.[id];
    return {
      touch: (id) => touch(sessionId, id),
      labelOf: (id) => {
        const artefact = artefactOf(id);
        return artefact ? artefactLabel(artefact) : "Chat";
      },
      titleOf: (id) => {
        const artefact = artefactOf(id);
        return artefact ? artefactWindowTitle(artefact) : "Chat";
      },
    };
    // Read through the store at call time; this keeps titles fresh on render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, artefacts]);

  if (!session || !layout) return null;
  const chatOpen = layout.entries[CHAT_WINDOW]?.presentation !== "minimized";

  const renderBody = (instance: WorkbenchInstance, entry: LayoutEntry, rect: Rect | undefined) => {
    if (instance.id === CHAT_WINDOW) return <ChatPane width={rect?.width ?? 0} open={chatOpen} />;
    const artefact = session.artefacts?.[instance.id];
    if (!artefact) return null;
    return (
      <ChatLabArtefactWindow
        key={artefact.id}
        sessionId={sessionId}
        artefact={artefact}
        size={shellSizeFor(entry, rect)}
      />
    );
  };

  /** Large layouts sit 24px in, cards 16px; Chat follows its own padding. */
  const insetFor = (instance: WorkbenchInstance, entry: LayoutEntry, rect: Rect | undefined) => {
    if (instance.id === CHAT_WINDOW) return (rect?.width ?? 0) < 520 ? 8 : 16;
    return shellSizeFor(entry, rect) === "large" ? 24 : 16;
  };

  /** A change asked for on something highlighted: the person's turn, about that interface. */
  const sendHighlightEdit = (instance: WorkbenchInstance, quote: string, instruction: string) => {
    if (isGenerating) return;
    if (instance.id !== CHAT_WINDOW) useChatLabStore.getState().focusArtefact(sessionId, instance.id);
    void sendText(quote ? `${instruction}: “${quote}”` : instruction);
  };

  return (
    <WorkbenchSurface
      className="h-dvh w-full"
      instances={instances}
      layout={layout}
      chatId={CHAT_WINDOW}
      host={host}
      transact={(change) => transact(sessionId, change)}
      preview={(change) => preview(sessionId, change)}
      undo={() => undo(sessionId)}
      redo={() => redo(sessionId)}
      onWidth={setWorkspaceWidth}
      title={<ChatLabTitle sessionId={sessionId} />}
      onAdd={(kind) => addInterface(sessionId, kind)}
      onRemove={(id) => removeWindow(sessionId, id)}
      renderBody={renderBody}
      insetFor={insetFor}
      onHighlightEdit={sendHighlightEdit}
      flashId={flashId}
      floating={
        <>
          {peek && (
            <ReplyPeek
              text={peek.text}
              onOpen={() => {
                clearPeek();
                transact(sessionId, { type: "open", id: CHAT_WINDOW });
              }}
            />
          )}
          <ChatLabComposer mode="floating" />
        </>
      }
    />
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
      // The starter's first commit on return still carries the handoff state, so
      // its headline/tiles fade back in; resetting during render would skip that.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-commit reset; see above
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
