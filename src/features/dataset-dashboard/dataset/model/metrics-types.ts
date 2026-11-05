import type { ApiSchemas } from "@/shared/api/schema";

export type ChartPoint = {
  step: number;
  trainLoss: number;
  validationLoss: number | null;
  learningRate: number;
  gradNorm: number;
  trainKlChosen: number | null;
  trainKlRejected: number | null;
  trainRewardChosen: number | null;
  trainRewardRejected: number | null;
  trainRewardAccuracy: number | null;
  trainRewardMargin: number | null;
  trainLogpChosen: number | null;
  trainLogpRejected: number | null;
};

export type ChartMetricKey = Exclude<keyof ChartPoint, "step">;

export type FinetuneStepMetricWithDpo = ApiSchemas["FinetuneStepMetricDto"] & {
  train_kl_chosen?: number | null;
  train_kl_rejected?: number | null;
  train_reward_chosen?: number | null;
  train_reward_rejected?: number | null;
  train_reward_accuracy?: number | null;
  train_reward_margin?: number | null;
  train_logp_chosen?: number | null;
  train_logp_rejected?: number | null;
};

export type LegendItem = {
  label: string;
  color: string;
  dataKey?: ChartMetricKey;
  asIcon?: boolean;
};

export type MetricCard = {
  id: string;
  title: string;
  tooltipTitle: string;
  gradientColor: string;
  gradientOpacity: number;
  series: {
    dataKey: ChartMetricKey;
    stroke: string;
    isFilled?: boolean;
    label?: string;
  }[];
  legendItems?: LegendItem[];
};

export type WinRateBar = {
  value: number;
  label: string;
  fill: string;
  borderColor?: string;
};
