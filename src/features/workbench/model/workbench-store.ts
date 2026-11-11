import { create } from "zustand";
import {
  SHELL_FIXTURES,
  SHELL_META,
  shellId,
  type ShellData,
  type ShellKind,
} from "@/features/interface-shells";
import { fitsWidth } from "./workbench-geometry";
import type { WorkbenchInstance } from "./workbench-host";
import {
  addEntry,
  applyLayoutChange,
  previewLayoutChange,
  restoreArrangement,
  touchEntry,
  type InstanceId,
  type LayoutChange,
  type LayoutOptions,
  type LayoutResult,
  type WorkspaceLayout,
} from "./workbench-layout";
import {
  createNavStack,
  currentEntry,
  navBack,
  navForward,
  navGo,
  navPush,
  navSaveView,
  type NavStack,
  type NavView,
} from "./workbench-navigation";

/**
 * The workbench test page's state, in three parts that never reach into each
 * other: what each interface shows (artifacts and navigation), and where it
 * sits (layout, with its own undo history).
 */

export type { WorkbenchInstance };

export type WorkbenchArtifact = { id: string; kind: ShellKind; data: ShellData };

export const CHAT_INSTANCE = "chat";

/** A turn in the chat. An assistant turn can carry an interface, shown inline in the reply. */
export type WorkbenchMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** The artifact shown inline under the text. */
  inline?: string;
};

export type WorkbenchThread = { title: string; messages: WorkbenchMessage[] };

/** Recency is written at most this often while someone works inside an interface. */
const TOUCH_INTERVAL = 800;
const HISTORY_LIMIT = 50;

export function artifactTitle(artifact: WorkbenchArtifact | undefined): string {
  if (!artifact) return "";
  const data = artifact.data as { title?: string; query?: string };
  const title = (data.title ?? data.query ?? "").trim();
  return title || `New ${SHELL_META[artifact.kind].label.toLowerCase()}`;
}

const clone = <T>(value: T): T => structuredClone(value);

/** Two artifacts per kind from the library's fixtures, so back and forward have somewhere to go. */
function seedArtifacts(): Record<string, WorkbenchArtifact> {
  const artifacts: Record<string, WorkbenchArtifact> = {};
  for (const kind of Object.keys(SHELL_FIXTURES) as ShellKind[]) {
    if (kind === "chat") continue;
    for (const state of ["suggestion", "history"] as const) {
      const id = `${kind}-${state}`;
      const data = clone(SHELL_FIXTURES[kind].states[state]) as ShellData & { title?: string };
      // Some fixtures share a title; history needs to tell them apart.
      if (state === "history" && data.title && data.title === artifactTitle(artifacts[`${kind}-suggestion`])) {
        data.title = `${data.title} (${SHELL_FIXTURES[kind].history.when})`;
      }
      artifacts[id] = { id, kind, data };
    }
  }
  return artifacts;
}

/** The library's chat history, then a turn that answers with an interface inline. */
function seedThread(): WorkbenchThread {
  const history = SHELL_FIXTURES.chat.states.history;
  return {
    title: history.title,
    messages: [
      ...history.messages.map(({ id, role, text }) => ({ id, role, text })),
      { id: "m5", role: "user", text: "Can you turn the shoot into a checklist?" },
      { id: "m6", role: "assistant", text: "Here's a checklist for the shoot.", inline: "tracker-suggestion" },
    ],
  };
}

type WorkbenchData = {
  instances: Record<InstanceId, WorkbenchInstance>;
  artifacts: Record<string, WorkbenchArtifact>;
  nav: Record<InstanceId, NavStack>;
  layout: WorkspaceLayout;
  past: WorkspaceLayout[];
  future: WorkspaceLayout[];
  /** Measured by the page; large interfaces are kept at least `minLarge` wide in it. */
  workspaceWidth: number | null;
  thread: WorkbenchThread;
  /**
   * The inline interface the person has changed since their last turn. It
   * shows its editing tools, and moves into its own window on their next turn.
   */
  inlineEditing: string | null;
};

