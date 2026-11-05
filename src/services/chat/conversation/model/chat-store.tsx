import type { ApiSchemas } from "@/shared/api/schema";
import { createContext, useContext, useState } from "react";
import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

type ChatMessage = ApiSchemas["ChatMessageDto"];
type ChatMessageMetadata = ApiSchemas["ChatMessageMetadataDto"];
type ChatAttachment = ApiSchemas["ChatAttachmentDto"];
type MessageImagePlan = ApiSchemas["ChatSseImagePlanEventDto"];
type MessageQuote = ApiSchemas["ChatQuoteDto"];

type ComponentBlock = {
  id: string;
  kind?: string;
  text?: string;
  status?: string;
  url?: string;
  width?: number;
  height?: number;
  spec?: unknown;
};

type ComponentDocument = {
  blocks: ComponentBlock[];
};
type HighlightSuggestionSide = "left" | "right";
type HighlightSuggestionPlacement = "above" | "below";

interface ChatState {
  messages: ChatMessage[];
  summaryByMessageId: Record<string, string[]>;
  generationEtaMsRemaining: number | undefined;
  interactiveByMessageId: Record<string, boolean>;
  componentDocByMessageId: Record<string, ComponentDocument>;
  isPending: boolean;
  isGenerating: boolean;
  isTextGenerating: boolean;
  isRegenerating: boolean;
  isLoadingMore: boolean;
  isInitialScrollComplete: boolean;
  highlightMessageId: string | undefined;
  selectedText: string | undefined;
  highlightRange: { start: number; end: number } | undefined;
  sourcesPopupMessageId: string | undefined;
  highlightSuggestionSide: HighlightSuggestionSide;
  highlightSuggestionPlacement: HighlightSuggestionPlacement;
  highlightSelectionOffsetY: number | undefined;
  isHighlightModeActive: boolean;
}

type ChatProps = ChatState;

