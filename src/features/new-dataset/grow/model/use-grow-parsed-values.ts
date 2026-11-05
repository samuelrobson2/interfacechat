import type { ApiSchemas } from "@/shared/api/schema";
import { parseNewDatasetValue } from "../../_lib/new-dataset-parse-values";
import { NEW_DATASET_KEYS } from "../../_lib/new-dataset-routes";
import { useDatasetStepCache } from "../../_model/use-dataset-step-query";

type ExpansionCountriesValue =
  | string[]
  | ApiSchemas["LanguageCountryPairResponseDto"][];

function getExpansionCountryPairKeys(value: ExpansionCountriesValue): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      return item.pairKey ?? null;
    })
    .filter((pairKey): pairKey is string => Boolean(pairKey));
}

export function useGrowParsedValues() {
  const data = useDatasetStepCache(NEW_DATASET_KEYS.expansion);

  const fields = data?.step.fields;

  const expansion_languages = new Set(
    parseNewDatasetValue(fields?.expansion_languages) as string[]);
  const expansion_countries = new Set(
    getExpansionCountryPairKeys(
      parseNewDatasetValue(fields?.expansion_countries) as ExpansionCountriesValue,
    ),
  );
  const expansion_languages_percent =
    (parseNewDatasetValue(fields?.expansion_languages_percent) as string[])?.[1] ?? 0;
  const expansion_countries_percent =
    (parseNewDatasetValue(fields?.expansion_countries_percent) as string[])?.[1] ?? 0;

  const expansionLanguagesData = fields?.expansion_languages;
  const expansionCountriesData = fields?.expansion_countries;

  return {
    fields,
    expansion_languages,
    expansion_countries,
    expansion_languages_percent,
    expansion_countries_percent,
    expansionLanguagesData,
    expansionCountriesData,
  };
}
