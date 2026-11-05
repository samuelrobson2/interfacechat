import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSuspenseQueries } from "@tanstack/react-query";
import { datasetQueryOptions } from "@/services/dataset";
import type { ApiSchemas } from "@/shared/api/schema";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import { buildSavedRoleSelections } from "./build-saved-role-selections";

type FinetuneColumnsInlineData = {
  available_columns?: string[];
  column_samples?: Record<string, unknown>;
  inferred_mapping?: Record<string, string | string[] | null | undefined>;
  training_type?: string | null;
  finetune_wizard_method?: string | null;
  column_instructions?: {
    key: string;
    display_title?: string | null;
    selected_column?: string | null;
  }[];
  /**
   * Backend-defined wizard buttons (which roles to fill, mode-dependent).
   * Single source of truth for the role set — render these directly rather
   * than deriving the role list on the client. Absent only on older backends.
   */
  roles?: {
    key: string;
    display_title?: string | null;
    badge_title?: string | null;
    selected_column?: string | null;
    optional?: boolean | null;
  }[];
} | null;

export type TrainingContext = {
  trainingType: "sft" | "preference";
  wizardMethod: "instruction" | "alignment";
};

function buildRowsFromSlotSamples(
  columnInstructions: { key: string; displayTitle: string }[],
  slotSamples: Record<string, unknown>,
) {
  const keys = columnInstructions.map((ci) => ci.key);
  const arraysBySlot = keys.map((key) => {
    const value = slotSamples[key];
    return Array.isArray(value) ? value : [];
  });
  const maxRows = Math.min(
    12,
    arraysBySlot.reduce((max, values) => Math.max(max, values.length), 0),
  );
  if (maxRows === 0) return null;

  const headers = columnInstructions.map((ci) => ci.displayTitle);
  const rows = Array.from({ length: maxRows }, (_, rowIndex) =>
    Object.fromEntries(
      columnInstructions.map((ci, idx) => [
        ci.displayTitle,
        String(arraysBySlot[idx]?.[rowIndex] ?? ""),
      ]),
    ),
  );

  return { headers, rows };
}

function asSelectedColumn(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asSelectionsMap(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([, selectedColumn]) =>
          typeof selectedColumn === "string" && selectedColumn.length > 0,
      )
      .map(([instructionKey, selectedColumn]) => [
        instructionKey,
        selectedColumn as string,
      ]),
  ) as Record<string, string>;
}

export type TrainingRoleInstruction = {
  key: string;
  displayTitle: string;
  badgeTitle: string;
  /** Optional roles (e.g. reasoning_trace) don't block the continue gate. */
  optional?: boolean;
};

function buildTrainingRoleInstructions(ctx: TrainingContext): TrainingRoleInstruction[] {
  const isDpo = ctx.trainingType === "preference" && ctx.wizardMethod === "alignment";
  if (isDpo) {
    return [
      {
        key: "prompt",
        displayTitle: "Prompt column",
        badgeTitle: "Prompt",
      },
      {
        key: "chosen",
        displayTitle: "Chosen column",
        badgeTitle: "Chosen",
      },
      {
        key: "rejected",
        displayTitle: "Rejected column",
        badgeTitle: "Rejected",
      },
    ];
  }
  return [
    {
      key: "prompt",
      displayTitle: "Prompt column",
      badgeTitle: "Prompt",
    },
    {
      key: "completion",
      displayTitle: "Completion column",
      badgeTitle: "Completion",
    },
  ];
}

type ColumnsTableData = {
  description: string | null | undefined;
  headers: string[];
  rows: Record<string, string>[];
  stepKey: string;
  fields: ApiSchemas["FinetuneFieldDto"][];
  availableColumns: string[];
  trainingContext: TrainingContext;
  trainingRoleInstructions: TrainingRoleInstruction[];
  /** Maps table header (display title) → slot key for reverse lookup. */
  displayTitleToSlotKey: Record<string, string>;
  /** Maps slot key → table header (display title). */
  slotKeyToDisplayTitle: Record<string, string>;
  /** Saved training-role selections (role key → slot key), e.g. { prompt: "enhanced_prompt" }. */
  savedRoleSelections: Record<string, string>;
  columnInstructions: {
    key: string;
    displayTitle: string;
    selectedColumn: string | null;
  }[];
};

function buildRowsFromSamples(
  headers: string[],
  columnSamples: Record<string, unknown> | null | undefined,
) {
  const arraysByHeader = headers.map((header) => {
    const value = columnSamples?.[header];
    return Array.isArray(value) ? value : [];
  });
  const maxRows = Math.min(
    12,
    arraysByHeader.reduce((max, values) => Math.max(max, values.length), 0),
  );

  return Array.from({ length: maxRows }, (_, rowIndex) =>
    Object.fromEntries(
      headers.map((header, headerIndex) => [
        header,
        String(arraysByHeader[headerIndex]?.[rowIndex] ?? ""),
      ]),
    ),
  );
}

function buildRowsFromDatasetSamples(
  headers: string[],
  datasetSamples: Record<string, unknown>[] | null | undefined,
) {
  if (!Array.isArray(datasetSamples) || datasetSamples.length === 0) return [];

  return datasetSamples.slice(0, 12).map((sample) =>
    Object.fromEntries(
      headers.map((header) => [header, String(sample?.[header] ?? "")]),
    ),
  );
}

