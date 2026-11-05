import type { ApiSchemas } from "@/shared/api/schema";

export function useCreditsCalculation(
  credits: ApiSchemas["CreditsCalculationResponseDto"],
) {
  const isNotEnoughCredits =
    credits?.costFullDataset && credits?.availableCredits
      ? credits.costFullDataset > credits.availableCredits
      : false;

  const remainingFullCredits =
    credits?.availableCredits && credits.costFullDataset
      ? credits.costFullDataset - credits.availableCredits
      : 0;

  const remainingRequestedCredits =
    credits?.availableCredits && credits.costRequestedRows
      ? credits.costRequestedRows - credits.availableCredits
      : 0;

  return {
    isNotEnoughCredits,
    remainingFullCredits,
    remainingRequestedCredits,
  };
}
