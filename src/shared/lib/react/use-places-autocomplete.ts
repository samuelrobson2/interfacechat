import { useQuery } from "@tanstack/react-query";

import {
  fetchPlacePredictions,
  type PlacePrediction,
} from "@/shared/lib/google/places";

const MIN_QUERY_LENGTH = 2;

/**
 * Returns city predictions for a free-text query. The caller should pass an
 * already-debounced term to avoid a request per keystroke.
 */
export const usePlacesAutocomplete = (term: string) => {
  const normalized = term.trim();

  return useQuery<PlacePrediction[]>({
    queryKey: ["places-autocomplete", normalized],
    enabled: normalized.length >= MIN_QUERY_LENGTH,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    throwOnError: false,
    retry: 1,
    queryFn: ({ signal }) => fetchPlacePredictions(normalized, signal),
  });
};
