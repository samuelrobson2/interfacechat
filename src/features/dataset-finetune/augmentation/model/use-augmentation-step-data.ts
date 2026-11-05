import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useFinetuneStepSuspenseQuery } from "@/services/dataset";
import type { ApiSchemas } from "@/shared/api/schema";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";

type AugmentationInlineData = {
  suggested_domain_augmentation_count?: number | null;
  suggested_general_data_augmentation_count?: number | null;
  should_show_domain_slider?: boolean | null;
  should_show_general_slider?: boolean | null;
} | null;

function asFiniteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  return null;
}

function resolveFieldValue(
  fields: ApiSchemas["FinetuneFieldDto"][],
  matcher: (fieldKey: string) => boolean,
) {
  const field = fields.find((item) => matcher(item.key));
  return asFiniteNumber(field?.value);
}

export function useAugmentationStepData() {
  const { dataset_id } = useParams();
  const stepKey = FINETUNE_STEP_KEYS.augmentation;
  const { data } = useFinetuneStepSuspenseQuery(dataset_id!, stepKey);

  return useMemo(() => {
    const inlineData = data.step.inline_data as AugmentationInlineData;
    const suggestedDomain = inlineData?.suggested_domain_augmentation_count ?? null;
    const suggestedGeneral = inlineData?.suggested_general_data_augmentation_count ?? null;
    const shouldShowDomainSlider = asBoolean(inlineData?.should_show_domain_slider) ?? true;
    const shouldShowGeneralSlider = asBoolean(inlineData?.should_show_general_slider) ?? true;

    const savedDomain = resolveFieldValue(
      data.step.fields,
      (fieldKey) =>
        fieldKey.includes("augmentation_domain_rows")
        || fieldKey.includes("domain_rows"),
    );
    const savedGeneral = resolveFieldValue(
      data.step.fields,
      (fieldKey) =>
        fieldKey.includes("augmentation_general_rows")
        || fieldKey.includes("general_rows"),
    );

    return {
      datasetId: dataset_id,
      step: data.step,
      initialDomainDatapoints: savedDomain ?? suggestedDomain ?? 0,
      initialGeneralDatapoints: savedGeneral ?? suggestedGeneral ?? 0,
      shouldShowDomainSlider,
      shouldShowGeneralSlider,
    };
  }, [data.step, dataset_id]);
}
