import { parseNewDatasetValue } from "../../_lib/new-dataset-parse-values";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";
import type { ColumnType } from "./mapping-store";

function readFieldImageColumnValue(field?: {
  response_values?: Array<{ value?: string; }>;
}): string {
  const rawValue = field?.response_values?.[0]?.value;
  if (!rawValue) return "";

  try {
    const parsed = JSON.parse(rawValue);
    return typeof parsed === "string" ? parsed : "";
  } catch {
    return "";
  }
}

export function useMappingParsedValues() {
  const data = useDatasetStepCache(NEW_DATASET_KEYS.mapping);

  const fields = data?.step.fields;
  const imageColumn = readFieldImageColumnValue(fields?.mapping_image_column);
  const normalizeContextColumn = (column: string) =>
    column === "context_images" && imageColumn ? imageColumn : column;

  const prompt = {
    column: parseNewDatasetValue(fields?.mapping_prompt_column) as string,
    hasNoColumn: parseNewDatasetValue(
      fields?.mapping_no_prompt_column,
    ) as boolean,
    createColumn: parseNewDatasetValue(
      fields?.mapping_create_prompt_column,
    ) as boolean,
    universalPrompt:
      (parseNewDatasetValue(fields?.mapping_universal_prompt) as string) || "",
    showUniversalPrompt: false,
    createPrompt:
      (parseNewDatasetValue(fields?.mapping_create_prompt) as boolean) ||
      false,
  };

  const contextColumns =
    ((parseNewDatasetValue(fields?.mapping_context_column) as
      | string[]
      | undefined) || []
    ).map(normalizeContextColumn);

  const context = {
    column: contextColumns,
    hasNoColumn: parseNewDatasetValue(
      fields?.mapping_no_context_column,
    ) as boolean,
  };

  const completion = {
    column: parseNewDatasetValue(fields?.mapping_completion_column) as string,
    hasNoColumn: parseNewDatasetValue(
      fields?.mapping_no_completion_column,
    ) as boolean,
    createColumn: parseNewDatasetValue(
      fields?.mapping_create_completion_column,
    ) as boolean,
  };

  const chat = {
    column: parseNewDatasetValue(fields?.mapping_chat_column) as string,
    hasNoColumn: parseNewDatasetValue(
      fields?.mapping_no_chat_column,
    ) as boolean,
  };

  const selectedColumn: ColumnType | undefined =
    !!prompt.column ||
      context.column.length > 0 ||
      !!completion.column ||
      !!chat.column
      ? undefined
      : "prompt";

  return {
    fields,
    prompt,
    completion,
    context,
    chat,
    selectedColumn,
  };
}
