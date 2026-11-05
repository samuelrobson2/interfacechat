import { useState } from "react";

import {
  ChatComparisonCard,
  ChatComparisonDialog,
  ChatPillButton,
} from "@/services/chat";
import { cn } from "@/shared/lib/css";
import { useIsMobile } from "@/shared/lib/react/use-mobile";
import { toast } from "@/shared/ui/kit/sonner-toast";
import type { ChartProposal } from "../../_lib/chart-turn";
import { useResolveChartProposal } from "../model/use-resolve-chart-proposal";

/**
 * One side of the comparison. The height budget sits on a wrapper rather than
 * on the card, whose hairline is a pseudo element that would scroll out of view
 * along with the chart.
 */
function VisualizeProposalChart({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        // The padding keeps the scroll box from clipping the card's hairline.
        "w-full min-w-0 overflow-y-auto px-px",
        // Stacked mobile panels get half the viewport budget of the side-by-side desktop ones.
        isMobile ? "max-h-[32dvh]" : "max-h-[55dvh]",
      )}
    >
      {children}
    </div>
  );
}

/**
 * The choice between the chart an edit started from and the one it produced.
 *
 * The comparison opens as soon as the proposal appears; the inline button is
 * the way back to it once the dialog is dismissed or the page is reloaded.
 */
export function VisualizeChartProposal({
  proposal,
  original,
  edited,
}: {
  proposal: ChartProposal;
  original: React.ReactNode;
  edited: React.ReactNode;
}) {
  const { resolveProposal, isResolving } = useResolveChartProposal();
  const [isOpen, setIsOpen] = useState(true);

  // The shared card has no disabled state, so this guard is what keeps a second
  // click from sending a second choice. A rejected choice reopens the
  // comparison: the session stays blocked until one of the two is answered.
  const handleChoice = (choice: "keep_new" | "keep_old") => {
    if (isResolving) return;
    setIsOpen(false);
    resolveProposal({ proposalId: proposal.proposalId, choice }).catch(() => {
      setIsOpen(true);
      toast.error("Could not apply your choice. Please try again.");
    });
  };

  return (
    <div className="flex gap-4">
      <ChatPillButton onClick={() => setIsOpen(true)}>
        Review changes
      </ChatPillButton>

      <ChatComparisonDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Compare the current and the edited chart"
        description="Keep the current chart or use the edited one"
        before={
          <ChatComparisonCard
            label="Original"
            actionLabel="Keep Original"
            onAction={() => handleChoice("keep_old")}
            variant="secondary"
          >
            <VisualizeProposalChart>{original}</VisualizeProposalChart>
          </ChatComparisonCard>
        }
        after={
          <ChatComparisonCard
            label="Edited"
            actionLabel="Use This"
            onAction={() => handleChoice("keep_new")}
            variant="primary"
          >
            <VisualizeProposalChart>{edited}</VisualizeProposalChart>
          </ChatComparisonCard>
        }
      />
    </div>
  );
}
