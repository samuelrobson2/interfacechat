import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { href, useNavigate, useParams } from "react-router-dom";
import { createDatasetConfigResponse } from "../../_lib/new-dataset-create-response";
import { invalidateRecipesAndBrandStepQueries } from "../../_lib/invalidate-recipes-brand-step-queries";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";
import { useNewDatasetNavigation } from "../../_model/use-new-dataset-navigation";
import { useControlBrandContext } from "./control-brand-store";

export function useControlBrandPost() {
  const navigate = useNavigate();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [isPending, startTransition] = useTransition();

  const data = useDatasetStepCache(NEW_DATASET_KEYS.brand);
  const { nextStepRoute, lastStepDataReload } = useNewDatasetNavigation({
    stepKey: NEW_DATASET_KEYS.brand,
  });

  // Get control brand data from store
  const brand_length = useControlBrandContext((state) => state.brand_length);
  const brand_safety = useControlBrandContext((state) => state.brand_safety);
  const brand_custom_settings = useControlBrandContext(
    (state) => state.brand_custom_settings,
  );
  const hallucination_mitigation = useControlBrandContext(
    (state) => state.hallucination_mitigation,
  );

  const { mutateAsync: submitControlBrandMutation } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/config",
  );

  const postControlBrand = async () => {
    if (!data || !data.step || !data.step.fields) return;

    const storeValues = {
      brand_length: JSON.stringify(brand_length),
      brand_safety: JSON.stringify(Array.from(brand_safety)),
      brand_custom_settings: JSON.stringify(brand_custom_settings),
      hallucination_mitigation: hallucination_mitigation,
    };

    const body = createDatasetConfigResponse(
      data.step.key,
      data.step.fields,
      storeValues,
    );

    await submitControlBrandMutation({
      params: {
        path: {
          dataset_id: dataset_id!,
        },
      },
      body,
    });
  };

  const submitCustomSettings = async (onSuccess?: () => void) => {
    startTransition(async () => {
      try {
        await postControlBrand();
        await invalidateRecipesAndBrandStepQueries(dataset_id!);
        onSuccess?.();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Failed to save settings"),
        );
      }
    });
  };

  const submitForm = () => {
    startTransition(async () => {
      try {
        await postControlBrand();
        await Promise.all([
          invalidateRecipesAndBrandStepQueries(dataset_id!),
          lastStepDataReload(),
        ]);
        if (nextStepRoute) await navigate(href(nextStepRoute, { dataset_id }));
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Failed to submit"),
        );
      }
    });
  };

  return {
    submitForm,
    submitCustomSettings,
    isPending,
  };
}
