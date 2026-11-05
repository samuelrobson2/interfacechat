import type { ApiSchemas } from "@/shared/api/schema";
import type { VisualizeDataset } from "./use-visualize-datasets";

export const SAMPLE_DATASET_ID = "sample-playground";

export const SAMPLE_DATASET: VisualizeDataset = {
  id: SAMPLE_DATASET_ID,
  name: "Sample data",
  domain: "",
};

export const isSampleDatasetId = (datasetId?: string) =>
  datasetId === SAMPLE_DATASET_ID || Boolean(datasetId?.startsWith("sample-"));

export const PLACEHOLDER_VISUALIZE_PROMPTS = [
  "How do wins value and goals value compare across seasons for these three teams?",
  "How did these teams compare in total shots and shots on target during their last season?",
  "Which teams and seasons had the strongest clean-sheet records and fewest goals conceded?",
] as const;

export const SAMPLE_FOLLOWUP_SUGGESTIONS = [
  {
    id: "followup-wins-goals",
    text: "How do wins value and goals value compare across seasons for these three teams?",
  },
  {
    id: "followup-shots",
    text: "How did these teams compare in total shots and shots on target during their last season?",
  },
  {
    id: "followup-clean-sheets",
    text: "Which teams and seasons had the strongest clean-sheet records and fewest goals conceded?",
  },
] as const;

export const SAMPLE_VISUALIZE_SUGGESTIONS: ApiSchemas["ChartQuickInsightSuggestionDto"][] =
  [
    {
      id: "sample-revenue",
      set_id: "sample-visualize",
      text: PLACEHOLDER_VISUALIZE_PROMPTS[0],
      goal: "revenue-by-product",
      tag: "bar",
      columns: ["month", "product", "revenue"],
      dataset_id: SAMPLE_DATASET_ID,
      dataset_title: SAMPLE_DATASET.name,
    },
    {
      id: "sample-signups",
      set_id: "sample-visualize",
      text: PLACEHOLDER_VISUALIZE_PROMPTS[1],
      goal: "signups-over-time",
      tag: "line",
      columns: ["month", "signups"],
      dataset_id: SAMPLE_DATASET_ID,
      dataset_title: SAMPLE_DATASET.name,
    },
    {
      id: "sample-tickets",
      set_id: "sample-visualize",
      text: PLACEHOLDER_VISUALIZE_PROMPTS[2],
      goal: "tickets-by-priority",
      tag: "arc",
      columns: ["priority", "tickets"],
      dataset_id: SAMPLE_DATASET_ID,
      dataset_title: SAMPLE_DATASET.name,
    },
  ];
