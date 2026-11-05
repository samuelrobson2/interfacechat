import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { internalizationQueryOptions } from "./internalization-query-options";

export function useLanguagesQuery() {
  const query = useQuery(internalizationQueryOptions.languages());

  return query;
}

export function useLanguagesSuspenseQuery() {
  const query = useSuspenseQuery(internalizationQueryOptions.languages());

  return query;
}

export function useLanguagesCache() {
  const languages = queryClient.getQueryData<
    ApiSchemas["LanguagesResponseDto"]
  >(internalizationQueryOptions.languages().queryKey);

  return languages;
}
