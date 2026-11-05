import {
  useDownloadFinetuneWeights,
  useFinetuneJobConfigQuery,
  useFinetuneJobMetricsSuspenseQuery,
} from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import type { ApiSchemas } from "@/shared/api/schema";
import { ChevronRightIcon } from "@/shared/assets/icons/outlined/ChevronRight";
import { DownloadIconNormal } from "@/shared/assets/icons/outlined/DownloadNormal";
import { Button } from "@/shared/ui/kit/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { Text } from "@/shared/ui/kit/text";
import { useState } from "react";
import { hasMetricData, buildXAxisTicks } from "../lib/metrics-chart-helpers";
import type {
  ChartPoint,
  FinetuneStepMetricWithDpo,
  MetricCard,
  WinRateBar,
} from "../model/metrics-types";
import autoScientistImage from "@/shared/assets/images/autoscientist.png";
import togetherAiImage from "@/shared/assets/images/together-ai.svg";
import { WinRatesSection } from "../ui/fine-tune/win-rates-section";
import { MetricCardView } from "../ui/fine-tune/metric-card-view";
import { AutoscientistConfigDialog } from "../ui/fine-tune/autoscientist-config-dialog";
import { DatasetMeasureSectionTitle } from "./dataset-measure-section-title";

function getMetricCardsGridClass(cardsCount: number): string {
  if (cardsCount >= 3) {
    return "grid grid-cols-1 gap-8 xl:grid-cols-3";
  }

  return "grid grid-cols-1 gap-8 xl:grid-cols-2";
}

