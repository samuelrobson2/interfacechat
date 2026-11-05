const chatScrollBus = new EventTarget();
const USER_MESSAGE_SENT = "userMessageSent";

// Decouples the send flow from the scroll container: the messaging hooks emit
// after a user turn starts, the chat surface subscribes to pin the message.
export const userMessageSentEvent = {
  emit: (messageId: string) =>
    chatScrollBus.dispatchEvent(
      new CustomEvent(USER_MESSAGE_SENT, { detail: messageId }),
    ),
  subscribe: (fn: (messageId: string) => void) => {
    const handler = (e: Event) => fn((e as CustomEvent<string>).detail);
    chatScrollBus.addEventListener(USER_MESSAGE_SENT, handler);
    return () => chatScrollBus.removeEventListener(USER_MESSAGE_SENT, handler);
  },
};
