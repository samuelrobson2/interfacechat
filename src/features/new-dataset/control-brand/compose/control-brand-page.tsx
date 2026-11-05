import { datasetQueryOptions } from "@/services/dataset";
import { ArrowLeftIcon } from "@/shared/assets/icons/outlined/ArrowLeft";
import { ArrowRightIcon } from "@/shared/assets/icons/outlined/ArrowRight";
import type { DatasetRoutes, PathParams } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import {
  ControlBrandProvider,
  useControlBrandContext,
} from "../model/control-brand-store";
import { useControlBrandFilesData } from "../model/use-control-brand-files-data";
import { useControlBrandParsedValues } from "../model/use-control-brand-parsed-values";
import { useControlBrandPost } from "../model/use-control-brand-post";
import { ControlBrandCustomSettings } from "./control-brand-custom-settings";
import { ControlBrandGeneratedPrompt } from "./control-brand-generated-prompt";
import { ControlBrandHallucination } from "./control-brand-hallucination";
import { ControlBrandLength } from "./control-brand-length";
import { ControlBrandSafety } from "./control-brand-safety";

type Steps = "custom-settings" | "brand-settings";

export function ControlBrandPage() {
  const { dataset_id } = useParams<PathParams[DatasetRoutes]>();
  const [{ data: stepData }] = useSuspenseQueries({
    queries: [
      datasetQueryOptions.step(dataset_id!, NEW_DATASET_KEYS.brand),
      datasetQueryOptions.dataset(dataset_id!),
    ],
  });

  const {
    brand_length,
    brand_safety,
    brand_custom_settings,
    hallucination_mitigation,
  } = useControlBrandParsedValues();

  const { brand_files } = useControlBrandFilesData(stepData.step.fields);

  const [step, setStep] = useState<Steps>("custom-settings");

  const steps = {
    "custom-settings": (
      <ControlBrandCustomSettingsStep
        brand_files={brand_files}
        setStep={setStep}
      />
    ),
    "brand-settings": <ControlBrandSettingsStep setStep={setStep} />,
  };

  const currentStep = steps[step];

  return (
    <ControlBrandProvider
      brand_length={brand_length}
      brand_safety={brand_safety}
      brand_custom_settings={brand_custom_settings}
      hallucination_mitigation={hallucination_mitigation}
    >
      {currentStep}
    </ControlBrandProvider>
  );
}

function ControlBrandCustomSettingsStep({
  brand_files,
  setStep,
}: {
  brand_files: Map<string, File>;
  setStep: (step: Steps) => void;
}) {
  const { submitCustomSettings, isPending } = useControlBrandPost();
  const brand_custom_settings = useControlBrandContext(
    (state) => state.brand_custom_settings,
  );
  const buttonText = brand_custom_settings ? "Continue" : "Skip";

  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.brand} />

      <NewDatasetStepsContent className="flex flex-col gap-10 pb-6">
        <ControlBrandCustomSettings brand_files={brand_files} />

        <ControlBrandGeneratedPrompt separator="top" maxTextLines={10} />
      </NewDatasetStepsContent>

      <Button
        className="ml-auto w-full"
        variant="primary"
        isLoading={isPending}
        onClick={() => {
          if (brand_custom_settings) {
            submitCustomSettings(() => setStep("brand-settings"));
          } else {
            setStep("brand-settings");
          }
        }}
      >
        {buttonText}
        <ArrowRightIcon pathClasses="stroke-current" />
      </Button>
    </NewDatasetStepsContentWrapper>
  );
}

function ControlBrandSettingsStep({
  setStep,
}: {
  setStep: (step: Steps) => void;
}) {
  const { submitForm, isPending } = useControlBrandPost();

  return (
    <NewDatasetStepsContentWrapper>
      <Button
        className="w-full"
        variant="secondary"
        onClick={() => setStep("custom-settings")}
      >
        <ArrowLeftIcon pathClasses="stroke-current" />
        Back
      </Button>

      <NewDatasetStepsContent className="flex flex-col gap-10 pb-6">
        <ControlBrandGeneratedPrompt separator="bottom" />

        <div className="w-full flex gap-8">
          <ControlBrandLength className="flex-1" />

          <Separator orientation="vertical" color="secondary" />

          <ControlBrandSafety className="flex-1" />
        </div>

        <Separator />

        <ControlBrandHallucination />
      </NewDatasetStepsContent>

      <NewDatasetContinueButton
        stepKey={NEW_DATASET_KEYS.brand}
        isLoading={isPending}
        onClick={submitForm}
      />
    </NewDatasetStepsContentWrapper>
  );
}
