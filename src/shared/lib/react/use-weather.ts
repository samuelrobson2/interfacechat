import { useQuery } from "@tanstack/react-query";

import {
  fetchCurrentConditions,
  type WeatherReading,
} from "@/shared/lib/google/weather";
import type { GeolocationCoords } from "@/shared/lib/react/use-geolocation";

export type WeatherSnapshot = WeatherReading;

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

export const useWeather = (coords: GeolocationCoords | null) => {
  return useQuery<WeatherSnapshot>({
    queryKey: ["weather", coords?.lat, coords?.lon],
    enabled: !!coords,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    // Surface a fallback UI instead of bubbling to the global ErrorBoundary.
    throwOnError: false,
    retry: (failureCount, error) => !isAbortError(error) && failureCount < 1,
    queryFn: ({ signal }) => {
      if (!coords) throw new Error("Coordinates are required");
      return fetchCurrentConditions(coords, signal);
    },
  });
};