type WorkbenchActions = {
  transact: (change: LayoutChange) => LayoutResult;
  /** What a change would do, without doing it. */
  preview: (change: LayoutChange) => LayoutResult;
  setWorkspaceWidth: (width: number) => void;
  undo: () => void;
  redo: () => void;
  /** The person did something inside it. */
  touch: (id: InstanceId) => void;
  /**
   * A new interface on an artifact (a fresh one when omitted), opened large,
   * or as a medium in the supporting column.
   */
  addInterface: (kind: ShellKind, artifactId?: string, as?: "large" | "support") => InstanceId;
  /** The interface showing this artifact, if one is. */
  instanceShowing: (artifactId: string) => WorkbenchInstance | undefined;
  /** Move an inline interface into its own window: a medium in the supporting column. */
  openInWindow: (artifactId: string) => InstanceId | undefined;
  /** Add a turn to the chat. Not an interaction: recency and layout are untouched. */
  say: (role: WorkbenchMessage["role"], text: string, inline?: string) => void;
  /**
   * Take an interface out of this session: its window, its icon and its
   * history go. What it showed stays, so a reply that carries it still can.
   */
  remove: (id: InstanceId) => void;
  /** The person changed an inline interface. */
  markInlineEdited: (artifactId: string) => void;
  /** Put a selected inline interface back: it stays in the reply and won't move. */
  clearInlineEditing: () => void;
  createArtifact: (kind: ShellKind, data?: ShellData) => string;
  navigate: (id: InstanceId, artifactId: string, view?: NavView) => void;
  back: (id: InstanceId, view?: NavView) => void;
  forward: (id: InstanceId, view?: NavView) => void;
  goTo: (id: InstanceId, index: number, view?: NavView) => void;
  /** Edits from the person, or updates from the assistant. Neither touches recency or history. */
  updateArtifact: (artifactId: string, data: ShellData) => void;
  reset: () => void;
};

function initialData(): WorkbenchData {
  const artifacts = seedArtifacts();
  const now = Date.now();
  const instances: Record<InstanceId, WorkbenchInstance> = {};
  const nav: Record<InstanceId, NavStack> = {};
  let layout: WorkspaceLayout = { entries: {}, divider: 0.5 };

  // Oldest first, so the arrangement below has a recency order to evict by.
  // Oldest first, so the arrangement has a recency order to evict by. Without a
  // placement an interface starts in the strip.
  const seed: { id: InstanceId; kind: ShellKind; artifact: string; change?: LayoutChange }[] = [
    { id: "table-1", kind: "table", artifact: "table-suggestion" },
    { id: "calendar-1", kind: "calendar", artifact: "calendar-suggestion" },
    { id: "search-1", kind: "search", artifact: "search-suggestion" },
    { id: "map-1", kind: "map", artifact: "map-suggestion", change: { type: "move", id: "map-1", region: "right", order: 0 } },
    { id: CHAT_INSTANCE, kind: "chat", artifact: "", change: { type: "move", id: CHAT_INSTANCE, region: "main", order: 0 } },
    { id: "document-1", kind: "document", artifact: "document-suggestion", change: { type: "move", id: "document-1", region: "main", order: 1 } },
  ];
  seed.forEach((item, index) => {
    const at = now - (seed.length - index) * 1000;
    instances[item.id] = { id: item.id, kind: item.kind };
    // Chat has no navigation of its own.
    if (item.artifact) {
      nav[item.id] = createNavStack({ artifactId: item.artifact, title: artifactTitle(artifacts[item.artifact]) });
    }
    layout = addEntry(layout, item.id, item.kind === "chat", at);
    if (item.change) layout = applyLayoutChange(layout, item.change, at).layout;
  });
  return {
    instances,
    artifacts,
    nav,
    layout,
    past: [],
    future: [],
    workspaceWidth: null,
    thread: seedThread(),
    inlineEditing: null,
  };
}

const viewSaver = (view?: NavView) => (stack: NavStack) => (view ? navSaveView(stack, view) : stack);

