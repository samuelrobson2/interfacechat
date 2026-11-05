import { useQuery } from "@tanstack/react-query";

import { useSessionStore } from "@/services/auth";
import {
  geocodeCountry,
  reverseGeocode,
  type ResolvedLocation,
} from "@/shared/lib/google/geocoding";
import { useGeolocation } from "@/shared/lib/react/use-geolocation";

import { useManualLocationStore } from "./manual-location-store";

export type ActiveLocation = {
  location: ResolvedLocation | null;
  isResolving: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Resolves the location used across the dashboard widget, in priority order:
 * manual pick → live browser geolocation → profile-country fallback.
 */
export const useActiveLocation = (): ActiveLocation => {
  const manualLocation = useManualLocationStore((state) => state.location);
  const geolocation = useGeolocation();
  const fallbackCountry = useSessionStore(
    (state) => state.user?.profile?.countries?.[0] ?? null,
  );

  // Reverse-geocode live GPS coords for a label + country code.
  const gpsCoords = !manualLocation ? geolocation.coords : null;
  const reverseQuery = useQuery<ResolvedLocation | null>({
    queryKey: ["reverse-geocode", gpsCoords?.lat, gpsCoords?.lon],
    enabled: !!gpsCoords,
    staleTime: DAY_MS,
    gcTime: DAY_MS,
    throwOnError: false,
    retry: 1,
    queryFn: () => reverseGeocode(gpsCoords!),
  });

  // Fall back to the profile country only when geolocation is unavailable.
  const needsCountry =
    !manualLocation && !geolocation.coords && !geolocation.isLoading;
  const countryQuery = useQuery<ResolvedLocation | null>({
    queryKey: ["country-geocode", fallbackCountry?.code],
    enabled: needsCountry && !!fallbackCountry,
    staleTime: DAY_MS,
    gcTime: DAY_MS,
    throwOnError: false,
    retry: 1,
    queryFn: () => geocodeCountry(fallbackCountry!),
  });

  if (manualLocation) {
    return { location: manualLocation, isResolving: false };
  }

  if (gpsCoords) {
    return {
      location: reverseQuery.data ?? {
        coords: gpsCoords,
        label: "",
        countryCode: null,
      },
      isResolving: reverseQuery.isLoading,
    };
  }

  if (countryQuery.data) {
    return { location: countryQuery.data, isResolving: false };
  }

  return {
    location: null,
    isResolving: geolocation.isLoading || countryQuery.isLoading,
  };
};
