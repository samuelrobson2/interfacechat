import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { chatQueryOptions, useChatContext } from "@/services/chat";
import { fetchClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import {
  chartTurnFromMessage,
  isChartPending,
  parseChartArtifact,
  parseProposal,
  type ChartBlock,
  type ChartTurn,
} from "../_lib/chart-turn";
import { useRefreshChartTranscript } from "./use-refresh-chart-transcript";
import { useChartSession, useChartSessionId } from "./use-chart-session";

type ChatMessage = ApiSchemas["ChatMessageDto"];
type ChartSession = ApiSchemas["ChartSessionDto"];
type ChartJob = ApiSchemas["ChartJobResponseDto"];

const CHART_JOB_PATH = "/chart-sessions/{sessionId}/jobs/{jobId}";
const POLL_INTERVAL_MS = 1500;

function useChartJob() {
  const sessionId = useChartSessionId();
  const activeJob = useChartSession()?.data?.active_job;
  const refreshTranscript = useRefreshChartTranscript();
  const setIsGenerating = useChatContext((state) => state.setIsGenerating);
  const jobId = activeJob?.job_id ?? "";

  const { data: job } = useQuery({
    queryKey: chatQueryOptions.chartJob(sessionId, jobId).queryKey,
    queryFn: async () => {
      const { data } = await fetchClient.GET(CHART_JOB_PATH, {
        params: { path: { sessionId, jobId } },
      });
      if (!data) throw new Error("The chart job could not be read");

      if (!isChartPending(data.status)) {
        await refreshTranscript();
        setIsGenerating(false);
      }

      return data;
    },
    enabled: Boolean(activeJob),
    refetchInterval: ({ state }) =>
      state.data && !isChartPending(state.data.status)
        ? false
        : POLL_INTERVAL_MS,
  });

  return job;
}

const collectCharts = (messages: ChatMessage[]) => {
  const chartById = new Map<string, ChartBlock>();

  for (const message of messages) {
    const chart = parseChartArtifact(message.chart);
    if (chart?.chartId) chartById.set(chart.chartId, chart);
  }

  return chartById;
};

const withBaseChart = (
  turn: ChartTurn,
  chartById: Map<string, ChartBlock>,
): ChartTurn => {
  const proposal = turn.proposal;
  if (!proposal?.baseChartId) return turn;

  const baseChart = chartById.get(proposal.baseChartId);
  if (!baseChart) return turn;

  return { ...turn, proposal: { ...proposal, baseChart } };
};

const readTrailingTurn = ({
  messages,
  session,
  job,
  isSending,
}: {
  messages: ChatMessage[];
  session?: ChartSession;
  job?: ChartJob;
  isSending: boolean;
}): ChartTurn | undefined => {
  const lastMessage = messages.at(-1);

  const proposal =
    (lastMessage && parseProposal(lastMessage.pending_proposal)) ??
    parseProposal(job?.result?.pending_proposal);
  if (proposal) {
    return {
      status: "awaiting_choice",
      textBefore: proposal.textBefore,
      textAfter: proposal.textAfter,
      proposal,
    };
  }

  if (job) {
    // The reply is pulled into the transcript before the job is allowed to
    // settle, so a ready job has nothing left of its own to show.
    if (job.status === "ready") return undefined;
    return { status: job.status, error: job.error ?? undefined };
  }

  // The session knows a turn is in flight before the first poll answers, and
  // the send itself before the job even has an id.
  if (session?.active_job) return { status: session.active_job.status };
  if (isSending) return { status: "queued" };

  // A failure only belongs to the prompt still waiting for its answer.
  if (session?.generation_status === "failed" && lastMessage?.role === "user") {
    return { status: "failed" };
  }

  return undefined;
};

/** Everything the chart conversation renders, assembled for one pass. */
export function useChartTurns() {
  const { data: session } = useChartSession();
  const messages = useChatContext((state) => state.messages);
  const isSending = useChatContext((state) => state.isGenerating);
  const job = useChartJob();

  return useMemo(() => {
    const chartById = collectCharts(messages);

    const turnByMessageId = new Map(
      messages.flatMap((message) => {
        const turn = chartTurnFromMessage(message);
        return turn
          ? [[message.message_id, withBaseChart(turn, chartById)] as const]
          : [];
      }),
    );

    const trailing = readTrailingTurn({ messages, session, job, isSending });
    const trailingTurn = trailing && withBaseChart(trailing, chartById);

    const turns = [
      ...turnByMessageId.values(),
      ...(trailingTurn ? [trailingTurn] : []),
    ];

    return {
      turnByMessageId,
      trailingTurn,
      pendingProposal: turns.find((turn) => turn.proposal)?.proposal,
      isGenerating:
        isSending || turns.some((turn) => isChartPending(turn.status)),
    };
  }, [messages, session, job, isSending]);
};
