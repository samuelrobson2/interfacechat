import { ChatConversationLayout, useChatContext } from "@/services/chat";
import {
  isChartPending,
  type ChartProposal,
  type ChartTurn,
} from "../_lib/chart-turn";
import { useChartTurns } from "../_model/use-chart-turns";
import {
  VisualizeAssistantTurn,
  VisualizeMessage,
} from "../_ui/visualize-message";
import {
  VisualizeChartCard,
  VisualizeChartError,
} from "../chart/ui/visualize-chart-card";
import { VisualizeChartSkeleton } from "../chart/ui/visualize-chart-skeleton";
import { VisualizeChartHighlight } from "../highlight/compose/visualize-chart-highlight";
import { VisualizeChartProposal } from "../proposal/compose/visualize-chart-proposal";
import { VisualizeChartActions } from "./visualize-chart-actions";

function renderProposalSlots(proposal: ChartProposal) {
  return {
    original: proposal.baseChart ? (
      <VisualizeChartCard
        block={proposal.baseChart}
        showToolbar={false}
        className="w-full"
      />
    ) : (
      <VisualizeChartError
        message="The original chart is no longer loaded."
        className="w-full"
      />
    ),
    edited: proposal.chart ? (
      <VisualizeChartCard
        block={proposal.chart}
        showToolbar={false}
        className="w-full"
      />
    ) : (
      <VisualizeChartError
        message="The edited chart could not be loaded."
        className="w-full"
      />
    ),
  };
}

export function VisualizeConversation({
  conversationRef,
  ...props
}: React.ComponentProps<"div"> & {
  conversationRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const messages = useChatContext((state) => state.messages);
  const { turnByMessageId, trailingTurn, pendingProposal, isGenerating } =
    useChartTurns();
  const isEditBlocked = isGenerating || Boolean(pendingProposal);

  const renderTurnChart = (turn?: ChartTurn) => {
    if (!turn) return undefined;
    if (isChartPending(turn.status)) return <VisualizeChartSkeleton />;
    if (turn.status === "failed") {
      return <VisualizeChartError message={turn.error} />;
    }
    if (turn.status === "awaiting_choice") {
      const proposal = turn.proposal;
      if (!proposal) return undefined;
      const { original, edited } = renderProposalSlots(proposal);
      return (
        <VisualizeChartProposal
          key={proposal.proposalId}
          proposal={proposal}
          original={original}
          edited={edited}
        />
      );
    }
    const chart = turn.chart;
    if (!chart) return undefined;

    return (
      <VisualizeChartHighlight
        block={chart}
        isEditBlocked={isEditBlocked}
        renderChart={(bind) => <VisualizeChartCard block={chart} {...bind} />}
      />
    );
  };

  const renderActions = (turn?: ChartTurn) =>
    turn?.status === "ready" && turn.chart ? (
      <VisualizeChartActions
        chartId={turn.chart.chartId}
        showOnDataset={turn.chart.showOnDataset}
        isEditBlocked={isEditBlocked}
      />
    ) : undefined;

  return (
    <ChatConversationLayout contentRef={conversationRef} {...props}>
      {messages.map((message) => {
        const turn = turnByMessageId.get(message.message_id);

        return (
          <VisualizeMessage
            key={message.message_id}
            message={message}
            turn={turn}
            isGenerating={isGenerating}
            actions={renderActions(turn)}
            chart={renderTurnChart(turn)}
          />
        );
      })}

      {trailingTurn && (
        <VisualizeAssistantTurn
          turn={trailingTurn}
          isGenerating={isGenerating}
          actions={renderActions(trailingTurn)}
          chart={renderTurnChart(trailingTurn)}
        />
      )}
    </ChatConversationLayout>
  );
}
