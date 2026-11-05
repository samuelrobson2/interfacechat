import { useState } from "react";

import {
  ChatComposerAttachButton,
  ChatComposerSendButton,
  ChatTextareaComposer,
} from "@/services/chat";
import aiPoster from "@/shared/assets/images/ai-avatar.png";
import { cn } from "@/shared/lib/css";
import { Text } from "@/shared/ui/kit/text";
import { PaperPdfPanel } from "./mock-paper-pdf";

// DEV-ONLY "paper explainer" chat. The real paper PDF sits in the right panel;
// the assistant walks through it on the left. Each turn quotes a passage
// verbatim — that quote is matched against the PDF's text layer, so the exact
// text gets highlighted and scrolled into view as the turn becomes active.

export const PAPER_TITLE = "Attention Is All You Need";
const PAPER_AUTHORS =
  "Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin — NeurIPS 2017";
const PAPER_URL = "https://arxiv.org/abs/1706.03762";

type PaperTurn = {
  id: string;
  section: string;
  // Verbatim text from the PDF — used both as the on-screen excerpt and as the
  // string we locate + highlight in the rendered PDF.
  quote: string;
  explanation: string;
};

const USER_QUERY = "Can you walk me through the 'Attention Is All You Need' paper?";

const PAPER_TURNS: PaperTurn[] = [
  {
    id: "abstract",
    section: "Abstract",
    quote:
      "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    explanation:
      "The headline claim, right in the abstract: drop RNNs and CNNs altogether. Everything that relates one token to another now happens through attention — which is what makes it both simpler and far more parallelizable.",
  },
  {
    id: "intro",
    section: "1 · Introduction",
    quote:
      "This inherently sequential nature precludes parallelization within training examples",
    explanation:
      "Here's the problem they're solving. RNNs process tokens one after another, so you can't spread a single sequence across your hardware. Long sequences make that bottleneck painful — the motivation for ditching recurrence.",
  },
  {
    id: "stacks",
    section: "3.1 · Encoder and Decoder Stacks",
    quote:
      "The first is a multi-head self-attention mechanism, and the second is a simple, position-wise fully connected feed-forward network.",
    explanation:
      "The structure itself: a stack of identical layers, each just self-attention plus a small feed-forward network (wrapped in residual connections). No recurrence anywhere in the stack.",
  },
  {
    id: "attention",
    section: "3.2 · Attention",
    quote:
      "An attention function can be described as mapping a query and a set of key-value pairs to an output",
    explanation:
      "This is the core operation. A query is compared against a set of keys to produce weights, and the output is a weighted sum of the values — a soft, learnable lookup over the whole sequence at once.",
  },
  {
    id: "multihead",
    section: "3.2.2 · Multi-Head Attention",
    quote:
      "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.",
    explanation:
      "Rather than one attention pass, they run several in parallel. Each head can specialise — one might track syntax, another long-range references — and a single averaged head would blur all of that together.",
  },
  {
    id: "results",
    section: "6.2 · Results",
    quote:
      "outperforms the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4",
    explanation:
      "The payoff: a new state of the art on English-to-German, at a fraction of the training cost of previous architectures — which is why this design took over.",
  },
];

// Stable list of every quote, so all passages stay highlighted in the PDF.
const QUOTES = PAPER_TURNS.map((turn) => turn.quote);

export function PaperExperience() {
  const [value, setValue] = useState("");
  // Nothing is active until the reader clicks a quote — scrolling is free and
  // never moves the paper on its own.
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeQuote =
    PAPER_TURNS.find((turn) => turn.id === activeId)?.quote ?? "";

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1700px] flex-1 gap-40 pl-28 pr-8">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-visible">
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-8 py-6">
            <div className="self-end max-w-[80%] rounded-[18px] bg-gray-2 px-4 py-2.5">
              <Text variant="body">{USER_QUERY}</Text>
            </div>

            <div className="flex gap-3">
              <img
                src={aiPoster}
                alt=""
                className="mt-1 size-7 shrink-0 rounded-full object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-8">
                <Text variant="body" color="secondary">
                  Of course — the paper's on the right. I'll go through it
                  section by section and highlight the passage I'm talking about
                  as we go.
                </Text>

                {PAPER_TURNS.map((turn) => (
                  <button
                    key={turn.id}
                    type="button"
                    onClick={() => setActiveId(turn.id)}
                    className={cn(
                      "flex scroll-mt-24 flex-col gap-2.5 rounded-[14px] p-3 text-left transition-colors",
                      activeId === turn.id ? "bg-gray-1" : "hover:bg-gray-1/60",
                    )}
                  >
                    {/* Lead with the walkthrough; the quote backs it up. */}
                    <Text variant="label">{turn.explanation}</Text>
                    <span className="flex flex-col gap-1 border-l-2 border-blue-4 pl-3">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "size-1.5 rounded-full transition-colors",
                            activeId === turn.id ? "bg-[#f0c000]" : "bg-gray-3",
                          )}
                        />
                        <Text variant="caption" color="secondary">
                          {turn.section}
                        </Text>
                      </span>
                      <Text variant="caption" color="secondary" className="italic">
                        “{turn.quote}”
                      </Text>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 pb-8 pt-2">
          <ChatTextareaComposer
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ask a follow-up about the paper…"
            frameClassName="h-[104px]"
            leftActions={<ChatComposerAttachButton />}
            rightActions={
              <ChatComposerSendButton active={value.trim().length > 0} />
            }
          />
        </div>
      </div>

      <PaperPdfPanel
        quotes={QUOTES}
        activeQuote={activeQuote}
        title={PAPER_TITLE}
        authors={PAPER_AUTHORS}
        url={PAPER_URL}
      />
    </div>
  );
}
