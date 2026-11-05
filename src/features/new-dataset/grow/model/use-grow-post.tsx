import { datasetQueryOptions } from "@/services/dataset";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { rqClient } from "@/shared/api/instance";
import { queryClient } from "@/shared/api/query-client";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { toast } from "@/shared/ui/kit/sonner-toast";
import { useTransition } from "react";
import { href, useNavigate, useParams } from "react-router-dom";
import { useLanguageCountryPairsCache } from "@/services/internalization";
import { createDatasetConfigResponse } from "../../_lib/new-dataset-create-response";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";
import { useNewDatasetNavigation } from "../../_model/use-new-dataset-navigation";
import { useGrowContext } from "./grow-store";

export function useGrowPost() {
  const navigate = useNavigate();
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [isPending, startTransition] = useTransition();

  const data = useDatasetStepCache(NEW_DATASET_KEYS.expansion);
  const { nextStepRoute, lastStepDataReload } = useNewDatasetNavigation({
    stepKey: NEW_DATASET_KEYS.expansion,
  });

  const expansion_languages = useGrowContext(
    (state) => state.expansion_languages,
  );
  const expansion_countries = useGrowContext(
    (state) => state.expansion_countries,
  );
  const expansion_languages_percent = useGrowContext(
    (state) => state.expansion_languages_percent,
  );
  const expansion_countries_percent = useGrowContext(
    (state) => state.expansion_countries_percent,
  );
  const languageCountryPairsData = useLanguageCountryPairsCache();

  const { mutateAsync: submitGrowMutation } = rqClient.useMutation(
    "post",
    "/datasets/{dataset_id}/config",
  );

  const postGrow = async () => {
    if (!data || !data.step || !data.step.fields) return;

    const selectedCountryPairs = Array.from(expansion_countries).flatMap(
      (pairKey) => {
        const pair = languageCountryPairsData?.languageCountryPairs.find(
          (item) => item.pairKey === pairKey,
        );
        return pair ? [pair] : [];
      },
    );

    const storeValues = {
      expansion_languages: JSON.stringify(Array.from(expansion_languages)),
      expansion_countries: JSON.stringify(
        selectedCountryPairs.length > 0
          ? selectedCountryPairs
          : Array.from(expansion_countries),
      ),
      expansion_languages_percent: JSON.stringify([0, expansion_languages_percent]),
      expansion_countries_percent: JSON.stringify([0, expansion_countries_percent]),
    };

    const body = createDatasetConfigResponse(
      data.step.key,
      data.step.fields,
      storeValues,
    );

    await submitGrowMutation({
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
        await postGrow();
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: datasetQueryOptions.step(
              dataset_id!,
              NEW_DATASET_KEYS.expansion,
            ).queryKey,
          }),
          lastStepDataReload(),
        ]);
        if (nextStepRoute) await navigate(href(nextStepRoute, { dataset_id }));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to submit"));
      }
    });
  };

  return {
    postGrow,
    submitForm,
    isPending,
  };
}
