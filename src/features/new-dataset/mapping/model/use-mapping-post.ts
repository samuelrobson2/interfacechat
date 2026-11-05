import { datasetQueryOptions } from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { href, useNavigate, useParams } from "react-router-dom";
import { createDatasetConfigResponse } from "../../_lib/new-dataset-create-response";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";
import { useNewDatasetNavigation } from "../../_model/use-new-dataset-navigation";
import { useIsMappingValid, useMappingContext } from "./mapping-store";

export function useMappingPost() {
  const navigate = useNavigate();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [isPending, startTransition] = useTransition();

  const data = useDatasetStepCache(NEW_DATASET_KEYS.mapping);
  const { nextStepRoute } = useNewDatasetNavigation({
    stepKey: NEW_DATASET_KEYS.mapping,
  });
  const isMappingValid = useIsMappingValid();

  const prompt = useMappingContext((state) => state.prompt);
  const context = useMappingContext((state) => state.context);
  const completion = useMappingContext((state) => state.completion);
  const chat = useMappingContext((state) => state.chat);

  const contextColumns = context.column || [];

  const { mutateAsync: submitMappingMutation } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/config",
  );

  const postMapping = async () => {
    if (!isMappingValid) return;
    if (!data || !data.step || !data.step.fields) return;
    const mappingImageColumnValue =
      data.step.fields.mapping_image_column?.response_values?.[0]?.value || "";

    const mappingValues = {
      mapping_prompt_column: JSON.stringify(prompt.column || ""),
      mapping_create_prompt_column: JSON.stringify(prompt.createColumn),
      mapping_no_prompt_column: JSON.stringify(prompt.hasNoColumn),
      mapping_universal_prompt: JSON.stringify(prompt.universalPrompt || ""),
      mapping_create_prompt: JSON.stringify(prompt.createPrompt),

      mapping_context_column: JSON.stringify(contextColumns),
      mapping_image_column: mappingImageColumnValue,
      mapping_no_context_column: JSON.stringify(context.hasNoColumn),

      mapping_completion_column: JSON.stringify(completion.column || ""),
      mapping_create_completion_column: JSON.stringify(
        completion.createColumn,
      ),
      mapping_no_completion_column: JSON.stringify(completion.hasNoColumn),

      mapping_chat_column: JSON.stringify(chat.column || ""),
      mapping_no_chat_column: JSON.stringify(chat.hasNoColumn),
    };

    const body = createDatasetConfigResponse(
      data.step.key,
      data.step.fields,
      mappingValues,
    );

    await submitMappingMutation({
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
        await postMapping();
        await queryClient.invalidateQueries({
          queryKey: datasetQueryOptions.step(
            dataset_id!,
            NEW_DATASET_KEYS.mapping,
          ).queryKey,
        });
        if (nextStepRoute) await navigate(href(nextStepRoute, { dataset_id }));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to submit mapping"));
      }
    });
  };

  return {
    postMapping,
    submitForm,
    isPending,
  };
}
