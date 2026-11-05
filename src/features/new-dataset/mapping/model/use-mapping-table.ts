import { useDatasetCache } from "@/services/dataset";
import { openInNewTab } from "@/shared/lib/js";
import { toast } from "@/shared/ui/kit/sonner-toast";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { createElement, useMemo } from "react";
import Markdown from "react-markdown";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";
import {
  UNIVERSAL_PROMPT_COLUMN_ID,
  useMappingContext,
  type ColumnType,
} from "./mapping-store";

const MULTIMODAL_DOCS_URL =
  "https://docs.adaptionlabs.ai/guides/multimodal-context";

type TableRowData = Record<string, unknown>;

export { UNIVERSAL_PROMPT_COLUMN_ID };

export type SelectedColumns = Record<
  string,
  { value: string; bgColor: string; }
>;

export const colorsMap = {
  prompt: {
    bgColor: "bg-gradient-blue shadow-highlight-blue [--hairline-color:var(--color-blue-5)]",
    textColor: "text-blue-5",
    borderColor: "var(--color-blue-5)",
  },
  context: {
    bgColor: "bg-gradient-green shadow-highlight-green [--hairline-color:var(--color-green-5)]",
    textColor: "text-green-5",
    borderColor: "var(--color-green-5)",
  },
  completion: {
    bgColor: "bg-gradient-rose shadow-highlight-rose [--hairline-color:var(--color-rose-2)]",
    textColor: "text-rose-2",
    borderColor: "var(--color-rose-2)",
  },
  chat: {
    bgColor: "bg-gradient-orange shadow-highlight-orange [--hairline-color:var(--color-orange-5)]",
    textColor: "text-orange-5",
    borderColor: "var(--color-orange-5)",
  },
  images: {
    bgColor: "bg-gradient-yellow shadow-highlight-yellow [--hairline-color:var(--color-yellow-5)]",
    textColor: "text-yellow-5",
    borderColor: "var(--color-yellow-5)",
  },
};

export const CHAT_WITH_CONTEXT_IMAGES_ONLY_TOAST =
  "When Chat is selected, only the Context Images column can be used as context";

export const IMAGE_DOCS_TOAST_OPTIONS = {
  button: {
    label: "Check our documentation",
    onClick: () => openInNewTab(MULTIMODAL_DOCS_URL),
    variant: "secondary" as const,
  },
};

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

