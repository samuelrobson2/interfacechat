import { useState } from "react";
import {
  ChatComposerAttachButton,
  ChatComposerSendButton,
  ChatSuggestionCard,
  ChatTextareaComposer,
} from "@/services/chat";
import aiPoster from "@/shared/assets/images/ai-avatar.png";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";

// Pinned chat — stays mounted regardless of which tab is open in the main
// view. Each turn quotes a passage from the seed document verbatim; clicking
// a turn asks the main view to open that document and highlight the quote,
// the same reference-and-highlight technique from the archived paper-chat
// demo (chat/_compose/mock-paper.tsx), generalized to any open document.

const USER_QUERY = "Can you walk me through the 'Attention Is All You Need' paper?";

type Turn = {
  id: string;
  section: string;
  quote: string;
  explanation: string;
};

const TURNS: Turn[] = [
  {
    id: "abstract",
    section: "Abstract",
    quote:
      "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    explanation:
      "The headline claim, right in the abstract: drop RNNs and CNNs altogether. Everything that relates one token to another now happens through attention.",
  },
  {
    id: "intro",
    section: "1 · Introduction",
    quote:
      "This inherently sequential nature precludes parallelization within training examples",
    explanation:
      "The problem being solved — RNNs process tokens one after another, so a single sequence can't be spread across hardware.",
  },
  {
    id: "attention",
    section: "3.2 · Attention",
    quote:
      "An attention function can be described as mapping a query and a set of key-value pairs to an output",
    explanation:
      "The core operation: a query is compared against a set of keys to produce weights, and the output is a weighted sum of the values.",
  },
  {
    id: "results",
    section: "6.2 · Results",
    quote:
      "outperforms the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4",
    explanation:
      "The payoff — a new state of the art on English-to-German translation.",
  },
];

// Every quote this document has, exported so the main view can keep them all
// highlighted (not just the active one) while the seed document is open.
export const SEED_DOCUMENT_QUOTES = TURNS.map((turn) => turn.quote);

// Offers for other views to open as their own tabs — not verbatim prompts to
// send, so these are action cards rather than composer text.
const OTHER_VIEW_SUGGESTIONS = [
  "Show citation trend as a graph",
  "Visualize this in a graph database",
];

export function ChatPanel({
  seedDocId,
  activeQuote,
  onReference,
  onOpenGraph,
}: {
  seedDocId: string;
  activeQuote: string | null;
  onReference: (docId: string, quote: string) => void;
  onOpenGraph: () => void;
}) {
  const [value, setValue] = useState("");
  const activeTurnId = TURNS.find((t) => t.quote === activeQuote)?.id ?? null;

  return (
    <aside className="flex w-[380px] shrink-0 flex-col border-r border-gray-2 bg-background-primary">
      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-6 p-4">
          <div className="self-end max-w-[85%] rounded-[16px] bg-gray-2 px-3.5 py-2">
            <Text variant="caption">{USER_QUERY}</Text>
          </div>

          <div className="flex gap-2.5">
            <img
              src={aiPoster}
              alt=""
              className="mt-1 size-6 shrink-0 rounded-full object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <Text variant="caption" color="secondary">
                Of course — the paper's open on the left. I'll go through it
                section by section and highlight the passage I'm discussing.
              </Text>

              {TURNS.map((turn) => (
                <button
                  key={turn.id}
                  type="button"
                  onClick={() => onReference(seedDocId, turn.quote)}
                  className={cn(
                    "flex flex-col gap-2 rounded-[12px] p-2.5 text-left transition-colors",
                    activeTurnId === turn.id ? "bg-gray-1" : "hover:bg-gray-1/60",
                  )}
                >
                  <Text variant="caption">{turn.explanation}</Text>
                  <span className="flex flex-col gap-1 border-l-2 border-blue-4 pl-2.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          activeTurnId === turn.id ? "bg-[#f0c000]" : "bg-gray-3",
                        )}
                      />
                      <Text variant="small" color="secondary">
                        {turn.section}
                      </Text>
                    </span>
                    <Text variant="small" color="secondary" className="italic">
                      “{turn.quote}”
                    </Text>
                  </span>
                </button>
              ))}

              <div className="grid grid-cols-2 gap-2">
                {OTHER_VIEW_SUGGESTIONS.map((suggestion) => (
                  <ChatSuggestionCard
                    key={suggestion}
                    variant="plain"
                    size="s"
                    showArrow={false}
                    suggestion={suggestion}
                    onClick={onOpenGraph}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 p-3">
        <ChatTextareaComposer
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask a follow-up…"
          frameClassName="h-[120px]"
          leftActions={<ChatComposerAttachButton />}
          rightActions={<ChatComposerSendButton active={value.trim().length > 0} />}
        />
      </div>
    </aside>
  );
}
