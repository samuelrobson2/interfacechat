import { Separator } from "@/shared/ui/kit/separator";
import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import { DiagnosisProvider } from "../model/diagnosis-store";
import { useDiagnosisData } from "../model/use-diagnosis-data";
import { useDiagnosisParsedValues } from "../model/use-diagnosis-parsed-values";
import { useDiagnosisPost } from "../model/use-diagnosis-post";
import { DiagnosisInfoCard } from "./diagnosis-info-card";
import { DiagnosisInfoText } from "./diagnosis-info-text";
import { DiagnosisTags } from "./diagnosis-tags";

export function DiagnosisPage() {
  useDiagnosisData();

  const { dataset_name, description } = useDiagnosisParsedValues();

  return (
    <DiagnosisProvider dataset_name={dataset_name} description={description}>
      <DiagnosisConsumer />
    </DiagnosisProvider>
  );
}

function DiagnosisConsumer() {
  const { submitForm, isPending } = useDiagnosisPost();

  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.diagnosis} />

      <NewDatasetStepsContent className="flex flex-col gap-10">
        <DiagnosisInfoCard />

        <Separator />

        <DiagnosisInfoText />

        <Separator />

        <DiagnosisTags />
      </NewDatasetStepsContent>

      <NewDatasetContinueButton
        stepKey={NEW_DATASET_KEYS.diagnosis}
        isLoading={isPending}
        onClick={submitForm}
      />
    </NewDatasetStepsContentWrapper>
  );
}