export function useMappingTable() {
  const mappingStep = useDatasetStepCache(NEW_DATASET_KEYS.mapping);
  const prompt = useMappingContext((state) => state.prompt);
  const universalPrompt = useMappingContext(
    (state) => state.prompt.universalPrompt,
  );
  const context = useMappingContext((state) => state.context);
  const completion = useMappingContext((state) => state.completion);
  const chat = useMappingContext((state) => state.chat);
  const selectedColumn = useMappingContext((state) => state.selectedColumn);
  const setSelectedColumn = useMappingContext(
    (state) => state.setSelectedColumn,
  );

  const dataset = useDatasetCache();
  const mappedImageColumn = readFieldImageColumnValue(
    mappingStep?.step.fields?.mapping_image_column,
  );

  const tableColumns = dataset?.columns;
  const tableSamples = dataset?.column_samples;

  const hasUniversalPromptColumn = universalPrompt.length > 0;

  const columns = useMemo<ColumnDef<TableRowData>[]>(() => {
    if (!tableColumns) return [];

    let names = tableColumns.filter((columnName) => !!columnName);

    if (hasUniversalPromptColumn) {
      const rest = names.filter((n) => n !== UNIVERSAL_PROMPT_COLUMN_ID);
      names = [UNIVERSAL_PROMPT_COLUMN_ID, ...rest];
    } else {
      names = names.filter((n) => n !== UNIVERSAL_PROMPT_COLUMN_ID);
    }

    return names.map((columnName) => ({
      id: columnName,
      accessorKey: columnName,
      header:
        columnName === UNIVERSAL_PROMPT_COLUMN_ID
          ? "Universal prompt"
          : columnName,
      meta:
        columnName === UNIVERSAL_PROMPT_COLUMN_ID
          ? { disableColumnSelect: true }
          : undefined,
      cell: (info: CellContext<TableRowData, unknown>) => {
        const value = info.getValue();
        if (typeof value === "string") {
          return createElement(Markdown, { children: value });
        }
        return JSON.stringify(value ?? "");
      },
    }));
  }, [tableColumns, hasUniversalPromptColumn]);

  /** Stable when only universal prompt text or visibility changes — avoids cloning every row. */
  const tableData = useMemo<TableRowData[]>(() => {
    if (!tableSamples) return [];

    const columnNames = Object.keys(tableSamples);
    if (columnNames.length === 0) return [];

    let maxRows = 0;
    for (const col of columnNames) {
      if (!col) continue;
      const length = tableSamples[col]?.length || 0;
      if (length > maxRows) maxRows = length;
    }

    const rows: TableRowData[] = Array.from({ length: maxRows }, () => ({}));

    for (const columnName of columnNames) {
      if (!columnName) continue;

      const columnData = tableSamples[columnName];
      if (!columnData) continue;

      for (let i = 0; i < maxRows; i++) {
        rows[i]![columnName] = columnData[i] ?? "";
      }
    }

    return rows;
  }, [tableSamples]);

  const selectedColumns: SelectedColumns = {
    ...(hasUniversalPromptColumn
      ? {
        [UNIVERSAL_PROMPT_COLUMN_ID]: {
          value: "prompt",
          bgColor: colorsMap.prompt.bgColor,
        },
      }
      : {}),
    ...(prompt.column
      ? {
        [prompt.column]: {
          value: "prompt",
          bgColor: colorsMap.prompt.bgColor,
        },
      }
      : {}),
    ...context.column.reduce(
      (acc, col) => ({
        ...acc,
        [col]: {
          value: col === mappedImageColumn ? "context images" : "context",
          bgColor: colorsMap.context.bgColor,
        },
      }),
      {},
    ),
    ...(completion.column
      ? {
        [completion.column]: {
          value: "completion",
          bgColor: colorsMap.completion.bgColor,
        },
      }
      : {}),
    ...(chat.column
      ? {
        [chat.column]: {
          value: "chat",
          bgColor: colorsMap.chat.bgColor,
        },
      }
      : {}),
  };

  const getNextColumn = (
    justSetColumn?: ColumnType,
  ): ColumnType | undefined => {
    if (!prompt.column && !prompt.hasNoColumn && justSetColumn !== "prompt")
      return "prompt";
    if (
      !completion.column &&
      !completion.hasNoColumn &&
      justSetColumn !== "completion"
    )
      return "completion";
    if (context.column.length === 0 && justSetColumn !== "context")
      return "context";
    return undefined;
  };

  const hasInvalidChatWithContext =
    !!chat.column &&
    !!mappedImageColumn &&
    context.column.some((col) => col !== mappedImageColumn);

  const rejectNonImageContextWithChat = (column: string) => {
    if (!chat.column || !mappedImageColumn || column === mappedImageColumn) {
      return false;
    }
    toast.info(CHAT_WITH_CONTEXT_IMAGES_ONLY_TOAST, IMAGE_DOCS_TOAST_OPTIONS);
    return true;
  };

  const handleColumnSelect = (column: string) => {
    if (column === UNIVERSAL_PROMPT_COLUMN_ID) return;
    if (
      column === mappedImageColumn &&
      (selectedColumn === "prompt" || selectedColumn === "completion")
    ) {
      toast.info(
        "Images column cannot be used as Prompt or Completion",
        IMAGE_DOCS_TOAST_OPTIONS,
      );
      return;
    }

    // Clear previous assignment if this column is already used
    if (prompt.column === column) prompt.setColumn(undefined);
    if (completion.column === column) completion.setColumn(undefined);
    if (context.column.includes(column)) context.removeColumn(column);
    if (chat.column === column) chat.setColumn(undefined);

    if (selectedColumn === "prompt") {
      prompt.setColumn(column);
      return setSelectedColumn(getNextColumn("prompt"));
    }

    if (selectedColumn === "completion") {
      completion.setColumn(column);
      return setSelectedColumn(getNextColumn("completion"));
    }

    if (selectedColumn === "context") {
      if (rejectNonImageContextWithChat(column)) return;
      return context.addColumn(column);
    }

    if (selectedColumn === "chat") {
      if (context.column.some((col) => col !== mappedImageColumn)) {
        toast.info(
          CHAT_WITH_CONTEXT_IMAGES_ONLY_TOAST,
          IMAGE_DOCS_TOAST_OPTIONS,
        );
        return;
      }
      chat.setColumn(column);
      return setSelectedColumn(undefined);
    }
  };

  const handleColumnRemove = (column: string) => {
    if (column === UNIVERSAL_PROMPT_COLUMN_ID) return;

    if (prompt.column === column) prompt.setColumn(undefined);
    if (context.column.includes(column)) context.removeColumn(column);
    if (completion.column === column) completion.setColumn(undefined);
    if (chat.column === column) chat.setColumn(undefined);
  };

  return {
    columns,
    tableData,
    handleColumnSelect,
    handleColumnRemove,
    selectedColumns,
    imageColumnId: mappedImageColumn,
    hasInvalidChatWithContext,
  };
}
