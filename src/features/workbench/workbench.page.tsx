import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  InlineShell,
  InlineSmall,
  chartTypeFor,
  InterfaceShell,
  routeShellDraft,
  SHELL_FIXTURES,
  SHELL_META,
  type InterfaceShellProps,
  type ShellData,
  type ShellKind,
} from "@/features/interface-shells";
import type { Rect } from "./model/workbench-geometry";
import { type InstanceId, type LayoutEntry } from "./model/workbench-layout";
import { EMPTY_DRAFT, type ComposerDraft } from "./model/composer-draft";
import type { WorkbenchHost } from "./model/workbench-host";
import { currentEntry } from "./model/workbench-navigation";
import {
  artifactTitle,
  CHAT_INSTANCE,
  useWorkbenchStore,
  type WorkbenchInstance,
  type WorkbenchMessage,
} from "./model/workbench-store";
import { ordinalsOf, shellSizeFor } from "./model/workbench-view";
import { WorkbenchChat } from "./ui/workbench-chat";
import { WorkbenchComposer } from "./ui/workbench-composer";
import { ReplyPeek, WorkbenchSurface } from "./ui/workbench-surface";

/**
 * A test bed for the flexible workspace, kept out of the real chat while the
 * behaviour settles. Chat is the page; interfaces open beside it, minimize to
 * the strip in the top right, and move by dragging their header. ⌘Z undoes a
 * layout change. See docs/workbench.md.
 */

/** A new artifact from a chat message: the kind's suggestion, titled after what was asked. */
function artifactFromPrompt(kind: ShellKind, text: string): ShellData {
  const data = structuredClone(SHELL_FIXTURES[kind].states.suggestion) as ShellData & {
    title?: string;
    query?: string;
  };
  const title = text.length > 60 ? `${text.slice(0, 57)}…` : text;
  if ("query" in data) data.query = title;
  else if ("title" in data) data.title = title;
  // The model picks a chart's type from what was asked.
  if (kind === "chart") (data as ShellData & { type: string }).type = chartTypeFor(text);
  return data;
}

/** The workbench's name, with its picture, centred in the top bar. */
function WorkbenchTitle({ title }: { title: string }) {
  return (
    <>
      <img
        src="https://picsum.photos/seed/workbench-office/96/96"
        alt=""
        className="size-8 shrink-0 rounded-full object-cover"
      />
      <h1 className="min-w-0 truncate font-bureau text-[16px] text-typography-primary">{title}</h1>
    </>
  );
}

