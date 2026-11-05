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
import { useRecipesContext } from "./recipes-store";

export function useRecipesPost() {
  const navigate = useNavigate();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [isPending, startTransition] = useTransition();

  const data = useDatasetStepCache(NEW_DATASET_KEYS.recipes);
  const { nextStepRoute, lastStepDataReload } = useNewDatasetNavigation({
    stepKey: NEW_DATASET_KEYS.recipes,
  });
  const fields = useRecipesContext((state) => state.fields);

  const { mutateAsync: submitRecipesMutation } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/config",
  );

  const postRecipes = async () => {
    if (!data || !data.step || !data.step.fields) return;

    const body = createDatasetConfigResponse(
      data.step.key,
      data.step.fields,
      fields,
    );

    await submitRecipesMutation({
      params: {
        path: {
          dataset_id: dataset_id!,
        },
      },
      body,
    });
  };

  const submitForm = () => {
    startTransition(async () => {
      try {
        await postRecipes();
        await Promise.all([
          invalidateRecipesAndBrandStepQueries(dataset_id!),
          lastStepDataReload(),
        ]);
        if (nextStepRoute) await navigate(href(nextStepRoute, { dataset_id }));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to submit recipes"));
      }
    });
  };

  return {
    postRecipes,
    submitForm,
    isPending,
  };
}