export function DatasetFinetuneMetricsContent({
  datasetId,
  jobId,
  finetunes,
  onSelectJobId,
}: {
  datasetId: string;
  jobId: string;
  finetunes: ApiSchemas["DatasetFinetuneSummaryDto"][];
  onSelectJobId: (jobId: string) => void;
}) {
  const selectedFinetune = finetunes.find(
    (finetune) => finetune.job_id === jobId,
  );
  const { data: metrics } = useFinetuneJobMetricsSuspenseQuery(
    datasetId,
    jobId,
    "succeeded",
  );
  const trainingCurves = (metrics?.training_curves ??
    []) as FinetuneStepMetricWithDpo[];
  const winRates = metrics?.win_rates;
  const { downloadFinetuneWeights, isPending: isDownloadPending } =
    useDownloadFinetuneWeights();
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const { data: jobConfig } = useFinetuneJobConfigQuery(
    datasetId,
    jobId,
    isConfigDialogOpen,
  );
  const configText = jobConfig?.best_job_config
    ? JSON.stringify(jobConfig.best_job_config, null, 2)
    : "";

  const handleWeightsExport = async () => {
    try {
      await downloadFinetuneWeights(datasetId, jobId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not download weights"));
    }
  };

  const handleCopyConfig = async () => {
    if (!configText) return;
    try {
      await navigator.clipboard.writeText(configText);
      toast.success("Config copied to clipboard");
    } catch {
      toast.error("Could not copy config");
    }
  };

  const chartData: ChartPoint[] = trainingCurves.map((m) => ({
    step: m.step,
    trainLoss: m.train_loss,
    validationLoss: m.val_loss,
    learningRate: m.learning_rate,
    gradNorm: m.gradient_norm,
    trainKlChosen: m.train_kl_chosen ?? null,
    trainKlRejected: m.train_kl_rejected ?? null,
    trainRewardChosen: m.train_reward_chosen ?? null,
    trainRewardRejected: m.train_reward_rejected ?? null,
    trainRewardAccuracy: m.train_reward_accuracy ?? null,
    trainRewardMargin: m.train_reward_margin ?? null,
    trainLogpChosen: m.train_logp_chosen ?? null,
    trainLogpRejected: m.train_logp_rejected ?? null,
  }));
  const xAxisTicks = buildXAxisTicks(chartData);
  const shouldShowApproxKl = hasMetricData(chartData, "trainKlChosen");
  const shouldShowReward = hasMetricData(chartData, "trainRewardChosen");
  const shouldShowLogP = hasMetricData(chartData, "trainLogpChosen");

  const trainEvalLearningRateCard: MetricCard = {
    id: "finetune-learning-rate",
    title: "Learning Rate",
    tooltipTitle: "Learning Rate",
    gradientColor: "var(--color-rose-1)",
    gradientOpacity: 1,
    legendItems: [{ label: "Train/Loss", color: "var(--color-rose-2)" }],
    series: [
      {
        dataKey: "learningRate",
        stroke: "var(--color-rose-2)",
        label: "Train/Loss",
      },
    ],
  };

  const trainEvalGradNormCard: MetricCard = {
    id: "finetune-grad-norm",
    title: "Gradient norm",
    tooltipTitle: "Gradient norm",
    gradientColor: "var(--color-blue-2)",
    gradientOpacity: 1,
    legendItems: [{ label: "Train/Loss", color: "var(--color-blue-4)" }],
    series: [
      {
        dataKey: "gradNorm",
        stroke: "var(--color-blue-4)",
        label: "Train/Loss",
      },
    ],
  };

  const trainEvalLossCard: MetricCard = {
    id: "finetune-loss",
    title: "Loss",
    tooltipTitle: "Loss",
    gradientColor: "var(--color-mint-1)",
    gradientOpacity: 1,
    legendItems: [
      {
        label: "Train/Loss",
        color: "var(--color-mint-2)",
        dataKey: "trainLoss",
      },
      {
        label: "Validation/Loss",
        color: "#1A1718",
        dataKey: "validationLoss",
        asIcon: true,
      },
    ],
    series: [
      {
        dataKey: "trainLoss",
        stroke: "var(--color-mint-2)",
        label: "Train/Loss",
      },
      {
        dataKey: "validationLoss",
        stroke: "#1A1718",
        label: "Validation/Loss",
        isFilled: false,
      },
    ],
  };

  const approxKlCards: MetricCard[] = [
    {
      id: "finetune-approx-kl-rejected-chosen",
      title: "",
      tooltipTitle: "Approx. KL",
      gradientColor: "rgba(252, 183, 35, 1)",
      gradientOpacity: 0.3,
      legendItems: [
        {
          label: "Train/rejected",
          color: "rgba(252, 183, 35, 1)",
          dataKey: "trainKlRejected",
        },
        {
          label: "Train/chosen",
          color: "#1A1718",
          dataKey: "trainKlChosen",
          asIcon: true,
        },
      ],
      series: [
        {
          dataKey: "trainKlRejected",
          stroke: "rgba(252, 183, 35, 1)",
          label: "Train/rejected",
        },
        {
          dataKey: "trainKlChosen",
          stroke: "#1A1718",
          label: "Train/chosen",
          isFilled: false,
        },
      ],
    },
  ];

  const rewardCards: MetricCard[] = [
    {
      id: "finetune-reward-rejected-chosen",
      title: "",
      tooltipTitle: "Reward",
      gradientColor: "rgba(100, 180, 143, 1)",
      gradientOpacity: 0.4,
      legendItems: [
        {
          label: "Train/rejected",
          color: "rgba(100, 180, 143, 1)",
          dataKey: "trainRewardRejected",
        },
        {
          label: "Train/chosen",
          color: "#1A1718",
          dataKey: "trainRewardChosen",
          asIcon: true,
        },
      ],
      series: [
        {
          dataKey: "trainRewardRejected",
          stroke: "rgba(100, 180, 143, 1)",
          label: "Train/rejected",
        },
        {
          dataKey: "trainRewardChosen",
          stroke: "#1A1718",
          label: "Train/chosen",
          isFilled: false,
        },
      ],
    },
    {
      id: "finetune-reward-accuracy",
      title: "",
      tooltipTitle: "Reward",
      gradientColor: "rgba(100, 180, 143, 1)",
      gradientOpacity: 0.4,
      legendItems: [
        { label: "Train/accuracy", color: "rgba(100, 180, 143, 1)" },
      ],
      series: [
        {
          dataKey: "trainRewardAccuracy",
          stroke: "rgba(100, 180, 143, 1)",
          label: "Train/accuracy",
        },
      ],
    },
    {
      id: "finetune-reward-margin",
      title: "",
      tooltipTitle: "Reward",
      gradientColor: "rgba(100, 180, 143, 1)",
      gradientOpacity: 0.4,
      legendItems: [{ label: "Train/margin", color: "rgba(100, 180, 143, 1)" }],
      series: [
        {
          dataKey: "trainRewardMargin",
          stroke: "rgba(100, 180, 143, 1)",
          label: "Train/margin",
        },
      ],
    },
  ];

  const logPCards: MetricCard[] = [
    {
      id: "finetune-log-p-rejected-chosen",
      title: "",
      tooltipTitle: "Log P",
      gradientColor: "rgba(209, 55, 41, 1)",
      gradientOpacity: 0.4,
      legendItems: [
        {
          label: "Train/rejected",
          color: "rgba(209, 55, 41, 1)",
          dataKey: "trainLogpRejected",
        },
        {
          label: "Train/chosen",
          color: "#1A1718",
          dataKey: "trainLogpChosen",
          asIcon: true,
        },
      ],
      series: [
        {
          dataKey: "trainLogpRejected",
          stroke: "rgba(209, 55, 41, 1)",
          label: "Train/rejected",
        },
        {
          dataKey: "trainLogpChosen",
          stroke: "#1A1718",
          label: "Train/chosen",
          isFilled: false,
        },
      ],
    },
  ];

  const approxKlMainCard = approxKlCards[0];
  const logPMainCard = logPCards[0];

  const winRateData: WinRateBar[] = winRates
    ? [
        {
          value: Math.round(winRates.base_model_win_rate_pct),
          label: "base",
          fill: "url(#finetune-win-rate-base-fill-gradient)",
          borderColor: "var(--color-gray-2)",
        },
        {
          value: Math.round(winRates.finetuned_model_win_rate_pct),
          label: "adapted",
          fill: "url(#finetune-win-rate-adapted-fill-gradient)",
          borderColor: "var(--color-blue-3)",
        },
      ]
    : [];

  if (chartData.length === 0 && !winRates) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text variant="body" className="text-typography-secondary">
          Training metrics are not available yet.
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <DatasetMeasureSectionTitle
        overline="AUTOSCIENTIST · TRAINING METRICS"
        title="AutoScientist"
        uppercaseOverline
      />
      {finetunes.length > 0 && (
        <div className="flex max-w-md flex-col gap-2">
          <Text variant="label" color="secondary">
            Training model
          </Text>
          <Select value={jobId} onValueChange={onSelectJobId}>
            <SelectTrigger
              className="min-w-0 [&_[data-slot=select-value]]:truncate"
              size="sm"
              variant="outline"
            >
              <SelectValue placeholder="Select a training model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {finetunes.map((finetune) => (
                  <SelectItem
                    key={finetune.job_id}
                    className="truncate"
                    value={finetune.job_id}
                  >
                    {finetune.name ?? finetune.job_id}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-6 md:flex-row md:flex-wrap md:items-center md:gap-[80px]">
          <div className="flex items-center gap-4 md:contents">
            <img
              className="h-[90px]"
              src={autoScientistImage}
              alt="AutoScientist"
            />
            <div className="flex flex-col gap-1 md:-ml-[40px]">
              <Text variant="label" color="secondary">
                Training model name
              </Text>
              <Text>{selectedFinetune?.name}</Text>
            </div>
          </div>

          <Button
            className="justify-start px-0"
            variant="link"
            onClick={handleWeightsExport}
            isLoading={isDownloadPending}
            disabled={isDownloadPending}
          >
            <img src={togetherAiImage} alt="Together AI" className="h-7" />
            Weights export
            <DownloadIconNormal />
          </Button>

          <div className="flex items-center gap-2">
            <img className="h-8" src={autoScientistImage} alt="AutoScientist" />
            <Button
              className="justify-start px-0"
              variant="link"
              onClick={() => setIsConfigDialogOpen(true)}
            >
              AutoScientist Config
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      </div>
      {winRates && winRateData.length > 0 && (
        <WinRatesSection winRateData={winRateData} />
      )}
      {chartData.length > 0 && (
        <div className="flex flex-col gap-6">
          <Text variant="h2">Train/Eval Metrics</Text>
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
            <MetricCardView
              data={chartData}
              xAxisTicks={xAxisTicks}
              card={trainEvalLossCard}
            />
            <div className="h-px w-full shrink-0 self-stretch bg-stroke-secondary xl:h-auto xl:w-px" />
            <MetricCardView
              data={chartData}
              xAxisTicks={xAxisTicks}
              card={trainEvalLearningRateCard}
            />
            <div className="h-px w-full shrink-0 self-stretch bg-stroke-secondary xl:h-auto xl:w-px" />
            <MetricCardView
              data={chartData}
              xAxisTicks={xAxisTicks}
              card={trainEvalGradNormCard}
            />
          </div>
        </div>
      )}
      {chartData.length > 0 && (shouldShowApproxKl || shouldShowLogP) && (
        <div className="flex flex-col gap-6">
          <Text variant="h2">Alignment Metrics</Text>
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            {shouldShowApproxKl && approxKlMainCard ? (
              <div className="flex flex-col gap-6">
                <Text variant="h2">Approx. KL</Text>
                <MetricCardView
                  data={chartData}
                  xAxisTicks={xAxisTicks}
                  card={approxKlMainCard}
                />
              </div>
            ) : null}
            {shouldShowLogP && logPMainCard ? (
              <div className="flex flex-col gap-6">
                <Text variant="h2">Log P</Text>
                <MetricCardView
                  data={chartData}
                  xAxisTicks={xAxisTicks}
                  card={logPMainCard}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
      {chartData.length > 0 && shouldShowReward && (
        <div className="flex flex-col gap-6">
          <Text variant="h2">Reward</Text>
          <div className={getMetricCardsGridClass(rewardCards.length)}>
            {rewardCards.map((card) => (
              <MetricCardView
                key={card.id}
                data={chartData}
                xAxisTicks={xAxisTicks}
                card={card}
              />
            ))}
          </div>
        </div>
      )}
      <AutoscientistConfigDialog
        isConfigDialogOpen={isConfigDialogOpen}
        setIsConfigDialogOpen={setIsConfigDialogOpen}
        autoScientistConfigText={configText}
        canCopyConfig={Boolean(configText)}
        handleCopyConfig={handleCopyConfig}
      />
    </div>
  );
}
