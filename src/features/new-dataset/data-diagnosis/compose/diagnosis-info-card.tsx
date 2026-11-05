import {
  DatasetInfoEditableItem,
  getDomainColorizedIcon,
} from "@/services/dataset";
import { useDiagnosisContext } from "../model/diagnosis-store";
import { useDiagnosisParsedValues } from "../model/use-diagnosis-parsed-values";
import { DiagnosisInfoItem } from "../ui/diagnosis-info-item";
import { Separator } from "@/shared/ui/kit/separator";

export function DiagnosisInfoCard() {
  const {
    fields,
    topDomain,
    averagePromptLength,
    averageCompletionLength,
    datasetData,
  } = useDiagnosisParsedValues();
  const dataset_name = useDiagnosisContext((state) => state.dataset_name);
  const description = useDiagnosisContext((state) => state.description);
  const setDatasetName = useDiagnosisContext((state) => state.setDatasetName);
  const setDescription = useDiagnosisContext((state) => state.setDescription);

  const domainIcon = getDomainColorizedIcon(topDomain);

  return (
    <div className="flex items-start gap-6">
      <img className="shrink-0" src={domainIcon} alt={topDomain} />

      <div className="flex flex-col gap-10 w-full">
        <div className="w-full flex gap-8 overflow-hidden">
          <DatasetInfoEditableItem
            className="flex-1/3"
            value={dataset_name}
            onSubmit={setDatasetName}
            maxTextLines={1}
            title={fields?.dataset_name?.title || "Dataset Name"}
            label={fields?.dataset_name?.title || "Dataset Name"}
            name={fields?.dataset_name?.key || "dataset_name"}
          />
          <DatasetInfoEditableItem
            className="flex-2/3"
            value={description}
            onSubmit={setDescription}
            maxTextLines={3}
            title={fields?.description?.title || "Description"}
            label={fields?.description?.title || "Description"}
            inputType="textarea"
            name={fields?.description?.key || "description"}
          />
        </div>

        <Separator color="secondary" />

        <div className="flex gap-8">
          {averagePromptLength && (
            <DiagnosisInfoItem
              className="min-w-[197px]"
              title={fields?.average_prompt_length?.title}
              description={`${averagePromptLength} words`}
            />
          )}
          {averageCompletionLength && (
            <DiagnosisInfoItem
              className="min-w-[197px]"
              title={fields?.average_completion_length?.title}
              description={`${averageCompletionLength} words`}
            />
          )}
          {datasetData?.row_count && (
            <DiagnosisInfoItem
              className="min-w-[197px]"
              title="Dataset size"
              description={`${datasetData.row_count.toLocaleString()} rows`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