function buildRowsFromMapping(
  mapping: Record<string, string | string[] | null | undefined>,
) {
  const rows = Object.entries(mapping).map(([field, column]) => ({
    Field: field,
    Column: Array.isArray(column)
      ? column.filter(Boolean).join(", ")
      : String(column ?? ""),
  }));

  return {
    headers: ["Field", "Column"],
    rows,
  };
}

export function useFinetuneColumnsTable(): ColumnsTableData {
  const { dataset_id } = useParams();
  const columnsStepKey = FINETUNE_STEP_KEYS.columns;
  const [{ data: dataset }, { data }] = useSuspenseQueries({
    queries: [
      datasetQueryOptions.dataset(dataset_id!),
      {
        ...datasetQueryOptions.finetuneStep(dataset_id!, columnsStepKey),
        staleTime: 0,
        refetchOnMount: "always" as const,
      },
    ],
  });

  return useMemo(() => {
    const inlineData = data.step.inline_data as FinetuneColumnsInlineData;
    const availableColumns = inlineData?.available_columns ?? dataset?.columns ?? [];
    const inferredMapping = inlineData?.inferred_mapping ?? {};
    const trainingContext: TrainingContext = {
      trainingType: (inlineData?.training_type === "preference" ? "preference" : "sft"),
      wizardMethod: (inlineData?.finetune_wizard_method === "alignment" ? "alignment" : "instruction"),
    };
    const backendColumnSamples =
      dataset?.column_samples as Record<string, unknown> | null | undefined;
    const selectionsField = data.step.fields.find((field) =>
      field.key.includes("column_selections"),
    );
    const selectedColumnByFieldKey = Object.fromEntries(
      data.step.fields.map((field) => [field.key, asSelectedColumn(field.value)]),
    ) as Record<string, string | null>;
    const selectedColumnByInstructionKey = asSelectionsMap(selectionsField?.value);
    const inlineInstructions = inlineData?.column_instructions ?? [];
    const columnInstructions =
      inlineInstructions.length > 0
        ? inlineInstructions.map((instruction) => ({
          key: instruction.key,
          displayTitle: instruction.display_title ?? instruction.key,
          selectedColumn:
            selectedColumnByInstructionKey?.[instruction.key]
            ?? selectedColumnByFieldKey[instruction.key]
            ?? instruction.selected_column
            ?? null,
        }))
        : data.step.fields
          .filter((field) => !field.key.includes("column_selections"))
          .map((field) => ({
            key: field.key,
            displayTitle: field.title ?? field.key,
            selectedColumn:
              selectedColumnByInstructionKey?.[field.key]
              ?? selectedColumnByFieldKey[field.key]
              ?? null,
          }));

    // Prefer the backend-provided role buttons (single source of truth for
    // which roles exist per mode). Fall back to the client-derived list only
    // when an older backend omits `roles` (deploy skew).
    const backendRoles = inlineData?.roles ?? [];
    const trainingRoleInstructions: TrainingRoleInstruction[] =
      backendRoles.length > 0
        ? backendRoles.map((role) => ({
            key: role.key,
            displayTitle: role.display_title ?? role.key,
            badgeTitle: role.badge_title ?? role.display_title ?? role.key,
            optional: role.optional ?? false,
          }))
        : buildTrainingRoleInstructions(trainingContext);

    const displayTitleToSlotKey: Record<string, string> = {};
    const slotKeyToDisplayTitle: Record<string, string> = {};
    for (const ci of columnInstructions) {
      displayTitleToSlotKey[ci.displayTitle] = ci.key;
      slotKeyToDisplayTitle[ci.key] = ci.displayTitle;
    }

    const savedRoleSelections = buildSavedRoleSelections(
      trainingRoleInstructions,
      selectedColumnByInstructionKey ?? {},
      inferredMapping,
    );

    const shared = {
      stepKey: data.step.key,
      fields: data.step.fields,
      trainingContext,
      trainingRoleInstructions,
      displayTitleToSlotKey,
      slotKeyToDisplayTitle,
      savedRoleSelections,
      columnInstructions,
    };

    const slotSamples = inlineData?.column_samples;
    const slotTable =
      slotSamples && columnInstructions.length > 0
        ? buildRowsFromSlotSamples(columnInstructions, slotSamples)
        : null;

    if (slotTable) {
      return {
        description: data.step.description,
        headers: slotTable.headers,
        rows: slotTable.rows,
        availableColumns:
          availableColumns.length > 0 ? availableColumns : slotTable.headers,
        ...shared,
      };
    }

    const headers = availableColumns;

    if (headers.length > 0) {
      const rowsFromColumnSamples = buildRowsFromSamples(headers, backendColumnSamples);
      const rows =
        rowsFromColumnSamples.length > 0
          ? rowsFromColumnSamples
          : buildRowsFromDatasetSamples(
            headers,
            (dataset?.samples as Record<string, unknown>[] | null | undefined),
          );

      return {
        description: data.step.description,
        headers,
        rows,
        availableColumns:
          availableColumns.length > 0 ? availableColumns : headers,
        ...shared,
      };
    }

    const mappingTable = buildRowsFromMapping(inferredMapping);
    return {
      description: data.step.description,
      headers: mappingTable.headers,
      rows: mappingTable.rows,
      availableColumns,
      ...shared,
    };
  }, [
    dataset?.column_samples,
    dataset?.columns,
    dataset?.samples,
    data.step.description,
    data.step.fields,
    data.step.inline_data,
    data.step.key,
  ]);
}
