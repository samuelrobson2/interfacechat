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
 * cacheable prefix.
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
  return messages.map((message) => {
    if (message.role !== "assistant" || !Array.isArray(message.content)) return message;
    let changed = false;
    const content = message.content.map((part) => {
      if (!isToolCall(part) || !names.has(part.toolName)) return part;
      changed = true;
      return { ...part, input: { ...nameOf(part.input), note: LEFT_OUT } };
    });
    return changed ? ({ ...message, content } as ModelMessage) : message;
  });
}
