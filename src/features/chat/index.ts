export { NewChatView } from "./new-chat-view";

// Public API for the pieces the auto-interface editor reuses. Upstream those
// components live in the same feature as the editor (`features/chat/interface`),
// so they were plain relative imports; here the editor sits in
// `features/auto-interface`, and a cross-feature import has to come through here.
export { CHAT_ALLOWED_ATTACHMENT_CONTENT_TYPES } from "./_model/messaging/use-upload-chat-attachments";
export { ChatAiAvatar } from "./_ui/chat-ai-avatar";
export {
  ChatComposerLayout,
  ChatHeader,
  ChatInputLayout,
  ChatLayout,
  ChatQuoteBlock,
} from "./_ui/chat-layout";
export {
  CustomFollowupTextarea,
  FollowupBackButton,
  FollowupSuggestionButton,
} from "./_ui/chat-followup-buttons";
export { ChatAssistantMarkdown } from "./message/ui/chat-assistant-markdown";
export { ChatAssistantReasoning } from "./message/ui/chat-assistant-message";
export {
  ChatUserMessage,
  ChatUserMessageLayout,
} from "./message/ui/chat-user-message";
