import { useFinetuneStepSuspenseQuery } from "@/services/dataset";
import { ROUTES } from "@/shared/model/routes";
import { useCallback, useEffect } from "react";
import { DatasetFinetuneBackButton } from "../../_compose/dataset-finetune-back-button";
import { DatasetFinetuneContinueButton } from "../../_compose/dataset-finetune-continue-button";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import { FinetuneStepper } from "../../_ui/finetune-dataset-stepper";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
  FinetuneStepsLayout,
} from "../../_ui/finetune-steps-layout";
import { FinetuneDatasetTitle } from "../../_compose/finetune-dataset-title";
import type { FinetuneHyperparamDraftKey } from "../lib/finetune-hyperparam-cards";
import { resolveRecipeNextValues } from "../lib/resolve-recipe-next-values";
import { useRecipeDependentFieldSync } from "../model/use-recipe-dependent-field-sync";
import { useRecipeContinue } from "../model/use-recipe-continue";
import { useFinetuneHyperparamsValidate } from "../model/use-finetune-hyperparams-validate";
import { useFinetuneRecipeDraft } from "../model/use-finetune-recipe-draft";
import { FinetuneHyperparametersRecipe } from "./finetune-hyperparameters-recipe";
import { href, useLocation } from "react-router-dom";

type DatasetFinetuneHyperparametersPageContentProps = {
  dataset_id: string;
};
type HyperparametersLocationState = {
  forceRecipeStepRefetch?: boolean;
};

export function DatasetFinetuneHyperparametersPageContent({
  dataset_id,
}: DatasetFinetuneHyperparametersPageContentProps) {
  const { search, state } = useLocation();
  const shouldForceRecipeRefetch = Boolean(
    (state as HyperparametersLocationState | null)?.forceRecipeStepRefetch,
  );
  const recipeStepKey = FINETUNE_STEP_KEYS.recipe;
  const { data: recipeStepData, refetch } = useFinetuneStepSuspenseQuery(
    dataset_id,
    recipeStepKey,
  );

  useEffect(() => {
    if (!shouldForceRecipeRefetch) return;
    void refetch();
  }, [refetch, shouldForceRecipeRefetch]);

  const { save, submit, isPending: isProceeding } = useRecipeContinue();
  const { draft, setDraftField, acceptServerState, hyperparams, modelOptions } =
    useFinetuneRecipeDraft(recipeStepData);
  const { isSyncing, onDraftFieldUpdated, recipeKey } =
    useRecipeDependentFieldSync({
      dataset_id,
      recipeStepData,
      save,
      acceptServerState,
      refetch,
    });

  const { errors: validationErrors } = useFinetuneHyperparamsValidate({
    datasetId: dataset_id,
    draft,
    enabled: !isSyncing,
  });
  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const onDraftChange = useCallback(
    (key: FinetuneHyperparamDraftKey, value: string) => {
      const nextDraft = setDraftField(key, value);
      onDraftFieldUpdated(key, nextDraft);
    },
    [onDraftFieldUpdated, setDraftField],
  );

  const handleContinue = () => {
    if (!recipeStepData?.step) return;
    submit({
      dataset_id,
      recipeStepData,
      nextValues: resolveRecipeNextValues(recipeStepData.step.fields, draft),
      nextStepRoute: `${href(ROUTES.DATASET_FINETUNE_CONFIRM, {
        dataset_id,
      })}${search}`,
    });
  };

  return (
    <FinetuneStepsLayout>
      <FinetuneStepper stepKey={FINETUNE_STEP_KEYS.recipe}>
        <FinetuneDatasetTitle title="We have computed the following recipe based upon your data to optimize performance." />
      </FinetuneStepper>
      <FinetuneStepsContentWrapper>
        <DatasetFinetuneBackButton stepKey={FINETUNE_STEP_KEYS.recipe} />

        <FinetuneStepsContent className="flex w-full min-w-0 flex-col items-center gap-10 overflow-y-auto py-2 no-scrollbar">
          <FinetuneHyperparametersRecipe
            key={recipeKey}
            hyperparams={hyperparams}
            modelOptions={modelOptions}
            draft={draft}
            errors={validationErrors}
            isSyncing={isSyncing}
            onDraftChange={onDraftChange}
          />
        </FinetuneStepsContent>

        <DatasetFinetuneContinueButton
          stepKey={FINETUNE_STEP_KEYS.recipe}
          disabled={isProceeding || hasValidationErrors || isSyncing}
          isLoading={isProceeding}
          onClick={handleContinue}
        />
      </FinetuneStepsContentWrapper>
    </FinetuneStepsLayout>
  );
}
