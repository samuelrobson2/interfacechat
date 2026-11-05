import {
  readSpecHeading,
  toVegaPayload,
  withoutSpecHeading,
  type VegaPayload,
} from "@/services/plot";
import type { ApiSchemas } from "@/shared/api/schema";

type ChartArtifactDto = ApiSchemas["ChartOrchestratorChartDto"];
type ChartProposalDto = ApiSchemas["ChartPendingProposalDto"];
type ChatMessageDto = ApiSchemas["ChatMessageDto"];

type ChartStatus = ApiSchemas["ChartJobResponseDto"]["status"];

/** A chart the conversation produced, ready for Vega. */
export type ChartBlock = VegaPayload & {
  chartId?: string;
  title?: string;
  subtitle?: string;
  showOnDataset?: boolean;
};

/**
 * An edit the agent proposes instead of applying. The user keeps the chart the
 * edit started from (`baseChart`) or takes the proposed one (`chart`).
 */
export type ChartProposal = {
  proposalId: string;
  baseChartId?: string;
  /** Filled from the transcript — a proposal names its base chart by id only. */
  baseChart?: ChartBlock;
  chart?: ChartBlock;
  textBefore?: string;
  textAfter?: string;
};

/**
 * One assistant turn of a chart conversation, whatever produced it — a job
 * still in flight or a message restored from the transcript.
 */
export type ChartTurn = {
  status: ChartStatus;
  textBefore?: string;
  textAfter?: string;
  chart?: ChartBlock;
  proposal?: ChartProposal;
  error?: string;
};

const PENDING_STATUSES: ChartStatus[] = ["queued", "running"];

export const isChartPending = (status: ChartStatus) =>
  PENDING_STATUSES.includes(status);

/** Empty strings are how the backend spells "no text" — treat them as absent. */
const readText = (value?: string | null) => value?.trim() || undefined;

export const parseChartArtifact = (
  artifact?: ChartArtifactDto | null,
): ChartBlock | undefined => {
  if (!artifact?.spec) return undefined;

  const heading = readSpecHeading(artifact.spec);

  return {
    chartId: artifact.chart_id,
    title: heading.text || undefined,
    subtitle: heading.subtitle || undefined,
    showOnDataset: Boolean(artifact.show_on_dataset),
    ...toVegaPayload(withoutSpecHeading(artifact.spec), artifact.plot_data),
  };
};

export const parseProposal = (
  proposal?: ChartProposalDto | null,
): ChartProposal | undefined => {
  if (!proposal) return undefined;

  return {
    proposalId: proposal.proposal_id,
    baseChartId: proposal.base_chart_id ?? undefined,
    chart: parseChartArtifact(proposal.chart),
    textBefore: readText(proposal.text_before),
    textAfter: readText(proposal.text_after),
  };
};

/**
 * The turn a persisted reply renders.
 *
 * `system` rows are replies the server wrote on its own — the note left behind
 * once an edit proposal is settled — so only the user side is excluded here.
 * Their prose arrives in `content` rather than in `text_before`.
 */
export const chartTurnFromMessage = (
  message: ChatMessageDto,
): ChartTurn | undefined => {
  if (message.role === "user") return undefined;

  const textBefore = readText(message.text_before) ?? readText(message.content);
  const chart = parseChartArtifact(message.chart);
  const textAfter = readText(message.text_after);
  if (!textBefore && !textAfter && !chart) return undefined;

  return { status: "ready", textBefore, textAfter, chart };
};
