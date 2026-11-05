import { queryClient } from "@/shared/api/query-client";
import type { ApiSchemas } from "@/shared/api/schema";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { internalizationQueryOptions } from "./internalization-query-options";

export function useDomainsQuery() {
  const query = useQuery(internalizationQueryOptions.domains());

  return query; 
}

export function useDomainsSuspenseQuery() {
  const query = useSuspenseQuery(internalizationQueryOptions.domains());

  return query;
}

export function useDomainsCache() {
  const domains = queryClient.getQueryData<
    ApiSchemas["DomainsResponseDto"]
  >(internalizationQueryOptions.domains().queryKey);

  return domains;
}
