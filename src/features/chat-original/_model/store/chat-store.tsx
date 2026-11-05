import type { ApiSchemas } from "@/shared/api/schema";
import { createContext, useContext, useState } from "react";
import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";

type ChatMessage = ApiSchemas["ChatMessageDto"];
type ChatAttachment = ApiSchemas["ChatAttachmentDto"];
type MessageImagePlan = ApiSchemas["ChatSseImagePlanEventDto"];
type MessageQuote = ApiSchemas["ChatQuoteDto"];
type HighlightSuggestionSide = "left" | "right";
type HighlightSuggestionPlacement = "above" | "below";

interface ChatState {
  messages: ChatMessage[];
  isPending: boolean;
  isGenerating: boolean;
  isTextGenerating: boolean;
  isRegenerating: boolean;
  isLoadingMore: boolean;
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
  setMessageImagePlan: (messageId: string, plan: MessageImagePlan) => void;
  clearMessageImagePlan: (messageId: string) => void;
  setMessageQuote: (messageId: string, quote: MessageQuote) => void;
  clearMessageQuote: (messageId: string) => void;
  setMessageApiPreviewUrl: (messageId: string, url: string) => void;
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
  isPending: false,
  isGenerating: false,
  isTextGenerating: false,
  isRegenerating: false,
  isLoadingMore: false,
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
            const message = draft.messages.find((m) => m.message_id === messageId);
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
        setMessageImagePlan: (messageId, plan) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message) return;
            message.metadata = { ...(message.metadata ?? {}), image_plan: plan };
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
        markMessageAsFailed: (messageId, content) =>
          set((draft) => {
            const message = draft.messages.find(
              (m) => m.message_id === messageId,
            );
            if (!message) return;
            message.content = content;
            message.metadata = { ...(message.metadata ?? {}), status: "failed" };
          }),
        startGeneration: () =>
          set((draft) => {
            draft.isPending = true;
            draft.isGenerating = true;
            draft.isTextGenerating = true;
          }),
        stopGeneration: () =>
          set((draft) => {
            draft.isPending = false;
            draft.isGenerating = false;
            draft.isRegenerating = false;
            draft.isTextGenerating = false;
          }),
        finishGeneration: () =>
          set((draft) => {
            draft.isPending = false;
            draft.isGenerating = false;
            draft.isTextGenerating = false;
          }),
        reset: () =>
          set((draft) => {
            draft.messages = [];
            draft.isPending = false;
            draft.isGenerating = false;
            draft.isTextGenerating = false;
            draft.isHighlightModeActive = false;
          }),
      };
    }),
  );
};

export const ChatContext = createContext<ReturnType<typeof createChatStore> | null>(null);

export const useChatContext = <T,>(selector: (state: ChatStore) => T): T => {
  const store = useContext(ChatContext);
  if (!store) {
    throw new Error("Missing ChatContext.Provider in the tree");
  }
  return useStore(store, selector);
};

type ChatProviderProps = React.PropsWithChildren<Partial<ChatProps>>;

export const ChatProvider = ({ children, ...props }: ChatProviderProps) => {
  const [store] = useState(() => createChatStore(props));
  return <ChatContext.Provider value={store}>{children}</ChatContext.Provider>;
};
