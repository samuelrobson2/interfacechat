import { ChatLabWorkspace } from "./chat-lab.workspace";

/**
 * Chat Lab lives entirely in this layout so starter → session never remounts
 * the page. Child routes only exist to match `/chat-lab` and `/chat-lab/:id`.
 */
function ChatLabLayout() {
  return <ChatLabWorkspace />;
}

export const Component = ChatLabLayout;
