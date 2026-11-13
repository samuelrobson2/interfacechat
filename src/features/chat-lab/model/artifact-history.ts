import type { ModelMessage } from "ai";

/**
 * Only the latest version of each interface stays in the model's context.
 *
 * Every time the model fills an interface (fill_document, fill_table,
 * write_interface …) the whole version is in that tool call's input, so a
 * document written and rewritten five times would be in the history five
 * times, mostly out of date. Before the history goes to the model, each of
 * those inputs is replaced by a fixed note, except the newest one of each
 * kind, and that one too when the interface is open, since its current
 * contents are sent separately at the end of the prompt.
 *
 * The note is the same bytes every turn (it names only the tool and the
 * title), so the history before the latest change stays a cacheable prefix.
 * The calls and their short results stay, so the model still knows what it did.
 * Small edits (update_interface's operations) are left as they are.
 *
 * Read by the chat API (`api/_ai-chat-lab.ts`), so it imports only types.
 */

export type ArtifactTools = {
  /** Tool name → which interface it writes ("document", "table", … or "write" for write_interface). */
  writes: Record<string, string>;
  /** The interface that's open now, whose current contents are sent anyway. */
  open: string | null;
};

const SUPERSEDED = "Earlier version, left out of context. The latest version is the one that counts.";
const OPEN = "Left out of context: the current contents of this interface are given at the end.";

type ToolCallPart = { type: "tool-call"; toolName: string; input: unknown };

const isToolCall = (part: unknown): part is ToolCallPart =>
  typeof part === "object" && part !== null && (part as { type?: unknown }).type === "tool-call";

const titleOf = (input: unknown) => {
  const title = (input as { title?: unknown } | null)?.title;
  return typeof title === "string" ? title : undefined;
};

export function compactArtifactHistory(messages: ModelMessage[], { writes, open }: ArtifactTools): ModelMessage[] {
  // The newest call per interface, found walking back from the end.
  const newest = new Set<ToolCallPart>();
  const seen = new Set<string>();
  for (let index = messages.length - 1; index >= 0; index--) {
    const content = messages[index]!.content;
    if (!Array.isArray(content)) continue;
    for (let part = content.length - 1; part >= 0; part--) {
      const call = content[part];
      if (!isToolCall(call) || !(call.toolName in writes)) continue;
      const kind = writes[call.toolName]!;
      if (!seen.has(kind)) {
        seen.add(kind);
        newest.add(call);
      }
    }
  }

  return messages.map((message) => {
    if (message.role !== "assistant" || !Array.isArray(message.content)) return message;
    let changed = false;
    const content = message.content.map((part) => {
      if (!isToolCall(part) || !(part.toolName in writes)) return part;
      const kind = writes[part.toolName]!;
      const keep = newest.has(part) && kind !== open;
      if (keep) return part;
      changed = true;
      const title = titleOf(part.input);
      return { ...part, input: { ...(title ? { title } : {}), note: newest.has(part) ? OPEN : SUPERSEDED } };
    });
    return changed ? ({ ...message, content } as ModelMessage) : message;
  });
}
