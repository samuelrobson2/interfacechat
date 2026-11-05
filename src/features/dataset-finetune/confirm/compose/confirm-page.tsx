import { useMemo, useState } from "react";
import { href, useLocation, useNavigate, useParams } from "react-router-dom";
import { useFinetuneStepSuspenseQuery } from "@/services/dataset";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { Button } from "@/shared/ui/kit/button";
import { Text } from "@/shared/ui/kit/text";
import type { ApiSchemas } from "@/shared/api/schema";
import { FINETUNE_STEP_KEYS } from "../../_lib/finetune-routes";
import {
  FinetuneStepsContent,
  FinetuneStepsContentWrapper,
} from "../../_ui/finetune-steps-layout";
import { useConfirmHyperparamsValidate } from "../model/use-confirm-hyperparams-validate";
import { useConfirmRequestState } from "../model/use-confirm-request-state";
import { useSaveConfirmHyperparams } from "../model/use-save-confirm-hyperparams";
import { ConfirmRequestBlock } from "./confirm-request-block";
import { ROUTES } from "@/shared/model/routes";

export const ConfirmPage = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { dataset_id } = useParams();
  const confirmStepKey = FINETUNE_STEP_KEYS.confirm;

  const { data: confirmStepData } = useFinetuneStepSuspenseQuery(
    dataset_id!,
    confirmStepKey,
  );
  const launchPayload = useMemo(() => {
    const inlineData = confirmStepData?.step.inline_data as
      | { launch_payload?: ApiSchemas["LaunchFinetuneJobDto"] }
      | null
      | undefined;
    return inlineData?.launch_payload;
  }, [confirmStepData?.step.inline_data]);
  const {
    isEditMode,
    setIsEditMode,
    launchPayloadText,
    setLaunchPayloadText,
    parsedLaunchPayload,
    hasInvalidJson,
    handleCopy,
  } = useConfirmRequestState(launchPayload);

  const parsedHyperparams = useMemo(
    () =>
      (parsedLaunchPayload?.hyperparams as
        | Record<string, unknown>
        | undefined) ?? null,
    [parsedLaunchPayload],
  );
  const { errors: validationErrors } = useConfirmHyperparamsValidate({
    datasetId: dataset_id,
    hyperparams: parsedHyperparams,
  });
  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const { save: saveConfirmHyperparams, isSaving: isSavingConfirmEdits } =
    useSaveConfirmHyperparams(dataset_id);
  const [hasEditedJson, setHasEditedJson] = useState(false);

  const saveIfEdited = async () => {
    if (!hasEditedJson || !parsedLaunchPayload) return true;
    const isConfigSaved = await saveConfirmHyperparams(parsedLaunchPayload);
    if (isConfigSaved) setHasEditedJson(false);
    return isConfigSaved;
  };

  const handleContinue = async () => {
    if (!dataset_id || !parsedLaunchPayload) return;
    const isConfigSaved = await saveIfEdited();
    if (!isConfigSaved) return;
    navigate(
      `${href(ROUTES.DATASET_FINETUNE_CREDITS, {
        dataset_id,
      })}${search}`,
    );
  };

  const handleToggleEdit = async () => {
    // Leaving edit mode = "Done". Persist any valid edits to the recipe
    // step before flipping the toggle so navigating back to the recipe
    // wizard reflects what the user typed in the JSON.
    if (
      isEditMode &&
      !hasInvalidJson &&
      !hasValidationErrors &&
      parsedLaunchPayload
    ) {
      const isConfigSaved = await saveIfEdited();
      if (!isConfigSaved) return;
    }
    setIsEditMode((prev) => !prev);
  };

  const handleLaunchPayloadChange = (value: string) => {
    setHasEditedJson(true);
    setLaunchPayloadText(value);
  };

  const handleBack = async () => {
    if (!dataset_id) return;
    const resolvedRoute = `${href(ROUTES.DATASET_FINETUNE_HYPERPARAMETERS, {
      dataset_id,
    })}${search}`;

    if (hasInvalidJson) {
      navigate(resolvedRoute);
      return;
    }

    const isConfigSaved = await saveIfEdited();
    if (!isConfigSaved) return;
    navigate(resolvedRoute);
  };

  if (!dataset_id) {
    return null;
  }

  return (
    <FinetuneStepsContentWrapper className="h-full min-h-0">
      <Button
        type="button"
        className="w-full"
        variant="secondary"
        onClick={() => handleBack()}
        disabled={isSavingConfirmEdits}
      >
        <ArrowLeftIcon pathClasses="stroke-current" />
        Back
      </Button>

      <FinetuneStepsContent className="flex h-full min-h-0 flex-col gap-4">
        {!launchPayload ? (
          <div className="flex h-full items-center justify-center">
            <Text color="secondary" className="max-w-[640px] text-center">
              Launch payload is unavailable for this step.
            </Text>
          </div>
        ) : (
          <ConfirmRequestBlock
            launchBodyText={launchPayloadText}
            isEditMode={isEditMode}
            hasInvalidJson={hasInvalidJson}
            validationErrors={validationErrors}
            isSaving={isSavingConfirmEdits}
            onCopy={() => handleCopy()}
            onToggleEdit={() => handleToggleEdit()}
            onEnterEdit={() => setIsEditMode(true)}
            onChange={handleLaunchPayloadChange}
          />
        )}
      </FinetuneStepsContent>

      <Button
        type="button"
        className="ml-auto w-full"
        variant="primary"
        disabled={
          isSavingConfirmEdits ||
          !parsedLaunchPayload ||
          hasInvalidJson ||
          hasValidationErrors
        }
        onClick={() => handleContinue()}
      >
        Continue
      </Button>
    </FinetuneStepsContentWrapper>
  );
};
