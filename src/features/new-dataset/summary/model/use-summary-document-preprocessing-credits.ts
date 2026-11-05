import { usePreprocessingCreditsSuspenseQuery } from "@/services/payment";
import type { ApiSchemas } from "@/shared/api/schema";
import { useState } from "react";
import type { LaunchPreprocessingRequestBody } from "./use-launch-dataset";

/** Slider / launch axis for document summary (not the same string as API preprocessing_mode). */
export type SummaryDocumentBudgetKind = "pages" | "documents";

export type SummaryDocumentPreprocessingCreditsValue = ReturnType<
  typeof useSummaryDocumentPreprocessingCredits
>;

export function useSummaryDocumentPreprocessingCredits(
  preprocessingMode: ApiSchemas["DatasetDto"]["preprocessing_mode"],
  baseline: ApiSchemas["PreprocessingCreditsResponseDto"],
) {
  const totalPages = baseline.totalPages;
  const totalDocuments = baseline.totalDocuments;

  const budgetKind: SummaryDocumentBudgetKind =
    preprocessingMode === "per_document" ? "documents" : "pages";
  const maxBudget =
    budgetKind === "pages"
      ? Math.max(1, totalPages)
      : Math.max(1, totalDocuments);
  const [committedBudget, setCommittedBudget] = useState<number | null>(null);
  const appliedBudget = Math.min(
    Math.max(1, committedBudget ?? maxBudget),
    maxBudget,
  );

  const setBudget = (value: number[]) => {
    const raw = value[0];
    if (raw == null) return;
    setCommittedBudget(Math.min(Math.max(1, raw), maxBudget));
  };

  const { data } = usePreprocessingCreditsSuspenseQuery(
    budgetKind === "documents"
      ? { documents_to_process: appliedBudget }
      : undefined,
  );

  const datasetCost =
    budgetKind === "pages" ? appliedBudget : (data.extractionCost ?? 0);

  const availableCredits = data.availableCredits ?? 0;
  const isNotEnoughCredits =
    datasetCost > availableCredits || Boolean(data.insufficientCredits);
  const creditsShortfall = Math.max(0, datasetCost - availableCredits);
  const headerTitle = isNotEnoughCredits
    ? `You need ${creditsShortfall.toLocaleString()} more credits to preprocess this dataset`
    : "You have enough credits to launch job";

  // API: exactly one of pages_to_process | documents_to_process (matches preprocessing_mode).
  const launchBody: LaunchPreprocessingRequestBody =
    preprocessingMode === "per_document"
      ? { documents_to_process: Math.max(1, Math.round(appliedBudget)) }
      : { pages_to_process: Math.max(1, Math.round(appliedBudget)) };

  return {
    budgetKind,
    maxBudget,
    setBudget,
    datasetCost,
    availableCredits,
    isNotEnoughCredits,
    headerTitle,
    launchBody,
    reduceTitle: budgetKind === "pages" ? "Reduce Pages" : "Reduce Documents",
    reduceTooltip:
      budgetKind === "pages"
        ? "Each selected page costs 1 credit."
        : "Cost depends on each document's page count; the estimate updates when you change the count.",
    enoughTitle:
      budgetKind === "pages"
        ? "If you want to use fewer credits on this job, reduce the pages."
        : "If you want to use fewer credits on this job, reduce how many documents to include.",
  };
}
