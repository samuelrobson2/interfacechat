import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { internalizationQueryOptions } from "./internalization-query-options";

export function useLanguageCountryPairsQuery() {
  const query = useQuery(internalizationQueryOptions.languageCountryPairs());

  return query;
}

export function useLanguageCountryPairsSuspenseQuery() {
  const query = useSuspenseQuery(
    internalizationQueryOptions.languageCountryPairs(),
  );

  return query;
}

export function useLanguageCountryPairsCache() {
  const languageCountryPairs = queryClient.getQueryData<
    ApiSchemas["LanguageCountryPairsResponseDto"]
  >(internalizationQueryOptions.languageCountryPairs().queryKey);

  return languageCountryPairs;
}
