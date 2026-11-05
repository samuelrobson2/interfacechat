import { useDatasetCache } from "@/services/dataset";
import { parseNewDatasetValue } from "../../_lib/new-dataset-parse-values";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";

export function useControlBrandParsedValues() {
  const data = useDatasetStepCache(NEW_DATASET_KEYS.brand);
  const datasetData = useDatasetCache();

  const fields = data?.step.fields;

  const brand_length = parseNewDatasetValue(fields?.brand_length) as string;
  const brand_safety = new Set(
    parseNewDatasetValue(fields?.brand_safety) as string[],
  );
  const brand_custom_settings = parseNewDatasetValue(
    fields?.brand_custom_settings,
  ) as string;
  const hallucination_mitigation = fields?.hallucination_mitigation?.response_values?.[0]?.value.toString() || "false";

  const lengthOptions = fields?.brand_length?.options;
  const safetyOptions = fields?.brand_safety?.options;

  const completionLength = datasetData?.metadata?.average_completion_length;

  return {
    fields,
    completionLength,
    brand_length,
    brand_safety,
    brand_custom_settings,
    hallucination_mitigation,
    lengthOptions,
    safetyOptions,
  };
}
