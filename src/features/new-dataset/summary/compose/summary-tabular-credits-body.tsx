import { paymentQueryOptions, useCreditsCalculation } from "@/services/payment";
import { Text } from "@/shared/ui/kit/text";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { SummaryTabularNotEnoughCredits } from "./summary-tabular-not-enough-credits";
import { SummaryTabularEnoughCredits } from "./summary-tabular-enough-credits";

export const SummaryTabularCreditsBody = () => {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const { data: credits } = useSuspenseQuery(
    paymentQueryOptions.creditsCalculation(dataset_id!),
  );
  const { isNotEnoughCredits, remainingFullCredits } =
    useCreditsCalculation(credits);

  const title = isNotEnoughCredits
    ? `You need ${remainingFullCredits.toLocaleString()} more credits to run this job`
    : "You have enough credits to launch job";

  return (
    <div className="flex flex-col gap-15 h-full">
      <Text variant="h2" className="text-center">
        {title}
      </Text>

      {isNotEnoughCredits ? (
        <SummaryTabularNotEnoughCredits
          maxRows={credits?.maxRowsProcessable || 0}
        />
      ) : (
        <SummaryTabularEnoughCredits
          maxRows={credits?.maxRowsProcessable || 0}
        />
      )}
    </div>
  );
};