function WorkbenchPage() {
  const instances = useWorkbenchStore((state) => state.instances);
  const artifacts = useWorkbenchStore((state) => state.artifacts);
  const nav = useWorkbenchStore((state) => state.nav);
  const layout = useWorkbenchStore((state) => state.layout);
  const thread = useWorkbenchStore((state) => state.thread);
  const inlineEditing = useWorkbenchStore((state) => state.inlineEditing);
  const {
    transact,
    preview,
    undo,
    redo,
    addInterface,
    createArtifact,
    updateArtifact,
    setWorkspaceWidth,
    say,
    instanceShowing,
    openInWindow,
    markInlineEdited,
    remove,
  } = useWorkbenchStore.getState();

  const reducedMotion = useReducedMotion() ?? false;
  const [flashId, setFlashId] = useState<InstanceId | null>(null);
  // One draft, wherever the input is.
  const [draft, setDraft] = useState<ComposerDraft>(EMPTY_DRAFT);
  // The latest reply, shown above the input while Chat is minimized.
  const [peek, setPeek] = useState<{ id: number; text: string } | null>(null);
  const chatOpen = layout.entries[CHAT_INSTANCE]?.presentation !== "minimized";
  const list = useMemo(() => Object.values(instances), [instances]);
  const ordinals = ordinalsOf(list);

  // Escape puts a selected inline interface back: inline, and staying in the reply.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      useWorkbenchStore.getState().clearInlineEditing();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Ring a window for a moment, to show where something went. */
  const flash = (id: InstanceId | undefined) => {
    if (!id) return;
    setFlashId(id);
    window.setTimeout(() => setFlashId((current) => (current === id ? null : current)), 900);
  };

  /**
   * The chat stand-in, answering as the model would. What was asked for comes
   * back inline in the reply. An inline interface the person changed since
   * their last turn moves into its own window: they're working on it.
   */
  /**
   * The assistant's turn. With Chat minimized nobody would see it there: the
   * text shows above the input, and an interface it brings opens beside the work.
   */
  const reply = (text: string, inline?: string) => {
    say("assistant", text, inline);
    const hidden = useWorkbenchStore.getState().layout.entries[CHAT_INSTANCE]?.presentation === "minimized";
    if (!hidden) return;
    if (inline) flash(openInWindow(inline));
    const id = Date.now();
    setPeek({ id, text });
    window.setTimeout(() => setPeek((current) => (current?.id === id ? null : current)), 6000);
  };

  const sendChat = (text: string) => {
    say("user", text);
    const edited = useWorkbenchStore.getState().inlineEditing;
    const { kind } = routeShellDraft(text);

    window.setTimeout(() => {
      const parts: string[] = [];
      const editedKind = edited ? useWorkbenchStore.getState().artifacts[edited]?.kind : undefined;
      if (edited && editedKind) {
        flash(openInWindow(edited));
        parts.push(`I've moved the ${SHELL_META[editedKind].label.toLowerCase()} beside the chat so you can keep working on it.`);
      }
      // Asking for the kind being edited is more of the same, not a new one.
      if (kind && kind !== "chat" && kind !== editedKind) {
        const artifactId = createArtifact(kind, artifactFromPrompt(kind, text));
        parts.push(`Here's a ${SHELL_META[kind].label.toLowerCase()}.`);
        reply(parts.join(" "), artifactId);
        return;
      }
      reply(
        parts.length
          ? parts.join(" ")
          : "That stays in the chat. Ask for a document, a table, a search or a plan to make one.",
      );
    }, 450);
  };

  /** A change asked for on something highlighted, sent to the chat as the person's turn. */
  const sendHighlightEdit = (instance: WorkbenchInstance, quote: string, instruction: string) => {
    const label = instance.kind === "chat" ? "reply" : SHELL_META[instance.kind].label.toLowerCase();
    say("user", quote ? `${instruction}: “${quote}”` : instruction);
    window.setTimeout(
      () => reply(`In Chat this goes to the model, which makes the change in the ${label}.`),
      450,
    );
  };

  /**
   * An interface in a reply: inline medium, or inline small while it has a
   * window open. Minimized, it's back to medium.
   */
  const renderInline = (message: WorkbenchMessage & { inline: string }) => {
    const artifact = artifacts[message.inline];
    if (!artifact) return null;
    const instance = instanceShowing(artifact.id);
    if (instance && layout.entries[instance.id]?.presentation !== "minimized" && layout.entries[instance.id]) {
      // Its window is open: the reply keeps inline small, pointing at it.
      return (
        <InlineSmall
          kind={artifact.kind}
          data={artifact.data}
          ordinal={ordinals[instance.id]}
          action={`Open in ${SHELL_META[artifact.kind].label}${ordinals[instance.id] ? ` ${ordinals[instance.id]}` : ""}`}
          onClick={() => flash(instance.id)}
          className="ml-2.5 w-[calc(100%-20px)]"
        />
      );
    }
    return (
      <InlineShell
        kind={artifact.kind}
        data={artifact.data}
        selected={inlineEditing === artifact.id}
        onSelect={() => markInlineEdited(artifact.id)}
        onChange={(data) => {
          updateArtifact(artifact.id, data);
          markInlineEdited(artifact.id);
        }}
        onOpen={() => flash(openInWindow(artifact.id))}
      />
    );
  };

  const composer = (
    <WorkbenchComposer draft={draft} onDraftChange={setDraft} onSend={sendChat} reducedMotion={reducedMotion} />
  );

  const renderBody = (instance: WorkbenchInstance, entry: LayoutEntry, rect: Rect | undefined) => {
    if (instance.id === CHAT_INSTANCE) {
      const compact = (rect?.width ?? 0) < 520;
      return (
        <WorkbenchChat
          messages={thread.messages}
          compact={compact}
          composer={chatOpen ? composer : null}
          renderInline={renderInline}
        />
      );
    }
    const stack = nav[instance.id];
    const artifact = stack && artifacts[currentEntry(stack)?.artifactId ?? ""];
    if (!artifact) return null;
    return (
      <InterfaceShell
        key={artifact.id}
        {...({
          kind: artifact.kind,
          size: shellSizeFor(entry, rect),
          data: artifact.data,
          surface: false,
          // The window bar carries the glyph, so the shell leaves its own out.
          mark: false,
          onChange: (data: ShellData) => updateArtifact(artifact.id, data),
          onAsk: sendChat,
        } as InterfaceShellProps)}
      />
    );
  };

  /** Large layouts sit 24px in, cards 16px; Chat follows its own padding. */
  const insetFor = (instance: WorkbenchInstance, entry: LayoutEntry, rect: Rect | undefined) => {
    if (instance.id === CHAT_INSTANCE) return (rect?.width ?? 0) < 520 ? 8 : 16;
    return shellSizeFor(entry, rect) === "large" ? 24 : 16;
  };

  const host = useMemo<WorkbenchHost>(() => {
    const store = useWorkbenchStore.getState;
    return {
      touch: (id) => store().touch(id),
      labelOf: (id) => {
        const kind = store().instances[id]?.kind;
        return kind ? SHELL_META[kind].label : "Interface";
      },
      titleOf: (id) => {
        if (id === CHAT_INSTANCE) return "Chat";
        const stack = store().nav[id];
        return artifactTitle(store().artifacts[stack ? (currentEntry(stack)?.artifactId ?? "") : ""]);
      },
      navigation: {
        stackOf: (id) => store().nav[id],
        titleOf: (artifactId, fallback) => {
          const artifact = store().artifacts[artifactId];
          return artifact ? artifactTitle(artifact) : fallback;
        },
        siblings: (kind) =>
          Object.values(store().artifacts)
            .filter((artifact) => artifact.kind === kind)
            .map((artifact) => ({ id: artifact.id, title: artifactTitle(artifact) })),
        navigate: (id, artifactId, view) => store().navigate(id, artifactId, view),
        back: (id, view) => store().back(id, view),
        forward: (id, view) => store().forward(id, view),
        goTo: (id, index, view) => store().goTo(id, index, view),
        createArtifact: (kind) => store().createArtifact(kind),
      },
    };
    // Read through the store at call time; these keep titles and stacks fresh on render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifacts, nav, instances]);

  return (
    <WorkbenchSurface
      className="h-dvh w-full md:h-screen"
      instances={list}
      layout={layout}
      chatId={CHAT_INSTANCE}
      host={host}
      transact={transact}
      preview={preview}
      undo={undo}
      redo={redo}
      onWidth={setWorkspaceWidth}
      title={<WorkbenchTitle title={thread.title || "Untitled workbench"} />}
      onAdd={(kind) => addInterface(kind)}
      onRemove={remove}
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
                setPeek(null);
                transact({ type: "open", id: CHAT_INSTANCE });
              }}
            />
          )}
          {composer}
        </>
      }
    />
  );
}

export const Component = WorkbenchPage;
