import { Text } from "@/shared/ui/kit/text";
import { SelectedText } from "@/shared/ui/kit/selected-text";
import { useDiagnosisParsedValues } from "../model/use-diagnosis-parsed-values";

export function DiagnosisInfoText() {
  const {
    topPercentage,
    topDomain,
    datasetGrade,
    datasetQuality,
    qualityScore,
    percentileScore,
  } = useDiagnosisParsedValues();

  return (
    <div className="flex items-start gap-6">
      <p className="text-[100px] leading-[100%] tracking-[-0.02em] font-extralight">
        {datasetGrade}
      </p>

      <Text variant="h3">
        Your dataset quality is{" "}
        <SelectedText as="span" variant="h3" className="inline">
          {datasetQuality}
        </SelectedText>
        . Your quality score is{" "}
        <SelectedText as="span" variant="h3" className="inline">
          {qualityScore}
        </SelectedText>{" "}
        out of 10. The percentile score is{" "}
        <SelectedText as="span" variant="h3" className="inline">
          {Number(percentileScore).toFixed(1)}%
        </SelectedText>
        , which means that{" "}
        <SelectedText as="span" variant="h3" className="inline">
          {Number(topPercentage).toFixed(1)}%
        </SelectedText>{" "}
        of datasets in the{" "}
        <SelectedText as="span" variant="h3" className="inline">
          {topDomain}
        </SelectedText>{" "}
        domain have higher quality scores than you.
      </Text>
    </div>
  );
}
