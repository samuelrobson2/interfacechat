import { paymentQueryOptions } from "@/services/payment";
import { Text } from "@/shared/ui/kit/text";
import type { ApiSchemas } from "@/shared/api/schema";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useSummaryDocumentPreprocessingCredits } from "../model/use-summary-document-preprocessing-credits";
import { SummaryDocumentEnoughCredits } from "./summary-document-enough-credits";
import { SummaryDocumentNotEnoughCredits } from "./summary-document-not-enough-credits";

export const SummaryDocumentCreditsBody = ({
  preprocessingMode,
}: {
  preprocessingMode: ApiSchemas["DatasetDto"]["preprocessing_mode"];
}) => {
  const { dataset_id } = useParams() as PathParams[DatasetRoutes];
  const { data: baseline } = useSuspenseQuery(
    paymentQueryOptions.preprocessingCredits(dataset_id!),
  );
  const credit = useSummaryDocumentPreprocessingCredits(
    preprocessingMode,
    baseline,
  );

  return (
    <div className="flex flex-col gap-15 h-full">
      <Text variant="h2" className="text-center">
        {credit.headerTitle}
      </Text>

      {credit.isNotEnoughCredits ? (
        <SummaryDocumentNotEnoughCredits credit={credit} />
      ) : (
        <SummaryDocumentEnoughCredits credit={credit} />
      )}
    </div>
  );
};
