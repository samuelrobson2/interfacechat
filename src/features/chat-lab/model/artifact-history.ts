import type { ModelMessage } from "ai";

/**
 * Interfaces reach the model in one place only: the current contents of the
 * ones in use, sent at the end of the prompt each turn (the one used last, the
 * others in a window, minimized or in a recent reply, and the tracked ones).
 * Closed interfaces aren't sent at all, and no interface is ever sent twice.
 *
 * So the history keeps no versions. Every write the model made (fill_*,
 * write_interface, update_interface) keeps its call, so the model still knows
 * what it did, but its contents are replaced by a fixed note naming only the
 * title and id. The note is the same bytes every turn, and a call's note never
 * changes once written, so the whole history before the latest turn stays a
 * cacheable prefix. The model's reasoning from earlier turns is left out too.
 *
 * Read by the chat API (`api/_ai-chat-lab.ts`), so it imports only types.
 */

export type ArtifactTools = {
  /** Tool names that write an interface: fill_document, write_interface, update_interface … */
  writes: Iterable<string>;
};

export const LEFT_OUT = "Contents left out of the history. If this interface is still in use, what it holds now is given at the end of the conversation; if not, it was closed and isn't in context.";

type ToolCallPart = { type: "tool-call"; toolName: string; input: unknown };

const isToolCall = (part: unknown): part is ToolCallPart =>
  typeof part === "object" && part !== null && (part as { type?: unknown }).type === "tool-call";

/** A part without the provider's id for its stored item: sent as content, not as a reference to that item. */
function withoutStoredId(part: unknown): unknown {
  const options = (part as { providerOptions?: { openai?: Record<string, unknown> } }).providerOptions;
  if (!options?.openai || !("itemId" in options.openai)) return part;
  const openai = Object.fromEntries(Object.entries(options.openai).filter(([key]) => key !== "itemId"));
  return { ...(part as object), providerOptions: { ...options, openai } };
}

/** What names the interface a write went to: its title, and its id when the call gave one. */
function nameOf(input: unknown) {
  const fields = (input ?? {}) as { title?: unknown; id?: unknown };
  return {
    ...(typeof fields.title === "string" ? { title: fields.title } : {}),
    ...(typeof fields.id === "string" ? { id: fields.id } : {}),
  };
}

export function compactArtifactHistory(messages: ModelMessage[], { writes }: ArtifactTools): ModelMessage[] {
  const names = new Set(writes);
  // The model's reasoning matters within its own turn; from earlier turns it's thousands of characters a reply,
  // resent every turn, that the model doesn't use. The turn in progress (after the latest message) keeps it.
  // Without it, an earlier part can't be a reference to the provider's stored item (which would need its
  // reasoning), so it goes as plain content; and a built-in search's call and results go too, as the reply says
  // what it found.
  const current = messages.map((message) => message.role).lastIndexOf("user");
  return messages.flatMap((message, index) => {
    if (index < current && (message.role === "assistant" || message.role === "tool") && Array.isArray(message.content)) {
      const content = (message.content as unknown[]).flatMap((part) => {
        const typed = part as { type?: unknown; providerExecuted?: unknown };
        if (typed.type === "reasoning" || typed.providerExecuted === true) return [];
        const plain = withoutStoredId(part);
        return [isToolCall(plain) && names.has(plain.toolName) ? { ...plain, input: { ...nameOf(plain.input), note: LEFT_OUT } } : plain];
      });
      return content.length ? [{ ...message, content } as ModelMessage] : [];
    }
    if (message.role !== "assistant" || !Array.isArray(message.content)) return [message];
    let changed = false;
    const content = message.content.flatMap((part) => {
      if (!isToolCall(part) || !names.has(part.toolName)) return [part];
      changed = true;
      return [{ ...part, input: { ...nameOf(part.input), note: LEFT_OUT } }];
    });
    if (!changed) return [message];
    return content.length ? [{ ...message, content } as ModelMessage] : [];
  });
}
