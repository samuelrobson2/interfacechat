import type { ChatLabMessage } from "./chat-lab-store";

export type AgentActivityKind = "thinking" | "searching" | "writing";

export type AgentActivity = {
  kind: AgentActivityKind;
  /** What the search is looking for, once the tool reports it. */
  query?: string;
  /** Sites the search has opened, newest last. */
  sources?: string[];
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const searchFrom = (part: ChatLabMessage["parts"][number]) => {
  if (!part.type.startsWith("tool-") && part.type !== "dynamic-tool") return null;
  const record = part as {
    input?: { query?: string };
    output?: {
      action?: { query?: string };
      sources?: { url?: string }[];
    };
  };
  const query = record.output?.action?.query ?? record.input?.query;
  const sources = (record.output?.sources ?? [])
    .map((source) => (source.url ? hostOf(source.url) : ""))
    .filter(Boolean);
  return { query, sources: [...new Set(sources)].slice(0, 4) };
};

/** What the agent is doing on the turn that is still in flight. */
export function agentActivity(
  messages: ChatLabMessage[],
  status: string,
): AgentActivity | null {
  if (status !== "submitted" && status !== "streaming") return null;

  const message = messages.at(-1);
  if (!message || message.role !== "assistant") {
    return { kind: "thinking" };
  }

  const writing = message.parts.some(
    (part) => part.type === "text" && part.text.trim().length > 0,
  );
  if (writing) return { kind: "writing" };

  const searches = message.parts
    .map(searchFrom)
    .filter((search): search is NonNullable<typeof search> => search != null);
  if (searches.length > 0) {
    const latest = searches.at(-1)!;
    return {
      kind: "searching",
      query: latest.query,
      sources: latest.sources,
    };
  }

  return { kind: "thinking" };
}

export function reasoningText(message: ChatLabMessage) {
  return message.parts
    .filter((part) => part.type === "reasoning")
    .map((part) => part.text.replace(/\*\*/g, "").trim())
    .filter(Boolean)
    .join("\n\n");
}