export const useWorkbenchStore = create<WorkbenchData & WorkbenchActions>()((set, get) => {
  const options = (): LayoutOptions => {
    const width = get().workspaceWidth;
    return width ? { fits: (layout) => fitsWidth(layout, width) } : {};
  };

  const pushLayout = (result: LayoutResult) => {
    if (!result.changed) return;
    set((state) => ({
      layout: result.layout,
      past: [...state.past, state.layout].slice(-HISTORY_LIMIT),
      future: [],
    }));
  };

  const updateNav = (id: InstanceId, update: (stack: NavStack) => NavStack) => {
    const stack = get().nav[id];
    if (!stack) return;
    const next = update(stack);
    if (next !== stack) set((state) => ({ nav: { ...state.nav, [id]: next } }));
  };

  return {
    ...initialData(),

    transact: (change) => {
      const result = applyLayoutChange(get().layout, change, Date.now(), options());
      pushLayout(result);
      return result;
    },

    preview: (change) => previewLayoutChange(get().layout, change, options()),

    setWorkspaceWidth: (width) => {
      if (get().workspaceWidth !== width) set({ workspaceWidth: width });
    },

    undo: () => {
      const { past, layout, future } = get();
      const previous = past.at(-1);
      if (!previous) return;
      set({ layout: restoreArrangement(previous, layout), past: past.slice(0, -1), future: [layout, ...future] });
    },

    redo: () => {
      const { past, layout, future } = get();
      const next = future[0];
      if (!next) return;
      set({ layout: restoreArrangement(next, layout), past: [...past, layout], future: future.slice(1) });
    },

    touch: (id) => {
      const entry = get().layout.entries[id];
      const now = Date.now();
      if (!entry || now - entry.lastInteraction < TOUCH_INTERVAL) return;
      set((state) => ({ layout: touchEntry(state.layout, id, now) }));
    },

    createArtifact: (kind, data) => {
      const id = shellId(kind);
      const artifact: WorkbenchArtifact = {
        id,
        kind,
        data: data ?? (clone(SHELL_FIXTURES[kind].states.empty) as ShellData),
      };
      set((state) => ({ artifacts: { ...state.artifacts, [id]: artifact } }));
      return id;
    },

    addInterface: (kind, artifactId, as = "large") => {
      const artifact = artifactId ?? get().createArtifact(kind);
      const id = shellId(`${kind}-view`);
      set((state) => ({
        instances: { ...state.instances, [id]: { id, kind } },
        nav: {
          ...state.nav,
          [id]: createNavStack({ artifactId: artifact, title: artifactTitle(state.artifacts[artifact]) }),
        },
        // Created in the strip, then opened: undo puts it back there.
        layout: addEntry(state.layout, id, kind === "chat", Date.now()),
      }));
      get().transact(as === "support" ? { type: "support", id } : { type: "open", id });
      return id;
    },

    instanceShowing: (artifactId) => {
      const { instances, nav } = get();
      return Object.values(instances).find((instance) => {
        const stack = nav[instance.id];
        return stack && currentEntry(stack)?.artifactId === artifactId;
      });
    },

    openInWindow: (artifactId) => {
      const artifact = get().artifacts[artifactId];
      if (!artifact) return undefined;
      if (get().inlineEditing === artifactId) set({ inlineEditing: null });
      const existing = get().instanceShowing(artifactId);
      if (!existing) return get().addInterface(artifact.kind, artifactId, "support");
      // Already in a window: leave a visible one where it is, bring a minimized one back.
      if (get().layout.entries[existing.id]?.presentation === "minimized") {
        get().transact({ type: "support", id: existing.id });
      }
      return existing.id;
    },

    say: (role, text, inline) =>
      set((state) => ({
        thread: {
          ...state.thread,
          messages: [...state.thread.messages, { id: shellId("m"), role, text, ...(inline ? { inline } : {}) }],
        },
      })),

    remove: (id) => {
      if (id === CHAT_INSTANCE) return;
      const without = <T,>(record: Record<string, T>) =>
        Object.fromEntries(Object.entries(record).filter(([key]) => key !== id));
      set((state) => ({
        instances: without(state.instances),
        nav: without(state.nav),
        layout: { ...state.layout, entries: without(state.layout.entries) },
      }));
    },

    markInlineEdited: (artifactId) => {
      if (get().inlineEditing !== artifactId) set({ inlineEditing: artifactId });
    },

    clearInlineEditing: () => {
      if (get().inlineEditing) set({ inlineEditing: null });
    },

    navigate: (id, artifactId, view) => {
      const title = artifactTitle(get().artifacts[artifactId]);
      updateNav(id, (stack) => {
        if (currentEntry(stack)?.artifactId === artifactId) return stack;
        return navPush(viewSaver(view)(stack), { artifactId, title });
      });
    },
    back: (id, view) => updateNav(id, (stack) => navBack(viewSaver(view)(stack))),
    forward: (id, view) => updateNav(id, (stack) => navForward(viewSaver(view)(stack))),
    goTo: (id, index, view) =>
      updateNav(id, (stack) => (index === stack.index ? stack : navGo(viewSaver(view)(stack), index))),

    updateArtifact: (artifactId, data) =>
      set((state) => {
        const artifact = state.artifacts[artifactId];
        if (!artifact) return state;
        return { artifacts: { ...state.artifacts, [artifactId]: { ...artifact, data } } };
      }),

    reset: () => set({ ...initialData(), workspaceWidth: get().workspaceWidth }),
  };
});
