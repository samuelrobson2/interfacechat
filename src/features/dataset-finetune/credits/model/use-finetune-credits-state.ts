import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { datasetQueryOptions } from "@/services/dataset";
import { useAugmentationStepData } from "../../augmentation/model/use-augmentation-step-data";

export function useFinetuneCreditsState() {
  const {
    datasetId,
    initialDomainDatapoints,
    initialGeneralDatapoints,
    shouldShowDomainSlider,
    shouldShowGeneralSlider,
  } = useAugmentationStepData();
  const [domainRows, setDomainRows] = useState(initialDomainDatapoints);
  const [generalRows, setGeneralRows] = useState(initialGeneralDatapoints);

  useEffect(() => {
    setDomainRows(initialDomainDatapoints);
  }, [initialDomainDatapoints]);

  useEffect(() => {
    setGeneralRows(initialGeneralDatapoints);
  }, [initialGeneralDatapoints]);

  const effectiveDomainRows = shouldShowDomainSlider ? domainRows : 0;
  const effectiveGeneralRows = shouldShowGeneralSlider ? generalRows : 0;

  const { data: credits } = useQuery({
    ...datasetQueryOptions.finetuneCalculate(datasetId ?? "", {
      augmentation_domain_rows: effectiveDomainRows,
      augmentation_general_rows: effectiveGeneralRows,
    }),
    enabled: Boolean(datasetId),
  });

  const rowsPerCredit = credits?.augmentationRowsPerCredit ?? 100;
  const domainExpansionCost = shouldShowDomainSlider
    ? (credits?.costAugmentationDomain
      ?? Math.ceil(effectiveDomainRows / rowsPerCredit))
    : 0;
  const diversityExpansionCost = shouldShowGeneralSlider
    ? (credits?.costAugmentationGeneral
      ?? Math.ceil(effectiveGeneralRows / rowsPerCredit))
    : 0;

  // Product requirement: keep AutoScientist training on FE as a fixed line
  // computed from the two augmentation costs.
  const autoScientistTrainingCost = credits?.costBaseTraining ?? 0;
  const totalOrderCost =
    domainExpansionCost + diversityExpansionCost;
  const totalCredits = credits?.availableCredits ?? 0;
  const remainingRequestedCredits = Math.max(totalOrderCost - totalCredits, 0);
  const isNotEnoughCredits = remainingRequestedCredits > 0;

  return {
    title: isNotEnoughCredits
      ? `You need ${remainingRequestedCredits.toLocaleString()} more credits to run this job`
      : null,
    augmentationDomainRows: effectiveDomainRows,
    augmentationGeneralRows: effectiveGeneralRows,
    datasetId,
    totalCredits,
    domainExpansionCost,
    diversityExpansionCost,
    autoScientistTrainingCost,
    totalOrderCost,
    remainingRequestedCredits,
    isNotEnoughCredits,
    shouldShowDomainSlider,
    shouldShowGeneralSlider,
    removeDomainExpansion: () => setDomainRows(0),
    removeGeneralExpansion: () => setGeneralRows(0),
  };
}
