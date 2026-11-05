import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { internalizationQueryOptions } from "./internalization-query-options";

export function useCountriesQuery() {
  const query = useQuery(internalizationQueryOptions.countries());

  return query;
}

export function useCountriesSuspenseQuery() {
  const query = useSuspenseQuery(internalizationQueryOptions.countries());

  return query;
}

export function useCountriesCache() {
  const countries = queryClient.getQueryData<
    ApiSchemas["CountriesResponseDto"]
  >(internalizationQueryOptions.countries().queryKey);

  return countries;
}
