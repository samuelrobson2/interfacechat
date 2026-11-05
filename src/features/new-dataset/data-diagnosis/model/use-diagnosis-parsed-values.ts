import { useDatasetCache, type DatasetDomain, type DatasetGrade } from "@/services/dataset";
import { parseNewDatasetValue } from "../../_lib/new-dataset-parse-values";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";

export function useDiagnosisParsedValues() {
  const data = useDatasetStepCache(NEW_DATASET_KEYS.diagnosis);
  const datasetData = useDatasetCache();

  const fields = data?.step.fields;

  const dataset_name = parseNewDatasetValue(fields?.dataset_name) as string;
  const description = parseNewDatasetValue(fields?.description) as string;
  const topDomain = parseNewDatasetValue(
    fields?.dataset_top_domain,
  ) as DatasetDomain;
  const topPercentage = parseNewDatasetValue(fields?.dataset_top_percentage);
  const datasetGrade = parseNewDatasetValue(
    fields?.dataset_grade,
  ) as DatasetGrade;
  const datasetQuality = parseNewDatasetValue(fields?.dataset_quality);
  const qualityScore = parseNewDatasetValue(fields?.quality_score);
  const percentileScore = parseNewDatasetValue(fields?.percentile_score);
  const averagePromptLengthParsed = parseNewDatasetValue(
    fields?.average_prompt_length,
  ) as string;
  const averageCompletionLengthParsed = parseNewDatasetValue(
    fields?.average_completion_length,
  ) as string;

  const averagePromptLength = averagePromptLengthParsed
    ? Number(averagePromptLengthParsed).toFixed(1)
    : null;
  const averageCompletionLength = averageCompletionLengthParsed
    ? Number(averageCompletionLengthParsed).toFixed(1)
    : null;

  // TODO: Remove this filter when the API is updated
  const domains = (parseNewDatasetValue(fields?.domain) as string[]).filter(
    (domain) => !domain.toLowerCase().includes("other"),
  );
  // TODO: Remove this filter when the API is updated
  const languages = (parseNewDatasetValue(fields?.language) as string[]).filter(
    (language) => !language.toLowerCase().includes("unknown"),
  );
  const tones = parseNewDatasetValue(fields?.tone) as string[];

  return {
    fields,
    dataset_name,
    description,
    topDomain,
    topPercentage,
    datasetGrade,
    datasetQuality,
    qualityScore,
    percentileScore,
    averagePromptLength,
    averageCompletionLength,
    domains,
    languages,
    tones,
    datasetData
  };
}