interface ChatActions {
  setHighlightMessageId: (messageId: string | undefined) => void;
  setSelectedText: (selectedText: string | undefined) => void;
  setHighlightRange: (
    range: { start: number; end: number } | undefined,
  ) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  prependMessages: (messages: ChatMessage[]) => void;
  setIsPending: (isPending: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsTextGenerating: (isTextGenerating: boolean) => void;
  setIsRegenerating: (isRegenerating: boolean) => void;
  setIsLoadingMore: (isLoadingMore: boolean) => void;
  setIsInitialScrollComplete: (isInitialScrollComplete: boolean) => void;
  appendToMessage: (id: string, text: string) => void;
  setMessageContent: (id: string, content: string) => void;
  replaceMessageRange: (
    id: string,
    start: number,
    end: number,
    replacement: string,
  ) => void;
  insertInMessage: (id: string, pos: number, text: string) => void;
  clearMessageAttachments: (messageId: string) => void;
  supersedeAttachment: (
    messageId: string,
    sourceAttachmentId: string,
    newAttachment: ChatAttachment,
  ) => void;
  addMessageAttachment: (messageId: string, attachment: ChatAttachment) => void;
  patchMessageMetadata: (
    messageId: string,
    patch: Partial<ChatMessageMetadata>,
  ) => void;
  setMessageImagePlan: (messageId: string, plan: MessageImagePlan) => void;
  clearMessageImagePlan: (messageId: string) => void;
  setMessageQuote: (messageId: string, quote: MessageQuote) => void;
  clearMessageQuote: (messageId: string) => void;
  setMessageApiPreviewUrl: (messageId: string, url: string) => void;
  clearMessageApiPreviewUrl: (messageId: string) => void;
  addMessageSummary: (messageId: string, text: string) => void;
  setGenerationEta: (etaMsRemaining: number | undefined) => void;
  setMessageInteractive: (messageId: string, isInteractive: boolean) => void;
  setComponentDocument: (
    messageId: string,
    document: ComponentDocument,
  ) => void;
  appendComponentProseText: (
    messageId: string,
    componentId: string,
    text: string,
  ) => void;
  setComponentImageReady: (
    messageId: string,
    componentId: string,
    image: { url: string; width?: number; height?: number },
  ) => void;
  setComponentPlotReady: (
    messageId: string,
    componentId: string,
    spec: Record<string, unknown>,
  ) => void;
  setComponentBlockError: (
    messageId: string,
    componentId: string,
    message: string,
  ) => void;
  clearComponentDocument: (messageId: string) => void;
  markMessageAsFailed: (messageId: string, content: string) => void;
  openSourcesPopup: (messageId: string) => void;
  closeSourcesPopup: () => void;
  setHighlightSuggestionSide: (side: HighlightSuggestionSide) => void;
  setHighlightSuggestionPlacement: (
    placement: HighlightSuggestionPlacement,
  ) => void;
  setHighlightSelectionOffsetY: (offsetY: number | undefined) => void;
  setIsHighlightModeActive: (isHighlightModeActive: boolean) => void;
  startGeneration: () => void;
  stopGeneration: () => void;
  finishGeneration: () => void;
  reset: () => void;
}

type ChatStore = ChatState & ChatActions;

const DEFAULT_PROPS: ChatProps = {
  messages: [],
  summaryByMessageId: {},
  generationEtaMsRemaining: undefined,
  interactiveByMessageId: {},
  componentDocByMessageId: {},
  isPending: false,
  isGenerating: false,
  isTextGenerating: false,
  isRegenerating: false,
  isLoadingMore: false,
  isInitialScrollComplete: false,
  highlightMessageId: undefined,
  selectedText: undefined,
  highlightRange: undefined,
  sourcesPopupMessageId: undefined,
  highlightSuggestionSide: "right",
  highlightSuggestionPlacement: "below",
  highlightSelectionOffsetY: undefined,
  isHighlightModeActive: false,
};

export const createChatStore = (initProps?: Partial<ChatProps>) => {
  return createStore<ChatStore>()(
    immer((set) => {
      const initialState: ChatState = {
        ...DEFAULT_PROPS,
        ...initProps,
      };

      return {
        ...initialState,
        setHighlightMessageId: (highlightMessageId) =>
          set((draft) => {
            draft.highlightMessageId = highlightMessageId;
          }),
        setSelectedText: (selectedText) =>
          set((draft) => {
            draft.selectedText = selectedText;
          }),
        setHighlightRange: (range) =>
          set((draft) => {
            draft.highlightRange = range;
          }),
        openSourcesPopup: (messageId) =>
          set((draft) => {
            draft.sourcesPopupMessageId = messageId;
          }),
        closeSourcesPopup: () =>
          set((draft) => {
            draft.sourcesPopupMessageId = undefined;
          }),
        setHighlightSuggestionSide: (side) =>
          set((draft) => {
            draft.highlightSuggestionSide = side;
          }),
        setHighlightSuggestionPlacement: (placement) =>
          set((draft) => {
            draft.highlightSuggestionPlacement = placement;
          }),
        setHighlightSelectionOffsetY: (highlightSelectionOffsetY) =>
          set((draft) => {
            draft.highlightSelectionOffsetY = highlightSelectionOffsetY;
          }),
        setIsHighlightModeActive: (isHighlightModeActive) =>
          set((draft) => {
            draft.isHighlightModeActive = isHighlightModeActive;
          }),
        addMessage: (message) =>
          set((draft) => {
            draft.messages.push(message);
          }),
        setMessages: (messages) =>
          set((draft) => {
            draft.messages = messages;
          }),
        prependMessages: (messages) =>
          set((draft) => {
            draft.messages = [...messages, ...draft.messages];
          }),
        setIsPending: (isPending) =>
          set((draft) => {
            draft.isPending = isPending;
          }),
        setIsGenerating: (isGenerating) =>
          set((draft) => {
            draft.isGenerating = isGenerating;
          }),
        setIsTextGenerating: (isTextGenerating) =>
          set((draft) => {
            draft.isTextGenerating = isTextGenerating;
          }),
        setIsRegenerating: (isRegenerating) =>
          set((draft) => {
            draft.isRegenerating = isRegenerating;
          }),
        setIsLoadingMore: (isLoadingMore) =>
          set((draft) => {
            draft.isLoadingMore = isLoadingMore;
          }),
        setIsInitialScrollComplete: (isInitialScrollComplete) =>
          set((draft) => {
            draft.isInitialScrollComplete = isInitialScrollComplete;
          }),
        appendToMessage: (id, text) =>
          set((draft) => {
            const message = draft.messages.find((m) => m.message_id === id);
            if (message) message.content += text;
          }),
        setMessageContent: (id, content) =>
          set((draft) => {
            const message = draft.messages.find((m) => m.message_id === id);
            if (message) message.content = content;
          }),
        replaceMessageRange: (id, start, end, replacement) =>
          set((draft) => {
            const message = draft.messages.find((m) => m.message_id === id);
            if (!message) return;
            const content = message.content;
            message.content =
              content.slice(0, start) + replacement + content.slice(end);
          }),
        insertInMessage: (id, pos, text) =>
          set((draft) => {
            const message = draft.messages.find((m) => m.message_id === id);
            if (!message) return;
            const content = message.content;
            message.content = content.slice(0, pos) + text + content.slice(pos);
          }),
        clearMessageAttachments: (messageId) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (message) message.attachments = [];
          }),
        supersedeAttachment: (messageId, sourceAttachmentId, newAttachment) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message) return;
            const sourceIdx = message.attachments.findIndex(
              (a) => a.attachment_id === sourceAttachmentId,
            );
            const source = message.attachments[sourceIdx];
            if (source) {
              source.superseded_at =
                source.superseded_at ?? new Date().toISOString();
              source.superseded_by_attachment_id = newAttachment.attachment_id;
            }
            const alreadyExists = message.attachments.some(
              (a) => a.attachment_id === newAttachment.attachment_id,
            );
            if (alreadyExists) return;
            const insertAt =
              sourceIdx >= 0 ? sourceIdx : message.attachments.length;
            message.attachments.splice(insertAt, 0, newAttachment);
          }),
        addMessageAttachment: (messageId, attachment) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message) return;
            // Guard against duplicate events for the same attachment.
            const alreadyExists = message.attachments.some(
              (a) => a.attachment_id === attachment.attachment_id,
            );
            if (alreadyExists) return;
            message.attachments.push(attachment);
          }),
        patchMessageMetadata: (messageId, patch) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message) return;
            message.metadata = { ...(message.metadata ?? {}), ...patch };
          }),
        setMessageImagePlan: (messageId, plan) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message) return;
            message.metadata = {
              ...(message.metadata ?? {}),
              image_plan: plan,
            };
          }),
        clearMessageImagePlan: (messageId) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message?.metadata) return;
            delete message.metadata.image_plan;
          }),
        setMessageQuote: (messageId, quote) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message) return;
            message.metadata = { ...(message.metadata ?? {}), quote };
          }),
        clearMessageQuote: (messageId) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message?.metadata) return;
            delete message.metadata.quote;
          }),
        setMessageApiPreviewUrl: (messageId, url) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (message) message.api_preview_url = url;
          }),
        clearMessageApiPreviewUrl: (messageId) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (message) message.api_preview_url = null;
          }),
        addMessageSummary: (messageId, text) =>
          set((draft) => {
            const list = draft.summaryByMessageId[messageId] ?? [];
            // Guard against duplicate/retried frames producing repeated lines.
            if (list[list.length - 1] === text) return;
            list.push(text);
            draft.summaryByMessageId[messageId] = list;
          }),
        setGenerationEta: (etaMsRemaining) =>
          set((draft) => {
            draft.generationEtaMsRemaining = etaMsRemaining;
          }),
        setMessageInteractive: (messageId, isInteractive) =>
          set((draft) => {
            draft.interactiveByMessageId[messageId] = isInteractive;
          }),
        setComponentDocument: (messageId, document) =>
          set((draft) => {
            draft.componentDocByMessageId[messageId] = document;
          }),
        appendComponentProseText: (messageId, componentId, text) =>
          set((draft) => {
            const block = draft.componentDocByMessageId[messageId]?.blocks.find(
              (b) => b.id === componentId,
            );
            // Fill events for unknown/mismatched ids are ignored.
            if (block?.kind === "prose") block.text += text; // APPEND
          }),
        setComponentImageReady: (messageId, componentId, image) =>
          set((draft) => {
            const block = draft.componentDocByMessageId[messageId]?.blocks.find(
              (b) => b.id === componentId,
            );
            if (block?.kind !== "image") return;
            block.status = "ready";
            block.url = image.url;
            if (image.width !== undefined) block.width = image.width;
            if (image.height !== undefined) block.height = image.height;
          }),
        setComponentPlotReady: (messageId, componentId, spec) =>
          set((draft) => {
            const block = draft.componentDocByMessageId[messageId]?.blocks.find(
              (b) => b.id === componentId,
            );
            if (block?.kind !== "plot") return;
            block.spec = spec;
            block.status = "ready";
          }),
        setComponentBlockError: (messageId, componentId, message) =>
          set((draft) => {
            const block = draft.componentDocByMessageId[messageId]?.blocks.find(
              (b) => b.id === componentId,
            );
            if (!block) return;
            const errored = block as {
              status?: "pending" | "ready" | "error";
              error?: string;
            };
            errored.status = "error";
            errored.error = message;
          }),
        clearComponentDocument: (messageId) =>
          set((draft) => {
            delete draft.componentDocByMessageId[messageId];
          }),
        markMessageAsFailed: (messageId, content) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message) return;
            message.content = content;
            message.metadata = {
              ...(message.metadata ?? {}),
              status: "failed",
            };
          }),
        startGeneration: () =>
          set((draft) => {
            draft.isPending = true;
            draft.isGenerating = true;
            draft.isTextGenerating = true;
            draft.generationEtaMsRemaining = undefined;
          }),
        stopGeneration: () =>
          set((draft) => {
            draft.isPending = false;
            draft.isGenerating = false;
            draft.isRegenerating = false;
            draft.isTextGenerating = false;
            draft.interactiveByMessageId = {};
            draft.generationEtaMsRemaining = undefined;
          }),
        finishGeneration: () =>
          set((draft) => {
            draft.isPending = false;
            draft.isGenerating = false;
            draft.isTextGenerating = false;
            draft.interactiveByMessageId = {};
            draft.generationEtaMsRemaining = undefined;
          }),
        reset: () =>
          set((draft) => {
            draft.messages = [];
            draft.summaryByMessageId = {};
            draft.generationEtaMsRemaining = undefined;
            draft.interactiveByMessageId = {};
            draft.componentDocByMessageId = {};
            draft.isPending = false;
            draft.isGenerating = false;
            draft.isTextGenerating = false;
            draft.isHighlightModeActive = false;
            draft.isInitialScrollComplete = false;
          }),
      };
    }),
  );
};

export const ChatContext = createContext<ReturnType<
  typeof createChatStore
> | null>(null);

export const useChatContext = <T,>(selector: (state: ChatStore) => T): T => {
  const store = useContext(ChatContext);
  if (!store) {
    throw new Error("Missing ChatContext.Provider in the tree");
  }
  return useStore(store, selector);
};

// Raw store handle for imperative reads/writes (getState) without subscribing —
// used by flows (e.g. generation reconnect) that must not re-render per token.
export const useChatStoreApi = () => {
  const store = useContext(ChatContext);
  if (!store) {
    throw new Error("Missing ChatContext.Provider in the tree");
  }
  return store;
};

type ChatProviderProps = React.PropsWithChildren<Partial<ChatProps>>;

export const ChatProvider = ({ children, ...props }: ChatProviderProps) => {
  const [store] = useState(() => createChatStore(props));
  return <ChatContext.Provider value={store}>{children}</ChatContext.Provider>;
};
