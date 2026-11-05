import { NewDatasetBackButton } from "../../_compose/new-dataset-back-button";
import { NewDatasetContinueButton } from "../../_compose/new-dataset-continue-button";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepSuspenseQuery } from "../../_model/use-dataset-step-query";
import {
  NewDatasetStepsContent,
  NewDatasetStepsContentWrapper,
} from "../../_ui/new-dataset-steps-layout";
import { GrowProvider } from "../model/grow-store";
import { useGrowParsedValues } from "../model/use-grow-parsed-values";
import { useGrowPost } from "../model/use-grow-post";
import { GrowCountriesPercent } from "./grow-countries-percent";
import { GrowLanguagePercent } from "./grow-language-percent";
import { GrowNewContries } from "./grow-new-countries";
import { GrowNewLanguages } from "./grow-new-languages";
import growLanguagesImage from "@/shared/assets/images/grow-languages.png";
import growCountriesImage from "@/shared/assets/images/grow-countries.png";

export function GrowPage() {
  useDatasetStepSuspenseQuery(NEW_DATASET_KEYS.expansion);
  const {
    expansion_languages,
    expansion_countries,
    expansion_languages_percent,
    expansion_countries_percent,
  } = useGrowParsedValues();

  return (
    <GrowProvider
      expansion_languages={expansion_languages}
      expansion_countries={expansion_countries}
      expansion_languages_percent={Number(expansion_languages_percent)}
      expansion_countries_percent={Number(expansion_countries_percent)}
    >
      <GrowConsumer />
    </GrowProvider>
  );
}

function GrowConsumer() {
  const { submitForm, isPending } = useGrowPost();
  const { expansionCountriesData, expansionLanguagesData } =
    useGrowParsedValues();

  return (
    <NewDatasetStepsContentWrapper>
      <NewDatasetBackButton stepKey={NEW_DATASET_KEYS.expansion} />

      <NewDatasetStepsContent className="flex flex-row gap-10">
        {expansionCountriesData && (
          <>
            <img
              className="size-22.5"
              src={growCountriesImage}
              alt="Grow Countries"
            />
            <div className="flex flex-1 flex-col gap-12">
              <GrowNewContries title={expansionCountriesData?.title} />
              <GrowCountriesPercent />
            </div>
          </>
        )}
        {expansionLanguagesData && (
          <>
            <img
              className="size-22.5"
              src={growLanguagesImage}
              alt="Grow Languages"
            />
            <div className="flex flex-1 flex-col gap-12">
              <GrowNewLanguages title={expansionLanguagesData?.title} />
              <GrowLanguagePercent />
            </div>
          </>
        )}
      </NewDatasetStepsContent>

      <NewDatasetContinueButton
        stepKey={NEW_DATASET_KEYS.expansion}
        isLoading={isPending}
        onClick={submitForm}
      />
    </NewDatasetStepsContentWrapper>
  );
}
